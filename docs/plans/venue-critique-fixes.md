# Venue Page Critique Remediation Plan

Source: dual-agent design critique of `src/app/[locale]/(attendee)/venues/[slug]/page.tsx`
(snapshot `.impeccable/critique/2026-10-17T13-05-52Z__src-app-locale-attendee-venues-slug-page-tsx.md`, 22/36).

Owner decisions: specs first, label-as-unverified (not removal), scope is everything.
One todo per commit, in order below. Each item states its acceptance check.

## Todos

- [x] **1. Honest engineering specs** (`P1`, `$impeccable clarify`)
      Every synthesized figure now carries a Typical qualifier on cards and in the dossier,
      plus a dossier disclaimer, and the universal 5.5m shutter-gate freight sentence is
      replaced with an honest varies-by-hall note. Keys added in all 6 locales (parity test
      guards them). Per-hall verified sourcing remains future work, recorded explicitly.
      Accept: no unqualified fabricated figure renders.

- [x] **2. Hydration mismatches on venue pages** (`P1`, `$impeccable harden`)
      INVESTIGATED, NOT REPRODUCED, no code change: 4 clean loads (en ×2, ja ×1, Pacifico),
      interaction pass (rooms expand + dossier select), and the dev server log show zero
      hydration warnings. Likely cause is measurement artifact in Assessment B's own flow
      (title/script-tag mutation plus overlay injection during Fast Refresh rebuilds).
      Hydration warnings are dev-only and never reach production builds. Reopen with a
      reproduction protocol if it recurs; papering over it would hide real issues.

- [x] **3. Hero conversion actions** (`P1`, `$impeccable shape`)
      Hero carries "View Scheduled Events (N)" and "Getting There" anchors plus a mobile
      sticky bar above the bottom nav; timetable and transit sections have scroll-mt
      anchors. Verified by screenshot on desktop and 390px, and by clicking the sticky bar.
      Keys added in all 6 locales.

- [x] **4. Localize the venue surface copy** (`P2`, `$impeccable clarify`)
      42 keys across explorer, transit, timetable and page metric labels, in all 6 locales.
      Verified /ja and /id render zero English section strings. Units (Pax, m², N/A) and
      proper nouns (Google Maps, Building A, Festhalle) stay untranslated by design.

- [x] **5. Meeting-rooms search and reveal** (`P2`, `$impeccable distill`)
      Text filter plus progressive reveal (12 initial rows, "Show all N") in the rooms
      component, with translated strings and an empty-search note. Verified live on
      Pacifico: 12 initial, filter narrows 79 to 1. Component tests cover it.

- [x] **6. Real wing vocabularies** (`P2`, `$impeccable document`)
      New `venueWings.ts` maps each of the 12 venues to its own wing rules with exact-match
      support for numbered halls; the component resolves labels through the dictionary
      (proper designations stay literal). Verified Tokyo: East Halls (9), West Halls (7),
      South Halls (4), Conference Tower (2), Ariake GYM-EX (1). Guarded by a coverage test
      asserting all 428 halls land in exactly one wing.

- [x] **7. Small-fixes sweep** (`P2/P3`, `$impeccable audit`)
      Venue-owned targets now meet 44px: the mobile View Specs strip, both breadcrumb
      links, both hero CTAs and the sticky bar (all measured). Header icon buttons, logo,
      language and account controls raised to 44px inside the 64px header (verified
      visually, no layout shift). Timetable badge uses the shared readable-badge helper,
      killing the 4.2:1 pair (detector confirms zero contrast failures). N/A Pax states
      render an em dash, timetable titles carry tooltips, breadcrumb reads Home via a new
      common.home key. Left alone with reasons: sr-only skip link (by design), stretched
      timetable link (whole card is the target), footer/region inline text links (WCAG
      2.5.8 exempts inline), desktop-only nav links (pointer precision). The lone new
      cramped-padding flag is inline glyph line-boxes, a detector false positive.

- [x] **8. Polish and Tokyo hero photo** (`P3`, `$impeccable polish`)
      Tokyo Big Sight showed a Shinjuku street photo; now shows the actual Conference
      Tower via a verified Wikimedia Commons image (viewed before use, URL returns 200).
      Image-URL test accepts the Commons host. Final detector: zero contrast failures;
      remaining findings are advisory or known-intermittent. Full suite green.

## Explicitly out of scope

- Rinko Park and other non-inventory spaces stay excluded.
- Organizer wizard hall selection untouched (booth allocation may use any space).
- Screen-reader full pass and light-mode image-text contrast: not covered by the critique.
