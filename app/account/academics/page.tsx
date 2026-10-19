import Link from 'next/link';
import { redirect } from 'next/navigation';
import { requireAppUser } from '@/lib/auth/current-user';
import { AcademicRecordsManager } from '@/components/academic-records-manager';

export const dynamic = 'force-dynamic';

export default async function AcademicRecordsPage() {
  const result = await requireAppUser();
  if (!result.ok && result.status === 401) redirect('/sign-in');

  return <main className="jt-auth-page">
    <section className="jt-auth-card jt-academics-card">
      {!result.ok
        ? <><span className="jt-kicker">ACADEMICS</span><h1>Academic records.</h1><div className="jt-auth-state" role="status"><strong>{result.code === 'AUTH_NOT_CONFIGURED' ? 'Sign-in setup required' : result.code === 'AUTH_UNAVAILABLE' ? 'Sign-in is temporarily unavailable' : result.code === 'VERIFIED_EMAIL_REQUIRED' ? 'Verified email required' : 'Academic storage is unavailable'}</strong><p>{result.code === 'AUTH_UNAVAILABLE' ? 'The authentication service could not be reached. No record changes were saved.' : result.code === 'VERIFIED_EMAIL_REQUIRED' ? 'Verify your email address before managing academic records.' : 'The application database may be inactive or not configured. No record changes were saved.'}</p></div></>
        : <AcademicRecordsManager />}
      <Link className="jt-auth-back" href="/account">← Back to account</Link>
    </section>
  </main>;
}
