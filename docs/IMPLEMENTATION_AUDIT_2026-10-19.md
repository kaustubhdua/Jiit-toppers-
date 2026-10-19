# JIIT Toppers — Implementation Audit

**Audit date:** 19 October 2026  
**Scope:** Repository source available on the main branch at audit start, plus changes made on feature/academic-core-and-pyq.  
**Important:** This is a source-level audit. A clean local build, real Supabase deployment, authenticated workflow, and production smoke test have not yet been executed in this environment.

## Executive verdict

**Not production-ready yet.** The repository is a Next.js/TypeScript foundation prototype. Its UI shell, domain schema, health route, validation utility and local academic calculations are useful starting points, but most workspace cards are placeholders. There is no configured authentication or server-side user ownership enforcement, no verified migration/deployment process, no persisted user workflow, and no current approved JIIT portal connector.

This branch now includes: attendance forecasts and credit-weighted SGPA/CGPA estimates with tests; source-aware PYQJIIT/Web kiosk links; a browser-local study planner; Supabase Auth scaffolding and account profile flow; owner-scoped academic term/subject/grade/attendance APIs; and a bounded, locally parsed CSV import with preview, server validation, transaction and provenance. These features are code-complete slices but remain unverified against the real database while Supabase is inactive.

These changes are **not** a claim that the overall project is finished.

## Verified repository shape

- Next.js App Router + React 19 + TypeScript.
- Prisma 6/PostgreSQL schema with user, campus, branch, curriculum, subject, resource, exam, company, placement experience, announcement, campus event, discussion and audit models.
- Academic calculation functions with Node's built-in test runner.
- A client-side application shell with navigation/search and workspace cards.
- A health endpoint that checks DATABASE_URL and runs a simple database query.
- A Zod resource-submission validation schema.
- CI workflow with test, lint, typecheck, Prisma validation and production build steps.

## Functional vs placeholder status

| Area | Current status | Release requirement |
|---|---|---|
| Home/navigation | UI works as a client-side prototype; navigation is local state, not deep-link routing | URL state/history, responsive and accessibility verification |
| Academic calculators | Local attendance and SGPA existed; branch adds attendance forecasting and cumulative GPA calculation | Verify calculations against current programme policy; automated tests must pass |
| CGPA/grade history | Owner-scoped grade API, manual grade entry and CSV grade import implemented; live database unavailable | Verify live persistence and official grading policy; JSON export and term deletion are implemented, but per-record deletion still needs review |
| Attendance records | Owner-scoped snapshots API, manual entry and CSV attendance import implemented; live database unavailable | Verify live persistence and history; JSON export and term deletion are implemented, but per-snapshot deletion and policy/source verification remain |
| Study Vault | Workspace scaffold; branch adds outbound PYQJIIT and Web kiosk source cards | Approved resource catalogue, permissions, metadata, moderation and search |
| PYQs | External archive link only; no archive copying or API integration | Maintainer permission/API/terms review before import or mirroring |
| Timetable/exams | Placeholder cards | Verified source or user import, preview, timezone and stale-data handling |
| Campus | Placeholder cards | Verified source catalogue, freshness and correction process |
| Career/placements | Placeholder cards and schema | Sourced directory, moderation, privacy and anti-misinformation workflow |
| Community | Placeholder cards and schema | Authentication, ownership, moderation, abuse reporting and rate limits |
| Authentication | Supabase Auth passwordless email-link scaffold, callback/sign-out, account profile and verified-session-to-app-user mapping implemented; real round trip unverified | Restore/configure project, verify email callback/session/logout, profile persistence and failure modes |
| Authorization | Academic APIs derive userId from verified Supabase identity and scope term/subject/grade/attendance queries; no cross-user integration test against live DB yet | Add automated cross-user denial tests and review every future API/download |
| Database | Prisma schema exists; no verified migration/deployment process in this audit | Lockfile, versioned migrations, staging validation, backup/restore |
| File storage | Original CSV is parsed in-browser and is not uploaded; only validated rows are posted after confirmation. No raw-document storage exists. | Verify bounded payload handling; add private storage only with owner checks, signed downloads, retention/deletion |
| JIIT integration | Not connected or verified | Permission and current sign-in flow review; connector must remain optional |
| Monitoring/operations | Health endpoint only | Error monitoring policy, deployment smoke tests, alerting, rollback and restore |
| Production | Not verified | Actual deployment, domain, environment variables and end-to-end smoke tests |

## P0 release blockers

1. **Authentication and identity:** choose and configure an identity provider; keep JIIT portal identity separate.
2. **Authorization:** every private read/write/download must derive the owner from a verified server session. Never trust a client-supplied owner ID or role.
3. **Database/migrations:** verify the live schema, migration history, policies, and staging/production separation. Do not apply schema changes blindly.
4. **Reproducible dependency graph:** the implementation branch now commits package-lock.json and restores npm ci plus lockfile-based npm caching. The clean-install CI run must remain green on the latest branch head.
5. **Data provenance:** imported grade/attendance records carry source, source label and observation timestamp; calculated/official/community/demo trust states still need consistent presentation across every workspace.
6. **File import security:** CSV is parsed locally, previewed, bounded, validated server-side and committed transactionally with owner-scoped records. XLSX/PDF and raw-file storage remain disabled until parser isolation, private storage and deletion are implemented.
7. **Live integration:** no JIIT login bypass or credential collection. Only consider an integration after current sign-in requirements and authorization are established.
8. **Release verification:** CI/build results and production flows must be observed and recorded. Source inspection alone cannot establish readiness.

## P1 product work

- Programme/branch/batch profile and current curriculum mapping.
- XLSX/PDF imports with preview and parser isolation; account deletion and private-file cleanup.
- SGPA/CGPA breakdown and what-if planning from persisted grade history, with current policy validation.
- Attendance class-level history where supported by source data, plus export/deletion.
- Resource/PYQ metadata, search, viewer, bookmarks and review/takedown process.
- Timetable and exam import with source, timezone and freshness handling.
- Study planner/tasks and calendar export.
- Responsive navigation, URL deep links, keyboard/screen-reader checks and explicit empty/loading/error states.

## P2 after P0/P1

- Campus directory and event feed from compliant, reliable sources.
- Moderated placement experiences and career resources.
- Student community/discussions.
- Notifications and source-grounded search/assistant.
- Native Android app only if demand justifies maintaining a second client.

## Reference-repository findings

- JPortal Android documents class-level attendance, attendance forecasts, exam venue details, grade cards, SGPA/CGPA, what-if calculation and offline access.
- Its ktjiit client documents typed portal methods, explicit error types, sanitized fixtures, read-only live tests and a marks-PDF parser.
- pyjiit and jsjiit provide additional protocol/data-shape references but their current compatibility and permission status must be verified independently.
- PYQJIIT already provides a year/branch browsing flow and paper contributions; link-first integration avoids unnecessary duplication.
- JPortal's proxy/CORS references are not permission to bypass access controls. CORS is not authentication.
- JPortal Android is GPL-3.0-only. Review obligations before reusing code; ideas and code copying are not equivalent.

## Branch changes in this implementation slice

- lib/academic-calculations.mjs: shared weighted grade-average helper, attendance forecast, CGPA estimate.
- lib/academic-calculations.d.ts: type declarations.
- tests/academic-calculations.test.mjs: attendance, forecast and grade-average edge cases.
- components/academic-calculators.tsx: separate SGPA/CGPA input sets and attendance forecast UI.
- components/pyq-discovery.tsx: source-aware external source cards.
- lib/supabase/*, proxy.ts, app/sign-in/*, app/auth/*: passwordless email auth scaffold; not live-tested while Supabase is inactive.
- lib/auth/current-user.ts and app/api/me: verified identity mapping and account profile API.
- prisma schema + 20261019000100_academic_records migration: private term, subject, grade, attendance snapshot and import models.
- app/api/academic/*: owner-scoped term, subject, grade, attendance and transactional CSV import APIs.
- lib/academic/parse-csv.mjs/.ts, components/academic-csv-import.tsx and tests/academic-csv.test.mjs: bounded client-side CSV parsing, preview and validation.
- lib/security/safe-redirect.mjs and tests/safe-redirect.test.mjs: validated local-only callback redirect helper.
- components/jt-workspace.tsx: renders the source panel inside Study Vault.
- app/globals.css: responsive styles for the new source panel.
- package-lock.json: generated by npm 10.9.9 in CI and committed to the implementation branch.
- .github/workflows/ci.yml: restored npm ci and lockfile-based caching after the lockfile was committed.

## Acceptance checklist before calling the project complete

- [ ] Package lock committed; CI uses npm ci and deterministic cache.
- [ ] Tests, lint, typecheck, Prisma validation and production build pass on a clean checkout.
- [ ] Authentication/session lifecycle is implemented and tested.
- [ ] Cross-user read/write/delete/download tests pass.
- [ ] Migrations have been applied and verified in a disposable/staging database.
- [ ] Data API/RLS and private-storage policies are verified against the real project.
- [ ] CSV imports are bounded, previewed, owner-scoped and transactional; verify live behavior, add account deletion and private-file cleanup before enabling raw uploads.
- [ ] Academic calculations are checked against current policy and their assumptions are visible.
- [ ] All workspace screens are classified as working, intentionally deferred or removed—not falsely presented as live services.
- [ ] Mobile/accessibility/performance checks pass.
- [ ] Deployment smoke tests, backup/restore, monitoring and rollback are verified.
- [ ] Any portal integration is separately authorized, read-only/scoped where possible, and has a tested kill switch.

**Conclusion:** continue implementation in vertical slices. Do not claim the project is finished until the acceptance checklist is supported by test and deployment evidence.


## Environment blocker discovered during implementation

The connected Supabase project named Jiit-toppers- (project ref ofqxnjbyyenxhzotwhhh, region ap-northeast-1) is currently INACTIVE. Read-only SQL inspection timed out because its database is not active. The organization is on the Free plan and already has the maximum number of active free projects. Attempting to restore this project was rejected by Supabase with a limit error.

No other project was paused or deleted, and no plan upgrade was made. Restoring the JIIT Toppers database requires the owner to choose an authorized infrastructure action: pause an unrelated active free project, upgrade the organization/project plan, or explicitly move JIIT Toppers to a different approved database. Do not pause JYC, Saathi, or Nirdhoom on the user's behalf.

Until the database is active, schema parity, RLS policies, live auth, migrations, persistence, and production database health cannot be verified. The application can still be improved and tested independently, but production completion is blocked on this infrastructure decision.
