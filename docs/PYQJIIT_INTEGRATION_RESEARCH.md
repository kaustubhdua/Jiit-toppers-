# PYQJIIT Integration Research and Delivery Plan

**Status:** Link-first integration only; no API or redistribution permission has been established.
**Reviewed:** 2 November 2026
**External source:** https://pyqjiit.rushilk.dev/

## Decision

Treat PYQJIIT as an independently operated community archive and link to the original site. Do not scrape, bulk-download, mirror, rehost, embed PDFs, or copy its database without explicit maintainer permission and a review of the rights applicable to each paper.

JIIT Toppers can add personal exam-preparation workflows around a paper a student chooses to open. Those workflows must not depend on undocumented PYQJIIT internals.

## Publicly advertised capabilities

The public-facing site advertises academic-year and branch discovery and student paper contributions. Its displayed version notes have described upload preview and page reordering. These observations do not establish full archive coverage, subject-level metadata, public downloads, API availability, paper licensing, or institutional endorsement.

## Unknowns to verify

- Full coverage by branch, course, semester, exam type and year.
- Whether papers are viewable/downloadable without an account.
- Search behavior and stable paper identifiers.
- Supported API, feed, export or sitemap, if any.
- Rights and license for each uploaded paper.
- Moderation, takedown and copyright complaint process.
- Rate limits, uptime expectations and permitted linking/embedding.
- Whether the maintainer is open to collaboration.

Do not invent coverage counts, paper availability, solutions, APIs or official affiliation.

## Delivery stages

### Stage 0 — Link-first discovery

- Link directly to https://pyqjiit.rushilk.dev/.
- Label it as an external community source, not an official JIIT service.
- Open in a new tab using safe link attributes.
- Explain that availability and content are controlled by the external operator.
- Do not proxy files or imply JIIT Toppers hosts the archive.

### Stage 1 — Maintainer outreach

Ask about a supported API/feed/export, stable identifiers, available metadata, attribution, caching, link/embedding permission, PDF redistribution rights, rate limits, takedowns and collaboration. Until permission and a documented contract exist, retain link-only behavior.

### Stage 2 — First-party personal study tracker

Build independently of the PYQJIIT backend:
- Save a paper reference URL with optional user-entered title, subject, semester, branch, paper year and exam type.
- Track Saved, Planned, Attempted and Reviewed status.
- Record personal attempt date, duration, self-reported score and notes.
- Filter upcoming, overdue and completed preparation tasks.
- Allow export and deletion of personal records.
- Label user-entered metadata as unverified.
- Keep notes and scores private and owner-scoped.
- Do not fetch arbitrary user URLs server-side; avoid SSRF.

If cloud persistence is not verified, clearly label records as device-local and do not imply cross-device sync.

### Stage 3 — Authorized metadata integration (conditional)

Only after written permission and a documented supported interface:
- Add a typed provider adapter, not direct fetch logic in React components.
- Store only permitted metadata and canonical source URLs.
- Preserve attribution, provenance and retrieval timestamps.
- Apply host allowlists, schema validation, timeouts, response-size limits, rate limiting and permitted caching.
- Handle timeouts, 404, rate limits, upstream errors, removed items and schema changes distinctly.
- Add contract tests with sanitized fixtures and a kill switch.
- Never forward student credentials, cookies or private academic records.

### Stage 4 — Unified Study Vault

Only when permitted metadata is available, allow search across JIIT Toppers' own approved resources and permitted external metadata. Distinguish external links from first-party hosted content and show freshness. Do not call a resource institutionally verified unless reviewed against a reliable source.

### Stage 5 — Independent uploads (separate release gate)

Before accepting or hosting papers, implement authentication, ownership, private staging storage, file signature validation, size/page limits, malware scanning where practical, moderation, duplicate detection, uploader rights attestation, reporting/takedown, audit trail, retention/deletion, storage policies and security tests. Do not host copyrighted material without a rights basis.

## Personal reference data model

Compare with the existing schema before implementation:
- ownerId (derived server-side from authenticated session)
- sourceKind (PYQJIIT_LINK, OTHER_LINK, USER_UPLOAD)
- canonicalUrl (HTTPS; validate host for PYQJIIT links)
- optional title, subjectCode, subjectName, semester, branch, paperYear, examType
- practiceStatus
- attemptedAt, durationMinutes, selfReportedScore, private notes
- createdAt, updatedAt

No external PDF binary is required for link-first support.

## Acceptance criteria

### Link-first
- Link reachable from Study Vault and relevant exam-preparation screens.
- External-source and non-affiliation labels visible.
- HTTPS and safe new-tab behavior.
- Mobile, keyboard and screen-reader behavior verified.
- External outage does not break JIIT Toppers.
- No unsupported claims about API, archive coverage, answers or endorsement.

### Personal tracker
- Create, edit, delete and update status.
- Reject malformed and non-HTTPS URLs.
- Owner A cannot read/update/delete Owner B's records.
- Private notes/scores are not public.
- No arbitrary server-side URL fetching.
- Tests cover validation, ownership, deletion and empty/error states.
- Export/deletion and local-vs-cloud persistence are accurately described.

### Authorized provider
- Permission and allowed use recorded.
- Provider contract, attribution and caching terms documented.
- Host allowlist, timeout, response limits, rate limit and kill switch.
- Tests cover malformed data, timeout, 404, rate limit, 5xx and removed resources.
- Redistribution rights explicitly confirmed before storing or serving files.

## Maintainer outreach questions

1. Is there a supported public API, metadata feed or export?
2. Is there a canonical course/subject catalog?
3. May JIIT Toppers link to individual paper pages?
4. Are metadata caching, thumbnails or PDF embedding allowed?
5. What attribution is required?
6. Is collaboration or a shared contribution workflow welcome?
7. What is the preferred broken-link, abuse and takedown process?

## Release decision

**Current supported path: link-first.** Personal preparation tracking can be implemented independently. API/feed integration, PDF hosting and archive mirroring remain conditional on explicit permission and verified rights. This document is a delivery plan, not proof that those integrations exist or are complete.
