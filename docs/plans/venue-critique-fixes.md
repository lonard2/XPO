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

- [ ] **4. Localize the venue surface copy** (`P2`, `$impeccable clarify`)
      Move VenueCampusExplorer, VenueTransitHub, VenueScheduleTable headers and the venue
      metric labels into the `venues` namespace dictionaries (all 6 locales), replacing the
      `split(' ')[1]` fallback. Includes any new strings introduced by todos 1, 3 and 5.
      Accept: message parity test passes; `/ja` renders no English section strings.

- [ ] **5. Meeting-rooms search and reveal** (`P2`, `$impeccable distill`)
      Text filter plus progressive reveal (~12 initial rows, "Show all N") in
      `VenueMeetingRooms`, following the existing collapse pattern.
      Accept: typing filters the grid; count updates; component tests cover it.

- [x] **6. Real wing vocabularies** (`P2`, `$impeccable document`)
      New `venueWings.ts` maps each of the 12 venues to its own wing rules with exact-match
      support for numbered halls; the component resolves labels through the dictionary
      (proper designations stay literal). Verified Tokyo: East Halls (9), West Halls (7),
      South Halls (4), Conference Tower (2), Ariake GYM-EX (1). Guarded by a coverage test
      asserting all 428 halls land in exactly one wing.

- [ ] **7. Small-fixes sweep** (`P2/P3`, `$impeccable audit`)
      Sub-44px targets on the venue path, the 4.2:1 uppercase badge, raw "N/A Pax" states,
      timetable `line-clamp-1` titles without tooltip, breadcrumb Explore/Home mismatch.
      Accept: each item fixed or explicitly recorded with a reason.

- [ ] **8. Polish and Tokyo hero photo** (`P3`, `$impeccable polish`)
      Replace the Shinjuku street photo on Tokyo Big Sight with a verified Ariake-complex
      shot (photo ID checked live before use). Final detector pass and full suite.
      Accept: hero shows the actual venue; detector shows no new findings; suite green.

## Explicitly out of scope

- Rinko Park and other non-inventory spaces stay excluded.
- Organizer wizard hall selection untouched (booth allocation may use any space).
- Screen-reader full pass and light-mode image-text contrast: not covered by the critique.
