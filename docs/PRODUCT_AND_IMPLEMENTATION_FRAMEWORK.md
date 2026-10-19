# JIIT Toppers — Product, Architecture and Delivery Framework

**Status:** Planning baseline for implementation  
**Last reviewed:** 19 October 2026  
**Repository:** `kaustubhdua/Jiit-toppers-`  
**Purpose:** Turn the current foundation prototype into a secure, useful, student-first academic workspace, using existing JIIT community projects as research references without depending on unapproved private-portal access.

> **Scope and trust:** This document is an implementation framework, not a claim that all described features exist. Existing UI, calculations, database schema, authentication, integrations, and deployment must be verified independently. JIIT Toppers is unofficial unless JIIT explicitly endorses it. Never collect Webkiosk passwords or attempt to defeat authentication/anti-abuse controls.

---

## 1. Product direction

JIIT Toppers should unify the academic workflows students repeatedly need: understand their current academic position, organize courses and deadlines, find learning resources and previous-year papers, prepare for exams, and manage their personal study plan.

It should complement official JIIT systems, not impersonate or replace them. An authorized live portal connector is an optional provider—not a hard dependency for the product.

### North-star user outcomes

1. A student can reach the most relevant academic information quickly.
2. A student can build a useful workspace with manual entry and document imports, even when the official portal is unavailable.
3. Calculated and imported values are traceable to their source and freshness.
4. Students can find PYQs and learning resources without duplicating another project's archive unnecessarily.
5. No student can access another student's private records.
6. The app degrades gracefully when an external source, storage provider, or integration is unavailable.

### Product principles

- **Source-aware:** every academic or institutional record has provenance and a last-updated timestamp.
- **Honest UI:** demo, imported, manually entered, calculated, estimated, reviewed, and official data are distinct.
- **Privacy by default:** collect only data needed to provide a feature; do not log credentials, tokens, session cookies, or private marks.
- **Portable:** the product remains useful without a JIIT integration.
- **Modular:** academic logic, data providers, persistence, and presentation remain separate.
- **Incremental delivery:** finish and test complete user journeys, rather than filling every page with placeholders.
- **Reuse respectfully:** prefer links, APIs, or collaboration with existing maintainers; honour licenses and content permissions.

---

## 2. Research references and what to learn from them

The following projects were examined at the README, repository-metadata, or selected-structure level. These are research references, not dependencies approved for production.

| Project | What its documentation indicates | How to use the research |
|---|---|---|
| [codelif/jportal-android](https://github.com/codelif/jportal-android) | Native Kotlin/Jetpack Compose remake; documents attendance counted class-by-class, skip/attend projections, exams with room/seat details, grades, SGPA/CGPA, CGPA what-if, and offline use. Its README says the portal moved to Google sign-in. GPL-3.0-only. | Primary reference for student workflows, offline expectations, Android privacy approach, automated screenshot tests, release discipline, and the current portal-client dependency. Do not copy code without evaluating GPL obligations. |
| [codelif/ktjiit](https://github.com/codelif/ktjiit) | Kotlin/JVM client documented for the updated Google-token exchange flow. Typed methods for attendance, subjects/faculty, credits, exam events/schedules, grade cards, marks, SGPA/CGPA, profile and other portal data; errors are modelled. | Study protocol boundary, typed domain responses, explicit error types, marks PDF parser, sanitized fixtures, and read-only live tests. Keep the client local to its own ecosystem unless a compatible, authorized integration is established. |
| [codelif/pyjiit](https://github.com/codelif/pyjiit) | Python library for JIIT Web Portal; documents session management, attendance, subject registration, exam-event queries and explicit exceptions. | Compare its supported methods and session/error handling to other clients; assess current compatibility before considering an adapter. |
| [codeblech/pyjiit](https://github.com/codeblech/pyjiit) | Fork of codelif/pyjiit. | Compare commit history with upstream; adopt findings, not a second parallel implementation by default. |
| [codeblech/jsjiit](https://github.com/codeblech/jsjiit) | Browser-compatible JS portal wrapper documenting attendance, exams, grades and SGPA/CGPA; README discusses CAPTCHA and CORS/proxy behavior. | Study data shapes, method boundaries and failure modes. Do not make CAPTCHA bypass or CORS circumvention a product requirement. Verify authorization before integration. |
| [codeblech/jportal](https://github.com/codeblech/jportal) | PWA intended as an alternative portal UI, including attendance, exams, grades and SGPA/CGPA. Public documentation notes usage analytics. | UX reference for academic views, mobile/PWA use, loading/error states, and limitations of centralized app state. Do not assume its current login path is reliable. |
| [PYQJIIT](https://pyqjiit.rushilk.dev/) | Student-facing previous-year question paper archive and contribution workflow, as advertised by its public site. | Prefer a link or authorized partnership. Verify coverage and any API with its maintainer before implementing duplication or importing files. |
| [codeblech/jpgram](https://github.com/codeblech/jpgram) and [jpgram-cdn](https://github.com/codeblech/jpgram-cdn) | Campus magazine / community-post aggregation and supporting image-cache/index workflow. | Consider later for campus updates, subject to current platform rules, source reliability and content permissions. Not a P0 academic feature. |
| [codeblech/jportal-cors-proxy](https://github.com/codeblech/jportal-cors-proxy) | Proxy design for JPortal requests to the university backend under cross-origin restrictions. | Study allowlists, fixed upstream, origin checks and proxy-abuse prevention only. A proxy does not grant authorization or bypass university controls. Do not deploy to circumvent restrictions. |
| [codeblech/gportal](https://github.com/codeblech/gportal), [gportal-g-fork](https://github.com/codeblech/gportal-g-fork), [gportal-workers-proxy](https://github.com/codeblech/gportal-workers-proxy), [glpy](https://github.com/codeblech/glpy) | GL Bajaj-related portal projects, not JIIT implementations. | Low priority; generic UI/proxy lessons only where a concrete need exists. |
| [codeblech/jaycee-62](https://github.com/codeblech/jaycee-62) | Basic-computer simulator. | Not relevant to the core product roadmap. |

### Required deeper research before adopting portal code

The initial study is not a complete code audit of every upstream file. Before depending on any connector, review its license, release/version, commit history, dependency tree, authentication flow, token/cookie storage, telemetry, domain allowlists, tests, exception handling, and compatibility with the current official sign-in flow. Never commit raw captures of student records or real tokens.

**Key architectural conclusion:** use the Android/PWA repositories to learn user workflows, and the portal-client repositories to understand protocol boundaries. Keep the JIIT connector isolated and optional. The web product can ship import-based workflows first.

---

## 3. Product workspaces

### 3.1 Home / Overview
- Personal academic summary: only records available to the signed-in user.
- Upcoming exams and tasks, recent documents, quick actions.
- Empty states that tell the student how to import/add data.
- Data provenance and freshness visible without overwhelming the screen.
- No invented demo results in real accounts.

### 3.2 Academics
- Programme, campus, branch, cohort/batch and semester settings.
- Subject list and credits.
- Grade cards and semester history.
- SGPA/CGPA calculations and what-if scenarios.
- Clear calculation breakdown and grading-rule source/version.
- Backlog representation only when imported/verified and correctly defined by the applicable rules.

### 3.3 Attendance
- Subject and component level where information exists.
- Class-by-class records when supported by an authorized/imported source; aggregate-only mode otherwise.
- Attended/held counts and percentage.
- Target calculator: classes to attend or possible absences under a configurable target.
- Zero-class and missing-data states.
- Timestamp, source, and “not official/current” disclosure for manual or stale data.

### 3.4 Study Vault and PYQs
- Search/browse by course code, course name, semester, programme/branch, year, exam type and paper year when these fields are available.
- PDF viewer, mobile reading, page navigation, bookmark and completed-practice tracking.
- Notes, tutorials, labs and assignments only where rights and moderation are handled.
- PYQJIIT entry/link integration first; direct ingestion only with permission, a documented feed/API, or a clear license.
- Do not republish question papers or solutions without understanding the applicable rights and university policies.
- Mark answers/solutions as verified, student-contributed, or AI-generated; never imply correctness without review.

### 3.5 Exam Center and planner
- Personal exam calendar and countdown based on a source the student can inspect.
- Study tasks, revision plans and personal deadlines.
- Timetable import and calendar export.
- Timetable/exam parsing must show a preview before saving.
- Never present community-submitted dates as official notices.

### 3.6 Campus
- Campus-specific pages for Sector 62 and Sector 128, where applicable.
- Public facilities, mess-menu or transport links, club notices and events only when there is a reliable source.
- Source links, source type, last-checked timestamp, and expiry for time-sensitive notices.
- Clearly distinguish official announcements from community posts.

### 3.7 Career
- Recruiter/company directory and preparation resources.
- Interview experiences and placement statistics only with origin, date, cohort/context, and moderation.
- No unsupported claims about placement percentages or recruiter policies.
- Keep private student applications and personal information out of public records.

### 3.8 Community
- Course discussions, study groups, clubs, events and resource contributions.
- Reporting, moderation, rate limits, spam protection, takedown flow and audit trail.
- Explicit content and IP policy; no personal records or unauthorized paid/copyrighted material.
- Do this only after core identity, storage and moderation controls are reliable.

### 3.9 Search and assistant (later)
- Search only over records the user is allowed to access.
- Prefer retrieval with source links rather than unsupported generation.
- Display source and updated time with answers; abstain when data is missing.
- Do not send marks, attendance, identifiers or uploaded files to external AI services without clear consent and a documented data policy.
- Add an assistant only after the underlying data is trustworthy.

---

## 4. Architecture

Keep the existing Next.js App Router + TypeScript + Prisma/PostgreSQL direction unless a fresh audit proves it unsuitable. Do not add a second backend just to mimic an upstream project.

### Logical layers

```text
Next.js UI / route handlers
          |
Authentication + authorization
          |
Application services (use cases)
          |
Domain logic and validation
          |
Provider interfaces --------------------------+
  |        |          |                       |
Manual   CSV/XLSX     PDF importer      Optional JIIT provider
entry    importer     / marks parser    (disabled until approved)
          |
Repository / persistence layer
          |
PostgreSQL + private object storage
```

### Suggested code boundaries

```text
app/
  (public)/
  (workspace)/
  api/
components/
  shell/
  academics/
  attendance/
  exams/
  study-vault/
  pyqs/
  planner/
lib/
  auth/
  domain/
    attendance/
    grades/
    exams/
    resources/
  application/
  validation/
  providers/
    manual/
    csv/
    xlsx/
    pdf/
    jiit/              # inactive until authorized/verified
  persistence/
  security/
prisma/
  schema.prisma
  migrations/
tests/
  unit/
  integration/
  e2e/
docs/
```

This is a target boundary, not a command to create empty folders immediately. Introduce code only when there is a real use case.

### Provider contract

Use an application-owned, typed interface that normalizes records from different sources. Avoid leaking upstream-specific types directly into the UI.

Every normalized record should include a provenance envelope equivalent to:
- source kind: official integration, student import, manual input, reviewed community, calculated, demo;
- source reference/import batch;
- observed/imported timestamp;
- effective academic term;
- freshness/verification state;
- parser/schema version where applicable.

The interface should return typed errors such as authentication required, session expired, permission denied, upstream unavailable, no data, malformed response and unsupported operation. Do not silently turn an error into an empty successful record.

### Background work
Start with synchronous imports for small, bounded files. Add a queue/background worker only if real-world file processing, OCR or throughput requires one. Avoid premature microservices.

---

## 5. Data model and provenance

Audit the existing Prisma schema before adding or renaming models. The following are logical concepts, not necessarily one-table-per-concept requirements.

| Concept | Required responsibility |
|---|---|
| User / profile | Authentication identity and non-sensitive academic preferences |
| Academic term | Canonical term/semester keys and date boundaries where known |
| Course / subject | Course code, name, credit metadata and applicable curriculum version |
| Enrollment | User's registered subjects per term, if legitimately available |
| Grade record | Grade/marks, credits, term, source and calculation status |
| Attendance record | Aggregate or class-level events, subject/component, date, source |
| Examination event | Date/time/location only when sourced and freshness-tagged |
| Timetable entry | Day/time/subject/venue, with import batch or source |
| Resource / PYQ | Metadata, file reference or outbound link, rights/source, trust state |
| Import job | Owner, file type, parser version, status, validation results and error summary |
| Private document | Owner, storage key, size, media type, checksum, retention/deletion state |
| Study task | Owner, due date, course link, completion state |
| Moderation record | Report/review decision, moderator and timestamp |
| Audit event | Security-relevant action metadata, never secrets or full sensitive payloads |

### Data quality rules
- Store decimal/credit values with explicit precision.
- Define uniqueness constraints based on stable codes/term/source rather than display names alone.
- Distinguish unknown, zero and not applicable.
- Normalize timestamps and show them in the user's configured local timezone.
- Keep an import snapshot/audit trail when records are corrected or replaced.
- Never rely on client-supplied user IDs for ownership; use the authenticated server identity.
- Do not include fake student names, enrollment numbers, marks or portal sessions in fixtures.

### Migrations
1. Compare Prisma schema, migration history and the live Supabase database.
2. Back up and identify environment (local/staging/production).
3. Generate/review explicit migrations.
4. Apply to a disposable test database first.
5. Verify relationships, indexes, RLS/policies and rollback/recovery plan.
6. Never blindly run a schema push on an existing production database.

---

## 6. Authentication, privacy and security

### Identity
- JIIT Toppers account authentication is separate from JIIT portal authentication.
- Use a maintained identity provider or well-reviewed authentication implementation.
- Verify email/identity where appropriate without implying university endorsement.
- Enforce session lifecycle, logout, CSRF protections where applicable, secure cookies and rate limits.

### Authorization
- Enforce ownership on every query, mutation, download and import job.
- Test cross-user access explicitly.
- Role changes require server-side authorization; never trust a client-editable role field.
- If Supabase is used, enable and test RLS policies for all private tables; RLS enabled with no appropriate policies is not a complete application authorization design.
- Private storage objects must not use guessable public paths or unauthenticated public URLs.

### Portal integration gates
Do not start a live connector until all are true:
1. Current login flow and portal owner are identified.
2. Written permission or a clearly permitted supported integration route is established.
3. Authentication method respects Google sign-in/MFA/CAPTCHA and any anti-abuse controls; no bypass requirement.
4. Data minimization, retention and revocation have been specified.
5. Secrets never enter frontend bundles, analytics, logs or shared backend state.
6. Host allowlists, request limits, timeouts, redirect policy and error handling are reviewed.
7. Integration tests use sanitized fixtures; live tests are opt-in and read-only.
8. A documented kill switch disables the connector immediately.

If these gates cannot be met, keep the portal connector disabled and ship import/manual workflows.

### Upload security
- Allowlist file types; verify signatures instead of trusting extension/MIME alone.
- Size/page/row limits, timeouts and memory limits.
- Treat parsed text as untrusted content.
- Store privately; issue short-lived authorized downloads if needed.
- Scan files where practical, use checksums, isolate parsers and avoid executing embedded content.
- Preview parsed data and require user confirmation before committing.
- Provide deletion and retention controls.

### Privacy operations
- Publish a clear data-use, retention, deletion and contact policy.
- Collect the least data possible.
- Do not send sensitive records to analytics.
- Redact IDs and personal data from logs, reports, test fixtures and issue templates.
- Have an incident-response and credential/session revocation checklist before public launch.

---

## 7. Academic rules and correctness

### Attendance
For aggregate counts, a basic percentage is:

`attendance = attended / held * 100`

Guard against a zero denominator and inconsistent counts. Do not imply a university-specific attendance threshold unless it is confirmed by current regulations. Class-level calculations must account for subject components and classes actually held, not a generic timetable count.

### SGPA / CGPA
Credit-weighted formulas are only correct when the grading policy and credit semantics match the student's programme and term. Make grading rules explicit, versioned, sourced, and testable. Display a breakdown and mark what-if outputs as simulations. Never label a local calculation an official result.

### Parsing
Do not assume JSON endpoint marks are complete if source projects indicate that grade-card/marks PDFs contain additional detail. Treat document parsing as a separate, testable pipeline. Keep sanitized PDFs/text fixtures, add a human review step, and highlight ambiguous fields instead of guessing.

---

## 8. Delivery plan: milestones, dependencies and exit criteria

### M0 — Reconnaissance and release-blocker audit
**Outputs**
- Verified repo/branch/dependency inventory.
- Existing feature matrix: scaffold vs functional vs tested vs deployed.
- Live database/migration/RLS discrepancy report.
- Threat model and trust-boundary diagram.
- Current login problem report based on actual user-observed behavior.
- External project and licensing matrix.
**Exit criteria:** no assumptions about missing features remain unverified; no sensitive data used for discovery.

### M1 — Quality and security foundation
**Outputs**
- Type-safe domain boundaries, validation, error states.
- Authentication/session design.
- Server-side record ownership and tested authorization.
- Migration baseline and safe staging strategy.
- CI for lint, typecheck, unit tests, Prisma validation and production build.
**Exit criteria:** automated cross-user denial tests pass; clean build and migration validation proven.

### M2 — First complete user journey (independent of JIIT)
**Outputs**
- User can create/edit a subject/term record manually.
- CSV import first, then XLSX and PDF grade-card extraction.
- Preview, correction, duplicate/conflict handling and commit.
- Private file storage and import history.
- Academic dashboard reads the user's persisted records.
**Exit criteria:** end-to-end tests cover successful import, malformed file, duplicate file, cross-user denial and deletion.

### M3 — Core academic workspace
**Outputs**
- Grade cards, SGPA/CGPA history and what-if simulations.
- Attendance aggregate import/manual entry and target projections.
- Subject/course management.
- Data-source/freshness indicators and export/delete controls.
**Exit criteria:** formulas covered by edge-case tests; every shown value has an understandable provenance state.

### M4 — Study Vault + PYQ
**Outputs**
- Research PYQJIIT linking/API/collaboration route.
- Metadata model and resource directory.
- PDF viewing/bookmarks/study completion where rights permit.
- Contribution review, duplicate detection and takedown flow if accepting uploads.
**Exit criteria:** all files/links have source/rights metadata and resource visibility tests; no unapproved bulk mirroring.

### M5 — Timetable, exam and planner
**Outputs**
- Timetable/import parsing with preview.
- Academic events and exam schedule from verified sources or student imports.
- Personal calendar, tasks, reminders and calendar export.
**Exit criteria:** timezone, duplicate, stale-source and rescheduling cases tested; sources clearly shown.

### M6 — Campus and career directories
**Outputs**
- Campus 62/128 source-tagged pages and links.
- Club/event/news aggregation only from compliant, maintainable sources.
- Career resources and moderated student experiences.
**Exit criteria:** no fake placement claims, no stale time-sensitive notice presented as current, reporting/moderation operational.

### M7 — Optional JIIT connector feasibility spike
**Only after security/permission gates.**
**Outputs**
- Current sign-in and API compatibility matrix.
- Read-only, scoped proof-of-concept using test consent and sanitized fixtures.
- Connector kill switch and freshness/error mapping.
- Decision record: proceed or remain import-only.
**Exit criteria:** authorized, stable, documented flow; connector is isolated and optional. No CAPTCHA or access-control bypass.

### M8 — Release readiness
**Outputs**
- End-to-end, accessibility, responsive, security and performance checks.
- Backups/restore exercise, monitoring and incident procedure.
- Privacy, terms, content rights and contribution guidelines.
- Deployment smoke tests and rollback procedure.
**Exit criteria:** no open P0 security/privacy/data-integrity issue; actual production checks verified, not inferred from a successful build.

---

## 9. Priority backlog

### P0 — must come first
- [ ] Audit current repository implementation and deployed behavior.
- [ ] Verify live schema, migration history and RLS policy coverage.
- [ ] Establish real authentication and ownership enforcement.
- [ ] Remove reliance on mock/demo values outside explicit demo mode.
- [ ] Centralize and test attendance/grade calculations.
- [ ] Add data provenance and freshness fields to persisted academic data.
- [ ] File import validation, private storage and user-controlled deletion.
- [ ] CI checks and end-to-end critical path.
- [ ] State integration is unofficial/inactive until authorized and verified.

### P1 — core student value
- [ ] CSV/XLSX/PDF grade-card import with review.
- [ ] Attendance import/manual entry and projections.
- [ ] Subject/semester history and CGPA what-if.
- [ ] PYQJIIT link/partnership discovery; do not bulk copy without permission.
- [ ] Exam and timetable import with preview.
- [ ] Personal tasks/study plan.
- [ ] Mobile-first navigation, accessibility, loading/error/empty states.

### P2 — after core data is reliable
- [ ] Verified/community resource contributions.
- [ ] Campus feeds, clubs and events.
- [ ] Career/preparation directory.
- [ ] Notifications/reminders.
- [ ] Contextual search and source-grounded assistant.
- [ ] Native mobile app only if usage evidence justifies the additional platform.

---

## 10. Testing and acceptance matrix

| Layer | Minimum test cases |
|---|---|
| Domain unit tests | Attendance denominator zero; attended > held; subject components; grade credit weighting; rounding; missing grades; repeated/backlog policy; hypothetical future grades |
| Import parsers | Valid/invalid type; oversized input; malformed data; ambiguous headers; empty PDF; multi-page marks table; duplicates; conflicts; parser versioning |
| Authorization | Unauthenticated read denied; user A cannot query/update/delete user B records; protected file denied; unauthorized role change denied |
| Integration | Database create/read/update/delete; import transaction; rollback after failed validation; storage permissions; expired session error mapping |
| End-to-end | Sign in → create term/subject → import → review → confirm → dashboard → calculate → export/delete |
| UX/accessibility | Keyboard navigation; visible focus; labels/error associations; contrast; reduced-motion; screen reader; mobile viewport; offline/slow network |
| Operations | Clean install/build; migration validation; deployment smoke test; backup restore; monitoring; connector kill switch |

### Release gates
- No P0 security, privacy or data-integrity issues.
- No user can see another user's private data.
- Every displayed grade/attendance value is labeled with source and freshness.
- No secret or live student record is committed.
- Current CI checks pass on the release candidate.
- Production login, database access and critical flows are verified against the deployed environment.
- Rollback and data deletion are documented.

---

## 11. Decision log

| Decision | Current recommendation | Revisit when |
|---|---|---|
| Primary stack | Keep Next.js + TypeScript + Prisma/PostgreSQL | Fresh repo audit indicates a material blocker |
| Authentication | JIIT Toppers identity separate from portal identity | A supported institutional SSO integration is approved |
| Academic data | Manual entry/import first | Authorized provider passes integration gates |
| Portal client | Isolated, optional adapter; no CAPTCHA bypass requirement | Written permission and verified current flow |
| PYQ | Link/partner with PYQJIIT first | Maintainer provides API/permission or a clear license permits reuse |
| Uploaded docs | Private storage and explicit owner checks | Never make student-specific records public |
| Community | Defer until moderation/authorization ready | P0 core and moderation workflows pass |
| AI assistant | Defer until source data is trustworthy | Retrieval permissions, privacy and evaluation exist |
| Native Android | Do not fork/build one immediately | Demand data justifies parallel platform maintenance |

---

## 12. Research limitations and next actions

This framework is based on repository documentation and selected public files, together with the current JIIT Toppers repository description. It is **not** a complete line-by-line security audit of the upstream projects, a live test of student login, or proof of current portal compatibility.

Next actions in order:

1. Audit the current JIIT Toppers files and database against this framework.
2. Inspect the current JPortal Android app and its `ktjiit` dependency more deeply: auth exchange, token/session storage, domain models, parsers, sanitized fixtures, unit tests, release workflow, and GPL obligations.
3. Compare `pyjiit` and `jsjiit` APIs, versions, licenses, and failure behavior.
4. Ask JIIT about supported third-party access; keep the connector disabled until resolved.
5. Contact PYQJIIT's maintainer about a link/API/collaboration.
6. Implement M1 and M2 before adding broad new UI.
7. Update this file as decisions are proven by code/tests, not just planned.

**Definition of done:** the feature works in a real, authenticated user journey; has authorization and error states; persists correctly; is tested; documents its source/trust state; and is verified in the deployed environment. A screen that merely looks complete does not meet that definition.
