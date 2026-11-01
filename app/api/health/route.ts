import { NextResponse } from 'next/server';
import { getSupabaseConfig } from '@/lib/supabase/config';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET() {
  const authConfigured = Boolean(getSupabaseConfig());
  const databaseConfigured = Boolean(process.env.DATABASE_URL);

  if (!databaseConfigured) {
    return NextResponse.json(
      { status: 'degraded', services: { database: 'not_configured', auth: authConfigured ? 'configured_unverified' : 'not_configured' } },
      { status: 503, headers: { 'Cache-Control': 'no-store' } },
    );
  }

  try {
    const { prisma } = await import('@/lib/prisma');
    await prisma.$queryRaw`SELECT 1`;
    const database = 'connected';
    const status = authConfigured ? 'ok' : 'degraded';

    return NextResponse.json(
      { status, services: { database, auth: authConfigured ? 'configured_unverified' : 'not_configured' } },
      { status: authConfigured ? 200 : 503, headers: { 'Cache-Control': 'no-store' } },
    );
  } catch {
    return NextResponse.json(
      { status: 'degraded', services: { database: 'unavailable', auth: authConfigured ? 'configured_unverified' : 'not_configured' } },
      { status: 503, headers: { 'Cache-Control': 'no-store' } },
    );
  }
}
