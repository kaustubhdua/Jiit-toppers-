# JIIT Toppers

**A student-first workspace for Jaypee Institute of Information Technology.**

JIIT Toppers brings academic discovery, study resources, exam preparation, campus information, career preparation and student collaboration into one coherent experience. It is designed to complement—not replace—the official JIIT student systems.

> **Current status:** Foundation prototype, not production-ready. The current branch has local attendance/SGPA/CGPA planning tools, a browser-local study task list, and outbound links to PYQJIIT and the JIIT Web kiosk. It now has a passwordless Supabase Auth flow, account profile API, owner-scoped academic term/subject/grade/attendance APIs, and a browser-parsed CSV import flow. These workflows are implemented in code but have not been verified against a live database because the connected Supabase project is inactive. Secure private file storage, account deletion, and a verified live JIIT student-record integration are still absent. The connected Supabase project is currently inactive. Never treat placeholders or calculations as official records.

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
| Academics | Local calculators plus account-scoped terms, subjects, grade records, attendance snapshots and CSV import APIs/UI | Code implemented; live persistence blocked by inactive database |
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

The application remains a prototype until its infrastructure is activated and verified. Supabase Auth scaffolding supports passwordless email links, cookie-backed SSR sessions, callback validation and sign-out. The account and academic APIs derive the owner from a verified server-side Supabase session and scope queries by that owner. The inactive Supabase project prevents real sign-in/database tests. Secure private file storage, import deletion/export, and a verified JIIT portal integration remain unimplemented.

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
3. Verify passwordless authentication and account profile workflows against the active database.
4. Verify owner-scoped academic terms, subjects, grade records, attendance snapshots and transactional CSV imports against the active database.
5. Add safe document storage, account deletion, import-history management and XLSX/PDF imports; verify the current JSON export and term-deletion controls.
6. Validate academic calculations against current programme-specific rules.
7. Add a permission-aware resource catalogue, PYQs, exam/timetable workflows and provenance.
8. Add campus and career directories with freshness and moderation.
9. Implement community workflows, abuse reporting and notifications.
10. Add contextual search and JIIT Sathi only after source data is trustworthy.
11. Complete security, accessibility, performance and deployment verification.

## Production readiness

Do not describe this repository as production-ready until authentication and ownership controls are tested, the database is active and verified, migrations and policies are aligned, CI/build checks pass from a clean checkout, critical end-to-end flows work, and deployment smoke tests plus rollback/restore are verified.
