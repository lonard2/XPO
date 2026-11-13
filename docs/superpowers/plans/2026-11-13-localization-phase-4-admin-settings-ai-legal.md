# Localization Phase 4: Admin, Settings, AI, and Legal Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Localize the remaining 456 hardcoded strings in the admin portal, settings suite, AI components, legal pages, and attendee leftovers into all six locales, bringing the audit to zero hardcoded UI strings.

**Architecture:** Reuse the existing `admin`, `settings`, `ai`, `auth`, and `perks` namespaces. Add section prefixes (`shell*`, `dashboard*`, `events*`, `venues*`, `crawler*`, `audit*`, `reports*`, `concierge*`, `privacy*`, `terms*`, `notFound*`). Legal prose is translated but flagged for legal review. Fabricated floor-map and preview records are replaced with real data or removed, not translated.

**Tech Stack:** next-intl, React 19, the Phase 0 audit and ratchet.

**Spec:** `docs/superpowers/specs/2026-11-11-localization-coverage-design.md`

## Global Constraints

- Six locales in the same commit: `en`, `id`, `ja`, `zh-CN`, `de`, `es`.
- No emojis, no em dashes. Institutional terms only.
- Technical codes (`HMAC`, `SHA-256`, `QR`, `OpenRouter`, model IDs) stay literal or allowlisted.
- The audit baseline only goes down. Update it after each task.
- Legal copy is translated but marked in `docs/guides/localization.md` as pending legal review.
- Long German and Romance strings must not clip admin tables, tabs, or modals at 390px and 1280px.

## Review Focus

- A sentence split across JSX fragments: merge into one ICU message.
- An existing key used with an English fallback: remove the fallback, do not add a duplicate.
- A table header, filter chip, or `aria-label`: it is user-facing copy.
- A fabricated floor-map or preview label: replace with event data or remove; do not translate invented content.
- A legal clause: translate faithfully and flag for legal review; do not paraphrase away obligations.

---

### Task 1: Admin shell and page headers

**Files:** `src/app/[locale]/(admin)/layout.tsx`, `admin/dashboard/page.tsx`, `admin/events/page.tsx`, `admin/venues/page.tsx`, `admin/audit/page.tsx`, `admin/crawler/page.tsx`, `src/components/admin/HomepageRowsManager.tsx`, `src/messages/*.json`.

- [ ] Add `admin.shell*`, `admin.dashboard*`, `admin.events*`, `admin.venues*`, `admin.audit*`, `admin.crawler*`, `admin.homepageRows*` keys.
- [ ] Replace the persona banner, sidebar labels, page headers, and dashboard KPI captions.
- [ ] Run tsc, i18n tests, and update the baseline. Commit.

### Task 2: Admin dashboard and audit viewer

**Files:** `src/components/admin/AdminDashboardClient.tsx`, `AuditLogsViewerClient.tsx`, `src/messages/*.json`.

- [ ] Add `admin.dashboard*` and `admin.audit*` keys for verification queue, severity filters, and status labels.
- [ ] Localize status values (`SUCCESS`, `WARN`, `ALERT`, `INFO`) through label keys while keeping the raw values in logic.
- [ ] Run the checks, update the baseline, commit.

### Task 3: Admin events console

**Files:** `src/components/admin/AdminEventsConsoleClient.tsx`, `src/messages/*.json`.

- [ ] Add `admin.events*` keys for ownership filters, assignment drawer, release flow, and editorial actions.
- [ ] Localize the organizer select placeholder, tier labels, and confirmation copy.
- [ ] Run the checks, update the baseline, commit.

### Task 4: Venue directory manager

**Files:** `src/components/admin/VenueDirectoryManagerClient.tsx`, `src/messages/*.json`.

- [ ] Add `admin.venues*` keys for region filters, search, venue/hall forms, and delete confirmation.
- [ ] Keep venue and hall proper nouns from the database.
- [ ] Run the checks, update the baseline, commit.

### Task 5: Crawler console

**Files:** `src/components/admin/CrawlerConsoleClient.tsx`, `src/messages/*.json`.

- [ ] Add `admin.crawler*` keys for feed selection, dry-run mode, persist mode, run history, and results.
- [ ] Keep feed identifiers and URLs literal.
- [ ] Run the checks, update the baseline, commit.

### Task 6: AI reports and concierge

**Files:** `src/components/ai/AIReportsHub.tsx`, `AttendeeAIConcierge.tsx`, `src/messages/*.json`.

- [ ] Add `ai.reports*` and `ai.concierge*` keys for model labels, report sections, streaming states, and errors.
- [ ] Keep model IDs (`google/gemini-3.5-flash-lite`, etc.) in the allowlist.
- [ ] Run the checks, update the baseline, commit.

### Task 7: Settings suite

**Files:** `src/app/[locale]/settings/page.tsx`, `src/components/settings/*.tsx`, `src/messages/*.json`.

- [ ] Add `settings.*` keys for model cards, font scale, motion test card, typography, theme, density, and profile placeholders.
- [ ] Localize the AI model descriptions but keep the model IDs.
- [ ] Run the checks, update the baseline, commit.

### Task 8: Legal pages

**Files:** `src/app/[locale]/(attendee)/privacy/page.tsx`, `terms/page.tsx`, `src/messages/*.json`.

- [ ] Add `legal.privacy*` and `legal.terms*` keys for the full prose.
- [ ] Translate faithfully into all six locales.
- [ ] Flag the translated copy in `docs/guides/localization.md` as pending legal review.
- [ ] Run the checks, update the baseline, commit.

### Task 9: Attendee leftovers

**Files:** `src/app/[locale]/not-found.tsx`, `src/app/not-found.tsx`, `src/components/auth/AuthModal.tsx`, `src/components/perks/HallFloorMap.tsx`, `DigitalPassQR.tsx`, `InteractiveGuidebook.tsx`, `PassDayOfSubnav.tsx`, `src/components/ui/Drawer.tsx`, `Modal.tsx`, `src/messages/*.json`.

- [ ] Add `notFound*`, `auth.tier*`, `perks.map*`, `perks.pass*`, and `common.close*` keys.
- [ ] Replace the fabricated floor-map labels with localized generic hall labels or event-derived data; do not invent brand names.
- [ ] Run the checks, update the baseline, commit.

### Task 10: Verification, guide, and checklist

**Files:** `docs/guides/localization.md`, `CHECKLIST.md`, `scripts/i18n-baseline.json`.

- [ ] Confirm the audit reports zero hardcoded UI strings and the untranslated count is zero or explained.
- [ ] Run `npx vitest run tests/unit/i18n tests/unit/admin tests/unit/settings tests/unit/ai tests/unit/a11y`.
- [ ] Run `npx tsc --noEmit` and `npm run build`.
- [ ] Render admin, settings, AI, and legal surfaces at 390px and 1280px in `de` and `ja`.
- [ ] Append the Phase 4 section to the localization guide and update `CHECKLIST.md`.
- [ ] Commit: `docs(i18n): record localization phase 4`.
