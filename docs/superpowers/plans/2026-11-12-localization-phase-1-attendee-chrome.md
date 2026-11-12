# Localization Phase 1: Attendee Chrome Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Remove the 94 hardcoded UI strings on attendee surfaces, translate them into all six locales, and lower the audit baseline to match.

**Architecture:** Each task covers one surface group. Strings move into the existing namespace for that surface (`footer`, `nav`, `common`, `home`, `discovery`, `venues`, `regions`, `events`, `tickets`, `myTickets`). Count sentences become one ICU message instead of fragments. Proper nouns and brands go to the allowlist.

**Tech Stack:** next-intl, React 19 client components, one server page, the Phase 0 audit.

**Spec:** `docs/superpowers/specs/2026-11-11-localization-coverage-design.md`

## Global Constraints

- Six locales: `en`, `id`, `ja`, `zh-CN`, `de`, `es`. Every new key ships in all six in the same commit.
- No emojis, no em dashes.
- Count sentences use ICU plurals or one interpolated message. Never concatenate translated fragments around a number.
- Proper nouns stay out of keys: venue names, city names, brand names, region codes, map apps.
- Privacy and terms pages are out of scope for this phase.
- The audit baseline only goes down. Run `npm run i18n:audit:update` after each task.
- Strings held in variables and fallback expressions (`t('key') || 'English'`) are out of the audit's reach; leave existing fallbacks alone unless the visible literal is a hit.

## Review Focus

- A count sentence split into fragments: the merged ICU message must render the same numbers in every locale, including plural forms.
- A locale whose translation is longer than English: check chips, tabs, and buttons at 390px and 1280px for clipping.
- A proper noun that looks like prose: `Google Maps` and `MICE Digital` must stay in the allowlist, not become keys.
- An aria-label: it must remain descriptive after translation, not become a duplicate of the visible label.
- The server-rendered region page: `getTranslations` must receive the locale, and the page must not import client hooks.

---

### Task 1: Layout and shared chrome

**Files:**
- Modify: `src/components/layout/Footer.tsx` (5 hits)
- Modify: `src/components/layout/Navbar.tsx` (1)
- Modify: `src/components/layout/RegionSwitcher.tsx` (2)
- Modify: `src/components/layout/Breadcrumbs.tsx` (1)
- Modify: `src/components/themed/EventPageShell.tsx` (2)
- Modify: `src/components/themed/ShowcaseProgramGrid.tsx` (1)
- Modify: `src/app/[locale]/(attendee)/page.tsx` (2)
- Modify: `src/app/[locale]/(attendee)/my-tickets/[bookingId]/page.tsx` (1)
- Modify: `src/app/[locale]/(attendee)/venues/[slug]/page.tsx` (1)
- Modify: `src/messages/*.json` (all six)
- Modify: `scripts/i18n-allowlist.json`

**Interfaces:**
- Consumes: the existing `useTranslations` hooks in Footer, Navbar, RegionSwitcher, EventPageShell; `getTranslations` in the server pages.
- Produces: no exported API. Lowers the baseline by 16.

- [ ] **Step 1: Allowlist brand and venue-name literals**

Add to `exact` in `scripts/i18n-allowlist.json`: `XPO Digital MICE`, `MICE Digital`, `(JIExpo, ICE, JICC)`, `(Tokyo Big Sight, Makuhari)`, `(MBS, Messe Frankfurt)`.

- [ ] **Step 2: Replace the copyright line**

`Footer.tsx:152` renders `© 2026 XPO MICE Digital Ecosystem.` Replace it with a `footer.copyright` message taking `{year}`. The brand stays literal in the translation.

- [ ] **Step 3: Replace the remaining layout literals**

- `RegionSwitcher.tsx:228,232`: `Currency:` and `Timezone:` into `common` (or `regions`) keys.
- `Breadcrumbs.tsx:43`: the `aria-label="Breadcrumb"` into a `common.breadcrumbAria` key. The component currently has no translation hook; add `useTranslations("common")`.
- `EventPageShell.tsx:520,630`: `Event Sections` aria and `Starting from` into `events` keys.
- `ShowcaseProgramGrid.tsx:53`: `Organizer content · updated` into an `events` key with the date as `{date}`. Add the translation hook.
- `page.tsx:592,642`: `Hall Wayfinding` and `Instant Turnstile` into `home` keys.
- `my-tickets/[bookingId]/page.tsx:180`: `Pass Ref:` into a `myTickets` key.
- `venues/[slug]/page.tsx:183`: `Hub` is a suffix on the region or city name. Use a `venues.hub` message with `{name}`.

- [ ] **Step 4: Translate all new keys into six locales**

Add the keys to `en`, `id`, `ja`, `zh-CN`, `de`, `es` in the same commit.

- [ ] **Step 5: Lower the baseline and verify**

Run `npm run i18n:audit:update`; the hardcoded count must drop by 16. Then run `npx vitest run tests/unit/i18n/no-hardcoded-ui.test.ts tests/unit/i18n/message-parity.test.ts` and the component tests for the touched files. Expected: PASS.

- [ ] **Step 6: Commit**

```bash
git add src/components/layout src/components/themed src/app/[locale]/(attendee) src/messages scripts/i18n-allowlist.json scripts/i18n-baseline.json
git commit -m "feat(i18n): localize attendee layout and shared chrome"
```

---

### Task 2: Filters and listing

**Files:**
- Modify: `src/components/discovery/FacetedFilterBar.tsx` (10)
- Modify: `src/components/discovery/FilterSidebar.tsx` (2)
- Modify: `src/components/discovery/ActiveFilterChips.tsx` (1)
- Modify: `src/components/discovery/EventsExplorer.tsx` (8)
- Modify: `src/components/discovery/CalendarInteractiveView.tsx` (2)
- Modify: `src/messages/*.json`

**Interfaces:**
- Consumes: existing `discovery`, `common`, `calendar` hooks.
- Produces: no exported API. Lowers the baseline by 23.

- [ ] **Step 1: Replace the filter aria-labels**

`FacetedFilterBar.tsx:138,151,158,178,196,207,208,222,223,236` and `FilterSidebar.tsx:157` into `discovery` aria keys. `ActiveFilterChips.tsx:133` into `discovery.activeFiltersAria`.

- [ ] **Step 2: Merge the listing count sentences**

`EventsExplorer.tsx:349-351,383-385` currently split `Showing`, the numbers, `of`, and `exhibitions`. Replace each with one ICU message `discovery.showingCount` taking `{shown}` and `{total}`. Replace `Load More Exhibitions` with `discovery.loadMore`.

- [ ] **Step 3: Replace the selected-count and calendar fragments**

`FilterSidebar.tsx:274` (`selected`) becomes an ICU message with `{count}`. `CalendarInteractiveView.tsx:503,580` (`events`) becomes an ICU message with `{count}`.

- [ ] **Step 4: Translate, lower the baseline, verify**

Add all keys to six locales. Run `npm run i18n:audit:update`; the count must drop by 23. Run the parity test and the discovery component tests. Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add src/components/discovery src/messages scripts/i18n-baseline.json
git commit -m "feat(i18n): localize attendee filters and listing"
```

---

### Task 3: Venues

**Files:**
- Modify: `src/components/discovery/VenueCampusExplorer.tsx` (8)
- Modify: `src/components/discovery/VenueDirectoryExplorer.tsx` (5)
- Modify: `src/components/discovery/VenueSpotlightCard.tsx` (1)
- Modify: `src/components/discovery/VenueSpotlightSection.tsx` (3)
- Modify: `src/components/discovery/VenueTransitHub.tsx` (3)
- Modify: `src/components/discovery/VenueMeetingRooms.tsx` (1)
- Modify: `src/components/discovery/HeroVenueQuickGlanceRail.tsx` (3)
- Modify: `src/messages/*.json`
- Modify: `scripts/i18n-allowlist.json`

**Interfaces:**
- Consumes: existing `venues`, `regions`, `spaceKinds` hooks.
- Produces: no exported API. Lowers the baseline by 24.

- [ ] **Step 1: Allowlist map brands and region codes**

Add `Google Maps`, `Apple Maps`, `Waze`, `(ID)`, `(JP)` to `exact`.

- [ ] **Step 2: Replace campus and directory literals**

`VenueCampusExplorer.tsx:185,201,231,334,429,437,444,452` into `venues` keys. The fragments `from floor to lighting trusses.` and `for heavy machinery and modular booths.` belong to sentences completed by the file; merge each with its prefix into one message. `VenueDirectoryExplorer.tsx:398,474-475` into `venues` keys, merging the search-query sentence into one ICU message.

- [ ] **Step 3: Replace the spotlight, transit, meeting-room, and rail literals**

`VenueSpotlightCard.tsx:83` (`Hub`), `VenueSpotlightSection.tsx:109,142-143`, `VenueMeetingRooms.tsx:121` (`pax`), and `HeroVenueQuickGlanceRail.tsx:148,158,204` into `venues` keys. Use ICU for `pax` and `Halls`.

- [ ] **Step 4: Translate, lower the baseline, verify**

Add all keys to six locales. Run `npm run i18n:audit:update`; the count must drop by 24. Run the parity test and the venue component tests. Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add src/components/discovery src/messages scripts/i18n-allowlist.json scripts/i18n-baseline.json
git commit -m "feat(i18n): localize attendee venue surfaces"
```

---

### Task 4: Region page and organizer section

**Files:**
- Modify: `src/app/[locale]/(attendee)/region/[code]/page.tsx` (13)
- Modify: `src/components/discovery/EventOrganizerSection.tsx` (3)
- Modify: `src/messages/*.json`
- Modify: `scripts/i18n-allowlist.json`

**Interfaces:**
- Consumes: `getTranslations` in the server page, `useTranslations` in the organizer section.
- Produces: no exported API. Lowers the baseline by 16.

- [ ] **Step 1: Replace the region page literals**

`region/[code]/page.tsx:205,218,247,256,276,326,341,361,385,400-401,484-485` into `regions` keys. `Hub` and `MICE Ecosystem` are suffixes; use interpolated messages. `Cap:` and `more` are fragments of a capacity list; merge each into one ICU message.

- [ ] **Step 2: Replace the organizer section literals**

`EventOrganizerSection.tsx:30,38,62` into `events` or `discovery` keys. `Venue:` is a label with the venue name beside it; use a message with `{venue}` if the name is adjacent, otherwise a plain label.

- [ ] **Step 3: Allowlist the region codes**

Add `(ID)` and `(JP)` if not already present from Task 3.

- [ ] **Step 4: Translate, lower the baseline, verify**

Add all keys to six locales. Run `npm run i18n:audit:update`; the count must drop by 16. Run the parity test and the region page tests. Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add "src/app/[locale]/(attendee)/region" src/components/discovery/EventOrganizerSection.tsx src/messages scripts/i18n-allowlist.json scripts/i18n-baseline.json
git commit -m "feat(i18n): localize attendee region and organizer surfaces"
```

---

### Task 5: Tickets and passes

**Files:**
- Modify: `src/components/tickets/TierSelector.tsx` (7)
- Modify: `src/components/tickets/PassWalletExplorer.tsx` (4)
- Modify: `src/components/tickets/TicketCheckoutDrawer.tsx` (4)
- Modify: `src/messages/*.json`

**Interfaces:**
- Consumes: existing `tickets` and `myTickets` hooks; TierSelector needs one added.
- Produces: no exported API. Lowers the baseline by 15.

- [ ] **Step 1: Replace the tier literals**

`TierSelector.tsx:41,111,119,123-124,128` into `tickets` keys. Merge `Only {n} passes remaining` and `{n} of {total} passes available` into ICU messages. `Priority` and `Sold Out` become plain keys. Add `useTranslations("tickets")` to the component.

- [ ] **Step 2: Replace the wallet and checkout literals**

`PassWalletExplorer.tsx:153,262,263,273` and `TicketCheckoutDrawer.tsx:454,471,488,503` into `tickets` and `myTickets` keys. The placeholders use example names; translate them to locale-appropriate examples, keeping the email format.

- [ ] **Step 3: Translate, lower the baseline, verify**

Add all keys to six locales. Run `npm run i18n:audit:update`; the count must drop by 15. Run the parity test and the ticket component tests. Expected: PASS.

- [ ] **Step 4: Run the full suite and build**

Run the Phase 0 database commands, `npx vitest run`, and `npm run build`. Expected: every test file passes and the build exits `0`.

- [ ] **Step 5: Commit**

```bash
git add src/components/tickets src/messages scripts/i18n-baseline.json
git commit -m "feat(i18n): localize attendee ticket surfaces"
```
