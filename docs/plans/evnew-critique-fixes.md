# Event Wizard Critique Fixes

Source: Impeccable critique `2026-10-19T10-30-25Z` (28/40, Acceptable).
Direction: multi-hall P0 first, all four issues, persist full array.

- [x] **1. Harden multi-hall persistence** (`$impeccable harden`): persist the
  full `venueHallIds` array through the API/Prisma write; no single-hall
  collapse.
- [x] **2. Clarify Category vocabulary** (`$impeccable clarify`): user-visible
  Archetype strings become Category; internal type names stay.
- [ ] **3. Layout entry points** (`$impeccable layout`): working `?step=`
  deep-links plus fix of the draft-suppresses-template race.
- [ ] **4. Clarify overwrite guards** (`$impeccable clarify`): confirm guards
  on region-switch price rewrites and template overwrites, with undo.
- [ ] **5. Polish final pass** (`$impeccable polish`): detector, screenshots,
  full suite green.

Each ships as its own commit pushed to `origin/main`. Verify by execution;
no regressions: existing suites must stay green throughout.
