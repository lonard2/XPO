# Localization Coverage and Audit

The interface ships in six locales: `en`, `id`, `ja`, `zh-CN`, `de`, and `es`.
Key parity is enforced by `tests/unit/i18n/message-parity.test.ts`. This guide
covers the second layer: finding user-visible text that never went through
`next-intl`, and English values that were copied into another bundle.

The program and its phases are defined in
`docs/superpowers/specs/2026-11-11-localization-coverage-design.md`. Organizer
content is handled separately in
`docs/superpowers/specs/2026-11-11-event-content-localization-design.md`.

## The two audits

`scripts/lib/i18n-audit.ts` exports two functions.

**`auditHardcodedUi()`** walks every `.tsx` file under `src/app` and
`src/components` with the Babel parser and reports:

- JSX text nodes with at least two consecutive letters.
- String literals in copy-bearing attributes: `aria-label`, `placeholder`,
  `title`, `alt`, `label`, `helperText`, `description`, `emptyMessage`,
  `ctaLabel`, `confirmLabel`.

It never reports structural attributes such as `className`, `href`, `src`,
`id`, `role`, `type`, `value`, `data-*`, or SVG presentation attributes.

**`auditUntranslatedValues()`** compares each non-English bundle to `en.json`
and reports values that are identical, longer than 18 characters, contain a
space, and are not allowlisted. That catches English prose copied into a
translation without flagging proper nouns or short codes.

The audit uses `@babel/parser` rather than the TypeScript compiler API because
the installed `typescript` 7 package exposes only version metadata, not the
compiler API.

## Current baseline

`scripts/i18n-baseline.json` records the current ceiling:

```json
{
  "hardcodedUi": 1259,
  "untranslatedValues": 20
}
```

The baseline is a ceiling, not a target. It only goes down. The ratchet test
`tests/unit/i18n/no-hardcoded-ui.test.ts` fails when either number rises.

The largest surfaces today:

| Surface | Hits |
|---|---|
| Organizer event wizard | 82 |
| AI reports hub | 72 |
| Admin venue directory | 54 |
| Admin events console | 42 |
| Themed category views | 153 across 22 files |
| Privacy page | 33 |

## Commands

```bash
# Summary: total hits, the ten busiest files, untranslated count
npm run i18n:audit

# Full inventory as JSON, including every hit with file and line
npx tsx scripts/audit-i18n.ts --json

# Lower the baseline after a phase removes strings
npm run i18n:audit:update

# The ratchet itself
npx vitest run tests/unit/i18n/no-hardcoded-ui.test.ts
```

Read the JSON inventory before starting a phase. It gives the exact file, line,
kind, and text for each hit, which is enough to group work by surface.

## Allowlist policy

`scripts/i18n-allowlist.json` has three lists:

- `exact`: a literal string that must never be reported. Use it for codes
  (`B2B`, `EV`, `CME`), brands (`OpenRouter`, `Stripe`), and fixed venue lists.
- `patterns`: regular expressions for emails, URLs, and hex colors.
- `files`: whole files to skip. Keep this empty unless a generated file cannot
  be edited.

Matching is exact. `"Plain"` never suppresses `"Plain sentence here"`. That
prevents a short allowlist entry from hiding a real sentence.

Review the allowlist at every phase. A broad entry hides future regressions.

## Known limitation

The scan sees JSX text and string literals in copy-bearing attributes. It does
not see a string held in a variable, built with a template literal, or passed
through a helper:

```tsx
const label = "Reserve Delegate Pass"; // not reported
<span>{label}</span>
```

The ratchet covers what the parser sees, not everything. When a phase touches a
component, check its constants and helper modules by hand. The themed views and
the organizer wizard both keep copy in local constants.

A local constant can also hold fabricated demo records rather than UI copy. Do
not translate those records. Source the section from `event.booths`,
`event.agendaItems`, or organizer showcase data, and hide the section when the
event provides nothing. Translating an invented clinical abstract or aircraft
spec would present fabricated content as localized fact.

## Phase order and ratcheting

| Phase | Scope | Action after |
|---|---|---|
| 0 | Audit, allowlist, baseline, ratchet | Baseline recorded |
| 1 | Attendee chrome | `npm run i18n:audit:update` |
| 2 | Themed views, one cluster at a time | Update per cluster |
| 3 | Organizer portal | Update |
| 4 | Admin, settings, AI, legal | Complete: 0 hardcoded, 0 untranslated |

Each phase translates its keys into all six locales in the same commit. The
message parity test enforces the key sets; the ratchet enforces that the
hardcoded count fell.

Legal copy in Phase 4 is translated but flagged for legal review. Keep the
English source as the reference until that review happens.

## Phase 3: organizer portal

The organizer portal is localized under the existing `organizer` namespace.
Keys are grouped by surface prefix so the wizard file stays navigable:

- `wizard*`: wizard chrome, identity, venue, passes, capacity, branding, summary.
- `authority*`: admin publication authority and ownership.
- `customizer*`: live customizer controls, palette presets, and typography.
- `preview*`: live preview frame chrome.
- `showcase*`: organizer-authored showcase rows, alerts, and channels.
- `updates*`: event news editor.
- `dashboard*`: dashboard error recovery.

The baseline moved from 640 to 456 hardcoded strings while the untranslated
value count held at 20. Every organizer file now reports zero hardcoded UI
strings.

Rules learned in this phase:

- Remove the English fallback once the key exists. `tOrg("key") || "English"`
  keeps the literal visible to the audit and hides a missing translation.
- Merge a sentence split across JSX into one ICU message. The capacity alert is
  one key with `{used}`, `{halls}`, and `{total}`, not three fragments.
- Localize placeholders and `aria-label` values. They are user-facing copy.
- Do not localize fabricated preview data. Replace it with event data and hide
  the section when the event provides none. The preview frame now derives
  agenda, exhibitors, perks, dates, and pass capacity from the event.
- Keep currency labels in the `regions` namespace instead of duplicating them
  per surface.
- The parity test parses each bundle once. Re-reading six JSON files inside a
  per-key loop pushed the test past its timeout as the bundles grew.

## Phase 4: admin, settings, AI, and legal

Phase 4 closed the remaining surface: the admin shell, dashboard, events
console, venue directory, crawler console, audit viewer, AI reports hub,
attendee AI concierge, settings suite, privacy and terms pages, and the
attendee leftovers (not-found pages, auth modal, digital pass, floor map,
guidebook, subnavigation, and the shared drawer and modal close labels).

The audit now reports:

- Hardcoded UI strings: 0
- Untranslated values: 0

Rules learned in this phase:

- Localize metadata titles and descriptions, not only the visible body.
- A global `app/not-found.tsx` sits outside the locale provider. Its three
  fallback strings stay in the allowlist; the localized `[locale]/not-found.tsx`
  carries the translated copy.
- Keep technical values literal but make their labels local: `Algorithm:` is a
  key, `HMAC-SHA256 (256-bit)` is a value.
- Severity and status codes (`SUCCESS`, `WARN`, `ALERT`, `INFO`) keep their raw
  values in logic and gain label keys for display.
- Legal prose is translated in all six locales but remains pending legal review.
  Keep the English source as the reference until that review signs off.

## Legal review status

The privacy and terms copy in `src/messages/*.json` under the `legal` namespace
is translated but not yet reviewed by counsel. Treat the English source as the
authoritative text until the review is recorded.


