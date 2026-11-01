# Data model and ownership boundaries

## Application identity

- Supabase Auth is the identity provider.
- `User.authProviderId` maps an application user to the verified Supabase Auth user ID.
- `User.email` is unique; an existing email is not silently linked to a different auth provider ID.
- The application role is stored in PostgreSQL and defaults to `STUDENT`. User-editable auth metadata is not an authorization source.

## Academic records

| Model | Purpose | Owner boundary |
| --- | --- | --- |
| `AcademicTerm` | User-created academic year/semester | `userId` |
| `StudentSubject` | User's course code, name and credits | `userId` and `termId` |
| `GradeRecord` | Latest user-entered/imported grade per subject | `userId`, `termId`, `studentSubjectId` |
| `AttendanceSnapshot` | Time-stamped attendance history | `userId`, `termId`, `studentSubjectId` |
| `AcademicImport` | Import metadata and review state | `userId` |

Private academic tables have RLS enabled and no direct Data API policies. Current application reads/writes use server-side Prisma routes. Every route derives the owner from the verified server-side auth identity; clients cannot submit a trusted `userId`.

## Data integrity

- Terms are unique per user, academic year and semester.
- Subject codes are unique per term.
- Grade points are constrained to 0–10.
- Attendance attended counts cannot exceed held counts.
- Mark values cannot exceed maximum marks.
- Import file metadata is bounded to 25 MiB at the database level, but raw file upload/storage is not implemented.
- Deleting a term or subject cascades its academic records. Term deletion is blocked if an import has a non-null storage key until secure object cleanup exists.

## Import boundaries

- CSV import is currently the supported import path. Parsing/validation occurs in the browser and imported values require user review.
- XLSX/PDF parsing, authorized JIIT portal access, raw document upload, malware scanning, object storage and automated extraction are not implemented.
- Import metadata is not proof that a document was received or securely stored.
- Source labels distinguish manual entries from import-derived entries. Student-entered data is not official JIIT data.

## PYQ Study Vault

The personal PYQ tracker is deliberately device-local. It stores only user-entered metadata, notes and HTTPS reference URLs in browser local storage. It does not fetch submitted URLs, proxy PDFs, mirror PYQJIIT content or synchronize across devices. The source archive remains independently operated.

## Operational constraints

- Live Supabase migration history has not yet been inspected because the intended project is inactive.
- Cross-account isolation has not yet been proven against a live database.
- No production Vercel deployment or runtime smoke test has been verified.
