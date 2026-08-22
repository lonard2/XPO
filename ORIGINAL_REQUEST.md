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

## Follow-up — 2026-08-21T17:19:08+07:00

Complete the end-to-end development of the remaining milestone phases (Phases 8 to 12) for the XPO (MICE Digital Ecosystem) platform, delivering production-ready RBAC authentication, an interactive Organizer Portal with live branding customizer, an OpenRouter multi-model AI analytics suite, an Admin Governance crawler pipeline, and production hardening with PWA and E2E verification.

Working directory: /Users/lonard/Desktop/XPO
Integrity mode: development

## Requirements

### R1. Phase 8: Multi-Role Authentication & Access Control (RBAC)
- Implement session management and authentication dialog (AuthModal.tsx) with quick-switch dev role simulation (Attendee, Organizer, Admin).
- Build route protection middleware guarding /[locale]/(organizer) and /[locale]/(admin) with role-based access control.
- Author educational guide: docs/guides/phase-08-rbac-authentication-and-security.md.

### R2. Phase 9: Organizer Portal (Event Wizard, Live Customizer & Door QR Scanner)
- Build Organizer Dashboard (app/[locale]/(organizer)/dashboard/page.tsx) with registration velocity metrics, revenue cards, and active event lists.
- Build multi-step Event Creation Wizard (app/[locale]/(organizer)/events/new/page.tsx).
- Implement real-time side-by-side Visual Branding Customizer (app/[locale]/(organizer)/events/[id]/customizer/page.tsx) with LivePreviewFrame.tsx and responsive viewport toggle (Desktop, Tablet, Mobile).
- Build Booth & Tenant Manager (app/[locale]/(organizer)/booths/page.tsx) with hall assignment and interactive search.
- Build Door QR Scanner simulation (src/components/organizer/CheckInScanner.tsx) with HMAC-SHA256 signature verification, double-scan prevention, and sound/haptic feedback.
- Author educational guide: docs/guides/phase-09-organizer-portal-and-live-customizer.md.

### R3. Phase 10: AI Multi-Model Intelligence Suite (OpenRouter Analytics)
- Implement OpenRouter multi-model client (src/lib/ai/openrouter.ts) supporting:
  - google/gemini-3.5-flash-lite (Ultra-fast digests)
  - google/gemini-3.7-flash (Balanced multi-modal analysis)
  - deepseek/deepseek-v4-pro-0813 (Deep reasoning & anomaly detection)
  - qwen/qwen3.7-plus (Multilingual trade synthesis)
  - openai/gpt-5.6-luna (Executive reporting)
  - google/gemma-4-26b-a4b-it (Edge analytics)
- Build AI Reports Hub (app/[locale]/(organizer)/events/[id]/ai-reports/page.tsx) with model selector, report type cards (Daily Executive Digest, Sentiment & Feedback Synthesis, Foot-Traffic & Booth Optimization), streaming markdown reader, and structured JSON metrics.
- Author educational guide: docs/guides/phase-10-ai-multi-model-reporting-suite.md.

### R4. Phase 11: Admin Governance, Venue Aggregator & Ingestion Pipeline
- Build Admin Dashboard (app/[locale]/(admin)/dashboard/page.tsx) with global platform metrics and audit log activity feed.
- Build Global Venue Directory Manager (app/[locale]/(admin)/venues/page.tsx) with exact hall creation, GPS coordinate mapping, and transit guide editor.
- Build automated MICE event crawler pipeline (src/lib/crawler/venueScraper.ts) with scheduled batch ingestion, deduplication, and verification queue.
- Author educational guide: docs/guides/phase-11-admin-governance-and-crawler.md.

### R5. Phase 12: Production Hardening, PWA Manifest, SEO Schema & E2E Testing
- Implement Progressive Web App (PWA) manifest (public/manifest.json, app/manifest.ts) and offline service worker.
- Implement Schema.org JSON-LD MICE event metadata (src/lib/seo/jsonLd.ts).
- Write automated E2E and integration tests verifying discovery, checkout, QR validation, live customizer, and multi-model AI reports.
- Author educational guide: docs/guides/phase-12-pwa-seo-hardening-and-e2e.md.
- Keep CHECKLIST.md and README.md updated with verification logs.

## Acceptance Criteria

### Automated Verification
- [ ] npm run type-check passes with 0 TypeScript errors.
- [ ] npm test runs full Vitest suite (unit, integration, QR crypto, zero-emoji compliance) with 100% pass rate.
- [ ] npm run build generates 100% clean Next.js 15 production build without errors.
- [ ] Zero-emoji audit confirms 100% vector SVG icons from lucide-react.

### Functional Verification
- [ ] RBAC middleware redirects unauthorized access attempts while permitting authorized roles.
- [ ] Organizer live customizer synchronizes theme colors, typography, and section visibility instantly in the side-by-side preview frame.
- [ ] Door QR Scanner accepts valid HMAC-SHA256 signatures, transitions ticket status to CHECKED_IN, and rejects duplicate scans.
- [ ] AI Multi-Model Suite executes requests against OpenRouter models with fallback handling and structured metric display.
- [ ] Admin venue manager creates venues with exact halls and GPS coordinates, and event crawler ingests upcoming schedules.
- [ ] PWA manifest and JSON-LD structured data validate cleanly.
- [ ] Educational guides docs/guides/phase-08 through phase-12 are fully written and comprehensive.
