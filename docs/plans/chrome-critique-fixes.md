# Outer Chrome Critique Fixes

Source: Impeccable critique `2026-10-19T12-15-25Z` (21/40, Weak-acceptable).
Direction: distill CTAs first, all five issues, crumb-bar wins.

- [x] **1. Distill frame CTAs** (`$impeccable distill`): crumb-bar Launch is
  the single canonical frame CTA; sidebar Create demoted to section link.
- [ ] **2. Clarify frame i18n** (`$impeccable clarify`): sidebar, crumbs,
  barrier, nav, switchers, footer strings into dictionaries.
- [ ] **3. Structure region unity** (`$impeccable structure`): single
  `useActiveRegion()` hook, subpath-preserving switch, one URL form.
- [ ] **4. Audit footer + listboxes** (`$impeccable audit`): link footer
  categories, arrow-key listboxes, real buttons for cards variant.
- [ ] **5. Clarify tone + micro-fixes** (`$impeccable clarify`): jargon pass,
  role-label helper, nav-set reconciliation, Settings link fix.
- [ ] **6. Polish final pass** (`$impeccable polish`): detector, screenshots,
  full suite green.

Each ships as its own commit pushed to `origin/main`. Verify by execution;
no regressions: existing suites must stay green throughout.
