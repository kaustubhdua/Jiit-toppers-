import { NextResponse, type NextRequest } from 'next/server';
import { requireAppUser } from '@/lib/auth/current-user';
import { prisma } from '@/lib/prisma';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

function jsonNoStore(body: unknown, status = 200) {
  return NextResponse.json(body, { status, headers: { 'Cache-Control': 'private, no-store, max-age=0' } });
}

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ termId: string }> }) {
  if (request.headers.get('origin') !== request.nextUrl.origin) {
    return jsonNoStore({ error: 'ORIGIN_NOT_ALLOWED' }, 403);
  }
  const auth = await requireAppUser();
  if (!auth.ok) return jsonNoStore({ error: auth.code }, auth.status);
  const { termId } = await params;

  try {
    const term = await prisma.academicTerm.findFirst({ where: { id: termId, userId: auth.user.id }, select: { id: true } });
    if (!term) return jsonNoStore({ error: 'TERM_NOT_FOUND' }, 404);

    // Never delete database metadata while a future private object still needs storage cleanup.
    const storedImport = await prisma.academicImport.findFirst({
      where: { userId: auth.user.id, termId, storageKey: { not: null } },
      select: { id: true },
    });
    if (storedImport) return jsonNoStore({ error: 'STORAGE_CLEANUP_REQUIRED' }, 409);

    await prisma.$transaction(async tx => {
      await tx.academicImport.deleteMany({ where: { userId: auth.user.id, termId } });
      await tx.academicTerm.delete({ where: { id: termId, userId: auth.user.id } });
    });
    return jsonNoStore({ deleted: true });
  } catch {
    return jsonNoStore({ error: 'DATABASE_UNAVAILABLE' }, 503);
  }
}
