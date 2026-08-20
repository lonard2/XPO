# Original User Request

## Initial Request — 2026-08-20T21:22:16+07:00

You are the Lead Project Orchestrator for XPO (MICE Digital Ecosystem).

Working directory: /Users/lonard/Desktop/XPO
Workspace Root: /Users/lonard/Desktop/XPO
Reference: See AGENTS.md, CHECKLIST.md, and README.md.

Mission:
Build out the complete multi-sided XPO (MICE Digital Ecosystem) platform across Attendee, Organizer, and Admin portals, supporting localized regional hubs (Indonesia, Japan, Global), 9 MICE category archetypes, ticket checkout with SVG QR passes, event day guidebooks, UI/UX settings (fonts & expressive animations), opt-in AI Concierge, Organizer Command Center, and OpenRouter Multi-Model AI Reports.

Integrity mode: development
Requested team: Full Multi-Agent Engineering Team (Tech Lead, Backend Engineer, Frontend Engineer, AI Engineer, QA Engineer, Docs Engineer)

Requirements:
- R1. Multilingual i18n & Regional Localization Hubs (next-intl, 6 languages: en, ja, zh-CN, id, de, es; 3 regional portals: /id, /jp, /global; exact venue hall mapping; localized currency/timezone formatting).
- R2. Attendee Discovery Engine & Faceted Search (hero banner carousel, regional venue spotlight cards, real-time debounced faceted search filtering by keyword, city, date range, scale, format, and MICE category archetype).
- R3. 9-Archetype Dynamic MICE Category Theming Engine (layout view engines and CSS variable theming for 9 MICE archetypes: Industrial B2B, Tech Summit, Medical Symposium, FinTech Forum, Pop Culture Expo, Music Festival, Mega Fair / Jakarta Fair, Diplomatic Summit, Incentive Retreat, with organizer branding overrides).
- R4. Ticket Checkout & Interactive Event-Day Treats Portal (multi-tier ticket checkout, tamper-proof SVG QR pass generation with cryptographic hash validation, interactive event-day digital guidebooks, and SVG hall/booth floor navigators).
- R5. UI/UX & Account Settings Suite + Attendee AI Concierge (custom typography selector: Modern Sans, Editorial Serif, Technical Mono, Atkinson Hyperlegible; font scaling slider 90%-125%; motion controller: Off, Subtle, Expressive 3D tilt/ambient glow; floating Attendee AI Concierge connected to OpenRouter).
- R6. Organizer Command Center & Multi-Model AI Reports (organizer event wizard, live split-screen branding customizer, booth/tenant manager, QR check-in scanner, OpenRouter multi-model AI reporting suite: gemini-3.5-flash-lite, gemini-3.7-flash, deepseek-v4-pro-0813, qwen3.7-plus, gpt-5.6-luna, gemma-4-26b-a4b-it).
- R7. Admin Governance & Educational Phase Guides (global venue directory manager, simulated MICE event crawler pipeline, audit logging, comprehensive educational learning guides in docs/guides/phase-XX-*.md for every phase).

Acceptance Criteria:
1. `npm run type-check` passes with 0 TypeScript errors.
2. `npm test` runs full Vitest suite (unit, integration, QR crypto, zero-emoji compliance) with 100% pass rate.
3. `npm run build` succeeds cleanly without build warnings or hydration mismatches.
4. Programmatic zero-emoji test confirms 100% vector SVG icon usage across src/.
5. All functional user journeys work seamlessly.

Coordinate your specialist sub-agents, track all items in CHECKLIST.md, author all required educational phase guides, and when complete, present a comprehensive completion report with test verification results.
