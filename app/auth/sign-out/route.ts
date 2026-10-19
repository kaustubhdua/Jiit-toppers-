import { NextResponse, type NextRequest } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function POST(request: NextRequest) {
  const supabase = await createClient();
  if (supabase) {
    try {
      const { data } = await supabase.auth.getClaims();
      if (data?.claims) await supabase.auth.signOut();
    } catch {
      // Redirect without leaking provider errors; session refresh can retry on next request.
    }
  }

  return NextResponse.redirect(new URL('/', request.url), { status: 303 });
}
