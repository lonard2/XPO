# Design: Editorial Blurb + Roomier Strip Thumbnails (Carousel)

- Date: 2026-11-04
- Status: proposed, awaiting owner approval
- Size: project (schema + admin + carousel + i18n)

## Intent and why

The carousel strip truncates titles at 64px thumbnails, and slides carry only
one organizer voice (title + tagline + single image). The owner wants roomier
thumbnails plus a two-voice subtitle system: the organizer tagline under the
title, and an XPO editorial line with distinct treatment below the CTA row.

## Goals

1. Strip thumbnails grow (taller imagery, two-line titles) so text is not cut.
2. Optional `editorialBlurb` per event: default copy plus per-locale overrides.
3. Editorial line renders below the CTA row in a quarantined editorial voice
   (mono micro-label with an XPO Editors marker), never blurring with
   organizer copy.
4. Collapse rules: no blurb resolves to nothing rendered and no gap; no
   tagline leaves title breathing room only.

## Non-goals

- Alternate names and alternate pictures (deferred; recorded, not designed).
- Organizer editing of the blurb; per-locale organizer taglines.
- Changes to autoplay, crossfade, strip a11y patterns, or motion gating.

## Constraints

- Slides map 1:1 from Event rows (`(attendee)/page.tsx` banner mapping);
  fallback slides must keep rendering with no DB.
- Admin console today does release/delete/assign only; copy editing is new.
- next-intl throws on missing keys in production: new marker keys need all
  six locales plus the T3.6-style usage guard.
- Footnote contrast must pass the serious+ axe gate on the dark story panel
  (slate-400 or lighter on slate-950).
- Additive migration only, per repo convention; rollback is image redeploy.

## Approaches

### A. Nullable columns on Event (picked)

`editorialBlurb String?` (default) + `editorialBlurbI18n Json?` holding a
`{ locale: text }` map. Resolution helper in lib: exact locale key, else
default, else null. Empty-string override values count as unset (fall back
to default, never render blank).

- For: smallest honest change; lives on the row the carousel already maps;
  one migration; admin edits beside existing governance actions.
- Against: single default language; JSON map is schemaless (mitigated by
  Zod allowlisting locale keys and a 280-char cap at the API boundary).

### B. Separate editorial-overlay table keyed by event

- For: organizer-owned schema untouched; cleaner permission story.
- Against: join on every homepage load plus a whole new admin surface.
  Rejected: heavier than the trust problem requires; admin-only PATCH on
  two columns is permission enough.

### C. Dictionary-based editorial lines, no DB change

- For: no migration.
- Against: copy edits need a deploy; defeats editorial curation.
  Rejected early in conversation.

## Decided parts

- Resolution chain: exact locale (including `zh-CN`) → default → null.
- Admin surface: extend `AdminEventsConsoleClient` with a blurb editor
  (default textarea + six locale textareas) backed by new admin-only
  `PATCH /api/admin/events/[id]/blurb` with Zod validation.
- Carousel: `BannerSlide` gains the resolved blurb (resolved server-side in
  the banner mapping, so the client never implements fallback); story
  renders tagline under title as today, editorial footnote below the CTA
  row; strip buttons grow (taller thumb, `line-clamp-2` titles).
- Marker text (`XPO Editors` or localized equivalent) comes from the `hero`
  dictionary in all six locales.
- Fallback slides gain one or two editorial examples for visual QA.

## Left to the builder

- Exact thumb dimensions and clamp counts within the strip's snap layout.
- Seed data for the new columns (builder call: add or skip with reason).
- Whether the blurb editor is a dialog or an inline row expansion
  (builder call, keep admin visual language).

## Builder-check resolutions (2026-11-04)

Answered by project convention: the PATCH mirrors
`api/admin/events/[id]/assign` exactly — `requireRole(request, ["ADMIN"])`,
`apiError` envelope, `{ success, event, message }` response with the
updated row (which is what `AdminEventsConsoleClient` merges). No `audit()`
row: the assign route writes none.

Builder calls (mine, check while reading):

1. Locale allowlist is exactly the six dictionary codes
   (`en`, `id`, `ja`, `zh-CN`, `de`, `es`), matched exactly as spelled —
   no normalization. `zh-CN` is a plain JSON object key.
2. PATCH body is `{ editorialBlurb?: string | null,
   editorialBlurbI18n?: Partial<Record<Locale, string>> }`, partial-update
   semantics: absent means unchanged, `null` or `""` clears. An override
   that resolves empty counts as unset and falls back to default.
3. The 280 cap is Zod `.max(280)` (UTF-16 units, matching repo Zod use);
   violation returns 400 through the envelope with per-field errors, and
   the admin textareas show matching counters. Nothing saves partially.
4. `BannerSlide` gains `editorialBlurb: string | null`, resolved
   server-side in the `(attendee)/page.tsx` banner mapping (and applied to
   fallback literals through the same resolver). The client never
   implements fallback.
5. Marker key is `hero.editorialByline` (`"XPO Editors"` in English);
   all six locales plus the T3.6-style usage guard, translations in the
   existing hero tone.
6. The footnote renders under all three temporal CTA variants, capped at
   `line-clamp-3`; the builder verifies no overflow on the 420px mobile
   story panel visually.
7. Fallback examples are hardcoded default-language strings, resolved
   through the same helper so non-English editions fall back identically.

Still theirs (changes what gets built):

- T1. What language is the default blurb written in — English everywhere
  with fallback-by-design, or matched to each event's region? This sets
  the admin editor guidance and what `id`/`ja` visitors read most often.
- T2. Which rows can be blurb-edited — platform-curated events only, or
  organizer-owned rows too — and what does the editor do in preview
  (`isLive=false`) mode?
