# Localization Phase 2: Themed Category Views

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Localize the 525 hardcoded strings in the 22 themed category views into all six locales, lowering the audit baseline view by view.

**Architecture:** Each view gets its own `archetypeViews.<ID>` namespace. Shared labels live in `archetypeViews.common`. Proper nouns and technical codes go to the allowlist. Views are client components, so they use `useTranslations`.

**Tech Stack:** next-intl, React 19, the Phase 0 audit.

**Spec:** `docs/superpowers/specs/2026-11-11-localization-coverage-design.md`

## Global Constraints

- Six locales, every key in the same commit.
- No emojis, no em dashes.
- Counts use the singular/plural key pattern already used by `venues.hallsCountOne`.
- Technical codes (`SMPTE ST 2110`, `AGV/AMR`, `CE`, `RFQ`, `BIM`, `EV`) stay in the allowlist.
- The audit baseline only goes down. Update it after each view.
- Long safety and procurement prose is translated as written; do not shorten it to fit.

## Review Focus

- A long prose paragraph split across JSX elements: merge it into one message, not fragments.
- A technical code that looks like prose: keep it in the allowlist, not a key.
- A view with a custom showcase stamp: reuse the `events.showcaseUpdated` copy rather than adding a duplicate.
- A translated heading longer than English: check the hero at 390px and 1280px.
- A view test that asserts English copy: update the test with the new key output.

## Follow-up Resolution

The Phase 2 review raised five follow-up groups. Their resolution:

1. **Singular counts.** Every count that can be one now has an explicit `*One` sibling key in all six locales. The views branch on `count === 1` because the Vitest next-intl mock does not evaluate ICU plurals. Commit `56a089c`.
2. **Expression strings.** Drawer submit states, tier fallbacks, KYC codes, track fallbacks, and filter sentinels moved into the view namespaces. Commit `2e3c46b`.
3. **Shared labels.** `Done`, `Cancel`, `Reference: {reference}`, and `Contact Email` moved to `archetypeViews.common` and removed from the view namespaces. Commit `cee1973`.
4. **Loanwords.** Japanese, Simplified Chinese, and German copy no longer leaves `excursion`, `meet & greet`, `runway`, `studio`, `corporate`, `allied health professionals`, or `restricted Flight-Line` untranslated. Commit `cee1973`.
5. **Demo record arrays.** These arrays held fabricated records presented as real, including invented clinical abstracts with DOIs and trial results. They were not translated. Each view now derives its records from `event.booths` or `event.agendaItems`, and the section hides when the event provides no data. The rule: a record that the platform cannot source from organizer data does not render.

---

### Task 1: SportsOutdoor and FaithPilgrimageCongress

**Files:** `src/components/themed/archetypes/SportsOutdoorView.tsx` (5), `FaithPilgrimageCongressView.tsx` (7), `src/messages/*.json`, `scripts/i18n-baseline.json`.

- [ ] Add `archetypeViews.SPORTS_OUTDOOR.*` and `archetypeViews.FAITH_PILGRIMAGE_CONGRESS.*` keys in six locales.
- [ ] Replace the hero title, subtitle, description, featured title, featured description, congress channel title, channel description, and stamp.
- [ ] Reuse `events.showcaseUpdated` for the stamp where the markup matches.
- [ ] Run `npm run i18n:audit:update`; the count must drop by 12.
- [ ] Run the view tests and the parity test. Commit.

### Task 2: Heavy Industry cluster

**Files:** IndustrialB2BView (36), AutomotiveMobilityView (25), BuildingPropTechView (25), EnergyInfrastructureView (25).

- [ ] One commit per view, each with its own namespace, allowlist additions, baseline update, and tests.
- [ ] Keep RFQ, CE, ISO, EV, and BIM in the allowlist.

### Task 3: Digital, Tech & Media cluster

**Files:** TechDevSummitView (17), MediaBroadcastView (26), EducationEdTechView (23).

- [ ] One commit per view. Keep SMPTE, LED, IP, and STEM in the allowlist.

### Task 4: Enterprise Trade, Supply Chain & Finance cluster

**Files:** SupplyChainLogisticsView (26), FinanceInvestorView (34), FranchiseLicensingView (31), AgritechFoodView (24).

- [ ] One commit per view. Keep AGV, AMR, OEM, and F&B in the allowlist.

### Task 5: Sovereign & Defense and Health & Faith clusters

**Files:** GovernmentDiplomaticView (29), AerospaceDefenseView (26), MedicalSymposiumView (25), HospitalityTourismView (28), FaithPilgrimageCongressView (done in Task 1), IncentiveRetreatView (32).

- [ ] One commit per view. Keep CME in the allowlist.

### Task 6: Culture & Sports cluster

**Files:** PopCultureGamingView (17), MusicFestivalView (21), MegaExpoPavilionView (19), FashionRetailView (24), SportsOutdoorView (done in Task 1).

- [ ] One commit per view. Keep OEM in the allowlist.
- [ ] Run the full suite and build after the last view.
