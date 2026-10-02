# MICE Event Categories Expansion Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Expand XPO from 15 to 20 specialized MICE event categories by introducing Aerospace & Defense, Maritime & Logistics, Real Estate & Smart Cities, Biotech & Life Sciences, and Sports & Outdoor Recreation across the entire ecosystem.

**Architecture:** Extend the central domain archetype union `MiceArchetype` in `src/lib/theming.ts` with 5 new entries, providing full token definitions, metadata, and CSS variable generators; wire them into event view routing, category pills discovery rail, organizer wizard clustering, and 6-language internationalization; update all test contracts and suites to verify 20-category integrity.

**Tech Stack:** Next.js 15+ App Router, React 19, TypeScript strict mode, Tailwind CSS, `lucide-react`, `next-intl`, Vitest, Prisma.

**Spec:** [`AGENTS.md`](file:///Users/lonard/Desktop/XPO/AGENTS.md), [`DESIGN.md`](file:///Users/lonard/Desktop/XPO/DESIGN.md), and [`src/lib/theming.ts`](file:///Users/lonard/Desktop/XPO/src/lib/theming.ts).

## Global Constraints

- Strictly zero emojis in code, commits, diffs, translations, or UI components (use `lucide-react` vector SVGs).
- Strictly zero em-dashes (`—`) or en-dashes (`–`); use hyphens `-` or colons `:`.
- Respect `DESIGN.md` typography hierarchy with minimum font floor of `text-[11px]`.
- Maintain WCAG AAA/AA contrast compliance across all 5 new category color ramps.
- Preserve backward compatibility for all existing 15 categories and their test contracts.
- Ensure all 6 supported locales (`en`, `id`, `ja`, `zh-CN`, `de`, `es`) receive complete translation keys.

## Review Focus

1. **Unknown/Legacy Archetype Fallback**: Any event with an invalid or obsolete archetype must gracefully fall back to `INDUSTRIAL_B2B` without throwing a runtime error.
2. **Cluster Grouping in Wizard**: The organizer wizard step 1 categorizes archetypes into filter clusters; every one of the 20 archetypes must belong to at least one cluster.
3. **Locale Key Completeness**: Every new archetype key in `messages/*.json` must supply `title`, `tag`, and `description` to prevent missing-translation warnings.
4. **Icon Rendering Safety**: Dynamic icon resolution in `EventCategoryPills.tsx` must resolve to a valid Lucide component without fallback breaks or layout shifts.
5. **Full Static Generation**: Next.js App Router static page generation (`npm run build`) must generate all regional and category routes cleanly without type or SSR mismatches.

---

### Task 1: Extend Archetype Definitions & Theming Engine

**Files:**
- Modify: `src/lib/theming.ts:8-285`
- Modify: `tests/helpers/contracts.ts:190-305`
- Test: `tests/unit/theming/theming.test.ts`

**Interfaces:**
- Consumes: None (root definition)
- Produces: `MiceArchetype` expanded with:
  - `"AEROSPACE_DEFENSE"`
  - `"MARITIME_LOGISTICS"`
  - `"REAL_ESTATE_URBAN"`
  - `"BIOTECH_PHARMA"`
  - `"SPORTS_OUTDOOR"`
  `ARCHETYPE_LIST` length = 20
  `ARCHETYPE_DEFAULTS` and `ARCHETYPE_METAS` records containing all 20 keys

- [ ] **Step 1: Write the failing test for 20 archetypes**

Add assertions in `tests/unit/theming/theming.test.ts`:
```ts
it("T1.1: resolves distinct default theme tokens for all 20 MICE archetypes", () => {
  expect(ARCHETYPE_LIST).toHaveLength(20);
  const newArchetypes: MiceArchetype[] = [
    "AEROSPACE_DEFENSE",
    "MARITIME_LOGISTICS",
    "REAL_ESTATE_URBAN",
    "BIOTECH_PHARMA",
    "SPORTS_OUTDOOR",
  ];
  for (const arch of newArchetypes) {
    expect(isValidArchetype(arch)).toBe(true);
    const tokens = getArchetypeTokens(arch);
    expect(tokens.primary).toMatch(/^#[0-9a-fA-F]{6}$/);
    expect(tokens.accent).toMatch(/^#[0-9a-fA-F]{6}$/);
    expect(tokens.displayName).toBeDefined();
  }
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run tests/unit/theming/theming.test.ts`
Expected: FAIL (received length 15, expected 20)

- [ ] **Step 3: Implement 5 new archetypes in `src/lib/theming.ts` & `tests/helpers/contracts.ts`**

1. Update `export type MiceArchetype` with:
   - `| "AEROSPACE_DEFENSE"`
   - `| "MARITIME_LOGISTICS"`
   - `| "REAL_ESTATE_URBAN"`
   - `| "BIOTECH_PHARMA"`
   - `| "SPORTS_OUTDOOR"`
2. Add color tokens in `ARCHETYPE_DEFAULTS`:
   - `AEROSPACE_DEFENSE`: primary `#0f172a`, accent `#0284c7`, font `font-mono`, badge `archetype`, icon `Rocket`
   - `MARITIME_LOGISTICS`: primary `#0369a1`, accent `#06b6d4`, font `font-sans`, badge `neutral`, icon `Anchor`
   - `REAL_ESTATE_URBAN`: primary `#b45309`, accent `#d97706`, font `font-serif`, badge `secondary`, icon `Building2`
   - `BIOTECH_PHARMA`: primary `#4f46e5`, accent `#10b981`, font `font-serif`, badge `outline`, icon `Dna`
   - `SPORTS_OUTDOOR`: primary `#15803d`, accent `#84cc16`, font `font-legible`, badge `success`, icon `Trophy`
3. Update `ARCHETYPE_LIST` to include all 20 items.
4. Add complete metadata in `ARCHETYPE_METAS` with high-specificity highlights and descriptions.
5. Synchronize `tests/helpers/contracts.ts` type and default definitions.

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run tests/unit/theming/theming.test.ts`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add src/lib/theming.ts tests/helpers/contracts.ts tests/unit/theming/theming.test.ts
git commit -m "feat(theming): expand MICE archetype taxonomy to 20 specialized categories"
```

---

### Task 2: Wire Event Detail View Map & Category Discovery Pills

**Files:**
- Modify: `src/app/[locale]/(attendee)/events/[slug]/page.tsx:25-45`
- Modify: `src/components/discovery/EventCategoryPills.tsx:1-60`
- Test: `tests/unit/components/discovery/EventCategoryPills.test.tsx` (or discovery tests)

**Interfaces:**
- Consumes: `MiceArchetype`, `ARCHETYPE_LIST`, `ARCHETYPE_METAS` from Task 1
- Produces: Complete `ARCHETYPE_VIEW_MAP` and Lucide `ICON_MAP` with `Rocket`, `Anchor`, `Building2`, `Dna`, `Trophy`

- [ ] **Step 1: Write test verifying all 20 archetypes have valid views and icons**

Add test in `tests/unit/theming/theming.test.ts`:
```ts
it("T1.5: verifies all 20 archetypes have valid icon bindings and metadata", () => {
  for (const arch of ARCHETYPE_LIST) {
    const meta = ARCHETYPE_METAS[arch];
    expect(meta.accentIcon).toBeDefined();
    expect(meta.highlights.length).toBeGreaterThanOrEqual(3);
  }
});
```

- [ ] **Step 2: Run test to verify**

Run: `npx vitest run tests/unit/theming/theming.test.ts`

- [ ] **Step 3: Update `src/app/[locale]/(attendee)/events/[slug]/page.tsx` & `src/components/discovery/EventCategoryPills.tsx`**

1. In `src/app/[locale]/(attendee)/events/[slug]/page.tsx`:
   Map new archetypes in `ARCHETYPE_VIEW_MAP`:
   - `AEROSPACE_DEFENSE: IndustrialB2BView`
   - `MARITIME_LOGISTICS: IndustrialB2BView`
   - `REAL_ESTATE_URBAN: MegaExpoPavilionView`
   - `BIOTECH_PHARMA: MedicalSymposiumView`
   - `SPORTS_OUTDOOR: PopCultureGamingView`
2. In `src/components/discovery/EventCategoryPills.tsx`:
   - Import `Rocket`, `Anchor`, `Building2`, `Dna`, `Trophy` from `lucide-react`.
   - Register them in `ICON_MAP`.

- [ ] **Step 4: Verify with vitest**

Run: `npx vitest run tests/unit/theming/ tests/unit/components/discovery/`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add src/app/[locale]/(attendee)/events/[slug]/page.tsx src/components/discovery/EventCategoryPills.tsx
git commit -m "feat(discovery): register 20 MICE category icons and event detail view routing"
```

---

### Task 3: Update Organizer Event Wizard and Live Customizer

**Files:**
- Modify: `src/app/[locale]/(organizer)/events/new/page.tsx:35-225`
- Modify: `src/app/[locale]/(organizer)/events/[slug]/customizer/page.tsx:60-95`
- Test: `tests/unit/organizer/event-wizard.test.ts`

**Interfaces:**
- Consumes: `MiceArchetype`, `ARCHETYPE_LIST` from Task 1
- Produces: Updated `ALL_ARCHETYPES` array (20 items) and updated `ARCHETYPE_CLUSTERS` groupings

- [ ] **Step 1: Write test verifying event wizard accepts new archetypes**

Add test in `tests/unit/organizer/event-wizard.test.ts`:
```ts
it("supports creating events with all 20 MICE archetypes", () => {
  const wizardArchetypes = ARCHETYPE_LIST;
  expect(wizardArchetypes).toHaveLength(20);
  expect(wizardArchetypes).toContain("AEROSPACE_DEFENSE");
  expect(wizardArchetypes).toContain("MARITIME_LOGISTICS");
  expect(wizardArchetypes).toContain("REAL_ESTATE_URBAN");
  expect(wizardArchetypes).toContain("BIOTECH_PHARMA");
  expect(wizardArchetypes).toContain("SPORTS_OUTDOOR");
});
```

- [ ] **Step 2: Run test to verify**

Run: `npx vitest run tests/unit/organizer/event-wizard.test.ts`

- [ ] **Step 3: Update `src/app/[locale]/(organizer)/events/new/page.tsx` & customizer**

1. In `src/app/[locale]/(organizer)/events/new/page.tsx`:
   - Update `ALL_ARCHETYPES` list to all 20 items.
   - Update `ARCHETYPE_CLUSTERS`:
     - `ALL`: `All Archetypes (20)`
     - `TRADE`: `Trade, Logistics & Heavy Industry (6)`: add `MARITIME_LOGISTICS`
     - `TECH`: `Tech, Aerospace & Life Sciences (5)`: add `AEROSPACE_DEFENSE`, `BIOTECH_PHARMA`
     - `CULTURE`: `Entertainment, Culture & Sports (5)`: add `SPORTS_OUTDOOR`
     - `POLICY`: `Corporate, Property & Policy (4)`: add `REAL_ESTATE_URBAN`
2. In `src/app/[locale]/(organizer)/events/[slug]/customizer/page.tsx`:
   - Add the 5 new archetypes to `ALL_ARCHETYPE_OPTIONS`.

- [ ] **Step 4: Verify test passes**

Run: `npx vitest run tests/unit/organizer/event-wizard.test.ts`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add src/app/[locale]/(organizer)/events/new/page.tsx src/app/[locale]/(organizer)/events/[slug]/customizer/page.tsx tests/unit/organizer/event-wizard.test.ts
git commit -m "feat(organizer): expand wizard clusters and branding customizer for 20 archetypes"
```

---

### Task 4: Complete Localization across All 6 Locales

**Files:**
- Modify: `src/messages/en.json:170-250`
- Modify: `src/messages/id.json:170-250`
- Modify: `src/messages/ja.json:170-250`
- Modify: `src/messages/zh-CN.json:170-250`
- Modify: `src/messages/de.json:170-250`
- Modify: `src/messages/es.json:170-250`
- Test: `tests/unit/i18n/formatters.test.ts`

**Interfaces:**
- Consumes: Archetype keys from Task 1
- Produces: Complete translation dictionaries for all 20 archetypes in 6 languages

- [ ] **Step 1: Write test verifying message file completeness**

Add test in `tests/unit/theming/theming.test.ts` to assert that English translations contain all 20 archetype keys:
```ts
import enMessages from "@/messages/en.json";

it("contains translations for all 20 archetypes in en.json", () => {
  for (const arch of ARCHETYPE_LIST) {
    expect((enMessages.archetypes as any)[arch]).toBeDefined();
    expect((enMessages.archetypes as any)[arch].title).toBeDefined();
  }
});
```

- [ ] **Step 2: Run test to verify it fails initially**

Run: `npx vitest run tests/unit/theming/theming.test.ts`
Expected: FAIL (missing new keys in `en.json`)

- [ ] **Step 3: Add localized keys to all 6 translation files**

Add `AEROSPACE_DEFENSE`, `MARITIME_LOGISTICS`, `REAL_ESTATE_URBAN`, `BIOTECH_PHARMA`, and `SPORTS_OUTDOOR` to:
- `src/messages/en.json`
- `src/messages/id.json`
- `src/messages/ja.json`
- `src/messages/zh-CN.json`
- `src/messages/de.json`
- `src/messages/es.json`

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run tests/unit/theming/theming.test.ts`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add src/messages/*.json tests/unit/theming/theming.test.ts
git commit -m "i18n: add 6-locale translations for 5 new MICE event categories"
```

---

### Task 5: Synchronize Test Suites and Integration Contracts

**Files:**
- Modify: `tests/integration/full-platform-e2e.test.ts:305-325`
- Modify: `tests/integration/Milestone6Adversarial.test.ts:305-330`
- Test: All unit and integration suites

**Interfaces:**
- Consumes: 20-category taxonomy from Task 1-4
- Produces: 100% green test passes across all 70 test files

- [ ] **Step 1: Update length assertions in integration tests**

1. In `tests/integration/full-platform-e2e.test.ts`:
   Update `expect(ARCHETYPE_LIST.length).toBe(20);`
2. In `tests/integration/Milestone6Adversarial.test.ts`:
   Update `allArchetypes` array with the 5 new archetypes (20 total).

- [ ] **Step 2: Run full test suite**

Run: `npm test`
Expected: All 70+ test files pass (100% green).

- [ ] **Step 3: Commit**

```bash
git add tests/integration/full-platform-e2e.test.ts tests/integration/Milestone6Adversarial.test.ts
git commit -m "test: update integration contracts and test suites for 20 MICE categories"
```

---

### Task 6: Update Seed Data and System Guidelines

**Files:**
- Modify: `prisma/seed.ts:360-700`
- Modify: `AGENTS.md:75-105`
- Modify: `README.md`
- Test: Seed execution and zero-emoji compliance tests

- [ ] **Step 1: Add sample events for new categories in `prisma/seed.ts`**

Add representative MICE events:
- Bali International Airshow & Aerospace Expo (`AEROSPACE_DEFENSE`) at JIExpo
- Indonesia Marine & Offshore Logistics Expo (`MARITIME_LOGISTICS`) at ICE BSD
- Tokyo PropTech & Smart Cities Summit (`REAL_ESTATE_URBAN`) at Tokyo Big Sight
- BioPharma & Genomics Innovation Expo (`BIOTECH_PHARMA`) at Pacifico Yokohama
- World Sports & Outdoor Recreation Expo (`SPORTS_OUTDOOR`) at Makuhari Messe

- [ ] **Step 2: Update `AGENTS.md` and `README.md` documentation**

Update section "5. Event Categories & Calendar Features" in `AGENTS.md` to document the full 20 categories.

- [ ] **Step 3: Run zero-emoji audit test**

Run: `npx vitest run tests/unit/a11y/ZeroEmojiExhaustive.test.ts`
Expected: PASS

- [ ] **Step 4: Commit**

```bash
git add prisma/seed.ts AGENTS.md README.md
git commit -m "docs(categories): update MICE archetype documentation and seed events for 20 categories"
```

---

### Task 7: Full Mechanical Verification Gate

**Files:** None (build & lint verification)

- [ ] **Step 1: Run mechanical detector on modified files**

Run: `/Users/lonard/.gemini/config/skills/impeccable/scripts/impeccable detect --json "src/lib/theming.ts" "src/components/discovery/EventCategoryPills.tsx" "src/app/[locale]/(organizer)/events/new/page.tsx"`
Expected: `[]` (0 findings, exit code 0)

- [ ] **Step 2: Run full test suite**

Run: `npm test`
Expected: All tests pass.

- [ ] **Step 3: Run Next.js static build**

Run: `npm run build`
Expected: 247+ static routes generated successfully with 0 errors.

- [ ] **Step 4: Push to origin/main**

```bash
git push origin main
```
