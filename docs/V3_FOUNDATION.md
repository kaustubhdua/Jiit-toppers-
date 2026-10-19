# V3 Foundation: implementation status

This document is the release-gate source of truth. A feature is not complete merely because its card or navigation item exists.

## Implemented in the repository

- Next.js App Router application with separated navigation, home and workspace components.
- Prototype workspace cards for academics, Study Vault, exams, career, campus and community.
- Explicit prototype messaging; no fabricated live student data is shown in the current UI.
- Prisma PostgreSQL domain schema covering users, campuses, branches, curricula, subjects, resources, exams, companies, placement experiences, announcements, events, discussions and audit events.
- Server-only Prisma singleton and a database health endpoint that reports degraded status without exposing connection details.
- Zod resource-submission shape validation, including HTTP(S)-only source URLs and rejection of unknown fields.
- Accessible not-found, route error and root error fallbacks; keyboard focus indicators and reduced-motion handling.
- GitHub Actions checks for academic unit tests, lint, TypeScript, Prisma schema validation and production build.
- Academic attendance and SGPA calculators are integrated into the Academics workspace. Calculation logic is isolated in dependency-free utilities and covered by Node's built-in test runner.

## Not implemented / release blockers

- No committed package lockfile; CI currently uses npm install, so dependency resolution is not fully reproducible.
- Committed Prisma migrations exist for initial schema creation, RLS enablement and foreign-key indexes; however, live schema/migration-history alignment and rollback/recovery have not been verified against the currently inactive Supabase project.
- No configured production database, seed/import pipeline or staging environment.
- No authentication, session lifecycle, onboarding or server-side role authorization.
- No database row-level security policies. Prisma models alone do not enforce authorization.
- No resource upload route, private object storage, file-size/type enforcement, malware scanning, signed download flow, moderation or takedown.
- No live JIIT curriculum, exam schedule, timetable, campus service or placement data source.
- Attendance and SGPA planning tools are functional for user-entered estimates; CGPA, persistence and institution-specific grading validation remain outstanding.
- Search filters only the currently displayed prototype cards; it is not a server-backed global search.
- Unit tests currently cover academic calculation utilities only. No end-to-end tests, full accessibility audit, dependency vulnerability gate, runtime monitoring or verified production deployment.
- No verified production canonical domain; do not publish a fabricated sitemap URL.

## Release gates

### Foundation
- Commit a package lock generated in a Node-enabled environment and restore npm ci with lockfile-based caching. CI temporarily uses npm install until the lockfile is committed.
- Run lint, typecheck, Prisma validation, tests and next build from a clean checkout.
- Keep data access in server-only modules and presentation components focused.
- Provide loading, empty, error and unavailable states for every live-data route.

### Data and trust
- Add versioned migrations and test them against a disposable/staging PostgreSQL database.
- Store provenance, source URL and last-checked time for externally sourced records.
- Keep OFFICIAL, VERIFIED, COMMUNITY and DEMO distinct in both data and UI.
- Do not seed production with fabricated people, student records, recruiter outcomes or institutional claims.

### Security and privacy
- Add authentication before accepting personal records or contributions.
- Enforce authorization on the server and in database policies; never trust a client-supplied role or owner ID.
- Validate all inputs at the boundary and apply request size/rate limits.
- Keep uploads private by default; validate actual file content, use short-lived download URLs and provide moderation/takedown.
- Keep secrets server-only and record privileged changes in an audit trail.

### Product acceptance
- Make Study Vault browse/search/filter functional against approved resources.
- Implement student-owned attendance and grade calculators with explicit assumptions; do not imply institutional integration.
- Add sourced academic, exam and campus records with freshness labels.
- Add moderated placement and community contributions only after identity and permissions are in place.
- Defer AI answers until retrieval is grounded in approved, source-attributed records.

### Release and operations
- Configure preview/staging/production environments and least-privilege secrets.
- Verify database region, migration deployment, health checks, logs, alerting and rollback.
- Test mobile layouts, keyboard navigation, screen-reader labels, contrast and production performance.
- Confirm domain and canonical metadata before enabling a sitemap or search indexing.

## External setup required

The repository can be improved without secrets, but live services cannot be honestly activated without owner-controlled configuration. Required setup includes a PostgreSQL project and connection string, an authentication provider decision, storage bucket and policies, approved JIIT data sources/permissions, and Vercel environment configuration. Add secrets directly to the relevant provider dashboards, never to chat or committed files.

## Next implementation slice

1. Generate and commit a lockfile in a Node-enabled environment, then switch CI to npm ci.
2. Run CI and resolve any test/build failures.
3. Finalize migrations and test database constraints.
4. Select and configure authentication, then add role-safe access.
5. Implement a small, end-to-end Study Vault flow before adding more workspace cards.
