# Event List Critique Fixes

Source: Impeccable critique `2026-10-18T04-33-10Z` (23/40, Acceptable). Direction:
tilt scoped down (off EventCard, kept elsewhere), all five issues, sidebar enriched
in place (no tile-engine transplant).

- [x] **1. Audit tilt scope + guards** (`$impeccable audit`): remove `data-tilt`
  from EventCard; engine ignores coarse pointers; stagger capped at 6 cards.
- [x] **2. Layout category disclosure** (`$impeccable layout`): sidebar archetype
  rows gain icons, subtitles, counts under collapsible clusters (active-only
  open); user-facing labels renamed to "Event Category".
- [x] **3. Layout badge cap** (`$impeccable layout`): max 2 image-overlay badges
  (status, then curation); archetype + format move to body metadata.
- [x] **4. Harden table view** (`$impeccable harden`): full i18n, focus-visible
  states, 44px targets, real toolbar role.
- [x] **5. Shape comparison** (`$impeccable shape`): price + ending-soon sorts,
  shortlist compare tray.
- [x] **6. Polish final pass** (`$impeccable polish`): detector, screenshots,
  full suite green.

Each ships as its own commit pushed to `origin/main`. Verify by execution.

Verified: detector exit 0 with [] on six targets; tsc clean; 686 tests pass; desktop + mobile screenshots reviewed; dev server stopped, browser closed.
