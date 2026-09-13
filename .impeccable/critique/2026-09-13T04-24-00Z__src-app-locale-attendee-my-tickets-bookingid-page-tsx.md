---
target: digital pass detail and event treats
total_score: 35
max_score: 40
na_heuristics: 
p0_count: 0
p1_count: 1
timestamp: 2026-09-13T04-24-00Z
slug: src-app-locale-attendee-my-tickets-bookingid-page-tsx
---
Method: verified calibration audit (humanized unvarnished review)

## Design Health Score (Calibrated)

| # | Heuristic | Score | Key Findings & Evidence |
|---|-----------|:-----:|-------------------------|
| 1 | **Visibility of System Status** | **4 / 4** | Live anti-tamper security pulse, verified admission timestamp, and offline readiness indicator. |
| 2 | **Match System / Real World** | **4 / 4** | Authentic convention day-of terms (Turnstile Reader, VIP Treats, Floor Map, Security Ledger). |
| 3 | **User Control and Freedom** | **4 / 4** | Sticky segmented jump bar (Digital Pass, VIP Treats, Timetable, Floor Map), 1-tap high-contrast turnstile modal, and SVG/PDF export. |
| 4 | **Consistency and Standards** | **3 / 4** | Standard badge variants, strict WCAG 44px mobile touch targets, and vector SVG QR rendering. |
| 5 | **Error Prevention** | **4 / 4** | Constant-time HMAC-SHA256 hash verification, local cache offline resilience, and clear admitted state stamping. |
| 6 | **Recognition Rather Than Recall** | **4 / 4** | Explicit attendee identity, tier perks details, physical redemption counters, and interactive booth wayfinding on map. |
| 7 | **Flexibility and Efficiency** | **3 / 4** | 1-tap max contrast turnstile modal expedites optical gate scanning; print stylesheet enables badge lanyard printing. |
| 8 | **Aesthetic and Minimalist Design** | **3 / 4** | Monolithic page contains 4 dense sections; sticky subnav successfully mitigates mobile vertical fatigue. |
| 9 | **Error Recovery** | **3 / 4** | Graceful fallback mock injection when demo passes are inspected; offline caching guards against hall network dead-zones. |
| 10 | **Help and Documentation** | **3 / 4** | Microcopy guides delegates on scanner alignment and voucher redemption locations. |
| **Total** | | **35 / 40** | **High-Craft Production Standard** |

---

## Design Specificity Verdict

**ENTERPRISE MICE DAY-OF PASS & ENTITLEMENTS SUITE (Calibrated Pass)**.
The pass detail page (`/my-tickets/[bookingId]`) and supporting perk modules deliver an all-in-one day-of operating surface for convention attendees and delegates.

Previous critique scored this surface at 34.2/40 and identified four core gaps:
1. Monolithic page scroll without mobile anchor subnav: Resolved via `<PassDayOfSubnav />`.
2. Absence of a high-contrast turnstile scanner modal: Resolved via `Maximize2` pure black-on-white 21:1 turnstile dialog.
3. Lack of offline pass resilience: Resolved via `localStorage` offline caching and "Offline Ready" badge.
4. Missing physical redemption locations for perks: Resolved via explicit counter locations (`Main Concourse Barista Hub`, `Hall A1 Welcome Counter`) and 1-click `scrollToMap()` navigation.

Our current audit identified and addressed the remaining accessibility and typographic details:
- Standardized `Badge` small size and `HallFloorMap` legend typography to eliminate sub-11px font sizes.
- Added explicit `role="img"` and accessible `aria-label` tags to SVG QR code containers.
- Standardized `min-h-[44px]` touch targets on mobile sub-navigation buttons.
- Configured accessible `role="radio"` and `aria-checked` semantics on `TierSelector`.

---

## Cognitive Load Assessment

1. **Section Chunking**: Stacking pass credentials, VIP treat vouchers, schedule timetable, and floor map could overwhelm users without spatial segmentation. The sticky `PassDayOfSubnav` anchors the viewport and provides one-touch jumping between operational tasks.
2. **Turnstile High-Speed Mode**: In arrival lines, optical CCD barcode readers can struggle with dark mode interfaces or screen glare. The 1-tap Max Contrast Turnstile Mode isolates the QR barcode in pure 21:1 monochrome, reducing cognitive stress during check-in.
3. **Perk Wayfinding**: Displaying the exact physical counter for each perk directly eliminates the frustration of wandering large convention concourses in search of amenities.
