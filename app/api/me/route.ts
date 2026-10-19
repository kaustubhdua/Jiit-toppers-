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
  const result = await requireAppUser();
  if (!result.ok) return jsonNoStore({ error: result.code }, result.status);
  return jsonNoStore({ user: result.user });
}

const profileUpdateSchema = z.object({
  name: z.string().trim().min(1).max(80).nullable(),
}).strict();

export async function PATCH(request: NextRequest) {
  // Cookie-authenticated mutations must originate from this exact site.
  if (request.headers.get('origin') !== request.nextUrl.origin) {
    return jsonNoStore({ error: 'ORIGIN_NOT_ALLOWED' }, 403);
  }

  const result = await requireAppUser();
  if (!result.ok) return jsonNoStore({ error: result.code }, result.status);

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return jsonNoStore({ error: 'INVALID_JSON' }, 400);
  }

  const parsed = profileUpdateSchema.safeParse(body);
  if (!parsed.success) return jsonNoStore({ error: 'INVALID_PROFILE' }, 400);

  try {
    const user = await prisma.user.update({
      where: { id: result.user.id },
      data: { name: parsed.data.name },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        campusId: true,
        branchId: true,
        admissionYear: true,
        createdAt: true,
      },
    });
    return jsonNoStore({ user });
  } catch {
    return jsonNoStore({ error: 'DATABASE_UNAVAILABLE' }, 503);
  }
}
