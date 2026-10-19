# Authentication setup

JIIT Toppers uses Supabase Auth with cookie-backed server-side sessions and passwordless email sign-in. This is the application's own identity layer; it is separate from the JIIT Web kiosk login.

## Required environment

Copy .env.example to .env.local and set:

- NEXT_PUBLIC_SUPABASE_URL — the Supabase project URL.
- NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY — the project's publishable key.
- DATABASE_URL — only when the server-side Prisma database is active and configured.

Do not add a service-role/secret key to NEXT_PUBLIC_* variables. Never ask users for or store their JIIT Web kiosk password.

## Supabase dashboard

1. Restore/activate the intended Supabase project and confirm the Auth service is healthy.
2. In Authentication > URL Configuration, set the Site URL to the canonical local/deployed origin.
3. Add exact redirect URLs for local development and the deployed origin, including /auth/callback. Avoid wildcard production redirects.
4. Confirm email OTP/magic-link sign-in is enabled and understand the default SMTP sender/rate limits for the project's plan.
5. Test the complete email round trip using an account you control before enabling sign-in publicly.
6. Configure any allowed email domains only after confirming JIIT's actual student/employee email domains and the intended eligibility policy. Do not guess a domain.
7. Keep database tables private. Browser-visible publishable keys are not authorization; access must be enforced by verified server sessions and/or tested RLS policies.

## Implementation notes

- The browser client uses @supabase/ssr.
- The server client uses Next.js cookies and verifies the user via the Supabase Auth API.
- The Next.js 16 proxy refreshes sessions using getClaims; it is not a replacement for per-route authorization.
- The callback exchanges the PKCE code for a session and rejects non-relative redirect paths.
- Sign-out is POST-only.
- If configuration is missing or Auth is unreachable, the app shows a setup/unavailable state instead of pretending the user is signed in.

## Current environment blocker

The connected Jiit-toppers- Supabase project is INACTIVE. Supabase rejected restoration because the organization has reached its active Free-project limit. No other project was paused or deleted. The owner must choose whether to pause an unrelated active free project, upgrade the plan, or use another approved database before the real sign-in round trip and database-backed workflows can be verified.

## Before production

- Verify login, email callback, logout, expired session, unavailable provider and redirect validation.
- Add rate limits and bot protection according to abuse risk.
- Implement per-user data ownership on every API/Server Action and private object download before storing academic records.
- Add privacy notice, data retention/deletion and incident response.
- Never treat an authenticated account as verified JIIT enrollment unless an independent, permitted verification method is implemented.
