'use client';

import { useState, type FormEvent } from 'react';
import { createClient } from '@/lib/supabase/client';

export function SignInForm() {
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [busy, setBusy] = useState(false);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const cleanEmail = email.trim().toLowerCase();
    if (!cleanEmail || cleanEmail.length > 254) {
      setMessage('Enter a valid email address.');
      return;
    }

    setBusy(true);
    setMessage('');
    try {
      const supabase = createClient();
      const { error } = await supabase.auth.signInWithOtp({
        email: cleanEmail,
        options: {
          emailRedirectTo: new URL('/auth/callback?next=/', window.location.origin).toString(),
          shouldCreateUser: true,
        },
      });
      if (error) {
        setMessage('We could not send a sign-in link. Check the email address and try again later.');
      } else {
        // Keep the response generic so the UI does not reveal whether an account exists.
        setMessage('If this address can sign in, a secure link will arrive shortly. Check your inbox and spam folder.');
      }
    } catch {
      setMessage('Sign-in is not configured or is temporarily unavailable. Please try again later.');
    } finally {
      setBusy(false);
    }
  }

  return <form className="jt-signin-form" onSubmit={submit}>
    <label htmlFor="signin-email">Email address</label>
    <input id="signin-email" type="email" autoComplete="email" required maxLength={254} value={email} onChange={event => setEmail(event.target.value)} placeholder="you@example.com" />
    <button className="jt-primary" type="submit" disabled={busy || !email.trim()}>{busy ? 'Sending link…' : 'Email me a sign-in link'}</button>
    <p className="jt-signin-message" role="status" aria-live="polite">{message}</p>
  </form>;
}
