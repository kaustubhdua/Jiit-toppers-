'use client';

import { useState, type FormEvent } from 'react';

export function ProfileForm({ initialName }: { initialName: string | null }) {
  const [name, setName] = useState(initialName ?? '');
  const [message, setMessage] = useState('');
  const [busy, setBusy] = useState(false);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const cleanName = name.trim();
    if (cleanName.length > 80) {
      setMessage('Display name must be 80 characters or fewer.');
      return;
    }

    setBusy(true);
    setMessage('');
    try {
      const response = await fetch('/api/me', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: cleanName || null }),
        cache: 'no-store',
      });
      if (!response.ok) {
        setMessage(response.status === 503 ? 'Account storage is unavailable. Try again later.' : 'We could not save this change. Please check your input.');
        return;
      }
      setMessage('Profile saved.');
    } catch {
      setMessage('Network error. Your profile was not saved.');
    } finally {
      setBusy(false);
    }
  }

  return <form className="jt-profile-form" onSubmit={submit}>
    <label htmlFor="profile-name">Display name <span>(optional)</span></label>
    <input id="profile-name" value={name} maxLength={80} onChange={event => setName(event.target.value)} placeholder="How should we address you?" />
    <button className="jt-primary" type="submit" disabled={busy}>{busy ? 'Saving…' : 'Save profile'}</button>
    <p role="status" aria-live="polite">{message}</p>
  </form>;
}
