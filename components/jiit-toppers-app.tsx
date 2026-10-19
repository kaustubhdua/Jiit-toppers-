'use client';

import { useState } from 'react';
import type { AuthStatus } from '@/lib/supabase/config';
import { JTHome } from './jt-home';
import { JTNavigation, type Section } from './jt-navigation';
import { JTWorkspace } from './jt-workspace';

export function JIITToppersApp({ authStatus }: { authStatus: AuthStatus }) {
  const [section, setSection] = useState<Section>('home');
  const [query, setQuery] = useState('');

  const navigate = (next: Section) => {
    setSection(next);
    if (typeof window !== 'undefined') window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return <div className="jt-shell">
    <JTNavigation section={section} query={query} authStatus={authStatus} onNavigate={navigate} onQueryChange={setQuery}/>
    <main className="jt-container">
      {section === 'home' ? <JTHome onNavigate={navigate}/> : <JTWorkspace section={section} query={query}/>}
    </main>
    <footer className="jt-footer"><div className="jt-container"><strong>JIIT TOPPERS</strong><span>Student-led information is distinct from official institutional sources.</span></div></footer>
  </div>;
}
