---
target: the calendar page
total_score: 26
max_score: 40
na_heuristics: 
p0_count: 1
p1_count: 2
timestamp: 2026-08-26T01-17-00Z
slug: src-app-locale-attendee-calendar-page-tsx
---
Method: dual-agent (A: 4789ccb2-ab74-4a97-a998-3f46cf2c88a1 · B: d159868c-cfd9-4276-8cea-dc2a867e695f)

### Design Health Score

| # | Heuristic | Score | Key Finding |
|---|-----------|:-----:|-------------|
| 1 | Visibility of System Status | 2.5/4 | Active dates highlighted with event counter badges, but missing active archetype filter chips on calendar |
| 2 | Match System / Real World | 2.5/4 | Uses MICE vocabulary, but renders multi-day trade shows as isolated dots instead of continuous date spans |
| 3 | User Control and Freedom | 2.0/4 | Category pills unexpectedly navigate away to `/events` instead of filtering the calendar in-place |
| 4 | Consistency and Standards | 2.5/4 | Inconsistent card styling between calendar list and discovery grid; self-referential reload link in widget |
| 5 | Error Prevention | 3.0/4 | Graceful empty state with "Jump to Next Event" action; DB query errors fallback to pre-seeded dataset |
| 6 | Recognition Rather Than Recall | 2.5/4 | Color-coded archetype badges, but lower chronological grid lacks monthly milestone separators |
| 7 | Flexibility and Efficiency | 2.0/4 | "Export iCal (.ics)" button is a non-functional static mockup; lacks multi-venue filtering tabs |
| 8 | Aesthetic and Minimalist Design | 3.0/4 | Clean vector icons and dark/light theming, but duplicate card presentation between dual-pane and lower grid |
| 9 | Error Recovery | 3.0/4 | Dynamic nearest-event computation when selecting empty dates provides instant recovery |
| 10| Help and Documentation | 2.5/4 | Clear subtitles, but missing timezone conversion badges for overseas trade delegates |
| **Total** | | **25.5/40** | **Acceptable (64%)** |

### Design Specificity Verdict

**LLM Assessment**: Moderate Domain Grounding (Grade: C+). While the backend data models support 15 specialized MICE verticals, regional hubs, and exact venue halls, the calendar interface currently operates like a conventional consumer blog calendar rather than an institutional, multi-hall MICE timetable.

**Deterministic Scan**: 0 mechanical anti-pattern violations across calendar components, with structural accessibility opportunities (eliminating nested `<a><button>` tags and implementing working `.ics` export).

### Overall Impression

The dual-pane calendar matrix and "Jump to Next Event" micro-interaction provide a strong foundation, but the calendar page suffers from navigational context ejection (category pills routing away to `/events`), a non-functional iCal export button, and an unchunked lower schedule grid.

### What's Working

1. **Smart Empty State & Nearest Event Jump (`EventCalendarWidget.tsx`)**:
   - Selecting a date with 0 scheduled events computes the next active exhibition and offers a 1-click jump button that automatically advances the calendar view.
2. **Archetype Color Identity (`theming.ts`)**:
   - Distinct color swatches across 15 verticals allow immediate visual sector triage.
3. **Multi-Region Timezone Formatting**:
   - Timezones correctly adapt to local venue time (`Asia/Jakarta`, `Asia/Tokyo`, `UTC`).

### Priority Issues

1. **[P0] In-Place Category Filtering (Stop Ejection to `/events`)**
   * **Why it matters**: Clicking category pills currently navigates users away to the general event list (`/events?archetype=...`), destroying their calendar view.
   * **Fix**: Update category selection on the calendar page to filter calendar events and matrix dots in-place (with active filter chips and clear actions).
   * **Suggested command**: `/impeccable clarify`

2. **[P1] Functional RFC 5545 iCal (.ics) Calendar Export**
   * **Why it matters**: Corporate delegates and international exhibitors require a working `.ics` file download to sync trade shows with Outlook, Google Calendar, or Apple Calendar.
   * **Fix**: Implement a functional client-side iCal generator utility that formats standard RFC 5545 `VCALENDAR` text and triggers `.ics` download.
   * **Suggested command**: `/impeccable polish`

3. **[P1] Remove Self-Referential Reload Link in Calendar Widget**
   * **Why it matters**: On the dedicated `/calendar` page, the header contains a "Full Multi-Track Timetable" button that reloads the exact same page.
   * **Fix**: Add an `isCalendarPage?: boolean` prop to `EventCalendarWidget` that suppresses the redundant link or replaces it with view filters.
   * **Suggested command**: `/impeccable layout`

4. **[P2] Monthly Milestone Chunking & Venue Filter Tabs**
   * **Why it matters**: The lower overview dumps all events in an unchunked 3-column grid, making chronological scanning difficult.
   * **Fix**: Group the overview by `Year-Month` with sticky headers and add venue filter tabs (*All Venues*, *JIExpo*, *ICE BSD*, *Tokyo Big Sight*).
   * **Suggested command**: `/impeccable layout`

5. **[P2] Nested Interactive Elements & HTML5 Cleanup (`<a><button>`)**
   * **Why it matters**: Wrapping `<Button>` components inside Next.js `<Link>` tags causes invalid DOM nesting and focus duplication.
   * **Fix**: Style `<Link>` tags directly with button utility classes.
   * **Suggested command**: `/impeccable harden`

### Persona Red Flags

* **Alex (Power User / Trade Delegate)**: Tries to export calendar to sync travel itinerary with Outlook; button is non-functional.
* **Jordan (First-Timer)**: Clicks "Tech & AI" to see tech summit dates in the calendar, but is abruptly redirected to the general event search page.
* **Casey (Mobile User)**: Faces small 32px calendar cells and must scroll through duplicate card listings.
* **Exhibitor / Booth Manager**: Cannot filter the schedule by specific convention venue (*JIExpo* vs *ICE BSD*).
