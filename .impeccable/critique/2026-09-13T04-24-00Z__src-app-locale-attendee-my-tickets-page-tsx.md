---
target: pass wallet and bookings list
total_score: 35
max_score: 40
na_heuristics: 
p0_count: 0
p1_count: 1
timestamp: 2026-09-13T04-24-00Z
slug: src-app-locale-attendee-my-tickets-page-tsx
---
Method: verified calibration audit (humanized unvarnished review)

## Design Health Score (Calibrated)

| # | Heuristic | Score | Key Findings & Evidence |
|---|-----------|:-----:|-------------------------|
| 1 | **Visibility of System Status** | **4 / 4** | Temporal triage tabs (Upcoming vs Past Expos), live count chips, and real-time temporal status badges (Happening Today, Starts in 2 Days). |
| 2 | **Match System / Real World** | **4 / 4** | Exact physical hall allocation (Hall A3, Nusantara Hall 2) displayed alongside venue and city names. |
| 3 | **User Control and Freedom** | **3 / 4** | Instant live keyword search, country pills (All, ID, JP, Global Gateways), and single-click "Reset view" button. |
| 4 | **Consistency and Standards** | **4 / 4** | Full-card stretched link (after:absolute after:inset-0), strict h1 to h2 heading hierarchy, and tokenized badges. |
| 5 | **Error Prevention** | **4 / 4** | Clear separation between concluded and active events prevents accidental gate confusion. |
| 6 | **Recognition Rather Than Recall** | **4 / 4** | Mini SVG QR preview, attendee name, booking reference ID, venue name, and exact hall visible on each card. |
| 7 | **Flexibility and Efficiency** | **3 / 4** | Instant filtering across multi-pass portfolios; could benefit from date-sorting toggle (earliest vs latest). |
| 8 | **Aesthetic and Minimalist Design** | **3 / 4** | Clean card grid with clear typography, but cards pack substantial information into compact cards. |
| 9 | **Error Recovery** | **3 / 4** | "Reset view" button quickly clears search query, region filter, and tab filters when no matches are found. |
| 10 | **Help and Documentation** | **3 / 4** | Clear instructional subtitle and status indicators explain pass presentation. |
| **Total** | | **35 / 40** | **High-Craft Production Standard** |

---

## Design Specificity Verdict

**AUTHENTIC MICE DELEGATE CREDENTIAL WALLET (Calibrated Pass)**.
Previous evaluations scored this page at a dismal 16.0/40 when it was an unindexed, flat order history stub with missing hall names, no regional filters, and no full-card click ergonomics.

With the implementation of `PassWalletExplorer.tsx`, all previous P0 issues have been systematically resolved:
1. Chronological triage tabs (Upcoming Passes vs Past Expos) separate historical passes from active convention credentials.
2. Regional filtering (All, Indonesia, Japan, Global Gateways) allows international delegates to quickly locate tickets for specific convention centers.
3. The Next.js `after:absolute after:inset-0` stretched link pattern provides seamless full-card click ergonomics across all mobile viewports.
4. Hall wayfinding (`booking.event.venueHall.name`) is directly co-located with venue metadata.

---

## Cognitive Load Assessment

1. **Chunking & Triage**: The 3-way tab bar (Upcoming / Past / All) immediately cuts cognitive search space in half for frequent delegates holding multiple credentials.
2. **Visual Hierarchy**: Primary event title, badge status, hall wayfinding, and mini QR thumbnail are clearly grouped and differentiated without visual clutter.
3. **Working Memory**: Delegates standing at a transit hub or venue entrance can immediately see which hall they must enter without clicking into detail screens.
