import { NextResponse, type NextRequest } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function POST(request: NextRequest) {
  const supabase = await createClient();
  if (supabase) {
    try {
      const { data } = await supabase.auth.getClaims();
      if (data?.claims) await supabase.auth.signOut();
    } catch {
      // Clear local auth cookies below even if the provider is unreachable.
    }
  }

  const response = NextResponse.redirect(new URL('/', request.url), { status: 303 });
  for (const cookie of request.cookies.getAll()) {
    if (cookie.name.startsWith('sb-')) response.cookies.delete(cookie.name);
  }
  return response;
}
