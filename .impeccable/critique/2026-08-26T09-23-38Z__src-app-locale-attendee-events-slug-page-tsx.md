---
target: the individual event page
total_score: 38
max_score: 40
na_heuristics: 
p0_count: 0
p1_count: 1
timestamp: 2026-08-26T09-23-38Z
slug: src-app-locale-attendee-events-slug-page-tsx
---
# Critique: XPO Individual Event Detail Surface

Method: dual-agent (A: 2d71b07a-41f3-4bd8-8f9a-e66f78f645d3 · B: 356f31f5-2ed5-45ab-a7bd-70359185054c)

## Design Health Score

| # | Heuristic | Score | Key Issue |
|---|-----------|:-----:|-----------|
| 1 | Visibility of System Status | **3.8/4** | Crystal-clear checkout drawer states (loading, cryptographic HMAC-SHA256 generation, instant QR preview) and live stage telemetry. |
| 2 | Match System / Real World | **4.0/4** | Flawless institutional MICE vocabulary: "RFQ Scope", "SKP / CME Credits", "Chatham House Rule", and "Bilateral Sovereign Delegation". |
| 3 | User Control and Freedom | **3.6/4** | Responsive slide-over drawers for RFQs, deal rooms, and checkout with easy backdrop dismiss; interactive SVG floor map zoom reset. |
| 4 | Consistency and Standards | **3.9/4** | Unified `EventPageShell` architecture across all 15 MICE archetypes; 100% vector SVG icons; zero emoji clutter. |
| 5 | Error Prevention | **3.6/4** | Sold-out ticket tiers are visually dimmed and keyboard-disabled; form inputs enforce proper field types. |
| 6 | Recognition Rather Than Recall | **4.0/4** | Complete benefit checklists on ticket tiers; interactive booth popover cards in the SVG floor map. |
| 7 | Flexibility and Efficiency | **3.8/4** | Deep-link anchor buttons jump directly to active modules (#tickets-section, #exhibitor-directory, #abstract-reader). |
| 8 | Aesthetic and Minimalist Design | **3.7/4** | Bespoke color harmonies per archetype (Steel blue, Indigo, Teal, Emerald, Fuchsia, Rose, Orange, Sky); clean visual hierarchy. |
| 9 | Error Recovery | **3.5/4** | Contextual inline alert callouts when pass generation or network validation encounters issues. |
| 10 | Help and Documentation | **3.8/4** | Point-of-need micro-guidance for cosplay weapon safety, Chatham House protocols, CME credit counters, and RFID wristbands. |
| **Total** | | **38/40** | **Excellent (Benchmark Quality)** |

## Design Specificity Verdict

**Verdict: Exemplary & Deeply Authored for MICE (9.6 / 10).**

The event detail surface is deeply specialized for 15 MICE archetypes, completely avoiding generic event template cliches. Each vertical restructures its operational model:
- **Industrial B2B**: Machinery specs (spindle RPM, CNC tolerances), factory-floor quotation RFQ drawers.
- **Tech Summit**: Terminal monospace aesthetics, low-latency stage livestream embeds, hackathon bounties.
- **Medical Congress**: Academic abstract reader with DOI reference indexation, 18.5 SKP / CME credit tracker.
- **Finance Forum**: Closed-door deal rooms, Chatham House Rule protocols, KYC Level-3 badges.
- **Pop Culture**: Weapon prop safety rules (foam/EVA permitted, live steel banned), autograph & photo-op reservations.
- **Music Festival**: Multi-stage sensor crowd meters, 3-step RFID wristband guide.
- **Government Summit**: High-security protocol briefings, bilateral audience memorandums.
- **Luxury Retreat**: Curated excursion itineraries, Mercedes-Benz V-Class chauffeur inclusion cards.

**Deterministic Scan Findings**:
- 0 primary AI slop anti-patterns (zero side-tabs, zero gradient text, zero bounce easing).
- Optical contrast ratios exceeding 10:1 to 16:1 across all hero scrims and badge pairings.
- 0 critical defects; 9 minor instances of sub-11px micro-text (`text-[10px]`) across secondary badges and checkout hashes.

## Overall Impression

The individual event detail surface is a benchmark-grade, multi-sided enterprise MICE experience. The polymorphic archetype engines deliver authentic industry utility without superficial skinning. Bringing the interactive floor map preview into the pre-booking shell and standardizing the 9 instances of `text-[10px]` will achieve total design perfection.

## What's Working

1. **Polymorphic Archetype Engines (`src/components/themed/archetypes/`)**: Deeply tailored data models for every MICE vertical rather than generic text blocks.
2. **Single-Surface Checkout Flow (`TicketCheckoutDrawer.tsx`)**: In-page slide-over drawer preserves conversion momentum with instant HMAC-SHA256 cryptographic pass issuance.
3. **Ergonomic Sticky Mobile Pass Bar (`EventPageShell.tsx`)**: Anchors lowest tier price and 1-tap pass reservation within thumb reach on mobile viewports.

## Priority Issues

### [P1] Floor Map & Day-of Guide Integration in Public Event Shell
- **Location**: `src/components/themed/EventPageShell.tsx`
- **Why it matters**: `HallFloorMap` and `InteractiveGuidebook` are currently accessible mainly from the post-booking ticket pass view (`/my-tickets/[bookingId]`). Prospective delegates researching an event cannot inspect the SVG floor plan prior to purchasing a pass.
- **Fix**: Embed an interactive "Venue Hall Floor Map & Day-of Perks" preview section or tab directly within `EventPageShell.tsx`.
- **Suggested Command**: `/impeccable layout`

### [P2] Standardize Sub-11px Micro-Badges (`text-[10px]`)
- **Location**: `TechDevSummitView.tsx`, `MedicalSymposiumView.tsx`, `TicketCheckoutDrawer.tsx`, `MusicFestivalView.tsx`
- **Why it matters**: 9 instances of `text-[10px]` fall below the 11px minimum legibility floor documented in `DESIGN.md`.
- **Fix**: Standardize all sub-11px micro-labels to `text-[11px] font-semibold` or `text-xs`.
- **Suggested Command**: `/impeccable typeset`

### [P2] Mobile Viewport Bottom Stacking & Main Content Padding
- **Location**: `src/components/themed/EventPageShell.tsx`
- **Why it matters**: On mobile viewports (`< 768px`), the fixed bottom booking bar (`fixed bottom-0 z-40`) can crowd footer links and floating concierge controls without sufficient bottom padding.
- **Fix**: Ensure the container uses `pb-24 md:pb-12` and floating concierge elements maintain `bottom-20 md:bottom-6`.
- **Suggested Command**: `/impeccable layout`

### [P3] Autocomplete Attributes on Checkout & RFQ Forms
- **Location**: `src/components/tickets/TicketCheckoutDrawer.tsx` & archetype RFQ drawers
- **Why it matters**: Attendees booking passes on mobile in transit benefit from browser autofill.
- **Fix**: Add `autoComplete="name"`, `autoComplete="email"`, and `autoComplete="organization"` attributes to all drawer form inputs.
- **Suggested Command**: `/impeccable clarify`

## Persona Red Flags

- **Alex (VIP Delegate / Investment Partner)**: Enjoys clean Chatham House protocols and pitch decks, but deal-room booking drawer currently lacks a 1-click `.ics` calendar export.
- **Jordan (First-Time Attendee)**: Gets hall and date info immediately, but venue transit connection info (`transitInfo`) should be highlighted in the hero quick specs strip.
- **Casey (Mobile Attendee Booking in Transit)**: Loves the sticky bottom bar, but form inputs lack `autoComplete` attributes.
- **International Trade Speaker**: Multi-track agenda is clean, but speaker profiles lack expandable bio popovers.

## Minor Observations

1. Zero emoji violations across all 15 archetype views.
2. Dynamic CSS variables (`--archetype-primary`, `--archetype-accent`) give each event a distinct atmospheric glow while preserving uniform accessibility contrast.

## Questions to Consider

1. Should the interactive SVG hall map support a 2-point walking distance & routing line between the main registration gate and specific exhibitor booths?
2. Should the sticky mobile pass bar detect existing ticket reservations in `localStorage`/session and swap "Book Pass" for "Show My QR Pass" upon arrival?
