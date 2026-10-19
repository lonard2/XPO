# Pass Pages Critique Fixes

Source: Impeccable critique `2026-10-18T07-06-29Z` (24/40, Acceptable).
Direction: gate i18n first, all five issues, server-persisted voucher claims.

- [x] **1. Clarify gate-path i18n** (`$impeccable clarify`): DigitalPassQR,
  voucher, and subnav strings into dictionaries with English as values.
- [x] **2. Clarify demo trust** (`$impeccable clarify`): Demo badges or true
  empty states; Location TBC fallbacks; conditional hours line.
- [x] **3. Harden offline proof** (`$impeccable harden`): compact mobile badge
  with cached-at time, expiry, and quota warnings.
- [x] **4. Layout label unity** (`$impeccable layout`): one perks name, one
  wallet H1, dedicated breadcrumb key.
- [ ] **5. Harden voucher claims** (`$impeccable harden`): server-persisted
  claims with hash-derived codes, tier-ID gating, undo affordance.
- [ ] **6. Polish final pass** (`$impeccable polish`): detector, screenshots,
  full suite green.

Each ships as its own commit pushed to `origin/main`. Verify by execution.
