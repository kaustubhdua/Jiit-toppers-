import Link from 'next/link';
import { getAuthStatus } from '@/lib/supabase/server';
import { SignInForm } from './sign-in-form';

export const dynamic = 'force-dynamic';

export default async function SignInPage({ searchParams }: { searchParams: Promise<{ error?: string }> }) {
  const [auth, params] = await Promise.all([getAuthStatus(), searchParams]);
  const callbackFailed = params.error === 'auth_callback_failed';

  return <main className="jt-auth-page">
    <section className="jt-auth-card">
      <span className="jt-kicker">JIIT TOPPERS ACCOUNT</span>
      <h1>Sign in securely.</h1>
      <p className="jt-lead">Use a one-time email link. JIIT Toppers never asks for your JIIT Web kiosk password.</p>
      {callbackFailed && <p className="jt-storage-warning" role="alert">That sign-in link could not be verified or has expired. Request a new link and try again.</p>}
      {!auth.configured
        ? <div className="jt-auth-state" role="status"><strong>Sign-in setup required</strong><p>The deployment needs NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY. No email has been sent.</p></div>
        : !auth.reachable
          ? <div className="jt-auth-state" role="status"><strong>Sign-in is temporarily unavailable</strong><p>The authentication service could not be reached. Please try again later.</p></div>
          : auth.email
            ? <div className="jt-auth-state" role="status"><strong>You are signed in</strong><p>Signed in as {auth.email}.</p><Link className="jt-primary jt-link-button" href="/">Return to JIIT Toppers</Link><form action="/auth/sign-out" method="post"><button className="jt-auth-secondary" type="submit">Sign out</button></form></div>
            : <SignInForm />}
      <p className="jt-auth-footnote">An account does not imply JIIT affiliation or grant access to private university records. Personal academic record features will remain unavailable until their secure workflows are implemented.</p>
      <Link className="jt-auth-back" href="/">← Back to JIIT Toppers</Link>
    </section>
  </main>;
}
