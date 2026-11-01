# Authentication and deployment setup

This application uses Supabase Auth with cookie-backed sessions and Prisma for server-side PostgreSQL access.

## Required environment variables

Configure these only in local secret files or the hosting provider's encrypted environment-variable store:

| Variable | Scope | Purpose |
| --- | --- | --- |
| `NEXT_PUBLIC_SUPABASE_URL` | Browser-visible | Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` | Browser-visible | Supabase publishable key |
| `DATABASE_URL` | Server-only | PostgreSQL connection string used by Prisma |

Never add a Supabase secret/service-role key, database password, or production connection string to Git, a client component, or a `NEXT_PUBLIC_*` variable. The publishable key is not a substitute for server-side authorization.

## Supabase project setup

1. Restore the intended `Jiit-toppers-` Supabase project or select an approved active project. Do not pause or delete another project without the owner's explicit approval.
2. Confirm the project is healthy and note its project URL and current publishable key.
3. Obtain the database connection string from the Supabase dashboard. For a serverless deployment, use the recommended pooler/connection mode for the hosting environment.
4. Add the three variables above to local `.env.local` and the production deployment environment. Do not commit `.env.local`.
5. In Supabase Auth URL configuration, set the production Site URL and exact allowed redirect URL for `/auth/callback`. Add local development callback URLs only for local testing.
6. Verify email OTP delivery and the full PKCE callback round trip in a real browser.
7. Confirm session refresh, logout, expired-link behavior and provider-outage behavior.

## Database and migrations

- Review the live database schema and `supabase_migrations.schema_migrations` before applying anything.
- Back up the database before production schema changes.
- Compare the live schema with `prisma/schema.prisma` and all committed migrations.
- Apply committed Prisma migrations with `npx prisma migrate deploy` only after the migration history is aligned and a backup exists.
- Do not use `prisma db push` or `prisma migrate dev` against production.
- Confirm RLS remains enabled on every application table. The application currently uses server-side Prisma; do not add direct browser table access without explicit grants and ownership policies.

## Authorization test plan

Create two independent test accounts, A and B.

- A and B can create, read, update, export and delete only their own terms and subjects.
- A cannot read, update, delete or infer B's grade, attendance, import or profile data by changing an identifier.
- Cross-owner term/subject combinations must be rejected.
- Unauthenticated and unverified users cannot access private account APIs.
- CSRF/origin checks reject cross-origin mutation requests.
- Provider/database failures fail closed and never return another user's data.

## Current state (2 November 2026)

The linked Supabase organization is on the Free plan. The intended `Jiit-toppers-` project is currently inactive. The organization currently has two active healthy projects, and the prior restoration attempt was blocked by the active-project limit. The inactive project could not return migration history because its database connection timed out.

No project should be paused, deleted, or upgraded without the owner's explicit decision. Until the intended database is restored and migration history is inspected, live authentication and data persistence remain unverified.

## Official references

- Supabase SSR authentication: https://supabase.com/docs/guides/auth/server-side
- Supabase Next.js quickstart: https://supabase.com/docs/guides/getting-started/tutorials/with-nextjs
- Supabase security guidance: https://supabase.com/docs/guides/security
- Prisma production migrations: https://www.prisma.io/docs/orm/prisma-migrate/workflows/development-and-production
- Next.js environment variables: https://nextjs.org/docs/app/guides/environment-variables
