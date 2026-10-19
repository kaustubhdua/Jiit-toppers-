import { Prisma } from '@prisma/client';
import { NextResponse, type NextRequest } from 'next/server';
import { z } from 'zod';
import { requireAppUser } from '@/lib/auth/current-user';
import { prisma } from '@/lib/prisma';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

function jsonNoStore(body: unknown, status = 200) {
  return NextResponse.json(body, { status, headers: { 'Cache-Control': 'private, no-store, max-age=0' } });
}

const sharedRow = {
  code: z.string().trim().min(1).max(20).regex(/^[A-Za-z0-9][A-Za-z0-9._/-]*$/),
  name: z.string().trim().min(1).max(120),
  credits: z.number().min(0.1).max(30).refine(value => Math.abs(value * 10 - Math.round(value * 10)) < 1e-8),
};
const gradeRow = z.object({
  ...sharedRow,
  gradePoint: z.number().min(0).max(10),
  letterGrade: z.string().max(4).nullable(),
  marksObtained: z.number().min(0).max(999999).nullable(),
  maxMarks: z.number().positive().max(999999).nullable(),
}).strict().superRefine((value, context) => {
  if ((value.marksObtained === null) !== (value.maxMarks === null)) context.addIssue({ code: 'custom', path: ['marksObtained'], message: 'Provide both marks fields or neither.' });
  if (value.marksObtained !== null && value.maxMarks !== null && value.marksObtained > value.maxMarks) context.addIssue({ code: 'custom', path: ['marksObtained'], message: 'Marks cannot exceed maximum marks.' });
});
const attendanceRow = z.object({
  ...sharedRow,
  classesHeld: z.number().int().min(0).max(100000),
  classesAttended: z.number().int().min(0).max(100000),
  targetPercent: z.number().min(0).max(100),
}).strict().superRefine((value, context) => {
  if (value.classesAttended > value.classesHeld) context.addIssue({ code: 'custom', path: ['classesAttended'], message: 'Attended classes cannot exceed classes held.' });
});

const baseImport = {
  originalName: z.string().trim().min(1).max(120),
  sizeBytes: z.number().int().min(1).max(1_000_000),
  checksum: z.string().regex(/^[a-f0-9]{64}$/i),
};
const importSchema = z.discriminatedUnion('kind', [
  z.object({ ...baseImport, kind: z.literal('GRADE_CARD'), rows: z.array(gradeRow).min(1).max(100) }).strict(),
  z.object({ ...baseImport, kind: z.literal('ATTENDANCE'), rows: z.array(attendanceRow).min(1).max(100) }).strict(),
]);

export async function POST(request: NextRequest, { params }: { params: Promise<{ termId: string }> }) {
  if (request.headers.get('origin') !== request.nextUrl.origin) return jsonNoStore({ error: 'ORIGIN_NOT_ALLOWED' }, 403);
  const contentLength = Number(request.headers.get('content-length') ?? 0);
  if (Number.isFinite(contentLength) && contentLength > 256_000) return jsonNoStore({ error: 'IMPORT_TOO_LARGE' }, 413);

  const auth = await requireAppUser();
  if (!auth.ok) return jsonNoStore({ error: auth.code }, auth.status);
  const { termId } = await params;

  let body: unknown;
  try { body = await request.json(); } catch { return jsonNoStore({ error: 'INVALID_JSON' }, 400); }
  const parsed = importSchema.safeParse(body);
  if (!parsed.success) return jsonNoStore({ error: 'INVALID_IMPORT' }, 400);

  const importInput = parsed.data;
  const safeName = importInput.originalName.replace(/[\\/\\\\]/g, '_').replace(/[\u0000-\u001f]/g, '').slice(0, 120);
  if (!safeName) return jsonNoStore({ error: 'INVALID_FILENAME' }, 400);

  try {
    const term = await prisma.academicTerm.findFirst({ where: { id: termId, userId: auth.user.id }, select: { id: true } });
    if (!term) return jsonNoStore({ error: 'TERM_NOT_FOUND' }, 404);

    const result = await prisma.$transaction(async tx => {
      const importRecord = await tx.academicImport.create({
        data: {
          userId: auth.user.id,
          termId,
          kind: importInput.kind,
          status: 'CONFIRMED',
          originalName: safeName,
          mimeType: 'text/csv',
          sizeBytes: BigInt(importInput.sizeBytes),
          checksum: importInput.checksum.toLowerCase(),
          parserVersion: 'academic-csv-v1',
          sourceLabel: safeName,
          confirmedAt: new Date(),
        },
        select: { id: true, kind: true, status: true, originalName: true, createdAt: true },
      });

      for (const row of importInput.rows) {
        const code = row.code.toUpperCase();
        const existingSubject = await tx.studentSubject.findUnique({ where: { termId_code: { termId, code } } });
        if (existingSubject && existingSubject.userId !== auth.user.id) throw new Error('ACADEMIC_OWNERSHIP_CONFLICT');
        if (existingSubject && (existingSubject.name.trim().toLocaleLowerCase() !== row.name.trim().toLocaleLowerCase() || Math.abs(Number(existingSubject.credits) - row.credits) > 1e-8)) {
          throw new Error('ACADEMIC_SUBJECT_CONFLICT');
        }

        const subject = existingSubject ?? await tx.studentSubject.create({
          data: { userId: auth.user.id, termId, code, name: row.name, credits: row.credits },
        });

        if (importInput.kind === 'GRADE_CARD') {
          const grade = row as z.infer<typeof gradeRow>;
          const values = {
            gradePoint: grade.gradePoint,
            letterGrade: grade.letterGrade,
            marksObtained: grade.marksObtained,
            maxMarks: grade.maxMarks,
            source: 'CSV_IMPORT' as const,
            sourceLabel: safeName,
            observedAt: new Date(),
            importId: importRecord.id,
          };
          await tx.gradeRecord.upsert({
            where: { userId_termId_studentSubjectId: { userId: auth.user.id, termId, studentSubjectId: subject.id } },
            create: { ...values, userId: auth.user.id, termId, studentSubjectId: subject.id },
            update: values,
          });
        } else {
          const attendance = row as z.infer<typeof attendanceRow>;
          await tx.attendanceSnapshot.create({
            data: {
              userId: auth.user.id,
              termId,
              studentSubjectId: subject.id,
              classesHeld: attendance.classesHeld,
              classesAttended: attendance.classesAttended,
              targetPercent: attendance.targetPercent,
              source: 'CSV_IMPORT',
              sourceLabel: safeName,
              observedAt: new Date(),
              importId: importRecord.id,
            },
          });
        }
      }

      return { import: importRecord, importedRows: importInput.rows.length };
    }, { timeout: 15_000 });

    return jsonNoStore(result, 201);
  } catch (error) {
    if (error instanceof Error && error.message === 'ACADEMIC_OWNERSHIP_CONFLICT') return jsonNoStore({ error: 'SUBJECT_OWNERSHIP_CONFLICT' }, 409);
    if (error instanceof Error && error.message === 'ACADEMIC_SUBJECT_CONFLICT') return jsonNoStore({ error: 'SUBJECT_METADATA_CONFLICT' }, 409);
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') return jsonNoStore({ error: 'DUPLICATE_IMPORT' }, 409);
    return jsonNoStore({ error: 'IMPORT_FAILED' }, 503);
  }
}
