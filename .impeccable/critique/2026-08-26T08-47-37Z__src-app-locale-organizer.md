---
target: organizer portal
total_score: 22
max_score: 40
na_heuristics: 
p0_count: 2
p1_count: 3
timestamp: 2026-08-26T08-47-37Z
slug: src-app-locale-organizer
---
## Organizer Portal — Full Design Critique
### XPO MICE Platform · Mode: Operate · Target: `src/app/[locale]/(organizer)`

### Design Health Score

| # | Heuristic | Score | Key Issue |
|---|-----------|-------|-----------|
| 1 | Visibility of System Status | 2 | KPI cards are static server snapshots with no freshness timestamp or refresh; scanner shows "Optical Engine Active" regardless of actual camera state |
| 2 | Match System / Real World | 3 | Strong MICE vocabulary throughout; fails on raw enum labels (DOUBLE_SCAN, CHECKED_IN) shown to door staff; hardcoded IDR revenue for JPY-region organizers |
| 3 | User Control and Freedom | 2 | Zero wizard draft persistence; step indicators are non-clickable; no undo on booth deletion |
| 4 | Consistency and Standards | 3 | Lucide icons, button hierarchy, and card patterns consistent; useTranslations inside try/catch (5+ files) is a fragile pattern-level inconsistency |
| 5 | Error Prevention | 2 | Publish redirects without confirmation; booth number is free-text; default tier name publishes uncleaned |
| 6 | Recognition Rather Than Recall | 3 | Sidebar descriptions reduce recall burden; URL slug field unmarked as auto-generated; JSON Schema Data tab requires ML knowledge |
| 7 | Flexibility and Efficiency of Use | 1 | Zero keyboard shortcuts; wizard forces linear Steps 1-4; no CSV booth import; no saved event templates |
| 8 | Aesthetic and Minimalist Design | 3 | Institutional, clean, emoji-free; dashboard Capabilities card is redundant noise; available-booth contrast too subtle |
| 9 | Error Recovery | 2 | Camera permission denial has no error state; AI report failure shows no retry button; dashboard DB errors are silent |
| 10 | Help and Documentation | 1 | Zero contextual help or tooltips anywhere; AI model selector provides no guidance; scanner Quick Test Scenarios visible to live door staff |
| **Total** | | **22/40** | **Acceptable — significant improvements needed** |

### Design Specificity Verdict

The portal is unmistakably MICE-specific in content — real venue names, authentic industry lexicon, 15 archetype-differentiated domain snippets. An exhibition director will feel understood. But the structural skeleton is generic SaaS: 4-item sidebar, 4-KPI dashboard, event card grid, activity feed. Nothing about the navigation architecture reflects the asymmetric time-pressure of MICE operations.

**Deterministic scan:** 34 true defects across 8 files (zero files clean). Highest-priority: text-[9px] on CheckInScanner.tsx:638 (below WCAG floor); interactive div onClick without keyboard on events/new/page.tsx:586-622 and 645-658; hover:scale-102 on LivePreviewFrame.tsx:360 (non-existent Tailwind token — hover silently fails); @ts-ignore on LivePreviewFrame.tsx:280; useTranslations inside try/catch in 5 separate files.

### What's Working

1. **MICE Vocabulary Precision:** "exhibitor tenant," "VIP Buyer & Delegate Pass," "foot-traffic index," "bilateral delegation lounges." Not borrowed from generic SaaS.
2. **Scanner Audio Feedback Architecture:** Three distinct Web Audio API synthesis tones (sine/triangle/sawtooth) for success/double-scan/fraud. Zero-dependency, screen-independent status signaling for exhibition hall environments.
3. **LivePreviewFrame Archetype-Specific Domain Snippets:** getCategoryFeatureSnippet() returns genuinely differentiated content for all 15 archetypes. The viewport switcher (Desktop/Tablet/Mobile) delivers real multi-device preview value.

### Priority Issues

**[P0] Scanner Has No Real Camera Integration**
- What: Camera mode renders a static simulated HUD. No getUserMedia() call, no video stream, no QR decode library. isCameraActive defaults to true and is never updated by any real event.
- Why it matters: The scanner is the primary day-of tool for door staff. A 5,000-delegate event with non-functional scanning software is a critical operational failure. Camera permission denial shows no error state.
- Fix: Integrate @zxing/browser or html5-qrcode. Mount a real video stream. Add camera permission error state. Suppress Quick Test Scenarios in production.
- Command: /impeccable harden

**[P0] Raw Database Enum Labels Exposed to Door Staff**
- What: CheckInScanner.tsx:543 and :640 render raw Prisma enum strings — CHECKED_IN, DOUBLE_SCAN, INVALID, CANCELLED — directly to door staff UI.
- Why it matters: Door staff at a live gate cannot interpret DOUBLE_SCAN under time pressure. Exposes internal data model to end users.
- Fix: Add SCAN_STATUS_LABELS map: CHECKED_IN → "Admitted", DOUBLE_SCAN → "Already Scanned", INVALID → "Invalid Pass", CANCELLED → "Cancelled Ticket".
- Command: /impeccable clarify

**[P1] Wizard State Is Ephemeral — No Draft Persistence**
- What: 4-step event creation wizard uses pure React state. Navigating away or encountering a server error destroys all work. Step indicators are non-clickable.
- Why it matters: First-wizard abandonment is the largest onboarding risk. An interrupted organizer loses everything.
- Fix: Persist wizard state to localStorage keyed by draft-event-{userId}-{timestamp}. Offer restore banner on mount. Clear on successful publish.
- Command: /impeccable harden

**[P1] Dashboard KPI Cards Have No Data Freshness Signal**
- What: Dashboard is a Server Component with no timestamp, no refresh mechanism. boothOccupancy hardcoded to 85 when totalBooths === 0. Revenue hardcoded to IDR regardless of organizer region.
- Why it matters: During a live event, stale KPIs create false confidence. 85% occupancy phantom on a new account is actively misleading.
- Fix: Add "Data as of [HH:MM]" to KPI section header. Remove boothOccupancy = 85 fallback. Fix currency to derive from organizer region profile.
- Command: /impeccable optimize

**[P1] Archetype and Region Picker Cards Are Keyboard-Inaccessible**
- What: 15 archetype cards (events/new/page.tsx:586-622) and 3 region cards (:645-658) are div onClick with no role, tabIndex, or onKeyDown. Keyboard-only users cannot complete Step 1.
- Why it matters: Absolute accessibility blocker. WCAG 2.1 SC 2.1.1. Sam cannot create an event.
- Fix: Replace with button type="button" or add role="radio" with tabIndex, onKeyDown (Enter/Space), aria-checked. Use role="radiogroup" on wrapper.
- Command: /impeccable audit

**[P2] No Bulk Booth Import**
- What: Only one-at-a-time modal entry. 200 booths = approximately 1,000 individual interactions.
- Why it matters: Exhibition organizers universally manage booth rosters in Excel/CSV. The absence of import makes the booth manager unusable for large-scale events.
- Fix: Add CSV import. Accept BoothNumber, HallName, CompanyName, Industry, Website. Preview validation table. Batch-POST to /api/organizer/booths/batch.
- Command: /impeccable optimize

**[P3] AI Reports Hub Exposes ML Jargon to Operations Managers**
- What: Model selector exposes "Context: 128k tokens," "DeepSeek V4 Pro 0813," technical tier labels to event operations managers. JSON Schema Data tab is opaque to non-technical users.
- Why it matters: If organizers can't navigate the model selector, the multi-model differentiator is wasted.
- Fix: Outcome-oriented model labels: "Best for: Speed," "Best for: Deep Analysis." Rename JSON Schema Data → Structured Metrics Export. Collapse technical specs.
- Command: /impeccable clarify

### Cognitive Load Assessment

Score: 2/8 — High cognitive load. Failed: Single focus, One-thing-at-a-time, Minimal choices, Working memory, Progressive disclosure. Passed: Chunking. Partial: Grouping, Visual hierarchy.

### Emotional Journey Map

- First Login → Dashboard: Impressed then uncertain. KPI cards with no freshness signal, phantom 85% occupancy, IDR currency in Japan.
- Event Creation: Archetype grid delight → wizard friction → publish anxiety (no confirmation).
- Booth Management: Routine competence → tedium (modal-per-booth for 50+ lots) → mild frustration (no undo on success toast).
- Day-of Scanner: Initial confidence (polished dark HUD) → operational anxiety (simulated camera, visible Quick Test Scenarios, no camera-denied error state).
- AI Analytics: Curiosity → cognitive overload (6 models before any output) → satisfaction (if streaming succeeds).

### Persona Red Flags

**Alex (Power User):** Cannot keyboard-navigate 15 archetype cards. Cannot skip wizard steps. No event templates or duplicate-from-previous-event. No keyboard shortcuts anywhere.

**Sam (Accessibility-Dependent):** Step 1 impassable — archetype grid is non-keyboard-interactive. Region picker locked. 5 select elements with unassociated labels. No focus management on step advance. Scanner mode toggle has no aria-pressed.

**Riley (Stress Tester):** 200 booth cards with no virtualization. AI report failure shows no retry button. Rapid scan storm has no request mutex — last response wins. boothOccupancy = 85 renders as real data on zero-booth accounts.

### Minor Observations

1. hover:scale-102 on LivePreviewFrame.tsx:360 — non-existent Tailwind token; hover silently fails. Change to hover:scale-105.
2. @ts-ignore on LivePreviewFrame.tsx:280 — replace with proper React.CSSProperties cast.
3. Camera HUD decorative elements (reticle, corner markers, laser) not aria-hidden — screen readers traverse them.
4. text-[9px] on CheckInScanner.tsx:638 — below WCAG legibility floor.
5. LivePreviewFrame renders hardcoded keynote speakers ("Dr. Kenji Takahashi") in a "Live Preview" — misleading after event publish.
6. No Events Management list page between dashboard and wizard — missing IA layer.
7. Dashboard "Capabilities & Pipelines" card is redundant with sidebar nav — remove.
8. "+18.4% vs last cycle" KPI delta hardcoded, not computed.
9. scanHistory key has 1-second granularity — key collisions during rapid scans.
10. Mobile topbar shows no current page name — door staff cannot orient themselves.

### Provocative Questions

1. Should the portal have Pre-Event (Planning) and Day-of (Operations) modes — activated when event start is within 24 hours?
2. Why does the AI Reports Hub require model configuration before generating anything? Default model + "Re-run with..." secondary action = value first, choice later.
3. The 15 MICE archetypes are the portal's most original concept — why are they a one-time irrevocable selection? Should they be composable (primary + up to 2 secondary archetypes)?
