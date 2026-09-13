# Design Critique: Organizer Door Scanner & QR Check-In Console
**Target**: `src/app/[locale]/(organizer)/scanner/page.tsx` & `src/components/organizer/CheckInScanner.tsx`
**Slug**: `src-app-locale-organizer-scanner-page-tsx`
**Timestamp**: 2026-09-13T09:55:00Z
**Method**: dual-agent (A: 449b1397-1793-42ad-84db-0ca3e7edbebe · B: 924225ea-5617-408f-b76b-31106ca0b943)
**Mode**: Operate (Turnstile, Gate Operations, Door Staff Triage Under Physical Queue Pressure)

---

## 1. Design Health Score

| # | Heuristic | Score | Key Issue |
|---|---|:---:|---|
| 1 | Visibility of System Status | 3/4 | Viewfinder animates even without decoding loop; mobile result card sits below the fold. |
| 2 | Match System / Real World | 3/4 | Uses realistic gate terminology; but displays 64-character raw hex hashes rather than human-readable booking references. |
| 3 | User Control and Freedom | 2/4 | No undo or revoke check-in action if an attendant accidentally scans the wrong badge. |
| 4 | Consistency and Standards | 3/4 | Respects international traffic light color tokens (Emerald, Amber, Rose); but audit stream badges differ in font metrics. |
| 5 | Error Prevention | 2/4 | Four test sandbox simulation buttons sit permanently under manual entry with no confirmation guard. |
| 6 | Recognition Rather Than Recall | 3/4 | Explicitly displays delegate name, ticket tier, and unlocked perks; but lacks company affiliation and photo ID for badge swapping fraud. |
| 7 | Flexibility and Efficiency | 2/4 | Zero-latency Web Audio chimes synthesized; but lacks hardware barcode wedge scanner listener and mobile haptic vibration. |
| 8 | Aesthetic and Minimalist Design | 2/4 | Cluttered by developer sandbox controls, HUD graphics, and redundant cryptographic labels. |
| 9 | Error Recovery | 2/4 | Camera errors offer clear retry buttons; but network drops are erroneously categorized as counterfeit pass fraud. |
| 10 | Help and Documentation | 2/4 | Clear input placeholders; but zero on-screen Standard Operating Procedures (SOP) for double-scan conflict handling. |
| **Total** | | **24/40** | **Needs Work (60%)** |

---

## 2. Design Specificity Verdict

- **LLM Assessment**: The console contains genuine MICE domain logic (HMAC-SHA256 signature verification, three-state triage: Admitted vs Double-Scan vs Invalid, tier-specific VIP perk unlocks, and real-time shift counters). However, it currently straddles a production door console and a developer test bench: the four "Quick Test Scenarios" buttons take up 25 percent of the screen and pose high accidental-trigger risk during morning queue rush. Furthermore, while the camera stream initializes the hardware sensor, there is no continuous optical barcode decoding loop parsing frames.
- **Deterministic Scan**: Mechanical detection identified 20 true defects across 2 files:
  - 1 heading hierarchy flaw (`eyebrow-kicker` on `scanner/page.tsx:33`)
  - 5 unused imports (`QrCode`, `Building2`, `Layers`, `Sparkles`, `Zap` on `scanner/page.tsx:6-11`)
  - 9 touch target violations under 44px on `CheckInScanner.tsx` (mode switches, sound toggle, retry buttons, sandbox buttons)
  - 2 WCAG AA color contrast failures on `text-amber-500` (2.15:1) and `text-amber-600` (3.28:1)
  - 1 accessibility barrier: dynamic check-in result container lacks `aria-live="assertive"`
  - 2 hardware lifecycle defects: `new AudioContext()` instantiated per scan without `ctx.close()` (causing browser audio freeze after 6 scans) and camera stream unmount race condition keeping hardware camera active
  - 1 missing functional loop: no optical barcode frame decoder.
- **Visual Overlays**: Automated scan executed cleanly via CLI. Overlays are summarized directly in the defect log.

---

## 3. Overall Impression

The core architecture possesses strong MICE foundations with its deterministic three-state triage (Admitted vs Double-Scan vs Invalid) and instant tier-perk disclosure. However, operational execution is compromised by developer-sandbox clutter, touch targets too small for mobile door staff, sub-fold result placement on phones, audio context resource leaks, and the absence of a live optical barcode decoding loop.

---

## 4. What is Working

1. **Deterministic Three-State Triage Architecture**: Distinguishes cleanly between Admitted (Green), Double-Scan Warning (Amber), and Cryptographic Tamper/Void (Red), preventing legitimate returning delegates from being accused of fraud.
2. **Instant Tier and Entitlement Disclosure**: Surfaces tier status and perk allowances (VIP Lounge, Swag Bag) directly in the admission card, allowing door staff to issue wristbands without consulting separate binders.
3. **Low-Latency Synthesized Web Audio**: Synthesizes acoustic frequencies on-the-fly without external audio file loading latency.

---

## 5. Priority Issues (P0 to P3)

- **[P0] Web Audio Context Leak and Autoplay Starvation**
  - *Why it matters*: Calling `new AudioContext()` on every scan without closing or reusing a singleton hits browser audio limits after 6 scans, permanently freezing audio feedback at the turnstile.
  - *Fix*: Create a single lazily-initialized `AudioContext` ref, call `ctx.resume()` on user interaction, and reuse the instance across all scan sound triggers.
  - *Suggested command*: `/impeccable harden`

- **[P0] Missing Screen Reader ARIA Live Region on Scan Results**
  - *Why it matters*: Blind or visually-impaired gate attendants using screen readers receive zero audible confirmation of admission or rejection when passes are scanned.
  - *Fix*: Add `aria-live="assertive"` and `role="status"` to the scan result container so assistive technology announces triage verdicts instantly.
  - *Suggested command*: `/impeccable harden`

- **[P0] Camera Stream Hardware Unmount Leak**
  - *Why it matters*: If an attendant navigates away while `getUserMedia` is resolving, the promise resolution executes against an unmounted component, leaving the camera hardware and green indicator light active indefinitely.
  - *Fix*: Introduce an `isMounted` ref check in `startCamera` and immediately terminate tracks if unmounted.
  - *Suggested command*: `/impeccable harden`

- **[P1] Sub-44px Mobile Touch Targets on Turnstile Controls**
  - *Why it matters*: Mode switches, retry buttons, and sound toggles are 28px to 32px tall, violating the 44px touch target minimum and causing frequent mis-taps by door staff working one-handed.
  - *Fix*: Enforce `min-h-[44px]` and `min-w-[44px]` across all operator controls.
  - *Suggested command*: `/impeccable layout`

- **[P1] Amber Contrast Failures on White Card Surfaces**
  - *Why it matters*: `text-amber-500` (2.15:1) and `text-amber-600` (3.28:1) fail WCAG AA contrast against white card backgrounds, washing out completely under convention hall sunlight.
  - *Fix*: Replace with high-contrast amber tokens such as `text-amber-800 dark:text-amber-300` or solid badge pills with dark text.
  - *Suggested command*: `/impeccable colorize`

- **[P2] Developer Test Sandbox Exposed in Live Gate View**
  - *Why it matters*: The four mock scan buttons sit directly under manual input, inviting accidental admissions during crowd pressure.
  - *Fix*: Tuck the sandbox controls into a collapsible "Staff Simulator & Diagnostics" panel.
  - *Suggested command*: `/impeccable distill`

---

## 6. Persona Red Flags

- **Rudy (Door Attendant in Direct Sunlight)**: FAIL. Subtle 5 percent background washes and low-contrast amber text wash out completely under 10,000+ lux daylight. Operator controls sit outside the mobile thumb reach zone.
- **Sam (Accessibility-Dependent Staff)**: WARN. Zero `aria-live` announcements on scan results. High hall noise masks audio chimes without any tactile `navigator.vibrate` fallback.
- **Riley (Stress Tester / Network Drop)**: FAIL. Network timeouts in `fetch("/api/tickets/verify")` are caught as counterfeit pass fraud (`INVALID`) rather than distinct network connection errors.
