---
target: the homepage
total_score: 38
max_score: 40
na_heuristics: 
p0_count: 0
p1_count: 1
timestamp: 2026-09-13T03-22-00Z
slug: src-app-locale-attendee-page-tsx
---
# Design Critique: Attendee Homepage (`src/app/[locale]/(attendee)/page.tsx`) - Search Cockpit Integrated

**Method:** dual-agent (A: a8b5383e · B: 9ec291f6)

## Design Health Score

| # | Heuristic | Score | Key Issue |
|---|-----------|-------|-----------|
| 1 | Visibility of System Status | 4 | Real-time temporal countdowns, pulsing live badge, and search query feedback |
| 2 | Match Between System and Real World | 4 | Exact hall mapping (Hall A1, Nusantara Hall 2) and transit connections |
| 3 | User Control and Freedom | 4 | Instant clear search ('X'), quick tag filters, and calendar month traversal |
| 4 | Consistency and Standards | 4 | Unified buttonVariants, 1px border tokens, zero emojis, verified Lucide icons |
| 5 | Error Prevention | 3 | Date comparison in calendar widget lacks explicit region timezone normalization |
| 6 | Recognition Rather Than Recall | 4 | Popular searches tag suggestions tailored to Indonesia, Japan, and Global editions |
| 7 | Flexibility and Efficiency of Use | 4 | **HeroSearchBar integrated**: instant keyword/venue search, popular tags, and '/' hotkey |
| 8 | Aesthetic and Minimalist Design | 3 | Section 5 Bento box still markets Organizer/Admin tools to attendees |
| 9 | Error Recovery | 4 | Resilient router fallback, clear queries, and jump-to-nearest in calendar |
| 10 | Help and Documentation | 4 | Floating AI Concierge with grounded transit, hall, and schedule prompts |
| **Total** | | **38/40** | **Excellent (Benchmark Quality)** |

## Design Specificity Verdict

**LLM Assessment:** The homepage now operates as an active **Discovery Cockpit** rather than a passive institutional brochure. The newly integrated `HeroSearchBar` seamlessly bridges the gap between the top cinematic banner and the physical hall wayfinding rail, empowering attendees to instantly search by expo title, sector, or convention center without leaving the landing view.
**Deterministic Scan:** 0 findings across all 11 homepage discovery components (`[]`, exit code 0).

## Priority Issues Remaining

### [P1] Audience Dissonance: Organizer & Admin Bento Showcase on Attendee Surface
- **What**: Section 5 devotes space to pitching Organizer tools ("Live Split-Screen Customizer", "Booth Manager") and Platform Governance audit logs to attendees.
- **Why it matters**: Attendees do not manage exhibitor booths or inspect server telemetry.
- **Fix**: Refocus bento cells toward attendee-centric value propositions: "Interactive Hall Floor Maps", "Networking & Deal-Room Passes", and "Turnstile QR Badges".
- **Suggested command**: `/impeccable clarify`
