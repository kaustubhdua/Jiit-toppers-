# PYQJIIT Integration Research and Delivery Plan

**Reviewed:** 20 October 2026  
**Project:** JIIT Toppers  
**External source:** [PYQJIIT](https://pyqjiit.rushilk.dev/)  
**Maintainer portfolio:** [Rushil Koul](https://www.rushilk.dev/)

## Executive decision

Treat PYQJIIT as the primary external PYQ archive to link to, not as a data source that JIIT Toppers can currently ingest. The public landing page advertises year selection (first through fourth year), branch selection (ECE, CSE, IT, BT, MNC, RAI), a common first-year curriculum, and an upload workflow that supports previewing and reordering pages. The maintainer's portfolio describes it as a student-built archive where JIIT students log in and upload papers.

**Not verified:** a public API, export feed, integration agreement, license permitting redistribution, complete subject-level metadata, archive completeness, or whether all pages work without authentication. Do not imply these capabilities exist.

## What JIIT Toppers should do now

1. Keep a clear, working outbound link to the original PYQJIIT site.
2. Explain that PYQJIIT is an external community source and that availability/content are controlled by its maintainer and contributors.
3. Do not scrape, bulk-download, mirror, rehost, or republish the archive without permission and a review of applicable content rights.
4. Build preparation tools that work with a paper a student chooses to open or lawfully upload, without depending on PYQJIIT internals.
5. Contact the maintainer to ask whether they are open to a collaboration, stable API/feed, subject metadata export, attribution requirements, and permitted linking/embedding.
6. If there is no authorized feed, keep integration link-only and make any independent student-submitted repository opt-in, moderated, source-attributed, and rights-aware.

## Current integration status

| Capability | Status | Evidence / next action |
|---|---|---|
| External link | Implemented in `components/pyq-discovery.tsx` | Verify link from the deployed app |
| Year/branch discovery | Advertised by public landing page | Do not assume exact archive coverage |
| Student paper upload | Advertised by maintainer portfolio | Upload behavior not tested in this audit |
| Public API/feed | Unknown / not documented in reviewed public landing page | Ask maintainer; do not guess endpoints |
| In-app paper listing | Not implemented | Requires permissioned source and stable metadata |
| In-app PDF viewer | Not implemented as a PYQ catalog workflow | Add only when document source and rights permit |
| Bookmarks/completion tracking | Not implemented for individual PYQs | Can be built as personal metadata around links |
| Official JIIT endorsement | Not established | Clearly label project as independent |

## Recommended product experience

### Phase A — Link-first discovery (now)

- Feature PYQJIIT prominently in Study Vault and Exam Center.
- Provide a short explanation of its purpose, external-source label, and “opens external site” affordance.
- Preserve the original source URL and open in a new tab with safe link attributes.
- Add fallback copy if external site is unavailable; do not proxy it through JIIT Toppers.
- Keep the source note visible on mobile and keyboard accessible.

### Phase B — Personal PYQ preparation tracker

Implement this independently of PYQJIIT's backend:

- Let a signed-in student save a personal reference to a paper using its URL and optional title, subject, semester, branch, paper year, exam type, and notes.
- Track status: Saved, Planned, Attempted, Reviewed.
- Allow duration and self-reported score to be recorded as personal notes.
- Display a clear source URL and user-entered metadata label.
- Treat metadata as user-provided until reviewed; do not claim official subject mappings.
- Enforce owner-scoped access. A student's bookmarks and practice scores must never be public by default.
- Do not use server-side URL fetching to arbitrary user URLs; avoid SSRF. If metadata preview is added later, use a strict allowlist, redirect restrictions, timeouts, and content-type/size limits.

### Phase C — Authorized catalog integration (only after permission)

If the maintainer offers a documented API/feed or written permission for another integration:

- Create a typed provider adapter in `lib/providers/pyqjiit/`.
- Store only permitted metadata, stable source IDs and canonical URLs unless redistribution rights are explicit.
- Cache only as allowed by the maintainer's terms; include attribution and freshness timestamps.
- Handle upstream timeout, rate limits, unavailable paper, removed paper, and schema changes.
- Never scrape private/authenticated pages or rely on undocumented endpoints.
- Add contract tests using sanitized fixtures; do not store private account data.
- Keep a kill switch to disable the adapter without affecting the rest of JIIT Toppers.

### Phase D — Independent uploads (separate decision)

Do not implement a public upload/rehosting workflow until all of these exist:

- Authenticated account and strict ownership controls.
- Private staging storage, file size/page limits, signature/type validation and malware scanning where available.
- Duplicate detection and a moderation queue.
- Required metadata and source/rights attestation.
- Report/takedown workflow and named moderation responsibility.
- Audit trail and deletion/retention policy.
- Copyright/university policy review.
- RLS and storage-policy tests.

## Data model for personal references

This is a proposed logical model; compare against the current Prisma schema before implementation.

- `ownerId`: authenticated owner, set server-side only.
- `sourceKind`: `PYQJIIT_LINK`, `OTHER_LINK`, or `USER_UPLOAD`.
- `canonicalUrl`: validated HTTPS URL; allowlist PYQJIIT's host for PYQJIIT records.
- `title`, `subjectCode`, `subjectName`, `semester`, `branch`, `paperYear`, `examType`: optional metadata with explicit provenance.
- `practiceStatus`: saved/planned/attempted/reviewed.
- `attemptedAt`, `durationMinutes`, `selfReportedScore`, `notes`: private user practice metadata.
- `createdAt`, `updatedAt`.

Avoid duplicating the PDF binary or creating a mirror of the external archive. A source link is enough for the first version.

## Acceptance criteria

### Link-first release
- [ ] PYQJIIT link is reachable from Study Vault and Exam Center.
- [ ] External source, independence and availability caveat are visible.
- [ ] Link uses HTTPS and safe new-tab attributes.
- [ ] Responsive layout and keyboard navigation verified.
- [ ] No claims of API, full coverage, verified solutions or official affiliation.

### Personal tracker
- [ ] User can add/edit/delete a reference and update its practice status.
- [ ] Invalid/non-HTTPS URLs are rejected; PYQJIIT URLs use the expected host.
- [ ] User A cannot read, update or delete User B's references.
- [ ] Practice notes/scores are private by default.
- [ ] No arbitrary URL fetch is performed by the server.
- [ ] Tests cover validation, ownership, deletion and empty/error states.

### Authorized integration
- [ ] Maintainer permission and allowed use are recorded.
- [ ] API/feed contract and attribution requirements are documented.
- [ ] No undocumented scraping or authentication bypass.
- [ ] Timeouts, rate limits, stale data and upstream failures are tested.
- [ ] Redistribution rights are explicit before files are stored or served by JIIT Toppers.

## Maintainer outreach checklist

Ask the PYQJIIT maintainer:

1. Is there a public, supported API or metadata feed?
2. Is there a canonical subject/course catalog we may link to?
3. May JIIT Toppers link to paper pages directly, and is embedding allowed?
4. Are metadata caching, thumbnails, or PDFs allowed? Under what terms?
5. What attribution is required?
6. Is a collaboration or shared contribution workflow welcome?
7. Is there a preferred way to report broken links, duplicate papers or takedown requests?

Until answered, use link-only integration.

## Sources checked

- [PYQJIIT public landing page](https://pyqjiit.rushilk.dev/) — advertised year/branch selection and upload-page preview/reordering.
- [Rushil Koul's portfolio](https://www.rushilk.dev/) — describes PYQJIIT as a student-built archive with student login and uploads.
- Repository file `components/pyq-discovery.tsx` — confirms the current JIIT Toppers UI links to PYQJIIT and labels it as an external community source.

This document is a research and implementation plan, not proof of a live API or a completed integration. Mark items complete only after implementation and test evidence exist.
