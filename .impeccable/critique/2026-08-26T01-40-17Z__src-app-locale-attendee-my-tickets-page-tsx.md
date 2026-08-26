---
target: the digital and bookings page
total_score: 34
max_score: 40
na_heuristics: 
p0_count: 0
p1_count: 2
timestamp: 2026-08-26T01-40-17Z
slug: src-app-locale-attendee-my-tickets-page-tsx
---
Method: dual-agent (A: 0e299a8f-0e98-4773-ab4a-629f9b522c6b · B: 053c0396-5d2b-4500-8cff-919732805a8c)

### Design Health Score

| # | Heuristic | Score | Key Findings & Evidence |
|---|-----------|:-----:|-------------------------|
| 1 | Visibility of System Status | 3.6/4 | Live pulsing anti-tamper indicator, clear status badges (`CONFIRMED`, `CHECKED_IN`), and gate admission timestamp |
| 2 | Match System / Real World | 3.8/4 | Institutional MICE vocabulary (Turnstile Reader, VIP Buyer Lounge, Plenary Keynote, Translation Channel) |
| 3 | User Control and Freedom | 3.1/4 | 1-click agenda bookmarking, SVG pass downloads, and interactive map zoom controls |
| 4 | Consistency and Standards | 3.7/4 | Strict Lucide SVG icon conventions (zero emojis), consistent dark/light slate palette, and tokenized badges |
| 5 | Error Prevention | 3.3/4 | Constant-time HMAC-SHA256 verification and graceful database fallbacks prevent runtime crashes |
| 6 | Recognition Rather Than Recall | 3.7/4 | Attendee name, booking reference ID, dates, venue, and hall location co-located beneath the QR code |
| 7 | Flexibility and Efficiency | 2.9/4 | Vector SVG download and print stylesheet present, but lacks a 1-tap fullscreen turnstile scanner mode |
| 8 | Aesthetic and Minimalist Design | 3.6/4 | High typographic hierarchy, clean border radiuses, and subdued background accents |
| 9 | Error Recovery | 3.3/4 | Polished empty states on `/my-tickets` with direct event discovery CTAs |
| 10| Help and Documentation | 3.2/4 | Clear instructional microcopy for turnstiles and VIP seating |
| **Total** | | **34.2/40** | **Excellent (85.5%)** |

### Design Specificity Verdict

**LLM Assessment**: High MICE-Domain Specificity with Mobile Ergonomic Gaps (Grade: B+). The digital pass ecosystem is authored with deep MICE domain awareness (cryptographic HMAC-SHA256 pass verification, tier-gated treat vouchers, multi-track conference guidebook, and co-located hall wayfinding). The primary ergonomic friction is the monolithic vertical stacking on mobile (~3,500px scroll depth) without a sticky anchor jump bar or 1-tap high-contrast turnstile modal.

**Deterministic Scan**: 0 mechanical anti-pattern violations across all 4 pass and perk components.

### Overall Impression

The Digital Passes and Booking Wallet surface represents one of the strongest subsystems in XPO, featuring cryptographic vector QR generation, anti-tamper security watermarks, and tier-gated VIP treat vouchers. Adding a mobile sticky anchor bar, a 1-tap high-contrast turnstile scanner modal, and offline caching will make it world-class.

### What's Working

1. **All-in-One MICE Day-Of Operating Surface**:
   - Unifies the Digital Pass Credential, Tier Treat Vouchers, Live Agenda Timetable, and Interactive Floor Map into a single cohesive experience.
2. **Deterministic Cryptographic Security with Anti-Tamper UI**:
   - Constant-time HMAC-SHA256 verification, live pulsing security dots, and turnstile admission timestamps (`DigitalPassQR.tsx`) establish high enterprise trust.
3. **Responsive Vector QR & Print Stylesheet**:
   - Pure SVG QR generation ensures razor-sharp rendering on any screen size, with clean `@media print` rules for physical badge lanyard printing.

### Priority Issues

1. **[P1] Monolithic Page Scroll & Missing Mobile Anchor Subnav**
   * **Why it matters**: On mobile viewports, the pass detail page stacks 4 heavy sections into a 3,500px scroll. Delegates standing at turnstiles or in busy halls need instant jumping between their Pass, Treats, Agenda, and Map.
   * **Fix**: Add a sticky segmented anchor jump bar on mobile: `[ Digital Pass | VIP Treats | Timetable | Floor Map ]` with smooth scrolling and active section highlighting.
   * **Suggested command**: `/impeccable layout`

2. **[P1] High-Contrast Turnstile / Fullscreen Scanner Modal**
   * **Why it matters**: In high-throughput convention gates (targeting 1.2s admission per delegate), optical CCD scanners and camera readers perform fastest on full-screen pure black (`#000000`) on white (`#ffffff`, 21:1 contrast) with zero glare.
   * **Fix**: Add a 1-tap **"Enlarge Pass / High-Contrast Turnstile Mode"** full-screen dialog with max screen contrast and clean QR rendering.
   * **Suggested command**: `/impeccable polish`

3. **[P2] Offline Pass Caching & Resilience Indicator**
   * **Why it matters**: Concrete convention centers frequently experience cellular congestion. Attendees refreshing `/my-tickets/[bookingId]` on-site must not hit blank screens.
   * **Fix**: Cache the pass and SVG QR in client `localStorage` on initial load, and surface an **"Available Offline"** badge with automatic offline recovery.
   * **Suggested command**: `/impeccable clarify`

4. **[P2] Physical Perk Redemption Coordinates & Floor Map Integration**
   * **Why it matters**: Treat vouchers display codes but omit where to redeem them (e.g. *Hall A2, VIP Concourse Counter*), forcing delegates to hunt for lounges manually.
   * **Fix**: Add physical redemption counter locations to each treat voucher with a 1-click **"Locate on Map"** trigger that highlights the area on the floor map.
   * **Suggested command**: `/impeccable distill`

### Persona Red Flags

* **Alex (VIP Keynote Delegate)**: Must scroll past the entire QR pass to find and claim their VIP lounge barista voucher.
* **Jordan (First-Timer Attendee)**: Faces screen glare in outdoor registration lines without a 1-tap high-contrast fullscreen QR view.
* **Casey (Mobile User with Spotty Signal)**: Risks losing pass access inside deep concrete exhibition halls if the page reloads without offline caching.
