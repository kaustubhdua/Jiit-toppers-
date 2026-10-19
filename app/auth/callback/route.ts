import { NextResponse, type NextRequest } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { safeRelativePath } from '@/lib/security/safe-redirect.mjs';

export async function GET(request: NextRequest) {
  const code = request.nextUrl.searchParams.get('code');
  const next = safeRelativePath(request.nextUrl.searchParams.get('next'));
  const supabase = await createClient();

  if (!code || !supabase) {
    return NextResponse.redirect(new URL('/sign-in?error=auth_callback_failed', request.url));
  }

  try {
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (error) {
      return NextResponse.redirect(new URL('/sign-in?error=auth_callback_failed', request.url));
    }
  } catch {
    return NextResponse.redirect(new URL('/sign-in?error=auth_callback_failed', request.url));
  }

  return NextResponse.redirect(new URL(next, request.url));
}
