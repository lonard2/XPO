# Booth Manager Critique Fixes

Source: Impeccable critique `2026-10-19T11-07-54Z` (24/40, Weak-acceptable).
Direction: trust data first, all five issues, badge and keep seeds.

- [x] **1. Harden data truth** (`$impeccable harden`): Sample badge + banner on
  seeded rows, real fetch-error state, branched CSV toast.
- [x] **2. Layout entry points** (`$impeccable layout`): read
  eventId/hall/status/q on mount with validation, sync back to URL.
- [x] **3. Structure hall dossiers** (`$impeccable structure`): hall combobox
  from the selected event's venue halls, event-scoped pills, duplicate guard.
- [x] **4. Clarify ownership + i18n** (`$impeccable clarify`): curated lock in
  filter, dictionary pass, localized industry select.
- [x] **5. Layout touch targets** (`$impeccable layout`): 44px minimums on the
  on-site path (toolbar, checkboxes, toggle, modal select).
- [x] **6. Polish final pass** (`$impeccable polish`): detector, screenshots,
  full suite green.

Each ships as its own commit pushed to `origin/main`. Verify by execution;
no regressions: existing suites must stay green throughout.
