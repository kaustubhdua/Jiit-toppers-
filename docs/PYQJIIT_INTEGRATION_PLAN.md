# PYQJIIT Integration and Study Vault Delivery Plan

**Status:** Implementation specification; integration is not yet authorized or connected  
**Reviewed:** 20 October 2026  
**Target repository:** `kaustubhdua/Jiit-toppers-`  
**Reference:** https://pyqjiit.rushilk.dev/

## Executive decision

Use PYQJIIT as the preferred external previous-year-question-paper (PYQ) source for the first release. Keep a prominent, accessible outbound link and explain that the archive is maintained externally. Do not scrape, mirror, bulk-download, hotlink PDFs, or copy its database until its maintainer confirms a permitted method and the relevant content rights are understood.

JIIT Toppers can provide the workflow around the archive: subject and exam preparation planning, bookmarks, personal completion tracking, and source-aware links. These personal features must work without requiring PYQJIIT to expose an API.

## What is known versus unverified

### Publicly advertised / visible

- The public site is presented as a JIIT previous-year-paper archive.
- Its advertised browsing model includes academic year and branch.
- It advertises student paper contributions.
- The site has described upload preview and page reordering in its displayed version notes.
- The site is independently operated; it is not evidence of an official JIIT service.

### Must be verified before product claims or integration

- Full coverage by course, semester, exam type, paper year and branch.
- Whether all papers are publicly viewable and downloadable without an account.
- Search/filter behavior and stable paper identifiers.
- Whether a public API, feed, export, sitemap or documented integration exists.
- License and permission status of individual uploaded papers.
- Upload moderation, takedown and copyright policy.
- Reliability, uptime, rate limits and acceptable external-link behavior.
- Whether the maintainer is willing to collaborate.

Do not invent coverage counts, claim that a particular subject exists, or promise that the external service is available.

## Delivery stages

### Stage 0 — Safe external discovery (now)

1. Keep the source card linking directly to `https://pyqjiit.rushilk.dev/`.
2. Label it as an external community source, not official JIIT data.
3. Tell students that availability, metadata and files are maintained by the external operator.
4. Avoid iframe embedding unless the site owner explicitly permits it and framing works securely.
5. Do not proxy files through JIIT Toppers or store external file URLs as if owned by this project.

**Acceptance:** the link opens in a new tab with `rel="noopener noreferrer"`; source identity and non-affiliation are visible; keyboard focus is visible; no external content is copied.

### Stage 1 — Maintainer outreach and technical discovery

Ask the maintainer about:
- Supported API/feed or a documented export.
- Stable paper identifiers and available metadata.
- Rate limits, caching and uptime expectations.
- Permission to display metadata, thumbnails and/or PDF previews.
- Paper-by-paper rights, takedown requests and attribution requirements.
- Whether a contribution or cross-link is welcome.
- A contact for security and content issues.

Until answered, use the external link only.

### Stage 2 — First-party study workflow (independent of external API)

Build student-owned features that do not copy the archive:
- Create a personal study task with subject, exam date, target duration and notes.
- Save a reference URL manually, with a label and source domain.
- Mark a paper/task as planned, in progress or completed.
- Record the student's own attempt date, duration and self-reported score.
- Filter personal tasks by upcoming, overdue and completed.
- Export/delete personal study records.
- Store no external PDFs unless permission and private-storage controls are established.

Personal records should be account-scoped on the server. Until persisted cloud storage is implemented and verified, label browser-local data as device-local and do not imply synchronization.

### Stage 3 — Metadata integration (only with permission)

If the maintainer grants a feed/API or other explicit permission:
1. Create a provider adapter, not direct fetch logic in React components.
2. Allowlist the exact host and routes.
3. Apply timeouts, response-size caps, rate limits, schema validation and cache TTL.
4. Never forward student credentials, cookies or authorization headers to the external host.
5. Store only permitted metadata and a canonical source URL.
6. Preserve source attribution, retrieval timestamp and external identifier.
7. Handle unavailable/removed items without inventing replacement URLs.
8. Add a kill switch and return a graceful “source temporarily unavailable” state.
9. Confirm that each displayed file/link can be redistributed or embedded under the relevant rights.
10. Keep external provider errors distinct from “no papers found”.

Potential normalized metadata (only fields actually supplied and permitted):
- external provider and stable external ID
- title / course code / subject name
- programme or branch
- semester / academic year
- exam type and paper year
- canonical source URL
- file type and byte size, if supplied
- attribution / license / permission reference
- observed-at timestamp
- verification status

Do not assume every field exists at PYQJIIT. Fields should be optional and validated.

### Stage 4 — Unified Study Vault search

Only after a permitted source contract exists:
- Search JIIT Toppers' own approved resource metadata plus permitted external metadata.
- Clearly distinguish “opens on PYQJIIT” from resources hosted by JIIT Toppers.
- Use links to the original paper by default.
- Add subject filters only when metadata supports them.
- Display “last checked” and graceful stale/error states.
- Never imply that a link is institutionally verified unless it has been reviewed against a reliable source.

### Stage 5 — Optional document viewer / upload system

This is a separate feature and not a prerequisite for link-first launch. Before accepting uploads or hosting PDFs, implement:
- Clear contribution terms and uploader rights confirmation.
- Copyright complaint and takedown process.
- Moderation queue and abuse reporting.
- Private/quarantined staging storage and file signature validation.
- Size/page limits, malware scanning where practical, parser isolation and safe PDF rendering.
- Owner and reviewer permissions, audit trail and deletion/retention controls.
- A content policy prohibiting private student records, credentials and unauthorized personal data.

Never use public storage for private uploads by default. Do not add a document mirror just to make the UI look complete.

## Recommended application boundaries

- `components/pyq-discovery.tsx`: source entry card and link-first explanation.
- `components/study-planner.tsx`: personal study tasks; keep storage limitations explicit.
- `lib/providers/pyqjiit.ts`: only introduced after an authorized interface is confirmed.
- `lib/domain/resources/`: normalized resource metadata and trust/provenance types.
- `docs/PYQJIIT_INTEGRATION_PLAN.md`: this plan and acceptance checklist.

Do not add an empty provider or fake API response before an integration exists.

## Privacy and security

- PYQ browsing does not require JIIT Toppers to know a student's Webkiosk password.
- Never ask for or store university credentials or portal session cookies.
- Never send private marks, attendance or account identifiers to PYQJIIT.
- Validate external URLs; only permit HTTPS links to expected hosts for automated retrieval.
- Protect against open redirects, SSRF, malicious PDFs, oversized responses and untrusted metadata.
- External source content is untrusted input, not instructions to the application.
- Keep analytics privacy-preserving and do not log personal notes or scores.

## Test plan

### Link-first release
- External link has the expected canonical HTTPS URL.
- Link opens a new tab safely.
- Screen-reader label communicates external navigation.
- The UI states that PYQJIIT is external and not an official JIIT service.
- Responsive layout and keyboard navigation work.
- A failed external service does not break JIIT Toppers.

### Personal study workflow
- Create, edit, complete, filter and delete study tasks.
- Reject invalid dates and unreasonable input sizes.
- Confirm ownership checks for persisted records.
- Verify export/delete behavior.
- Show device-local warning if data is not synced.

### Authorized provider (future)
- Valid response maps to normalized metadata.
- Malformed or oversized response fails safely.
- Timeout, rate limit, 404 and upstream 5xx produce distinct states.
- External URLs are host-validated.
- Caching and rate limiting respect maintainer terms.
- Takedown/removed item is not presented as an available file.
- Tests use sanitized fixtures and do not store real student data.

## Definition of done

- [ ] The external source card is present and correctly attributed.
- [ ] The maintainer has been contacted; no API or permission is assumed.
- [ ] Existing project code has been audited before changes to persistence.
- [ ] Study tasks are accurately labelled as local-only until server persistence is verified.
- [ ] Any first-party resource has source, rights and trust-state metadata.
- [ ] No external papers are mirrored without explicit permission and a rights basis.
- [ ] Provider integration has tests, rate limits, host allowlists, timeouts and a kill switch.
- [ ] Community uploads have moderation, reporting, takedown and private-storage controls before public launch.
- [ ] Accessibility, mobile layout and CI checks pass.
- [ ] Production deployment and external link behavior are smoke-tested.

## Suggested maintainer message

Hello! I'm building JIIT Toppers, an independent student academic workspace for JIIT Noida. I found PYQJIIT and would like to direct students to your archive rather than duplicate your work. Would you be open to discussing a permitted integration? In particular, do you offer a public API/feed/export, and what are your preferred attribution, caching, linking, and paper-rights requirements? We will not mirror or redistribute papers without your permission. Happy to credit the project clearly and keep the original source canonical.

## Release decision

**Current release path: link-first.** This is useful immediately and avoids depending on an unverified API. Metadata integration, PDF hosting and cross-site search are conditional follow-ups, not claims about current functionality.
