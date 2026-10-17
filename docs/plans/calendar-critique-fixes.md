# Calendar Critique Fixes

Source: Impeccable critique `2026-10-17T15-13-14Z` (19/40, Poor). Direction: export correctness first, all five issues, keep cards / declutter (no itinerary rebuild).

- [x] **1. Harden export correctness** (`$impeccable harden`): locale-aware origin for Google/Outlook URLs (never timezone), inline failure states for iCal/CSV/copy, venue `?venue=` URL sync, pill counts from archetype-filtered set.
- [x] **2. Clarify export scope** (`$impeccable clarify`): labeled bulk-vs-single groups, N in primary label, format guidance, timezone shown.
- [x] **3. Distill filter workspace** (`$impeccable distill`): compact category selector behind disclosure, sticky result summary, single divider language.
- [x] **4. Audit i18n and a11y** (`$impeccable audit`): localize weekdays/aria-labels/export menu, 44px dismiss, menu arrow-key nav with focus return, grid roles.
- [x] **5. Polish final pass** (`$impeccable polish`): detector clean, screenshots, full suite green, re-critique note.

Each ships as its own commit pushed to `origin/main`. Verify by execution (tsc, vitest, browser).

Verified: detector exit 0 with [] on all three targets; tsc clean; 664 tests pass; /en, /id, /ja calendar 200, ?venue= URL 200, SSR shows Showing N of M summary.
