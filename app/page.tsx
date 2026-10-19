import { JIITToppersApp } from '@/components/jiit-toppers-app';
import { getAuthStatus } from '@/lib/supabase/server';

export const dynamic = 'force-dynamic';

export default async function Home() {
  const authStatus = await getAuthStatus();
  return <JIITToppersApp authStatus={authStatus} />;
}
