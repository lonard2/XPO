# Event Detail Critique Fixes

Source: Impeccable critique `2026-10-18T05-09-11Z` (20/40, Weak-Acceptable).
Direction: trust first, all five issues, demo content gated on data (hidden until
backed by event data — no sample labels).

- [x] **1. Clarify trust** (`$impeccable clarify`): gate livestream card,
  bounties/sponsors, machinery catalog, universal alerts, seating/translation
  lines, booth directions on event data; schematic-label + count the floor map.
- [x] **2. Harden tier + tabs + booths** (`$impeccable harden`): tier buttons
  preselect via `initialTierId`; guidebook dead-end reset; tab bar un-stuck;
  booth cap disclosed.
- [x] **3. Layout hero badges** (`$impeccable layout`): overlay cap at 2;
  scale/format as translated body labels.
- [x] **4. Clarify conversion copy** (`$impeccable clarify`): drawer,
  guidebook, floor-map strings into dictionaries.
- [x] **5. Audit detail a11y** (`$impeccable audit`): 44px controls,
  nested-interactive and booth-keyboard pass.
- [ ] **6. Polish final pass** (`$impeccable polish`): detector, screenshots,
  full suite green.

Each ships as its own commit pushed to `origin/main`. Verify by execution.
