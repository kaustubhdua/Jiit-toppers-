import { NextResponse } from 'next/server';
import { requireAppUser } from '@/lib/auth/current-user';
import { prisma } from '@/lib/prisma';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET() {
  const auth = await requireAppUser();
  if (!auth.ok) return NextResponse.json({ error: auth.code }, { status: auth.status, headers: { 'Cache-Control': 'private, no-store, max-age=0' } });

  try {
    const terms = await prisma.academicTerm.findMany({
      where: { userId: auth.user.id },
      orderBy: [{ academicYear: 'desc' }, { semesterNumber: 'desc' }],
      select: {
        id: true,
        label: true,
        academicYear: true,
        semesterNumber: true,
        startsAt: true,
        endsAt: true,
        createdAt: true,
        updatedAt: true,
        subjects: {
          where: { userId: auth.user.id },
          orderBy: { code: 'asc' },
          select: { id: true, code: true, name: true, credits: true, createdAt: true, updatedAt: true },
        },
        gradeRecords: {
          where: { userId: auth.user.id },
          orderBy: { observedAt: 'desc' },
          select: {
            id: true, studentSubjectId: true, gradePoint: true, letterGrade: true,
            marksObtained: true, maxMarks: true, source: true, sourceLabel: true,
            observedAt: true, createdAt: true, updatedAt: true,
          },
        },
        attendanceSnapshots: {
          where: { userId: auth.user.id },
          orderBy: { observedAt: 'desc' },
          select: {
            id: true, studentSubjectId: true, classesHeld: true, classesAttended: true,
            targetPercent: true, source: true, sourceLabel: true, observedAt: true, createdAt: true,
          },
        },
        imports: {
          where: { userId: auth.user.id, deletedAt: null },
          orderBy: { createdAt: 'desc' },
          select: {
            id: true, kind: true, status: true, originalName: true, mimeType: true,
            sizeBytes: true, checksum: true, parserVersion: true, sourceLabel: true,
            createdAt: true, confirmedAt: true,
          },
        },
      },
    });

    const safeTerms = terms.map(term => ({
      ...term,
      imports: term.imports.map(item => ({ ...item, sizeBytes: item.sizeBytes.toString() })),
    }));
    return NextResponse.json(
      { exportedAt: new Date().toISOString(), terms: safeTerms },
      { headers: { 'Cache-Control': 'private, no-store, max-age=0' } },
    );
  } catch {
    return NextResponse.json({ error: 'DATABASE_UNAVAILABLE' }, { status: 503, headers: { 'Cache-Control': 'private, no-store, max-age=0' } });
  }
}
