import { Prisma } from '@prisma/client';
import { prisma } from '@/lib/prisma';
import { createClient } from '@/lib/supabase/server';

export type AppUserSummary = {
  id: string;
  email: string;
  name: string | null;
  role: 'STUDENT' | 'MODERATOR' | 'ADMIN';
  campusId: string | null;
  branchId: string | null;
  admissionYear: number | null;
  createdAt: Date;
};

export type CurrentAppUserResult =
  | { ok: true; user: AppUserSummary }
  | { ok: false; status: 401 | 403 | 409 | 503; code: 'AUTH_REQUIRED' | 'VERIFIED_EMAIL_REQUIRED' | 'ACCOUNT_LINK_CONFLICT' | 'AUTH_NOT_CONFIGURED' | 'DATABASE_UNAVAILABLE' };

export async function requireAppUser(): Promise<CurrentAppUserResult> {
  const supabase = await createClient();
  if (!supabase) return { ok: false, status: 503, code: 'AUTH_NOT_CONFIGURED' };

  let authUser;
  try {
    const { data, error } = await supabase.auth.getUser();
    if (error) {
      if (error.name === 'AuthSessionMissingError') return { ok: false, status: 401, code: 'AUTH_REQUIRED' };
      return { ok: false, status: 503, code: 'DATABASE_UNAVAILABLE' };
    }
    authUser = data.user;
  } catch {
    return { ok: false, status: 503, code: 'DATABASE_UNAVAILABLE' };
  }

  if (!authUser) return { ok: false, status: 401, code: 'AUTH_REQUIRED' };
  const email = authUser.email?.trim().toLowerCase();
  if (!email || !authUser.email_confirmed_at) {
    return { ok: false, status: 403, code: 'VERIFIED_EMAIL_REQUIRED' };
  }

  const rawName = authUser.user_metadata?.full_name ?? authUser.user_metadata?.name;
  const name = typeof rawName === 'string' ? rawName.trim().slice(0, 80) || null : null;

  try {
    const user = await prisma.user.upsert({
      where: { authProviderId: authUser.id },
      create: { authProviderId: authUser.id, email, name },
      // Do not overwrite a student's chosen display name with provider metadata.
      update: { email },
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
    return { ok: true, user };
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
      // Do not silently link an existing account solely because the email matches.
      return { ok: false, status: 409, code: 'ACCOUNT_LINK_CONFLICT' };
    }
    return { ok: false, status: 503, code: 'DATABASE_UNAVAILABLE' };
  }
}
