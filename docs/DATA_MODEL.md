# Data model and service boundary

The Prisma schema is the application domain model. It is not a live database until a PostgreSQL instance is configured and migrations are applied.

## Core relationships

- A branch has multiple curriculum versions.
- A curriculum is scoped to a branch, admission year and version.
- A curriculum links subjects to a semester through `CurriculumSubject`.
- Resources can be associated with subjects and campuses, and record uploader/reviewer relationships.
- Exams can be associated with a subject and retain source/trust metadata.
- Announcements and campus events can be scoped to a campus.
- Discussions have replies; privileged actions can be represented in `AuditEvent`.

## Trust and publication

`DataTrust` describes provenance, not publication permission. `ResourceStatus` and `AnnouncementStatus` control moderation/publication state. A community submission must not become official merely because it has been reviewed; official attribution requires an official source.

## Service boundaries

- `lib/prisma.ts`: server-only Prisma client singleton.
- `lib/validation/`: request-boundary schemas. Never trust browser-provided IDs, role fields or ownership.
- `app/api/health/route.ts`: minimal dependency health check. It reports only whether the database is configured and reachable; it does not expose connection details.

## Before enabling writes

1. Add a committed Prisma migration generated from the reviewed schema.
2. Configure a managed PostgreSQL database and apply migrations in staging.
3. Add authentication and enforce ownership/role checks on the server.
4. Add database-level row policies if the application uses Supabase directly.
5. Add upload scanning, private storage and moderation before accepting files.
6. Add tests for authorization, validation, and moderation transitions.


## Personal academic records (implementation branch)

The academic-record migration adds the following owner-scoped models:

- **AcademicTerm** — a user's academic year and semester.
- **StudentSubject** — course code/name/credits for a specific user-owned term.
- **GradeRecord** — one current grade record per user/term/subject, with optional marks, source, source label and observation time.
- **AttendanceSnapshot** — timestamped attendance counts and target; multiple snapshots preserve history.
- **AcademicImport** — import metadata, checksum, parser version, status and optional private storage key.

The API obtains the owner from a verified Supabase Auth session and never accepts a userId from the request body. Every academic query is scoped to the authenticated user's ID and term/subject ownership is checked before writes. Database constraints validate grade points, marks, credits, attendance counts, semester range and import size. RLS is enabled on the new tables with no browser Data API policies; browser clients must use the authenticated server API rather than direct table access.

CSV files are parsed in the browser, previewed and only the confirmed normalized rows are sent. The raw CSV is not uploaded. The server applies bounded JSON parsing, schema validation, duplicate-code detection and a transaction. Grade imports replace the current grade record for a subject; attendance imports append a dated snapshot. A metadata conflict in course name/credits is rejected instead of silently overwriting the existing subject.

**Not yet verified:** the connected Supabase project is inactive, so the migration has not been applied to a live/staging database and the APIs have not been tested against a real database. Do not enable public academic-record use until the project is restored and two-account ownership tests, migration checks, backup/restore and deletion/export workflows are completed.
