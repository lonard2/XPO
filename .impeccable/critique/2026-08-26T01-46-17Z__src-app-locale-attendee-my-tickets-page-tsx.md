---
target: the pass list page
total_score: 16
max_score: 40
na_heuristics: 
p0_count: 2
p1_count: 2
timestamp: 2026-08-26T01-46-17Z
slug: src-app-locale-attendee-my-tickets-page-tsx
---
Method: dual-agent (A: 3246d2df-0949-4d32-ae81-6d4ee4926f49 · B: 39f05bd5-a276-4b01-95c9-50a214a58243)

### Design Health Score

| # | Heuristic | Score | Key Findings & Evidence |
|---|-----------|:-----:|-------------------------|
| 1 | Visibility of System Status | 1.0/4 | No temporal triage (*Upcoming* vs *Past*), no event countdown pill (*Today*, *Starts in 2 Days*), all passes display static status |
| 2 | Match System / Real World | 2.0/4 | Shows internal DB ID (`bk-mfg-2026-001`) instead of formatted delegate reference; omits exact Hall name |
| 3 | User Control and Freedom | 1.0/4 | Zero filtering by region (*ID*, *JP*, *Global*), zero search input, and no sorting for attendees holding multiple passes |
| 4 | Consistency and Standards | 2.0/4 | Only the tiny 36px bottom button is interactive rather than the full card surface; uses legacy `variant="archetype"` |
| 5 | Error Prevention | 2.0/4 | Past concluded events remain mixed with active passes, risking wrong pass presentation at gate turnstiles |
| 6 | Recognition Rather Than Recall | 2.0/4 | Omits hall allocation (`venueHall.name`) and doors-open schedule, forcing delegates to click into detail pages |
| 7 | Flexibility and Efficiency | 1.0/4 | Lacks instant search/filter tools for delegates managing 4+ passes across regional MICE summits |
| 8 | Aesthetic and Minimalist Design | 2.0/4 | High visual noise inside nested thumbnail container; 7 unused imports declared |
| 9 | Error Recovery | 2.0/4 | Empty state offers single generic CTA without region/pass recovery support |
| 10| Help and Documentation | 1.0/4 | Zero on-site gate admission instructions or hall entrance guides |
| **Total** | | **16.0/40** | **Major Remediation Required (40.0%)** |

### Design Specificity Verdict

**LLM Assessment**: Generic Consumer Receipt Stub (Grade: D+). The pass wallet currently functions as a flat order-history list rather than an institutional credential wallet for international MICE delegates. Critical domain features missing include spatial hall indexing (`venueHall.name`), temporal triage (*Upcoming* vs *Past*), region filtering (*Indonesia*, *Japan*, *Global*), and full-card click ergonomics for mobile gate queues.

**Deterministic Scan**: 0 raw mechanical regex flags; verified heading skips (`h1` -> `h3`), missing `role="img"` on mini QR container, sub-11px micro-text (`text-[10px]`), legacy `variant="archetype"` references, and 7 unused module imports.

### Overall Impression

While the individual pass detail page (`/my-tickets/[bookingId]`) is world-class, the pass wallet index (`/my-tickets`) suffers from lack of spatial wayfinding (missing hall names), missing chronological and regional filters, and broken card click ergonomics on mobile devices.

### What's Working

1. **Deterministic Cryptographic QR Generation**:
   - Backend `generateSvgQrCode()` integration outputs crisp, scalable vector barcodes without external CDN dependencies.
2. **Defensive Staging & Demo Fallbacks**:
   - Graceful fallback pass injection prevents blank-screen errors when database tables are freshly initialized.
3. **Clean Tailwind Layout Baseline**:
   - Responsive multi-column layout foundation with standard tokenized borders and card padding.

### Priority Issues

1. **[P0] Chronological & Regional Triage (Upcoming vs Past & Country Filters)**
   * **Why it matters**: Attendees holding multiple passes (e.g. Jakarta in October, Tokyo in November) have them sorted strictly by booking creation date rather than event date, with past events cluttering active passes.
   * **Fix**: Introduce tabbed triage (*Upcoming Passes* vs *Past Expos*), region filters (*All*, *Indonesia*, *Japan*, *Global*), and live keyword search.
   * **Suggested command**: `/impeccable layout`

2. **[P0] Full-Card Click Ergonomics & Stretched Link Pattern**
   * **Why it matters**: In moving convention gate queues, attendees tap anywhere on the pass card. Only the small bottom button is currently interactive, leading to missed taps and frustration.
   * **Fix**: Apply Next.js `after:absolute after:inset-0` stretched link pattern so tapping anywhere on the card surface opens the digital pass.
   * **Suggested command**: `/impeccable polish`

3. **[P1] Spatial Wayfinding & Hall Name Display**
   * **Why it matters**: Delegates standing at a 100,000 sqm convention center need to know which hall to head toward immediately upon stepping off transit (e.g., *JIExpo Hall A3*, *Tokyo Big Sight East Hall 2*).
   * **Fix**: Render `booking.event.venueHall.name` alongside the venue name and add a live temporal badge (*Happening Today*, *Starts in 2 Days*, *Concluded*).
   * **Suggested command**: `/impeccable clarify`

4. **[P1] Heading Hierarchy, Accessibility & Code Hygiene**
   * **Why it matters**: Document skips from `h1` directly to `h3`, QR thumbnail lacks `role="img"` and `aria-label`, sub-11px micro-text degrades legibility, and 7 unused imports bloat the module.
   * **Fix**: Correct heading hierarchy (`h1` -> `h2`), add accessible image metadata to QR thumbnail, standardize micro-text to `text-xs`/`text-[11px]`, and remove dead imports.
   * **Suggested command**: `/impeccable harden`

### Persona Red Flags

* **Alex (International Trade Delegate)**: Holds 4 passes across Jakarta and Tokyo; cannot filter by country or view passes chronologically by event date.
* **Jordan (First-Timer Attendee)**: Steps off the shuttle at ICE BSD City and cannot find which Hall their conference is in from the pass card.
* **Casey (Mobile User in Queue)**: Taps the card body on their smartphone while in line and nothing happens because only the small footer button is interactive.
