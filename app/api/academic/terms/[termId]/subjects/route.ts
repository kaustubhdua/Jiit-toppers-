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

async function ownedTerm(userId: string, termId: string) {
  return prisma.academicTerm.findFirst({ where: { id: termId, userId }, select: { id: true } });
}

export async function GET(_request: NextRequest, { params }: { params: Promise<{ termId: string }> }) {
  const auth = await requireAppUser();
  if (!auth.ok) return jsonNoStore({ error: auth.code }, auth.status);
  const { termId } = await params;

  try {
    if (!await ownedTerm(auth.user.id, termId)) return jsonNoStore({ error: 'TERM_NOT_FOUND' }, 404);
    const subjects = await prisma.studentSubject.findMany({
      where: { userId: auth.user.id, termId },
      orderBy: { code: 'asc' },
      include: {
        grades: { where: { userId: auth.user.id }, orderBy: { observedAt: 'desc' }, take: 1 },
        attendanceSnapshots: { where: { userId: auth.user.id }, orderBy: { observedAt: 'desc' }, take: 1 },
      },
    });
    return jsonNoStore({ subjects });
  } catch {
    return jsonNoStore({ error: 'DATABASE_UNAVAILABLE' }, 503);
  }
}

const subjectSchema = z.object({
  code: z.string().trim().min(1).max(20).regex(/^[A-Za-z0-9][A-Za-z0-9._/-]*$/),
  name: z.string().trim().min(1).max(120).refine(value => ![...value].some(character => { const code = character.charCodeAt(0); return code < 32 || code === 127; })),
  credits: z.number().min(0.1).max(30).refine(value => Math.abs(value * 10 - Math.round(value * 10)) < 1e-8),
}).strict();

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
  const parsed = subjectSchema.safeParse(body);
  if (!parsed.success) return jsonNoStore({ error: 'INVALID_SUBJECT' }, 400);

  try {
    if (!await ownedTerm(auth.user.id, termId)) return jsonNoStore({ error: 'TERM_NOT_FOUND' }, 404);
    const subjectCount = await prisma.studentSubject.count({ where: { userId: auth.user.id, termId } });
    if (subjectCount >= 50) return jsonNoStore({ error: 'SUBJECT_LIMIT_REACHED' }, 429);
    const subject = await prisma.studentSubject.create({
      data: {
        userId: auth.user.id,
        termId,
        code: parsed.data.code.toUpperCase(),
        name: parsed.data.name,
        credits: parsed.data.credits,
      },
    });
    return jsonNoStore({ subject }, 201);
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
      return jsonNoStore({ error: 'SUBJECT_ALREADY_EXISTS' }, 409);
    }
    return jsonNoStore({ error: 'DATABASE_UNAVAILABLE' }, 503);
  }
}

const subjectUpdateSchema = z.object({
  id: z.string().min(1).max(100),
  name: z.string().trim().min(1).max(120),
  credits: z.number().min(0.1).max(30).refine(value => Math.abs(value * 10 - Math.round(value * 10)) < 1e-8),
}).strict();

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ termId: string }> }) {
  if (request.headers.get('origin') !== request.nextUrl.origin) return jsonNoStore({ error: 'ORIGIN_NOT_ALLOWED' }, 403);
  const auth = await requireAppUser();
  if (!auth.ok) return jsonNoStore({ error: auth.code }, auth.status);
  const { termId } = await params;

  let body: unknown;
  try { body = await request.json(); } catch { return jsonNoStore({ error: 'INVALID_JSON' }, 400); }
  const parsed = subjectUpdateSchema.safeParse(body);
  if (!parsed.success) return jsonNoStore({ error: 'INVALID_SUBJECT' }, 400);

  try {
    if (!await ownedTerm(auth.user.id, termId)) return jsonNoStore({ error: 'TERM_NOT_FOUND' }, 404);
    const existing = await prisma.studentSubject.findFirst({
      where: { id: parsed.data.id, userId: auth.user.id, termId },
      select: { id: true },
    });
    if (!existing) return jsonNoStore({ error: 'SUBJECT_NOT_FOUND' }, 404);
    const subject = await prisma.studentSubject.update({
      where: { id: existing.id, userId: auth.user.id, termId },
      data: { name: parsed.data.name, credits: parsed.data.credits },
    });
    return jsonNoStore({ subject });
  } catch {
    return jsonNoStore({ error: 'DATABASE_UNAVAILABLE' }, 503);
  }
}
