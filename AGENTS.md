# XPO System & Coding Agent Guidelines

Welcome to the **XPO (MICE Digital Ecosystem)** codebase. This document establishes the core rules, architectural standards, conventions, and operational guidelines for all AI agents and contributors working in this repository.

---

## 1. Project Mission & Identity

XPO is a next-generation, multi-sided MICE (Meetings, Incentives, Conferences, and Exhibitions) digital ecosystem encompassing:
* **Attendee Experience**: Event discovery, dedicated country editions (**Indonesia**, **Japan**, **Global**), venue & hall mapping, 9 MICE event category experiences, ticket checkout, interactive day-of guidebooks & perks, opt-in floating AI Event Concierge, and interactive event calendar.
* **Organizer Portal**: Event creation wizard, live visual branding customizer (real-time preview), booth/tenant manager, attendee QR check-in scanner, and multi-model AI analytics reports.
* **Admin Governance**: Venue directory management with exact hall indexing, automated event crawler/scraper pipeline, verification, and audit logs.
* **Settings Suite**: Custom UI/UX preferences (theming, font engine, expressive animations, density, AI assistant toggle) and Account profiles.

---

## 2. Coding Notes & Standards

1. **Maintain active codebase hygiene without placeholder stubs**: Implement real, functional logic and production-ready data pipelines; do not leave empty mockup stubs or non-functional placeholders.
2. **Avoid using emoji in production code or artificial AI quirks**: Strictly use vector SVG icons from `lucide-react`. Maintain an institutional, modern, ultra-clean aesthetic without emojis or conversational quirks.
3. **Provide comprehensive testing across unit, UI, and integration layers**: Every phase must contain automated unit and integration tests verifying correctness, hash validation, theming logic, and route behavior.
4. **Always diagnose issues with concrete evidence before applying fixes**: Investigate root causes and inspect logs/types before applying targeted, minimal code modifications.
5. **Use the latest stable versions of libraries and frameworks**: Next.js 15+ App Router, React 19, TypeScript strict mode, Prisma ORM, and Tailwind CSS.
6. **Avoid overengineering; prioritize simple, robust implementations**: Favor standard library utilities, direct component compositions, and clean modular services over speculative abstractions.
7. **Humanized, institutional copywriting**: Avoid artificial AI jargon (e.g. "Command & Intelligence", "Command Center", "Archetype"). Use professional industry terms: "Organizer Portal", "Event Management Hub", "Event Categories", "Attendee Perks & Guidebook".
8. **Maintain a concise and informative `README.md`**: Keep documentation up-to-date, clear, and actionable.

---

## 3. Responsive & Adaptive Multi-Device UX Guidelines

All three portals (Attendee, Organizer, and Admin) must be fully responsive and adapt gracefully to device viewports:

### A. Mobile Interface (`< 768px`):
* **Bottom Navigation & Thumb-Zone Ergonomics**: Core navigation tabs anchored to the bottom for single-handed mobile use.
* **Clutter-Free Top Banner**: Mobile-optimized hero card with distinct separation between imagery and textual metadata, ensuring zero clashing or text crowding.
* **Sticky Action Drawer**: Single-click "Book Pass" / "View Pass" sticky bottom bar on event pages.
* **Touch Optimization**: Minimum touch target size of 44x44px. Full-width swipeable cards and bottom-sheet drawers instead of bulky modals.
* **Compact Data Density**: Simplified cards with essential tags; expandable accordion rows for event agendas.

### B. Tablet Interface (`768px - 1024px`):
* **Hybrid Dual-Pane Layout**: Collapsible sidebars, 2-column event discovery grids, and split-view agenda schedules.
* **Balanced Density**: Touch-friendly buttons paired with expanded tabular data for exhibitor lists and ticket tiers.

### C. Desktop & Large Displays (`> 1024px / 1280px / 1600px+`):
* **Expansive Full-Width Layout**: No cramped or awkward empty spaces on ultrawide monitors. Utilize responsive multi-column grids (`xl:grid-cols-4`, `2xl:grid-cols-5`, fluid containers up to `1800px`).
* **Side-by-Side Live Preview**: Real-time visual branding customizer with live preview frame and device toggle.
* **High-Density Data Grids & Timetables**: Comprehensive faceted filter bars, multi-stage timetables, interactive floor maps, and multi-model AI comparison panes.

---

## 4. Regional Country Editions Architecture

XPO is organized as **distinct dedicated country editions**, not just a single all-in-one generic portal:
1. **Indonesia Edition (`/id`)**: Dedicated to Indonesian MICE ecosystems. Defaults to Indonesian venues (**JIExpo Kemayoran**, **ICE BSD City**, **JICC Senayan**, **NICE PIK 2**, **GBK Complex**, **JIS**), Indonesian Rupiah (IDR) currency, and localized event spotlights.
2. **Japan Edition (`/jp`)**: Dedicated to Japan MICE ecosystems. Defaults to Japanese venues (**Tokyo Big Sight**, **Makuhari Messe**, **Pacifico Yokohama**), Japanese Yen (JPY) currency, and Tokyo/Kanto event spotlights.
3. **Global Edition (`/global`)**: Dedicated to international conventions (**Marina Bay Sands Expo**, **Messe Frankfurt**, **ExCeL London**, **McCormick Place**), USD currency, and cross-border trade showcases.

### Major Venues Near-Upcoming Quick-Glance:
Directly below the top banner carousel on each country edition, a dedicated **"Happening at Major Venues"** section displays key venues in that country, each highlighting **up to 3 current and near-upcoming events** with exact hall names (`Hall A1`, `Nusantara Hall 2`), dates, and direct pass booking.

---

## 5. Event Categories & Calendar Features

### A. 9 Specialized Event Categories:
Each category features custom visual styling, distinct icon pairings, and specialized layout components:
1. **Industrial & Manufacturing B2B Expo** (Steel blue, machinery specs, RFQ quote drawer, exhibitor roster)
2. **Tech, AI & Developer Summit** (Indigo, multi-track keynotes, GitHub tags, livestream embeds)
3. **Medical, Healthcare & Scientific Symposium** (Teal, peer-reviewed abstract reader, CME credit counter)
4. **Financial, FinTech & Investor Forum** (Emerald/Gold, deal-room booking, pitch decks, VIP tiers)
5. **Pop Culture, Comic Con & Gaming Expo** (Rose/Magenta, cosplay guidelines, creator alley, merch list)
6. **Music Festival & Arena Concert** (Purple, real-time stage timeline, crowd meter, wristbands)
7. **Mega Exposition & Multi-Pavilion Fair** (Crimson, pavilion directory, fireworks schedule, promo radar)
8. **Government, Policy & Diplomatic Summit** (Navy/Bronze, protocol briefings, bilateral schedules)
9. **Incentive & Luxury Corporate Retreat** (Warm stone, itinerary planner, gala seating, wellness tracks)

### B. Interactive Event Calendar:
* **Homepage Quick-Calendar**: Interactive month/week selector filtering events occurring on specific days.
* **Dedicated Calendar Page (`/[locale]/calendar`)**: Comprehensive multi-month view, category/hall filters, and iCal / Google Calendar exports.

---

## 6. Multi-Model OpenRouter AI Standard

* AI capabilities are routed through OpenRouter (`OPENROUTER_API_KEY`).
* Supported models:
  * `google/gemini-3.5-flash-lite` (Fast attendee concierge & real-time digests)
  * `google/gemini-3.7-flash` (Balanced multi-modal reporting)
  * `deepseek/deepseek-v4-pro-0813` (Deep reasoning & anomaly detection)
  * `qwen/qwen3.7-plus` (Multilingual & trade synthesis)
  * `openai/gpt-5.6-luna` (Executive reporting)
  * `google/gemma-4-26b-a4b-it` (Edge analytics)
* Always implement error handling, schema parsing, and graceful fallbacks for LLM calls.

---

## 7. Sub-Agent Orchestration & Team Roster

The project utilizes specialized sub-agents working as an integrated engineering team:

| Agent Name | Role | Core Focus Area |
|---|---|---|
| `tech-lead` | **Technical Lead & Architect** | System architecture, wide-screen responsiveness, country edition routing, review gates |
| `backend-engineer` | **Senior Backend Engineer** | Prisma data modeling, venue/hall seeding, API routes, RBAC auth middleware, cryptographic QR pass hashing, crawler pipeline |
| `frontend-engineer` | **Senior Frontend & UI/UX Engineer** | Accessible React components, 9 MICE category view engines, full-width responsive UX, banner contrast, next-intl i18n |
| `ai-engineer` | **AI & Intelligence Systems Engineer** | OpenRouter multi-model gateway, Attendee AI Concierge, Organizer analytics reports, structured Zod schemas |
| `qa-engineer` | **Lead QA & Automation Engineer** | Vitest unit/integration test suites, QR verification tests, a11y checks, zero-emoji compliance audits, E2E user journeys |
| `docs-engineer` | **Documentation & Educational Engineer** | Phase-by-phase educational guides (`docs/guides/phase-XX-*.md`), architectural diagrams, CHECKLIST.md & README.md maintenance |

---

## 8. Operational Workflow for Phased Development

For every phase:
1. **Reference the Checklist**: Check `CHECKLIST.md` for current phase tasks and dependencies.
2. **Implement & Verify**: Write clean, modular TypeScript code and add corresponding unit/integration tests.
3. **Draft Learning Guide**: Write a detailed, educational Markdown guide in `docs/guides/phase-XX-*.md` covering architectural rationale, algorithms, and key code patterns.
4. **Update Checklist**: Mark completed items in `CHECKLIST.md` with timestamps and test verification receipts.
