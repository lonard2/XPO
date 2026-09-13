---
target: header carousel and quick glance list
total_score: 33
max_score: 40
na_heuristics: 
p0_count: 0
p1_count: 1
timestamp: 2026-09-13T04-20-00Z
slug: src-components-discovery-bannercarousel-tsx
---
Method: verified calibration audit (humanized unvarnished review)

## Design Health Score (Calibrated)

| # | Heuristic | Score | Key Issue |
|---|-----------|:-----:|-----------|
| 1 | **Visibility of System Status** | **3 / 4** | Temporal countdown and slide dots are present, but remaining duration before auto-advance lacks visual progress indicator. |
| 2 | **Match System / Real World** | **4 / 4** | Authentic MICE hall nomenclature (Hall A1-A3), physical venue anchors, and regional timezone binding. |
| 3 | **User Control and Freedom** | **3 / 4** | Auto-play now pauses on pointer hover and focus, but manual swipe threshold cannot be fine-tuned on mobile. |
| 4 | **Consistency and Standards** | **3 / 4** | Accessible link button variants now standard; WAI-ARIA carousel slide group annotations in place. |
| 5 | **Error Prevention** | **4 / 4** | Concluded events disable pass sales and swap to historical recap CTAs. |
| 6 | **Recognition Rather Than Recall** | **4 / 4** | Explicit hall name chips, archetype indicators, and clear event dates. |
| 7 | **Flexibility and Efficiency** | **3 / 4** | Keyboard arrows supported, but keyboard listeners require active element checking against inputs. |
| 8 | **Aesthetic and Minimalist Design** | **3 / 4** | High information density (up to 10 distinct badges, chips, and buttons overlaid on rich imagery). |
| 9 | **Error Recovery** | **3 / 4** | Graceful fallback when hero image fails; recap links on past events. |
| 10 | **Help and Documentation** | **3 / 4** | Clear domain badges and countdown status chips act as self-describing metadata. |
| **Total** | | **33 / 40** | **Good (Solid Production Quality)** |

---

## Design Specificity Verdict

**DOMAIN-SPECIFIC MICE CONVENTION BANNER (Calibrated Pass)**.
The header banner (`BannerCarousel.tsx`) is purpose-built for multi-sided convention discovery across Indonesia, Japan, and Global editions. It couples temporal lifecycle awareness (Live Doors Open, Countdown to Opening, Event Concluded Archive) with physical hall wayfinding chips (`JIExpo Kemayoran (Jakarta) Hall A1`).

Previous assessments inflated the score to 36/40 by assuming hover-to-pause and ARIA slide group structures were fully compliant. In reality:
1. `onMouseEnter` previously overwrote the manual pause state upon mouse leave.
2. `select-none` on the root container prevented delegates from copying event titles and venue names.
3. Slide groups were not annotated with standard `role="group"` and `aria-roledescription="slide"`.

---

## Cognitive Load Assessment

1. **Single Focus**: Moderate. The banner has high visual density (region tag, category archetype, live status, featured badge, title, tagline, date, venue, hall badge, countdown widget, dual CTAs).
2. **Chunking**: Information is chunked into three distinct vertical zones (taxonomic badges, primary metadata, and action triggers).
3. **Working Memory**: Delegates do not need to memorize dates or halls; all critical logistical data is visible on the slide surface.
4. **Visual Noise Floor**: The dark scrim (`from-black/95 via-black/80 to-black/35`) preserves text readability, but the sheer quantity of overlaid chips remains near the upper threshold of cognitive capacity.

---

## Priority Issues & Resolutions

### 1. [P1] Hover/Focus Pause State Hygiene (Resolved)
* **Problem**: Previously, hovering over the carousel called `setIsPaused(true)`, and leaving called `setIsPaused(false)`. If a user had clicked the manual pause button, moving the mouse out of the carousel resumed auto-play against their explicit intent.
* **Resolution**: Separated `isManuallyPaused`, `isHovered`, and `isFocused` states into a unified `isEffectivePaused` flag. Moving the mouse out no longer overrides an explicit pause button toggle.

### 2. [P2] Text Selection Prevention on Desktop (Resolved)
* **Problem**: `select-none` on the carousel outer wrapper prevented users from copying event titles, hall names, and dates into notes or calendars.
* **Resolution**: Removed `select-none` from the wrapper while preserving pointer drag functionality.

### 3. [P2] Slide Group ARIA Annotations (Resolved)
* **Problem**: Screen readers received a generic carousel container without slide-level group semantics.
* **Resolution**: Added `role="group"`, `aria-roledescription="slide"`, `aria-label`, and `aria-live={isEffectivePaused ? 'polite' : 'off'}`.
