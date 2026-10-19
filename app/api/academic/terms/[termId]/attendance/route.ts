import { NextResponse, type NextRequest } from 'next/server';
import { z } from 'zod';
import { requireAppUser } from '@/lib/auth/current-user';
import { prisma } from '@/lib/prisma';
import { readJsonBounded } from '@/lib/http/read-json-bounded';

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
    const snapshots = await prisma.attendanceSnapshot.findMany({
      where: { userId: auth.user.id, termId },
      orderBy: { observedAt: 'desc' },
      include: { subject: { select: { id: true, code: true, name: true, credits: true } } },
    });
    return jsonNoStore({ snapshots });
  } catch {
    return jsonNoStore({ error: 'DATABASE_UNAVAILABLE' }, 503);
  }
}

const attendanceSchema = z.object({
  studentSubjectId: z.string().min(1).max(100),
  classesHeld: z.number().int().min(0).max(100000),
  classesAttended: z.number().int().min(0).max(100000),
  targetPercent: z.number().min(0).max(100).default(75),
}).strict().superRefine((value, context) => {
  if (value.classesAttended > value.classesHeld) {
    context.addIssue({ code: 'custom', path: ['classesAttended'], message: 'Attended classes cannot exceed classes held.' });
  }
});

export async function POST(request: NextRequest, { params }: { params: Promise<{ termId: string }> }) {
  if (request.headers.get('origin') !== request.nextUrl.origin) {
    return jsonNoStore({ error: 'ORIGIN_NOT_ALLOWED' }, 403);
  }
  const auth = await requireAppUser();
  if (!auth.ok) return jsonNoStore({ error: auth.code }, auth.status);
  const { termId } = await params;

  const boundedBody = await readJsonBounded(request, 32_000);
  if (!boundedBody.ok) {
    return jsonNoStore(
      { error: boundedBody.reason === 'TOO_LARGE' ? 'REQUEST_TOO_LARGE' : 'INVALID_JSON' },
      boundedBody.reason === 'TOO_LARGE' ? 413 : 400,
    );
  }
  const body: unknown = boundedBody.value;
  const parsed = attendanceSchema.safeParse(body);
  if (!parsed.success) return jsonNoStore({ error: 'INVALID_ATTENDANCE' }, 400);

  try {
    const term = await prisma.academicTerm.findFirst({ where: { id: termId, userId: auth.user.id }, select: { id: true } });
    if (!term) return jsonNoStore({ error: 'TERM_NOT_FOUND' }, 404);
    const subject = await prisma.studentSubject.findFirst({
      where: { id: parsed.data.studentSubjectId, userId: auth.user.id, termId },
      select: { id: true },
    });
    if (!subject) return jsonNoStore({ error: 'SUBJECT_NOT_FOUND' }, 404);
    const snapshotCount = await prisma.attendanceSnapshot.count({ where: { userId: auth.user.id, termId } });
    if (snapshotCount >= 1000) return jsonNoStore({ error: 'ATTENDANCE_HISTORY_LIMIT_REACHED' }, 429);

    const snapshot = await prisma.attendanceSnapshot.create({
      data: {
        userId: auth.user.id,
        termId,
        studentSubjectId: subject.id,
        classesHeld: parsed.data.classesHeld,
        classesAttended: parsed.data.classesAttended,
        targetPercent: parsed.data.targetPercent,
        source: 'MANUAL',
        sourceLabel: 'Student-entered value',
        observedAt: new Date(),
      },
      include: { subject: { select: { id: true, code: true, name: true, credits: true } } },
    });
    return jsonNoStore({ snapshot }, 201);
  } catch {
    return jsonNoStore({ error: 'DATABASE_UNAVAILABLE' }, 503);
  }
}
