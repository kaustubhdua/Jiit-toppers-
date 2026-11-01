# JIIT Toppers — implementation and release-readiness audit

**Audit date:** 2 November 2026  
**Repository:** `kaustubhdua/Jiit-toppers-`  
**Default branch at audit start:** `main`  
**Release decision:** Not production-ready; do not describe as fully complete until the P0 gates below pass.

## Executive summary

The repository contains a Next.js 16 / React 19 application, Supabase cookie-based authentication integration, Prisma/PostgreSQL data models, owner-scoped academic API routes, client-side CSV parsing, academic calculators, study/exam planners and a source-aware Study Vault.

The codebase is a credible foundation, but several user-facing areas remain planned placeholders. More importantly, the intended Supabase project is inactive and production deployment is not verified. A green GitHub CI run validates the repository build, not the live database, Auth provider, user isolation or production runtime.

## Repository verification

- The consolidated PYQJIIT research PR #9 was merged to `main` at commit `9b49a6ee8e46a0ad0a1367ad4391ed086a3d8b9a`.
- PR #11 (official JIIT source directory, account guidance correction, readiness health reporting and documentation) was merged at `63f0ec9f6792209205aa4710c1386d2a59f4ef6a`; its CI passed.
- PR #10 (personal PYQ tracker, tested storage validation and Study Vault integration) was merged at `a326a1d1e757a5f591ab8be383568e9a44ef738d`; its final CI passed, including tests, lint, typecheck, Prisma validation and production build.
- PR #12 (ignore all local environment files and `.vercel` metadata while keeping `.env.example`) was merged at `3dbef10d488a9e39f33713fea782f1fe6b02a7e9`; its CI passed.
- PR #14 (browser-local PYQ tracker privacy disclosure and 500-record cap) was merged at `7752140f5aad6fedaa989ec5a748537bb7384b1b`; its CI passed.
- PR #15 (weekly Dependabot updates for npm and GitHub Actions) was merged at `fbeb417bbfe591db1d5627570b90ac3bcfb69197`; its PR CI passed and Dependabot configuration validation passed.
- The current `main` commit after PR #15 is `fbeb417bbfe591db1d5627570b90ac3bcfb69197`; post-merge main CI is running at audit update time.
- The CI run for the merged PYQJIIT change completed successfully.
- PR #10 adds a personal, device-local PYQ reference tracker. Its first CI run failed lint due to synchronous state updates in effects; this was corrected and reusable storage validation helpers plus tests were added. The newest CI run must be checked before merge.
- The main branch's CI workflow runs unit tests, ESLint, TypeScript typecheck, Prisma schema validation and a Next.js production build.
- The repository tree has 83 tracked files and no README file, consistent with the owner's documentation-removal preference; operational/release-gate documentation remains under `docs/`.
- No production deployment or Vercel project association has been verified.

## Implemented capabilities

### Application foundation
- Next.js App Router and responsive shell/navigation.
- Home workspace and six major navigation areas.
- PWA manifest, metadata, error and not-found surfaces.
- Security response headers and reduced-motion/focus-visible styling.

### Authentication and account
- Supabase SSR browser/server clients.
- Next.js 16 `proxy.ts` session refresh using `getClaims()`.
- Email OTP/PKCE callback and sign-out route.
- Verified-email requirement and application-user upsert.
- Private profile display-name update.

### Academic records
- Per-user terms, subjects, grades and attendance snapshots.
- Owner-derived server routes, request-size limits, Zod validation and same-origin mutation checks.
- CSV parsing and reviewable import workflow.
- JSON export and term/subject/grade/attendance deletion.
- Database constraints and RLS enabled for academic tables.

### Study and exam tools
- Attendance, SGPA/CGPA and forecast calculations with unit tests.
- Browser-local study planner and exam schedule planner with iCalendar export.
- External PYQJIIT and JIIT Web Kiosk links.
- Personal PYQ reference tracker is merged and available in the Study Vault. It remains device-local, not account-synced; the UI warns that anyone with access to the browser profile may view stored records, discourages sensitive notes, and caps saved records at 500.

## Gaps and release blockers

### P0 — Must complete before production
1. Restore or explicitly select the intended Supabase project. Current organization is on Free plan; intended `Jiit-toppers-` project is inactive and restoration was blocked by the active-project limit. Do not pause/delete another project or upgrade without owner approval.
2. Inspect live migration history and schema, compare with committed Prisma migrations, take a backup, and resolve drift before applying migrations.
3. Configure secrets in local/deployment secret stores and exact Supabase Auth redirect URLs.
4. Verify email OTP/PKCE, session refresh, logout, expired links and provider outage.
5. Run two-account authorization tests across profile, terms, subjects, grades, attendance, imports, export and deletion.
6. Verify production database connection/pooling, deploy, and run production smoke tests.
7. Confirm the deployment is serving the intended main commit and that health/readiness status reflects missing required services.

### P1 — Product completeness
- Replace planned Academic Explorer cards with verified, admission-year-specific curriculum data and clear provenance.
- Make official academic calendar, examination notices and campus information discoverable through official source links; do not scrape undocumented portal endpoints.
- Build first-party resource submission/moderation, safe file handling and takedown processes before hosting student uploads.
- Complete placement company directory and moderated student interview experiences.
- Complete community discussions, replies, team finder, clubs and events with abuse reporting/moderation.
- Add admin/moderator authorization and audited moderation workflows.
- Decide whether PYQ tracker should remain device-local or become owner-scoped cloud data. Do not imply sync until implemented.
- Complete timetable and schedule ingestion only from user-provided or explicitly authorized sources.

### P2 — Quality and operations
- Add end-to-end browser tests for signed-out, signed-in and two-account journeys.
- Add accessibility checks (keyboard, focus, screen reader, contrast) and responsive visual regression checks.
- Add rate limiting to public/authenticated mutation endpoints and abuse controls for sign-in.
- Add monitoring, error reporting, backup/restore runbook and data-retention/deletion policy.
- Add dependency and secret scanning to CI, and document supported Node/runtime versions. Weekly Dependabot updates for npm and GitHub Actions are now enabled; automated updates still require review and CI.
- Verify PWA install/offline behavior instead of relying on the manifest alone.

## Official JIIT source research

The following public JIIT pages are suitable source entry points. They should be linked with provenance and checked dates; they are not evidence of an API or permission to scrape.

- Academic calendars: https://www.jiit.ac.in/academics/academic-calendars
- Academic system and ordinances: https://www.jiit.ac.in/academics/academic-system-ordinances
- ECM programme/curriculum page: https://www.jiit.ac.in/prospective-student/ug-programmes/b-tech/b-tech-in-electronics-and-computer-engineering
- Latest announcements/examination notices: https://www.jiit.ac.in/latest-announcements
- Student placement information: https://www.jiit.ac.in/existing-student/training-and-placement/students-placement
- Campus facilities FAQ: https://www.jiit.ac.in/faq?type=Campus+Facilities
- Official campus contact details: https://www.jiit.ac.in/contact-us
- PYQJIIT: https://pyqjiit.rushilk.dev/ (independent community source; link-first only pending permission)

## Dependency security review

- The committed lockfile currently resolves Next.js 16.4.3, eslint-config-next 16.4.3, React/React DOM 19.3.1, Prisma CLI/client 6.19.3 and @types/node 22.20.5.
- CI now uses actions/checkout@v7 and actions/setup-node@v7 with Node.js 22.
- The October 2026 Next.js security update states that the relevant 16.x fixes are available from 16.4.1; the locked 16.4.2 is above that patch floor. Keep the lockfile current and review Dependabot updates rather than relying on semver ranges alone.
- References: https://nextjs.org/blog/nextjs-security-update-october-14-2026 and https://github.com/vercel/next.js/security/advisories.

## Verification matrix

| Area | Repository evidence | Live verification |
| --- | --- | --- |
| Unit tests | Node test suite | CI run |
| Lint/typecheck/build | CI workflow | Must pass on latest PR/main SHA |
| Prisma schema | Schema and migrations committed | Live drift/migration history unknown |
| Auth | Supabase SSR code | Blocked by inactive project |
| Academic ownership | Owner-scoped queries and RLS enabled | Two-account tests outstanding |
| CSV import | Parser, UI and routes | End-to-end database import test outstanding |
| Export/delete | Server routes and UI | Backup/restore and live data test outstanding |
| PYQ archive | External link and local personal tracker | Provider-owned; no integration contract; tracker has no cloud sync |
| Production | No verified Vercel project connection | Not deployed/verified |

## Definition of done

JIIT Toppers can be called production-ready only when:
- All P0 checks are completed with evidence.
- CI passes on the exact release commit.
- All advertised features work, or are clearly marked as planned/not available.
- Two-account privacy tests pass.
- Migrations, backups and restore are verified.
- Production health, authentication, core workflows and rollback are smoke-tested.
- Accessibility, mobile and desktop QA pass.
- There are no unresolved critical security, privacy or data-integrity findings.

A source-code-only audit cannot prove live service readiness. Do not close the release blockers based on a successful build alone.
