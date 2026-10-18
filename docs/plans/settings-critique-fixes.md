# Settings Critique Fixes

Source: Impeccable critique `2026-10-18T02-45-59Z` (23/40, Acceptable). Direction: profile trust first, all five issues, cluster-grouped matrix rebuilt from current data.

- [x] **1. Harden profile trust** (`$impeccable harden`): required + email-format errors, autocomplete attrs, local-only scope note, per-section profile clear in form footer, `role="status"` save feedback.
- [x] **2. Audit keyboard, touch, live regions** (`$impeccable audit`): roving-tabindex arrow-key tabs with ARIA linkage, 44px tab triggers, dropdown focus return, radio-card focus rings.
- [ ] **3. Distill Appearance tab** (`$impeccable distill`): accordion disclosure (Theme + Font Scale open), active-value summaries, default badges, `?tab=` deep links.
- [ ] **4. Clarify localization** (`$impeccable clarify`): live consequence line, timezone hints in options, cards variant of RegionSwitcher.
- [ ] **5. Layout interest matrix from current data** (`$impeccable layout`): all 22 archetypes from `ARCHETYPE_LIST` grouped under 6 `MICE_INDUSTRY_CLUSTERS` with counts + clear-all; neutral font-scale preset labels with dedicated keys.
- [ ] **6. Polish final pass** (`$impeccable polish`): detector clean, screenshots of all tabs, full suite green.

Each ships as its own commit pushed to `origin/main`. No overengineering, no regressions: tsc + vitest + live SSR check per todo.
