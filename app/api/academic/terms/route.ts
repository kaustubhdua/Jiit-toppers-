import { Prisma } from '@prisma/client';
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

export async function GET() {
  const auth = await requireAppUser();
  if (!auth.ok) return jsonNoStore({ error: auth.code }, auth.status);

  try {
    const terms = await prisma.academicTerm.findMany({
      where: { userId: auth.user.id },
      orderBy: [{ academicYear: 'desc' }, { semesterNumber: 'desc' }],
      include: {
        _count: { select: { subjects: true, gradeRecords: true, attendanceSnapshots: true } },
        subjects: {
          where: { userId: auth.user.id },
          orderBy: { code: 'asc' },
          include: {
            grades: { where: { userId: auth.user.id }, orderBy: { observedAt: 'desc' }, take: 1 },
            attendanceSnapshots: { where: { userId: auth.user.id }, orderBy: { observedAt: 'desc' }, take: 1 },
          },
        },
      },
    });
    return jsonNoStore({ terms });
  } catch {
    return jsonNoStore({ error: 'DATABASE_UNAVAILABLE' }, 503);
  }
}

const termSchema = z.object({
  label: z.string().trim().min(1).max(80).refine(value => ![...value].some(character => { const code = character.charCodeAt(0); return code < 32 || code === 127; })),
  academicYear: z.number().int().min(2000).max(2100),
  semesterNumber: z.number().int().min(1).max(12),
}).strict();

export async function POST(request: NextRequest) {
  if (request.headers.get('origin') !== request.nextUrl.origin) {
    return jsonNoStore({ error: 'ORIGIN_NOT_ALLOWED' }, 403);
  }

  const auth = await requireAppUser();
  if (!auth.ok) return jsonNoStore({ error: auth.code }, auth.status);

  const boundedBody = await readJsonBounded(request, 32_000);
  if (!boundedBody.ok) {
    return jsonNoStore(
      { error: boundedBody.reason === 'TOO_LARGE' ? 'REQUEST_TOO_LARGE' : 'INVALID_JSON' },
      boundedBody.reason === 'TOO_LARGE' ? 413 : 400,
    );
  }
  const body: unknown = boundedBody.value;
  const parsed = termSchema.safeParse(body);
  if (!parsed.success) return jsonNoStore({ error: 'INVALID_TERM' }, 400);

  try {
    const termCount = await prisma.academicTerm.count({ where: { userId: auth.user.id } });
    if (termCount >= 30) return jsonNoStore({ error: 'TERM_LIMIT_REACHED' }, 429);
    const term = await prisma.academicTerm.create({ data: { ...parsed.data, userId: auth.user.id } });
    return jsonNoStore({ term }, 201);
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
      return jsonNoStore({ error: 'TERM_ALREADY_EXISTS' }, 409);
    }
    return jsonNoStore({ error: 'DATABASE_UNAVAILABLE' }, 503);
  }
}
