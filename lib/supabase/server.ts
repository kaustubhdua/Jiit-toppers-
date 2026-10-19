import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { getSupabaseConfig, type AuthStatus } from './config';

export async function createClient() {
  const config = getSupabaseConfig();
  if (!config) return null;

  const cookieStore = await cookies();
  return createServerClient(config.url, config.publishableKey, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet) {
        try {
          cookiesToSet.forEach(({ name, value, options }) => cookieStore.set(name, value, options));
        } catch {
          // Server Components cannot write cookies. The root proxy refreshes sessions.
        }
      },
    },
  });
}

export async function getAuthStatus(): Promise<AuthStatus> {
  const config = getSupabaseConfig();
  if (!config) return { configured: false, reachable: false, email: null };

  try {
    const supabase = await createClient();
    if (!supabase) return { configured: false, reachable: false, email: null };

    // A missing session is a normal signed-out state. Only call the Auth API
    // to verify an identity when a cookie-backed session actually exists.
    const { data: sessionData } = await supabase.auth.getSession();
    if (!sessionData.session) return { configured: true, reachable: true, email: null };

    const { data, error } = await supabase.auth.getUser();
    if (error) return { configured: true, reachable: false, email: null };
    return { configured: true, reachable: true, email: data.user?.email ?? null };
  } catch {
    return { configured: true, reachable: false, email: null };
  }
}
