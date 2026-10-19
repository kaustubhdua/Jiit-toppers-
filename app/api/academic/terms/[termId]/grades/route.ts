import { NextResponse, type NextRequest } from 'next/server';
import { z } from 'zod';
import { requireAppUser } from '@/lib/auth/current-user';
import { prisma } from '@/lib/prisma';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

function jsonNoStore(body: unknown, status = 200) {
  return NextResponse.json(body, { status, headers: { 'Cache-Control': 'private, no-store, max-age=0' } });
}

export async function GET(_request: NextRequest, { params }: { params: Promise<{ termId: string }> }) {
  const auth = await requireAppUser();
  if (!auth.ok) return jsonNoStore({ error: auth.code }, auth.status);
  const { termId } = await params;

  try {
    const term = await prisma.academicTerm.findFirst({ where: { id: termId, userId: auth.user.id }, select: { id: true } });
    if (!term) return jsonNoStore({ error: 'TERM_NOT_FOUND' }, 404);
    const grades = await prisma.gradeRecord.findMany({
      where: { userId: auth.user.id, termId },
      orderBy: { observedAt: 'desc' },
      include: { subject: { select: { id: true, code: true, name: true, credits: true } } },
    });
    return jsonNoStore({ grades });
  } catch {
    return jsonNoStore({ error: 'DATABASE_UNAVAILABLE' }, 503);
  }
}

const gradeSchema = z.object({
  studentSubjectId: z.string().min(1).max(100),
  gradePoint: z.number().min(0).max(10),
  letterGrade: z.string().trim().max(4).regex(/^[A-Za-z0-9+-]{0,4}$/).nullable().optional(),
  marksObtained: z.number().min(0).max(999999).nullable().optional(),
  maxMarks: z.number().positive().max(999999).nullable().optional(),
}).strict().superRefine((value, context) => {
  if (value.marksObtained != null && value.maxMarks != null && value.marksObtained > value.maxMarks) {
    context.addIssue({ code: 'custom', path: ['marksObtained'], message: 'Marks obtained cannot exceed maximum marks.' });
  }
});

export async function POST(request: NextRequest, { params }: { params: Promise<{ termId: string }> }) {
  if (request.headers.get('origin') !== request.nextUrl.origin) {
    return jsonNoStore({ error: 'ORIGIN_NOT_ALLOWED' }, 403);
  }
  const auth = await requireAppUser();
  if (!auth.ok) return jsonNoStore({ error: auth.code }, auth.status);
  const { termId } = await params;

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return jsonNoStore({ error: 'INVALID_JSON' }, 400);
  }
  const parsed = gradeSchema.safeParse(body);
  if (!parsed.success) return jsonNoStore({ error: 'INVALID_GRADE' }, 400);

  try {
    const term = await prisma.academicTerm.findFirst({ where: { id: termId, userId: auth.user.id }, select: { id: true } });
    if (!term) return jsonNoStore({ error: 'TERM_NOT_FOUND' }, 404);
    const subject = await prisma.studentSubject.findFirst({
      where: { id: parsed.data.studentSubjectId, userId: auth.user.id, termId },
      select: { id: true },
    });
    if (!subject) return jsonNoStore({ error: 'SUBJECT_NOT_FOUND' }, 404);

    const values = {
      gradePoint: parsed.data.gradePoint,
      letterGrade: parsed.data.letterGrade ?? null,
      marksObtained: parsed.data.marksObtained ?? null,
      maxMarks: parsed.data.maxMarks ?? null,
      source: 'MANUAL' as const,
      sourceLabel: 'Student-entered value',
      observedAt: new Date(),
    };
    const grade = await prisma.gradeRecord.upsert({
      where: { userId_termId_studentSubjectId: { userId: auth.user.id, termId, studentSubjectId: subject.id } },
      create: { ...values, userId: auth.user.id, termId, studentSubjectId: subject.id },
      update: values,
      include: { subject: { select: { id: true, code: true, name: true, credits: true } } },
    });
    return jsonNoStore({ grade });
  } catch {
    return jsonNoStore({ error: 'DATABASE_UNAVAILABLE' }, 503);
  }
}
