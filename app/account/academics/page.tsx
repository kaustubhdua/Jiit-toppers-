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
        ? <><span className="jt-kicker">ACADEMICS</span><h1>Academic records.</h1><div className="jt-auth-state" role="status"><strong>Academic storage is unavailable</strong><p>Your records are not accessible right now. The database may be inactive or not configured. No record changes were saved.</p></div></>
        : <AcademicRecordsManager />}
      <Link className="jt-auth-back" href="/account">← Back to account</Link>
    </section>
  </main>;
}
