# JIIT Toppers

A student-first academic workspace for JIIT students. The current application focuses on personal academic records and study workflows; it does **not** claim to be an official JIIT portal or an official source of university records.

## Implemented in the repository

- Next.js App Router application with responsive workspace navigation.
- Supabase SSR cookie-session authentication foundation, email OTP/PKCE callback and verified-email checks.
- Personal academic terms, subjects, grade records and attendance snapshots.
- Attendance, SGPA/CGPA and forecast calculations.
- Reviewable CSV import workflow, import history, JSON export and record deletion.
- Browser-local study planner and exam schedule planner with iCalendar export.
- Personal PYQ reference tracker. It stores user-entered metadata and HTTPS references locally; it does not mirror, proxy or claim ownership of third-party archives.
- Server-side ownership checks, bounded request parsing, validation, same-origin mutation checks and database constraints.
- Automated tests, lint, typecheck, Prisma schema validation and production build in GitHub Actions.

## Tech stack

- Next.js 16, React 19 and TypeScript
- Supabase Auth SSR
- Prisma and PostgreSQL
- Zod validation
- Node.js test runner

## Run locally

Requirements: Node.js 22 and npm.

```bash
npm ci
cp .env.example .env.local
```

Fill in the local environment variables in `.env.local`:

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`
- `DATABASE_URL`

Then:

```bash
npm run db:generate
npm run dev
```

Open http://localhost:3000.

Never commit `.env.local`, database credentials, Supabase secret/service-role keys or production secrets. Do not expose database credentials through a `NEXT_PUBLIC_*` variable.

## Quality checks

```bash
npm test
npm run lint
npm run typecheck
npm run db:validate
npm run build
```

## Current release status

**Active prototype; not production-ready.** A source-code build does not prove that the live Auth provider, database, tenant isolation or production deployment works.

The release audit currently records these open gates:

1. Restore or select an approved, healthy Supabase project. Do not pause, delete or upgrade another project without explicit owner approval.
2. Inspect live migration history and schema, back up the database, and reconcile drift before applying migrations.
3. Configure exact Auth redirect URLs and encrypted deployment secrets.
4. Verify OTP/PKCE, session refresh, sign-out, expired links and provider outage behavior.
5. Run two-account tests proving that one student cannot read, alter, export or delete another student's data.
6. Verify production database connectivity, deploy the intended commit and run production smoke tests.

Several larger campus features remain planned, including a verified curriculum explorer, moderated resource submissions, placements, discussions, clubs and events. They should not be described as implemented until their complete workflows and moderation safeguards exist.

See [the implementation and release-readiness audit](docs/IMPLEMENTATION_AUDIT_2026-11-02.md), [authentication and deployment setup](docs/AUTH_SETUP.md), and [data model and ownership boundaries](docs/DATA_MODEL.md).

## Data and trust boundaries

- Personal academic records are student-entered or imported and are not official JIIT records.
- Official university information should be linked to the relevant JIIT source with a checked date.
- Community material must be labelled as community material and moderated before publication.
- The PYQ tracker stores references and notes locally; it does not fetch submitted URLs or copy third-party PDFs.
- Do not enter sensitive information into the browser-local tracker.

## Security

See [SECURITY.md](SECURITY.md) for responsible vulnerability reporting. Review the threat model, environment configuration, live migration state and authorization behavior before using this with real student data.
