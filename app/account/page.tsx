import Link from 'next/link';
import { redirect } from 'next/navigation';
import { requireAppUser } from '@/lib/auth/current-user';
import { ProfileForm } from './profile-form';

export const dynamic = 'force-dynamic';

export default async function AccountPage() {
  const result = await requireAppUser();
  if (!result.ok && result.status === 401) redirect('/sign-in');

  return <main className="jt-auth-page">
    <section className="jt-auth-card">
      <span className="jt-kicker">ACCOUNT</span>
      <h1>Your profile.</h1>
      {!result.ok
        ? <div className="jt-auth-state" role="status"><strong>{result.code === 'AUTH_NOT_CONFIGURED' ? 'Sign-in setup required' : result.code === 'AUTH_UNAVAILABLE' ? 'Sign-in is temporarily unavailable' : result.code === 'VERIFIED_EMAIL_REQUIRED' ? 'Verified email required' : 'Account storage is unavailable'}</strong><p>{result.code === 'AUTH_UNAVAILABLE' ? 'The authentication service could not be reached. No profile changes were saved.' : result.code === 'VERIFIED_EMAIL_REQUIRED' ? 'Verify your email address before managing an account.' : 'The application database or authentication setup is not ready. No profile changes were saved.'}</p></div>
        : <>
          <p className="jt-lead">Signed in as <strong>{result.user.email}</strong>.</p>
          <ProfileForm initialName={result.user.name}/><p><Link className="jt-auth-back" href="/account/academics">Manage academic terms, grades and attendance →</Link></p>
          <div className="jt-auth-state"><strong>Academic records are not connected yet</strong><p>This account profile is private, but grades, attendance and other academic records are not yet stored by JIIT Toppers. Do not upload sensitive documents until secure import and deletion workflows are available.</p></div>
        </>}
      <Link className="jt-auth-back" href="/">← Back to JIIT Toppers</Link>
    </section>
  </main>;
}
