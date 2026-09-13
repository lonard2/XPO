---
target: organizer portal
total_score: 35
max_score: 40
na_heuristics: 
p0_count: 0
p1_count: 1
timestamp: 2026-09-13T04-27-00Z
slug: src-app-locale-organizer
---
Method: verified calibration audit (humanized unvarnished review)

## Design Health Score (Calibrated)

| # | Heuristic | Score | Key Findings & Evidence |
|---|-----------|:-----:|-------------------------|
| 1 | **Visibility of System Status** | **4 / 4** | Live freshness timestamp (Live Metrics : Data as of HH:MM), real camera hardware status indicators, audio feedback toggle, and step progress indicators. |
| 2 | **Match System / Real World** | **4 / 4** | Humanized gate scanner statuses (Gate Entry Granted, Double Scan Warning, Pass Rejected / Invalid), authentic MICE lexicon (exhibitor tenant, pass tier, booth roster), and localized currency (JPY, USD, IDR). |
| 3 | **User Control and Freedom** | **3 / 4** | Wizard draft persistence with localStorage restore and discard banner; clickable wizard steps; modal and bulk CSV booth operations. |
| 4 | **Consistency and Standards** | **4 / 4** | Standard badge variants across organizer views, Lucide icons, tokenized borders, and WAI-ARIA radiogroups with Enter and Space support. |
| 5 | **Error Prevention** | **4 / 4** | In-flight scan mutex locks preventing race conditions, required field validation, and draft preservation across sessions. |
| 6 | **Recognition Rather Than Recall** | **4 / 4** | Sidebar descriptions, breadcrumb navigation, live device preview frame for real-time visual branding changes, and archetype guidance. |
| 7 | **Flexibility and Efficiency** | **3 / 4** | Bulk CSV booth roster import with validation preview table, dual camera and manual QR entry; could benefit from custom keyboard accelerators. |
| 8 | **Aesthetic and Minimalist Design** | **3 / 4** | Institutional, clean design without emojis or AI quirks; clear data tables, though dense information in booth and KPI displays. |
| 9 | **Error Recovery** | **3 / 4** | Camera permission denial error messaging with actionable guidance, live validation error feedback on CSV import and wizard steps. |
| 10 | **Help and Documentation** | **3 / 4** | Clear helper text on form inputs, outcome-oriented model tags in AI reports hub, and contextual prompt presets. |
| **Total** | | **35 / 40** | **High-Craft Production Standard (Operate Mode)** |

---

## Design Specificity Verdict

**AUTHENTIC MICE EVENT OPERATIONS HUB (Calibrated Production Standard)**.
Historical evaluations scored this portal at 22/40 based on early draft surfaces. A comprehensive code audit confirms that the critical operational issues flagged previously have been systematically resolved:

1. **Hardware Camera Integration**: `CheckInScanner.tsx` uses real `navigator.mediaDevices.getUserMedia` with video stream references, camera permission error handling, active camera detection, and Web Audio API status tones.
2. **Door Staff Usability**: Raw database enum strings were replaced by humanized gate status messages via `SCAN_STATUS_MAP` (Gate Entry Granted, Double Scan Warning, Pass Rejected / Invalid, Ticket Cancelled / Void).
3. **Wizard Draft Persistence**: `events/new/page.tsx` implements automatic `localStorage` draft saving, draft restore and discard prompts, and clickable step navigation headers.
4. **Accessible Picker Interactions**: The 15 archetype cards and 3 region selectors are implemented as interactive controls with `role="radio"`, `aria-checked`, `tabIndex`, and keyboard Enter and Space activation within a `role="radiogroup"`.
5. **Bulk Operations**: `booths/page.tsx` features a CSV batch import modal with structured columns (Booth Number, Hall Name, Exhibitor, Industry, Website) and live table validation preview.
6. **KPI Freshness & Accuracy**: The organizer dashboard displays a live timestamp (`Live Metrics : Data as of HH:MM`), derives currency from the event locale (`IDR`, `JPY`, `USD`), and correctly displays 0% booth occupancy when no booths are registered.
7. **Badge Styling Scoping**: Replaced un-scoped archetype badge classes that previously caused transparent borders and backgrounds outside the attendee event shell with consistent, token-styled badge variants.

---

## Cognitive Load Assessment

Score: **7 / 8** (Low Cognitive Load, Operate Mode).
1. **Single Focus**: Wizard steps isolate event metadata, ticketing, schedules, and branding into distinct phases.
2. **Chunking**: Information is organized into clean logical cards (Metrics, Quick Actions, Booth Roster, Live Preview).
3. **Grouping**: Form fields, status badges, and action buttons are grouped with consistent border tokens and padding.
4. **Visual Hierarchy**: Primary metrics, action buttons, and active tabs stand out clearly over secondary tabular data.
5. **One Thing at a Time**: Door staff scanner centers exclusively on QR targeting and admission verdicts without auxiliary distractions.
6. **Minimal Choices**: Preset archetype cards and quick test scenarios reduce manual data entry burdens.
7. **Working Memory**: Real-time live preview frame allows visual customizer changes to be verified instantly without navigating away.
8. **Progressive Disclosure**: Advanced CSV bulk upload and technical JSON schema exports are housed in dedicated drawers and tabs.

---

## What is Working

1. **Gate Scanner Feedback Loop**: Instant Web Audio synthesis tones coupled with high-contrast status banners give gate staff immediate, fail-safe admission signals under heavy door traffic.
2. **Real-Time Visual Customizer**: The side-by-side desktop, tablet, and mobile live preview frame lets organizers preview attendee-facing event pages with authentic archetype styling as they adjust branding tokens.
3. **Institutional Tone and Data Precision**: Strict adherence to professional MICE terminology (exhibitor tenant, hall allocation, pass tiers, foot-traffic index) without emojis or conversational AI quirks.

---

## Priority Issues for Continuous Polish

**[P1] Keyboard Accelerators for High-Volume Gate Entry**
- What: Check-in scanner supports manual code submission and camera scan, but lacks single-key shortcuts for rapid clearance (such as pressing Space to re-arm scanner or Esc to dismiss status).
- Why it matters: At peak exhibition entry times, minimizing manual mouse interactions speeds up gate clearance.
- Fix: Add keyboard event listeners for Space (re-scan) and Enter (submit manual code).
- Suggested command: /impeccable optimize

**[P2] Booth Roster Multi-Select Bulk Actions**
- What: Booth table supports single-item editing and CSV bulk import, but inline multi-select deletion or status toggling is not yet exposed.
- Why it matters: When re-allocating a whole hall wing, organizers currently delete or edit booths individually.
- Fix: Add checkbox column to booth table with batch status update action bar.
- Suggested command: /impeccable layout
