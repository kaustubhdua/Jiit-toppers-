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
  label: z.string().trim().min(1).max(80),
  academicYear: z.number().int().min(2000).max(2100),
  semesterNumber: z.number().int().min(1).max(12),
}).strict();

export async function POST(request: NextRequest) {
  if (request.headers.get('origin') !== request.nextUrl.origin) {
    return jsonNoStore({ error: 'ORIGIN_NOT_ALLOWED' }, 403);
  }

  const auth = await requireAppUser();
  if (!auth.ok) return jsonNoStore({ error: auth.code }, auth.status);

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return jsonNoStore({ error: 'INVALID_JSON' }, 400);
  }
  const parsed = termSchema.safeParse(body);
  if (!parsed.success) return jsonNoStore({ error: 'INVALID_TERM' }, 400);

  try {
    const term = await prisma.academicTerm.create({ data: { ...parsed.data, userId: auth.user.id } });
    return jsonNoStore({ term }, 201);
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
      return jsonNoStore({ error: 'TERM_ALREADY_EXISTS' }, 409);
    }
    return jsonNoStore({ error: 'DATABASE_UNAVAILABLE' }, 503);
  }
}
