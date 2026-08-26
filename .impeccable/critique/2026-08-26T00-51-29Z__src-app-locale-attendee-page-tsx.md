---
target: the homepage
total_score: 34
max_score: 40
na_heuristics: 
p0_count: 0
p1_count: 1
timestamp: 2026-08-26T00-51-29Z
slug: src-app-locale-attendee-page-tsx
---
Method: dual-agent (A: 02eeeef8-aed5-4897-bb0d-8b1925b6fb6f · B: 6cbd0251-3ec0-4439-a0f2-24def1fdcfd0)

### Design Health Score

| # | Heuristic | Score | Key Issue |
|---|-----------|:-----:|-----------|
| 1 | Visibility of System Status | 4/4 | Excellent temporal status badges (Live pulsing, countdowns, Concluded grayscale) |
| 2 | Match System / Real World | 4/4 | Authentic MICE domain grounding (Convention complexes, Hall numbers, B2B specs) |
| 3 | User Control and Freedom | 3/4 | Good keyboard & swipe support; lacks desktop drag-to-scroll on category rail |
| 4 | Consistency and Standards | 4/4 | Strict Lucide vector icons, 15 archetype tokens, uniform corner radius hierarchy |
| 5 | Error Prevention | 4/4 | Zero-blank screen guarantee via comprehensive regional fallback data pipelines |
| 6 | Recognition Rather Than Recall | 3/4 | Calendar empty-day click shows dashed state instead of nearest active dates |
| 7 | Flexibility and Efficiency | 3/4 | Direct 1-click pass booking; lacks quick keyword search in top hero header |
| 8 | Aesthetic and Minimalist Design | 3/4 | High visual density in Hero banner (multiple concurrent badges + countdown box) |
| 9 | Error Recovery | 4/4 | Seamless fallback routing across ID, JP, and Global country editions |
| 10| Help and Documentation | 3/4 | Dedicated Attendee Concierge banner guides users to AI assistant and preferences |
| **Total** | | **34/40** | **Good (85%)** |

### Design Specificity Verdict

**LLM Assessment**: High MICE-Domain Specificity (Grade: A-). The homepage is authored specifically for physical convention centers and international trade exhibitions. Features like the docked `HeroVenueQuickGlanceRail` (indexing JIExpo Hall A1, Tokyo Big Sight, Marina Bay Sands) and 15 distinct B2B industry verticals (CME credits, RFQ machinery quotes, deals rooms) establish an institutional MICE identity that avoids generic consumer ticketing tropes.

**Deterministic Scan**: 21 files (4,647 lines of code across homepage, discovery, and layout components) were mechanically audited by the Impeccable Anti-Pattern Detector. **0 fatal anti-patterns found** (0 directional side-tab stripes, 0 gradient text fills, 0 clashing rounded border accents, 0 AI purple/violet dual-saturation gradients, 0 bounce easings, 0 broken images, 0 emoji). Verified WCAG AAA text contrast scrims on hero photography and robust zero-blank fallback data pipelines.

### Overall Impression

The XPO homepage is a highly competent, authentic MICE trade ecosystem. It feels like an institutional enterprise platform for convention centers, exhibitors, and delegates. The primary opportunity for improvement lies in **streamlining the hero banner's visual density** and **refining the discovery ergonomics** (such as category browsing and interactive calendar empty states).

### What's Working

1. **Integrated Venue-First Discovery (`HeroVenueQuickGlanceRail`)**: Docking real-time convention hall schedules directly beneath the hero carousel answers the primary delegate question immediately: *"What is happening at major venues this week?"*
2. **15 Bespoke MICE Archetype Worlds**: Authoritative color systems, domain tags, and specialized metadata tailored for each trade sector (Industrial B2B, Tech Summit, Medical, Pop Culture, etc.).
3. **Asymmetric Ecosystem Bento Showcase**: Clean 7-5-12 column division providing clear boundary separation between Attendee Hub, Organizer Tools, and Infrastructure Governance.

### Priority Issues

* **[P1] Hero Banner Visual Density Overload**
  * *Why it matters*: Encountering 9 concurrent visual targets (3 separate badges, countdown boxes, dates, venues, double CTAs) creates high initial cognitive load.
  * *Fix*: Consolidate region and category into a single unified metadata chip; streamline the countdown into a sleek inline badge (`Starts in 4d 12h`).
  * *Suggested command*: `/impeccable polish`
* **[P2] Empty State in Interactive Calendar Widget**
  * *Why it matters*: Selecting a date without events renders a blank dashed box, creating an exploration dead-end.
  * *Fix*: Default the calendar to the nearest upcoming active event date, and display a helpful prompt with a 1-click jump button when an empty day is clicked.
  * *Suggested command*: `/impeccable clarify`
* **[P2] 15-Category Horizontal Discoverability**
  * *Why it matters*: A single horizontal scrolling track hides ~70% of categories off-screen at desktop viewports.
  * *Fix*: Add a compact category quick-filter bar and desktop mouse drag-to-scroll capability.
  * *Suggested command*: `/impeccable layout`
* **[P3] Administrative Jargon in Public Platform Showcase**
  * *Why it matters*: Terms like "Event Ingestion Pipeline" and "RBAC" describe internal engineering plumbing rather than user-facing trust signals.
  * *Fix*: Replace with delegate/exhibitor benefits: *"Verified Hall Floor Plans"*, *"Enterprise Data Security"*, and *"Real-Time Venue Telemetry"*.
  * *Suggested command*: `/impeccable polish`

### Persona Red Flags

* **Jordan (First-Time Attendee)**: Encountering the dense countdown timer and only the first 3 categories in the carousel makes finding specific conferences (e.g. Medical) off-screen harder without a quick category selector.
* **Casey (Distracted Mobile User)**: Vertical scrolling on narrow viewports can occasionally trigger the horizontal carousel swipe zones. Increasing vertical separation between rail sections will improve single-thumb ergonomics.
* **Corporate Event Organizer**: Evaluating XPO for a 5,000-delegate expo requires scrolling down to Section 5 to discover organizer capabilities. A prominent "For Organizers" top-bar pill will streamline B2B conversion.

### Minor Observations

* The first 3 event card images above the fold could use `loading="eager"` / `priority` to optimize Largest Contentful Paint (LCP).
* Category pill badges in the venue rail should avoid low-opacity dynamic backgrounds in light mode to maintain contrast.

### Questions to Consider

* What if the Hero Venue Quick-Glance Rail included quick city tabs (Jakarta, BSD City, Bali, Tokyo) to condense vertical height on laptops?
* Could the Interactive Calendar Widget dynamically filter by the active category selected in the category explorer?
