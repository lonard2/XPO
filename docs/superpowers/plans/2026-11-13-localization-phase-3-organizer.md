# Localization Phase 3: Organizer Portal Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Localize every user-visible string in the organizer portal into all six locales, lowering the audit baseline from 640 to about 473.

**Architecture:** Keep the existing `organizer` namespace. Add section-prefixed keys (`wizard*`, `authority*`, `customizer*`, `showcase*`, `preview*`, `updates*`, `dashboard*`) so the wizard file does not become a flat list of 150 keys. Replace `tOrg("key") || "English fallback"` with a bare `tOrg("key")` once the key exists. Preview-only sample content is replaced with real event data rather than translated as fact.

**Tech Stack:** next-intl, React 19, the Phase 0 audit and ratchet.

**Spec:** `docs/superpowers/specs/2026-11-11-localization-coverage-design.md`

## Global Constraints

- Six locales in the same commit: `en`, `id`, `ja`, `zh-CN`, `de`, `es`.
- No emojis, no em dashes. Use institutional terms: Event Category, not Archetype.
- Technical codes (`IDR`, `JPY`, `USD`, `HMAC`, `QR`, `HID`, `WYSIWYG`) stay in the allowlist or remain literal.
- Proper nouns and example IDs are ICU values, not keys.
- The audit baseline only goes down. Update it after each task.
- Long German and Romance strings must not clip the wizard chips; test at 390px and 1280px.
- Preview sample statistics are not translated as fact. Derive them from the event or remove them.

## Review Focus

- A sentence split across JSX fragments: merge it into one key with ICU placeholders, not three keys.
- An existing key used through `tOrg("key") || "fallback"`: remove the fallback, do not add a second key.
- A placeholder or `aria-label`: it is user-facing copy and needs a key, not an allowlist entry.
- Preview-only fabricated content: replace with event data or omit; do not translate a fake delegate count.
- A long translated label inside a fixed-width pill: check 390px and 1280px before committing.

---

### Task 1: Organizer shell and small surfaces

**Files:**
- Modify: `src/app/[locale]/(organizer)/layout.tsx`, `dashboard/page.tsx`, `events/[slug]/updates/page.tsx`, `booths/page.tsx`
- Modify: `src/components/organizer/CheckInScanner.tsx`, `MeetingRequestInbox.tsx`
- Modify: `src/messages/*.json`

**Interfaces:**
- Consumes: `useTranslations("organizer")` already present in each file.
- Produces: keys `organizerNavAria` (exists), `dashboardLoadErrorTitle`, `dashboardLoadErrorDesc`, `dashboardRetry`, `updatesPageTitle`, `updatesPageTab`, `updatesPageDesc`, `dismissNotificationAria`, `hidWedgeActive`, `meetingWherePlaceholder`.

- [ ] Add the new keys in six locales.
- [ ] Replace the hardcoded `aria-label`, dashboard error block, updates header, booth dismiss label, scanner badge, and meeting placeholder.
- [ ] Reuse `common.cancel` and `organizer.decommTitleAttr` where the value already matches.
- [ ] Run `npx tsc --noEmit`, `npx vitest run tests/unit/i18n`, and `npx tsx scripts/audit-i18n.ts --update-baseline`.
- [ ] Commit: `feat(i18n): localize organizer shell and small surfaces`.

### Task 2: Wizard chrome and draft recovery

**Files:**
- Modify: `src/app/[locale]/(organizer)/events/new/page.tsx:1090-1170, 1240-1260`
- Modify: `src/messages/*.json`

**Interfaces:**
- Consumes: `tOrg` and `tCom`.
- Produces: `wizardProgressLabel`, `wizardProgressValue` (ICU `{percent}`), `wizardDraftTitle`, `wizardDraftQuestion`, `wizardDraftResume`, `wizardDraftDiscard`, `wizardDiscardTitle`, `wizardDiscardBody`, `wizardDiscardConfirm`, `wizardStepsAria`.

- [ ] Add the keys in six locales.
- [ ] Replace the progress pill, draft banner, discard modal, and `aria-label="Wizard Steps"`.
- [ ] Keep `tCom("cancel")` for the modal cancel button.
- [ ] Run the i18n tests and update the baseline.
- [ ] Commit: `feat(i18n): localize event wizard chrome and draft recovery`.

### Task 3: Wizard publication authority

**Files:**
- Modify: `src/app/[locale]/(organizer)/events/new/page.tsx:1365-1580`
- Modify: `src/messages/*.json`

**Interfaces:**
- Consumes: `tOrg`, `Input` labels and helper text.
- Produces: `authorityTitle`, `authorityDesc`, `authorityBadge`, `authorityAria`, `authorityCuratedTitle`, `authorityCuratedBadge`, `authorityCuratedDesc`, `authorityDelegatedTitle`, `authorityDelegatedBadge`, `authorityDelegatedDesc`, `authoritySelfTitle`, `authoritySelfBadge`, `authoritySelfDesc`, `authorityListingTitle`, `authorityListingBadge`, `authorityListingDesc`, `authorityOwnedNote`, `authorityExternalUrlLabel`, `authorityExternalUrlPlaceholder`, `authorityExternalUrlHelper`, `authorityOrganizerNameLabel`, `authorityOrganizerNamePlaceholder`, `authorityOrganizerNameHelper`, `authorityTargetIdLabel`, `authorityTargetIdPlaceholder`, `authorityTargetIdHelper`.

- [ ] Add the keys in six locales. Reuse `settings.defaultBadge` for the Default chip only if its value matches.
- [ ] Replace the four authority cards, the radiogroup label, and the three sub-field blocks.
- [ ] Run the i18n tests and update the baseline.
- [ ] Commit: `feat(i18n): localize event publication authority`.

### Task 4: Wizard identity, venue, halls, and dates

**Files:**
- Modify: `src/app/[locale]/(organizer)/events/new/page.tsx:1580-2140`
- Modify: `src/messages/*.json`

**Interfaces:**
- Consumes: `tOrg`, `tReg`, `tVenueType`, `tSpaceKind`.
- Produces: `wizardIdentityDesc`, `wizardTitlePlaceholder`, `wizardSlugPlaceholder`, `wizardSlugPrefix`, `wizardVenueDesc`, `wizardRegionLabel`, `wizardRegionAria`, `wizardCampusTitle`, `wizardCampusDesc`, `wizardCampusAllocation`, `wizardCampusSlots`, `wizardOperatingWindow`, `wizardPhysicalDays`.

- [ ] Add the keys in six locales.
- [ ] Replace the identity description, title/slug placeholders, the `/events/` prefix, venue description, region label and aria, campus card copy, and date-window labels.
- [ ] Keep region and venue proper nouns from `regions` and the venue record.
- [ ] Run the i18n tests and update the baseline.
- [ ] Commit: `feat(i18n): localize wizard identity and venue allocation`.

### Task 5: Wizard passes, capacity, perks, and branding

**Files:**
- Modify: `src/app/[locale]/(organizer)/events/new/page.tsx:2190-2560`
- Modify: `src/messages/*.json`

**Interfaces:**
- Consumes: `tOrg`, `tReg` for currency labels.
- Produces: `wizardPassPresets`, `wizardPresetFree`, `wizardPresetVip`, `wizardPresetAllAccess`, `wizardHallAllocation`, `wizardAllocatedLabel`, `wizardSlotsLabel`, `wizardPercentAllocated`, `wizardHallAllocationAria`, `wizardCapacityAlertTitle`, `wizardCapacityAlertBody` (ICU `{allocated}`, `{limit}`), `wizardTierNamePlaceholder`, `wizardPerksLabel`, `wizardPerksPlaceholder`, `wizardBrandingDesc`, `wizardPaletteLabel`, `wizardPrimaryHexAria`, `wizardAccentHexAria`.

- [ ] Add the keys in six locales. Use `regions.id.currency`, `regions.jp.currency`, and `regions.global.currency` where they match.
- [ ] Merge the capacity alert fragments into one ICU message.
- [ ] Replace the preset buttons, allocation labels, tier placeholders, perks, and branding controls.
- [ ] Run the i18n tests and update the baseline.
- [ ] Commit: `feat(i18n): localize wizard passes, capacity, and branding`.

### Task 6: Wizard summary and preview labels

**Files:**
- Modify: `src/app/[locale]/(organizer)/events/new/page.tsx:2560-2650`
- Modify: `src/messages/*.json`

**Interfaces:**
- Produces: `wizardSummaryDesc`, `wizardSummaryTitleLabel`, `wizardSummaryVenueLabel`, `wizardSummaryDatesLabel`, `wizardSummaryTo`, `wizardSummaryTiersLabel` (ICU `{count}`), `wizardSummarySlots`, `wizardPreviewTitle`, `wizardPreviewBadge`.

- [ ] Add the keys in six locales.
- [ ] Replace the summary card and preview header.
- [ ] Run the i18n tests and update the baseline.
- [ ] Commit: `feat(i18n): localize wizard summary and preview header`.

### Task 7: Customizer page

**Files:**
- Modify: `src/app/[locale]/(organizer)/events/[slug]/customizer/page.tsx`
- Modify: `src/messages/*.json`

**Interfaces:**
- Consumes: `tOrg`, `tCom`, `tArch`.
- Produces: `customizerBack`, `customizerLive`, `customizerDesc`, `customizerCategoryTitle`, `customizerCategoryCount` (ICU `{count}`), `customizerCategoryDesc`, `customizerCategoryAria`, `customizerColorsTitle`, `customizerPaletteLabel`, `customizerPrimaryLabel`, `customizerPrimaryPickerAria`, `customizerPrimaryHexAria`, `customizerAccentLabel`, `customizerAccentPickerAria`, `customizerAccentHexAria`, `customizerTypographyTitle`, `customizerHeroTitle`, `customizerHeroBadgeLabel`, `customizerHeroBadgePlaceholder`, `customizerHeroBadgeHelper`, `customizerPageSizeTitle`, `customizerPageSizeHelper`, `customizerHeroUrlLabel`, `customizerOverlayLabel`, `customizerSectionsTitle`, `customizerSwitchTitle`, `customizerSwitchBody`, `customizerSwitchKeep`, `customizerSwitchApply`.

- [ ] Add the keys in six locales. Reuse `organizer.curatedBadge`, `organizer.wizardPageSize*`, and `organizer.wizardHeroImage` where they match.
- [ ] Replace the header, category card, color controls, typography, hero media, page-size helper, section visibility, and category-switch modal.
- [ ] Run the i18n tests and update the baseline.
- [ ] Commit: `feat(i18n): localize organizer customizer`.

### Task 8: Live preview frame

**Files:**
- Modify: `src/components/organizer/LivePreviewFrame.tsx`
- Modify: `src/messages/*.json`

**Interfaces:**
- Produces: `previewCanvasTitle`, `previewCanvasBadge`, `previewDesktopAria`, `previewDesktopLabel`, `previewTabletAria`, `previewTabletLabel`, `previewMobileAria`, `previewMobileLabel`, `previewHeroFallback`, `previewVerifiedBadge`, `previewReserveCta`, `previewFloorPlan`, `previewDelegateCount` (ICU `{count}`), `previewPassTiers`, `previewCap`, `previewPassFeature`, `previewKeynoteTracks`, `previewExhibitors`, `previewPerks`, `previewPerkExample`, `previewPerkUnlock`, `previewSpeakerDecks`, `previewDeckUnlock`.

- [ ] Add the keys in six locales.
- [ ] Replace the viewport labels and aria labels.
- [ ] Replace the fabricated `3,900+ registered delegates` with a real count from the event ticket tiers or hide it when absent.
- [ ] Replace the fabricated perk examples with `event.perks` when present, otherwise hide the block.
- [ ] Run the i18n tests and update the baseline.
- [ ] Commit: `feat(i18n): localize live preview frame`.

### Task 9: Showcase editor

**Files:**
- Modify: `src/components/organizer/ShowcaseEditor.tsx`
- Modify: `src/messages/*.json`

**Interfaces:**
- Produces: `showcaseTitle`, `showcaseDesc`, `showcaseLivestream`, `showcaseStreamUrl`, `showcaseLive`, `showcaseProgramRows` (ICU `{count}`), `showcaseAddRow`, `showcaseKind`, `showcaseProgramTitle`, `showcaseDetail`, `showcaseSponsor`, `showcaseSponsorPlaceholder`, `showcaseAlerts` (ICU `{count}`), `showcaseAddAlert`, `showcaseAnnouncement`, `showcaseChannels` (ICU `{count}`), `showcaseAddChannel`, `showcaseChannelCode`, `showcaseLanguage`, `showcaseFilledOnly`, `showcaseAttest`, `showcaseAttestFor`, `showcaseLastAttested`.

- [ ] Add the keys in six locales. Reuse `common.language` and `admin.homepageRowsTitleField` only if the value matches.
- [ ] Replace the section headers, row labels, placeholders, attestation copy, and the `Only filled rows publish` note.
- [ ] Run the i18n tests and update the baseline.
- [ ] Commit: `feat(i18n): localize showcase editor`.

### Task 10: Event updates editor

**Files:**
- Modify: `src/components/organizer/EventUpdatesEditor.tsx`
- Modify: `src/messages/*.json`

**Interfaces:**
- Produces: `updatesTitleLabel`, `updatesTitlePlaceholder`, `updatesBodyLabel`, `updatesBodyPlaceholder`, `updatesLoading`, `updatesEmpty`, `updatesApprovedLocked`, `updatesEdit`, `updatesDelete`.

- [ ] Add the keys in six locales. Reuse `common.cancel`, `common.delete`, and `organizer.editBtn` where the value matches.
- [ ] Replace the form labels, placeholders, loading and empty states, approved-copy note, and action labels.
- [ ] Run the i18n tests and update the baseline.
- [ ] Commit: `feat(i18n): localize event updates editor`.

### Task 11: Phase verification, guide, and checklist

**Files:**
- Modify: `docs/guides/localization.md`, `CHECKLIST.md`
- Modify: `docs/guides/phase-03-multilingual-and-regional-routing.md` (append the localization pass)
- Modify: `scripts/i18n-baseline.json`

- [ ] Run `npx tsx scripts/audit-i18n.ts --update-baseline`; confirm the hardcoded count dropped by the total fixed and the untranslated count is unchanged.
- [ ] Run `npx vitest run tests/unit/i18n tests/unit/theming tests/unit/a11y`.
- [ ] Run `npx tsc --noEmit` and `npm run build`.
- [ ] Render the organizer wizard and customizer at 390px and 1280px in `de` and `ja`; check chips, tabs, and modals for clipping.
- [ ] Append a Phase 3 section to the localization guide with the key-prefix convention and the preview-data rule.
- [ ] Update `CHECKLIST.md` with the commit range and verification receipts.
- [ ] Commit: `docs(i18n): record localization phase 3`.
