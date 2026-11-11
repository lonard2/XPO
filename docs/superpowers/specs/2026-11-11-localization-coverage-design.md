# Localization Coverage Program

Date: 2026-11-11
Status: Draft for approval

## Intent

The six locale bundles have complete key parity: 1,637 keys in each of `en`,
`id`, `ja`, `zh-CN`, `de`, and `es`. Key coverage is not the problem. Two other
gaps are:

1. **Hardcoded UI text.** 407 unique user-visible strings live in 70 `.tsx`
   files. Only 25 of them already exist as message values.
2. **English values in non-English bundles.** `home.organizerPill1` to
   `organizerPill3`, `home.adminTitle`, and some settings font names are still
   English in `de`, `es`, `zh-CN`, and `ja`.

The largest single gap is structural. The 22 themed category views have no
`useTranslations` calls at all, and hold 153 of the 407 strings.

This program removes hardcoded UI text in phases and adds a guard so it cannot
grow back.

## Goals

- No user-visible English literals remain on attendee, organizer, admin,
  settings, or legal surfaces, except allowlisted proper nouns and data.
- Every new key ships in all six locales in the same commit.
- A repeatable audit with a ratcheting baseline and a CI test.
- Translations keep the existing institutional tone and fit the existing layouts.

## Non-goals

- Translating names and identifiers: venue names, city names, organizer names,
  booth company names, URLs, emails, IDs, units, currency symbols, model IDs,
  and file formats.
- Translating API protocol errors and audit log actions.
- Redesigning layouts to fit translations. If a translated string cannot fit
  after translation, the layout gets a length check, as the category tiles did.
- Publishing machine-translated legal copy without a review flag.

Organizer-written descriptive content, such as event titles, taglines,
descriptions, agenda titles, perks, updates, and booth descriptions, is handled
by the separate content localization project in
`docs/superpowers/specs/2026-11-11-event-content-localization-design.md`. This
program covers interface chrome only.

## Anti-goals

- One 407-string, 70-file, six-locale diff.
- Adding keys in English only.
- Replacing data values with keys.
- An allowlist so broad that it hides real UI strings.

## Constraints

- next-intl. Client components use `useTranslations`, server components use
  `getTranslations`.
- Themed views are client components and already receive `locale`.
- `tests/unit/i18n/message-parity.test.ts` enforces identical key sets.
- The repository forbids emojis and em dashes.
- The audit must run without new dependencies. `typescript` and `tsx` are
  already installed.

## Approaches considered

**Detection: regex or TypeScript AST.** The AST is chosen. The regex probe
produced 426 raw hits with false positives such as code fragments and
`className` values. The TypeScript compiler API is already installed, separates
JSX text from attributes, and reports exact positions.

**Replacement: codemod or manual.** Manual is chosen. Each string needs a key
name, a tone decision, a proper-noun decision, and five translations. A codemod
cannot make those choices, and a generated diff would be harder to review than
the manual one. The audit script produces the inventory that drives the manual
edits.

**Ordering: one sweep or phased.** Phased is chosen by the partner. The guard
comes first, then attendee surfaces, then the themed views, then organizer, then
admin, settings, and legal.

## Design

### Guard

`scripts/audit-i18n.ts` walks every `.tsx` file under `src/app` and
`src/components` with the TypeScript compiler API and reports:

- JSX text nodes containing at least two letters.
- String literals in a fixed attribute set: `aria-label`, `placeholder`,
  `title`, `alt`, `label`, `helperText`, `description`, `emptyMessage`,
  `ctaLabel`, `confirmLabel`.

It ignores attributes that are never copy: `className`, `href`, `src`, `id`,
`name`, `role`, `type`, `value`, `htmlFor`, `key`, `data-*`, `fill`, `stroke`,
`d`, `viewBox`, and other SVG presentation attributes.

`scripts/i18n-allowlist.json` holds three kinds of entries:

- `exact`: literal strings that are proper nouns or codes.
- `patterns`: regular expressions for emails, URLs, hex colors, model IDs,
  version strings, and pure numbers.
- `files`: per-file exemptions for generated or non-UI files.

The script supports:

- `npx tsx scripts/audit-i18n.ts` for a summary.
- `npx tsx scripts/audit-i18n.ts --json` for the full inventory.
- `npx tsx scripts/audit-i18n.ts --update-baseline` to write
  `scripts/i18n-baseline.json`.

`tests/unit/i18n/no-hardcoded-ui.test.ts` imports the audit function and fails
when the total exceeds the baseline. Each phase lowers the baseline in the same
commit.

### Value audit

The same test compares each non-English bundle to English and flags values that
are identical, longer than 18 characters, contain a space, and are not
allowlisted. A second baseline entry, `untranslatedValues`, ratchets down. This
catches the organizer pills and admin title without flagging `Tokyo Big Sight`
or `B2B`.

### Key strategy

- Reuse existing namespaces: `home`, `discovery`, `events`, `venues`,
  `calendar`, `organizer`, `admin`, `settings`, `common`.
- Add `archetypeViews.<ID>` for the 22 themed views, plus
  `archetypeViews.common` for labels shared across them.
- Proper nouns become ICU interpolations, never keys: `{venue}`, `{city}`,
  `{name}`, `{organizer}`.
- Counts use ICU plurals where the UI shows a number and a noun.

### Phase order

| Phase | Scope | Strings |
|---|---|---|
| 0 | Guard, allowlist, baselines, two tests | 0 |
| 1 | Attendee chrome: homepage, discovery, event, venue, calendar, exhibitor, my-tickets | about 70 |
| 2 | Themed views, one cluster per task group (6 clusters, 22 views) | 153 |
| 3 | Organizer pages and components | 82 |
| 4 | Admin, settings, AI components, legal pages | 92 |

Phase 4 includes the privacy and terms pages. Their copy is translated but
flagged in `docs/guides/localization.md` as pending legal review. Until that
review happens, the English source remains the reference text.

### Translation rules

- Translate into `id`, `ja`, `zh-CN`, `de`, and `es` in the same commit as the
  keys.
- Keep the institutional tone. No emojis, no em dashes.
- Prefer short noun phrases for chips and cards, full sentences for body copy.
- Run a rendered check of the touched surfaces in all six locales. Long German
  and Romance strings must not clip fixed-width controls.

### Verification per phase

- The audit total is at or below the new baseline.
- `message-parity` passes.
- `no-hardcoded-ui` passes.
- Full suite and production build pass.
- The touched surfaces are rendered in all six locales at 390px and 1280px.

## Left to the builder

- Exact key names, chosen to match neighboring conventions.
- How to split Phase 2 into tasks per cluster.
- Whether a shared label belongs in `common` or `archetypeViews.common`. Prefer
  the latter when it is specific to the themed views.

## Risks

- Long German and Romance strings can overflow fixed-width chips and tabs.
  Check rendered width, not character count alone.
- Themed views contain safety and legal prose. Translate carefully and keep the
  review flag.
- An allowlist that is too broad hides real strings. Review it at every phase.
- The guard is heuristic. A string passed through a variable or a template
  literal can escape it. The ratchet covers what the AST sees, not everything.
