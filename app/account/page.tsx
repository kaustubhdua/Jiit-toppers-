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
        ? <div className="jt-auth-state" role="status"><strong>Account storage is unavailable</strong><p>Your sign-in may be valid, but the application database is not ready. No profile changes were saved. Please try again later.</p></div>
        : <>
          <p className="jt-lead">Signed in as <strong>{result.user.email}</strong>.</p>
          <ProfileForm initialName={result.user.name}/>
          <div className="jt-auth-state"><strong>Academic records are not connected yet</strong><p>This account profile is private, but grades, attendance and other academic records are not yet stored by JIIT Toppers. Do not upload sensitive documents until secure import and deletion workflows are available.</p></div>
        </>}
      <Link className="jt-auth-back" href="/">← Back to JIIT Toppers</Link>
    </section>
  </main>;
}
