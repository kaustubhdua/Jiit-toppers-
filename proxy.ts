import { type NextRequest } from 'next/server';
import { updateSession } from '@/lib/supabase/proxy';

export async function proxy(request: NextRequest) {
  return updateSession(request);
}

// Keep auth refresh scoped to routes that currently read or mutate the session.
// Add every future protected workspace/API route here before introducing private data.
export const config = {
  matcher: ['/', '/sign-in', '/auth/:path*'],
};
