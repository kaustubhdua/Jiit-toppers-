# JIIT Toppers

**A student-first workspace for Jaypee Institute of Information Technology.**

JIIT Toppers brings academic discovery, study resources, exam preparation, campus information, career preparation and student collaboration into one coherent experience. It is designed to complement—not replace—the official JIIT student systems.

> **Current status:** Foundation prototype, not production-ready. The current branch has local attendance/SGPA/CGPA planning tools, a browser-local study task list, and outbound links to PYQJIIT and the JIIT Web kiosk. It now has a passwordless Supabase Auth setup flow, but the real sign-in round trip is unverified because the connected Supabase project is inactive. Server-side personal-record persistence, secure uploads, and a verified live JIIT student-record integration are still absent. The connected Supabase project is currently inactive. Never treat placeholders or calculations as official records.

## Product principles

- **Student-first:** organise tools around a student's programme, branch, admission batch and semester.
- **Trust by design:** distinguish official information, reviewed community contributions, unreviewed submissions and demo content.
- **Source-aware:** institutional facts should link to the originating JIIT notice or document and show when they were last checked.
- **Privacy-conscious:** never expose private student records or credentials in public pages, logs or demo data.
- **Complement existing systems:** do not imply access to attendance, grades, fees or other private records unless an authorised integration exists.
- **Link-first reuse:** use existing archives such as PYQJIIT through their original source until the maintainer grants permission for a feed/API/import.

## Workspace status

| Workspace | Current implementation | Status |
| --- | --- | --- |
| Home | Entry point and shortcuts | Prototype UI |
| Academics | Attendance calculator/forecast, SGPA estimate and cumulative CGPA estimate from user inputs | Functional local calculators; no official records |
| Study Vault | Source-aware links to PYQJIIT and the JIIT Web kiosk | Functional outbound links; no mirrored archive or uploads |
| Exam Center | Study task creation, due dates, completion, filters and deletion | Functional browser-local planner; not synced to an account |
| Career | Recruiter information and student experiences | Placeholder |
| Campus | Sector 62 / Sector 128 information and utilities | Placeholder |
| Community | Discussions, teams, clubs and events | Placeholder |

The browser-local study planner stores tasks in the current browser only. Do not use it as a cloud backup or assume tasks follow you across devices.

## Research and implementation docs

- [Product and implementation framework](docs/PRODUCT_AND_IMPLEMENTATION_FRAMEWORK.md)
- [Authentication setup](docs/AUTH_SETUP.md)
- [Implementation audit and release blockers](docs/IMPLEMENTATION_AUDIT_2026-10-19.md)
- [Feature map](docs/FEATURE_MAP.md)
- [V3 foundation status](docs/V3_FOUNDATION.md)
- [Research and code audit](docs/RESEARCH_AND_CODE_AUDIT_2026-10-01.md)
- [Data model and service boundaries](docs/DATA_MODEL.md)

## Technology

- Next.js App Router and React
- TypeScript
- CSS design system
- Prisma schema targeting PostgreSQL
- GitHub Actions for unit tests, lint, typecheck, Prisma validation and production build

The application remains a client-side prototype for academic data. Supabase Auth scaffolding now supports passwordless email links, cookie-backed SSR sessions, callback validation and sign-out, but the inactive Supabase project prevents a real sign-in test. Authentication does not yet gate private data because no private-record API exists. Ownership enforcement, private storage and server-backed academic workflows remain unimplemented.

## Local development

Requirements: Node.js 22+ and npm.

```bash
npm install
npm run dev
```

Open http://localhost:3000.

Available scripts:

- `npm run dev` — local development server
- `npm run test` — dependency-free unit tests for academic calculations
- `npm run lint` — ESLint
- `npm run typecheck` — TypeScript checks
- `npm run db:validate` — Prisma schema validation
- `npm run build` — production compilation

## Data and contribution policy

Records should carry a trust state:

- `OFFICIAL` — published by JIIT through an official channel
- `VERIFIED` — independently reviewed against a reliable source
- `COMMUNITY` — student-contributed and not institutionally endorsed
- `DEMO` — illustrative placeholder data, never real student or institutional records

Do not upload private student information, credentials, copyrighted material without permission, or personal contact details. Community submissions need a review and reporting workflow before public launch.

## Roadmap

1. Commit and use a reproducible package lock; keep CI green.
2. Restore an approved database environment and verify migration history/schema alignment.
3. Implement authentication, sessions, profiles and role-safe authorization.
4. Build private, persisted academic records and safe CSV/XLSX/PDF import workflows.
5. Validate academic calculations against current programme-specific rules.
6. Add a permission-aware resource catalogue, PYQs, exam/timetable workflows and provenance.
7. Add campus and career directories with freshness and moderation.
8. Implement community workflows, abuse reporting and notifications.
9. Add contextual search and JIIT Sathi only after source data is trustworthy.
10. Complete security, accessibility, performance and deployment verification.

## Production readiness

Do not describe this repository as production-ready until authentication and ownership controls are tested, the database is active and verified, migrations and policies are aligned, CI/build checks pass from a clean checkout, critical end-to-end flows work, and deployment smoke tests plus rollback/restore are verified.
