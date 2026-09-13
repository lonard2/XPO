# Design Critique: Organizer Event Launch Wizard
**Target**: `src/app/[locale]/(organizer)/events/new/page.tsx`  
**Slug**: `src-app-locale-organizer-events-new-page-tsx`  
**Timestamp**: 2026-09-13T10:24:32Z  
**Method**: dual-agent (A: 4e6afd59-7d9e-4b1f-b5ae-e49a66d26bc3 · B: bf34c003-0e6f-4d1a-82eb-212e060963e7)  
**Mode**: Operate (Exhibition Directors, Convention Chairs, Event Operations Staff creating high-stakes MICE events)  

---

## 1. Design Health Score

| # | Heuristic | Score | Key Issue |
|---|---|:---:|---|
| 1 | Visibility of System Status | 2/4 | Silent draft auto-saving with zero "Draft saved" timestamps; no step completion telemetry during submission. |
| 2 | Match System / Real World | 2/4 | Professional MICE terminology; but restricts expos to a single hall dropdown, and new tiers default to 1,000,000 across all currencies ($1M USD). |
| 3 | User Control and Freedom | 2/4 | Step tracker allows backward navigation; but forward navigation is rigidly sequential, and "Discard Draft" lacks confirmation. |
| 4 | Consistency and Standards | 3/4 | Clean token borders and cards; radiogroup arrow navigation works, but illegal `<Link><Button>` nesting exists in attendee barrier. |
| 5 | Error Prevention | 1/4 | Zero hall capacity validation (allows 15k tickets in a 3.5k hall); allows past dates; auto-slug overwrites manual slugs on title edits. |
| 6 | Recognition Rather Than Recall | 3/4 | 15 archetype cards display full tokens and tags; but Step 3 hides selected hall capacity, forcing recall during tier sizing. |
| 7 | Flexibility and Efficiency | 1/4 | No event cloning from past editions; no tier presets; no CSV tier import; no keyboard shortcuts (Cmd+Enter to advance). |
| 8 | Aesthetic and Minimalist Design | 3/4 | Modern institutional typography and clean badges; but inputs are pre-filled with hardcoded strings forcing manual deletion. |
| 9 | Error Recovery | 2/4 | Top alert displays generic error; but individual failing inputs lack red borders, aria-invalid, and viewport scroll placement. |
| 10 | Help and Documentation | 1/4 | Realistic placeholder strings; but zero contextual help or tooltips explaining MICE scales, gate perks, or hall guidelines. |
| **Total** | | **20/40** | **Needs Work (50.0%)** |

---

## 2. Design Specificity Verdict

- **LLM Assessment**: The event wizard contains authentic MICE engineering foundations (15 specialized MICE category archetypes with tailored color tokens, badge treatments, and industry-specific metadata in `src/lib/theming.ts`; dedicated regional country hubs for Indonesia, Japan, and Global filtering authentic convention centers like JIExpo Kemayoran, ICE BSD City, Tokyo Big Sight, and Marina Bay Sands; and multi-currency ticket tier structures in IDR, JPY, and USD). However, the UI implementation treats this domain model like a generic linear form. Crucially, the dedicated multi-device visual simulator `LivePreviewFrame.tsx` (which supports live desktop, tablet, and mobile views with injected CSS tokens) is completely missing from Step 4, forcing organizers to blind-publish without verifying their layout. Furthermore, real MICE exhibitions occupy multi-hall campuses, yet the form restricts organizers to a single native `<select>` hall option.
- **Deterministic & Evidence Scan**: Mechanical detection and manual structural audit identified 19 concrete defect categories:
  - 1 critical HTML5 nesting violation: `<Link>` directly wrapping `<Button>` in the attendee RBAC barrier ([page.tsx:521-525](file:///Users/lonard/Desktop/XPO/src/app/[locale]/(organizer)/events/new/page.tsx#L521-L525)).
  - 1 data-loss race condition: Mount auto-save effect overwrites existing localStorage drafts with default strings before restoration ([page.tsx:210-254](file:///Users/lonard/Desktop/XPO/src/app/[locale]/(organizer)/events/new/page.tsx#L210-L254)).
  - 6 touch target violations under 44px: draft restore/discard buttons at 36px ([page.tsx:564](file:///Users/lonard/Desktop/XPO/src/app/[locale]/(organizer)/events/new/page.tsx#L564)), step tracker pills at 36px ([page.tsx:608](file:///Users/lonard/Desktop/XPO/src/app/[locale]/(organizer)/events/new/page.tsx#L608)), add/remove tier buttons at 36px ([page.tsx:957](file:///Users/lonard/Desktop/XPO/src/app/[locale]/(organizer)/events/new/page.tsx#L957)), color swatch inputs at 36px ([page.tsx:1064](file:///Users/lonard/Desktop/XPO/src/app/[locale]/(organizer)/events/new/page.tsx#L1064)), and wizard navigation buttons at 40px ([page.tsx:1159](file:///Users/lonard/Desktop/XPO/src/app/[locale]/(organizer)/events/new/page.tsx#L1159)).
  - 1 heading hierarchy skip: main title `<h1>` jumps directly to `<h3>` on all card headers with no `<h2>` parent level ([page.tsx:542-647](file:///Users/lonard/Desktop/XPO/src/app/[locale]/(organizer)/events/new/page.tsx#L542-L647)).
  - 1 eyebrow kicker placed above the main `<h1>` ([page.tsx:536-544](file:///Users/lonard/Desktop/XPO/src/app/[locale]/(organizer)/events/new/page.tsx#L536-L544)).
  - 1 contrast failure: default archetype primary color `#ca8a04` with white text yields 2.96:1 contrast ratio, failing WCAG AA 4.5:1.
  - 1 error accessibility defect: top error alert lacks `role="alert"` and `aria-live="assertive"`, failing inputs lack `aria-invalid="true"`, and the viewport does not scroll to errors ([page.tsx:636-641](file:///Users/lonard/Desktop/XPO/src/app/[locale]/(organizer)/events/new/page.tsx#L636-L641)).
  - 1 dynamic row accessibility gap: ticket tier list additions and deletions lack an `aria-live="polite"` container ([page.tsx:964-1042](file:///Users/lonard/Desktop/XPO/src/app/[locale]/(organizer)/events/new/page.tsx#L964-L1042)).
  - 1 semantic button content model flaw: archetype selection `<button>` elements contain block-level `<div>` tags and `<Badge>` components ([page.tsx:762-818](file:///Users/lonard/Desktop/XPO/src/app/[locale]/(organizer)/events/new/page.tsx#L762-L818)).
  - 7 unused imports in `events/new/page.tsx` (`PlusCircle`, `Calendar`, `Layers`, `Compass`, `CardHeader`, `CardTitle`, `CardContent`).
  - 6 unused imports in `LivePreviewFrame.tsx` (`ExternalLink`, `CheckCircle2`, `ArrowRight`, `Button`, `Card`, `BrandingConfig`).
  - 3 type safety bypasses (`venuesList: any[]`, `val: any`, and `(h: any)`).

---

## 3. Cognitive Load Assessment (8-Item Checklist)

1. **Single Focus**: Moderate. Steps isolate logical domains, but Step 1 combines general metadata with 15 archetype cards in a very long vertical layout.
2. **Chunking**: Strong. Inputs are cleanly grouped into titled sub-cards (`Event Details & Scale`, `Hosting Venue & Hall Allocation`).
3. **Grouping**: Strong. Regional country hubs (ID, JP, Global) and venue/hall selectors are grouped logically.
4. **Visual Hierarchy**: Strong. Follows `DESIGN.md` rules with high-contrast section titles, muted helper text, and clear primary actions.
5. **One-Thing-at-a-Time**: Moderate. Step 1 requires both text entry and archetype selection before advancing.
6. **Minimal Choices**: Weak. All 15 MICE archetypes are displayed simultaneously without category clustering (B2B Trade vs Consumer vs Summit).
7. **Working Memory**: Weak. When configuring pass tier capacities on Step 3, the selected hall capacity from Step 2 is not visible in the viewport, forcing organizers to remember hall capacity limits.
8. **Progressive Disclosure**: Moderate. Venue changes update the hall dropdown, but advanced ticketing settings (early-bird windows, refund policies) are missing entirely.

---

## 4. Emotional Journey Map

```
Emotional
Valence
  +2 |                                            [Anticipation]
     |                                              Review &
  +1 |                  [Confidence]                Summary
     |   [Curiosity]     Venue & Hall                  *
   0 |     Load *             *                       / \
     |         \             / \                     /   \
  -1 |          *           /   *                   /     * [Disappointment]
     |     [Frustration]   /  [Anxiety]            /       Blind Publish
  -2 |     Dirty State    /   Capacity Blindspot  /        No Live Preview
     |     Pre-filled    /                       /
  -3 |                  /                       /
     +------------------------------------------------------------>
       Step 1 (Meta)   Step 2 (Venue)   Step 3 (Passes)  Step 4 (Launch)
```

1. **Initial Load (Curiosity to Frustration)**: Organizers enter ready to create an event, but find all fields pre-populated with hardcoded dummy data for an Indonesian battery expo. They must manually clear four text fields.
2. **Archetype Selection (Tactile Confidence)**: Picking between the 15 MICE categories is responsive, with live color dots and smooth arrow-key navigation.
3. **Venue & Hall Mapping (Operational Clarity)**: Selecting country hubs (Indonesia, Japan, Global) dynamically updates authentic convention centers and hall lists with capacity badges.
4. **Ticket Tier Setup (Anxiety & Friction)**: Clicking "Add Ticket Pass Tier" defaults to 1,000,000 currency units (e.g. $1,000,000 USD). Organizers worry about over-allocating seats because the screen hides physical hall limits.
5. **Branding & Review (Confusion to Disappointment)**: Step 4 displays two raw hex pickers and a basic text summary card. The promised live multi-device visual preview is completely absent, forcing a blind publish into the database.

---

## 5. What is Working

1. **Accessible 15-Archetype Selection Engine**: Full WAI-ARIA `radiogroup` and `radio` implementation with dual-axis keyboard navigation (`ArrowLeft`, `ArrowRight`, `ArrowUp`, `ArrowDown`) and automatic CSS token synchronization.
2. **Country Hub Cascade Architecture**: Grounding event creation in regional MICE hubs (Indonesia `/id`, Japan `/jp`, Global `/global`) provides instant venue and hall filtering with authentic convention center names.
3. **Draft Recovery Notification Architecture**: Persistent local draft storage with a non-intrusive resume notification banner allows operations staff to recover uncompleted drafts after browser interruptions.

---

## 6. Priority Issues (P0 to P3)

- **[P0] Missing Live Preview Frame in Step 4**
  - *Why it matters*: `LivePreviewFrame.tsx` provides multi-device (Desktop, Tablet, Mobile) WYSIWYG previews of banners, agendas, and ticket tiers. Omitting it forces organizers to blind-publish unverified event pages.
  - *Fix*: Embed `LivePreviewFrame` in a 2-column split layout on Step 4 (branding inputs on the left, live preview on the right).
  - *Suggested command*: `/impeccable layout`

- **[P0] Draft Persistence Auto-Save Overwrite on Mount**
  - *Why it matters*: The auto-save `useEffect` runs on initial mount with default strings, overwriting previously saved drafts before the user can click "Resume Draft".
  - *Fix*: Add an `isInitialized` ref guard to prevent writing to `localStorage` until initial draft checking has completed.
  - *Suggested command*: `/impeccable harden`

- **[P0] Illegal Interactive Nesting in Attendee RBAC Barrier**
  - *Why it matters*: `<Link href="...">` wraps `<Button>` at lines 521-525, generating invalid `<a href><button>` HTML that violates W3C standards and breaks screen reader navigation.
  - *Fix*: Replace `<Link><Button>` with `<Link href="..." className={buttonVariants({ variant: "outline" })}>`.
  - *Suggested command*: `/impeccable polish`

- **[P1] Hall Capacity vs Ticket Pass Allocation Safeguard**
  - *Why it matters*: Organizers can configure unlimited ticket pass capacities exceeding physical hall limits without any warning or error, creating safety and logistics risks.
  - *Fix*: Calculate `totalCapacity = ticketTiers.reduce((acc, t) => acc + t.capacity, 0)` and render a capacity allocation progress indicator with an amber warning when `totalCapacity > hallCapacity`.
  - *Suggested command*: `/impeccable clarify`

- **[P1] Sub-44px Touch Targets Across Interactive Controls**
  - *Why it matters*: Draft restore/discard buttons (36px), step navigation pills (36px), tier add/remove buttons (36px), color pickers (36px), and wizard navigation buttons (40px) fail WCAG 2.5.5 and cause miss-taps.
  - *Fix*: Upgrade all interactive buttons and controls to `min-h-[44px]`.
  - *Suggested command*: `/impeccable adapt`

- **[P1] Eyebrow Kicker, Heading Skips, and Alert Accessibility**
  - *Why it matters*: Eyebrow kicker sits before `<h1>`, card headings skip from `<h1>` directly to `<h3>`, error alerts lack `role="alert"`, and ticket tier mutations lack `aria-live`.
  - *Fix*: Remove kicker, use proper `<h2>` card headers, add `role="alert"` and `aria-live="assertive"` to errors, and wrap the tier list in `aria-live="polite"`.
  - *Suggested command*: `/impeccable typeset`

- **[P2] Destructive Auto-Slug Regeneration & Pre-Filled Dummy Inputs**
  - *Why it matters*: Custom manual slugs are overwritten whenever the title changes, and pre-filled dummy strings force high-volume staff to clear fields manually.
  - *Fix*: Add `isSlugDirty` tracking to preserve custom slugs, and initialize form inputs to empty strings with clean placeholders.
  - *Suggested command*: `/impeccable polish`

---

## 7. Persona Red Flags

- **Alex (Power User / High-Volume Exhibition Director)**: Must delete 5 pre-populated fields on every event run; cannot clone previous annual editions; cannot press Cmd+Enter to advance; adding tiers defaults to 1,000,000 across all currencies.
- **Sam (Accessibility-Dependent Staff)**: Inactive steps are disabled `<button>` elements with no step index announcements; ticket tier additions and removals are silent (no `aria-live`); validation errors are not announced via `role="alert"` and focus is not moved to failing inputs.
- **Riley (Stress Tester / Edge-Case Organizer)**: Opening a second tab destroys stored drafts due to mount auto-save race; currency can be mismatched across tiers for the same event; ISO date serialization without UTC normalization causes off-by-one day display errors in Tokyo timezone (+9).

---

## 8. Minor Observations & Provocative Questions

1. **Color Hex Validation**: Manual hex input accepts invalid hex strings without error checking.
2. **Single Hall UI Labeling**: Falls back to "Main Exhibition Complex" without explaining whether hall assignment is pending.
3. **Provocative Question 1**: Why is the Live Preview treated as an afterthought rather than the primary workspace throughout the wizard?
4. **Provocative Question 2**: Why limit an exhibition to a single hall when real MICE events occupy multi-hall campuses?
5. **Provocative Question 3**: Why not generate ticket pass tiers automatically from the selected Archetype (e.g., CME passes for Medical, deal-room passes for Finance)?
