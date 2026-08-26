# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

- **Enterprise MICE Organizers & Exhibitors (Primary Focus)**: Commercial expo organizers, conference chairs, and exhibition managers configuring multi-day conventions, managing booth spatial inventories, customizing event branding in real-time, executing fast turnstile QR admissions, and generating multi-model AI analytics reports.
- **International Trade Delegates & Attendees**: B2B buyers, conference delegates, exhibitors, and general attendees discovering events across country hubs (Indonesia, Japan, Global), checking hall timetables, managing cryptographically signed digital passes, and navigating venue campuses.
- **Venue Operators & Ecosystem Administrators**: Convention center facility managers and platform administrators curating verified hall dossiers (ceiling clearances, floor loadings, utility trenches, transit links) and auditing crawler scraper pipelines.

## Product Purpose

XPO is an institutional digital ecosystem for the global MICE (Meetings, Incentives, Conferences, and Exhibitions) industry. It unifies event discovery, venue/hall spatial topology, ticket tier booking, on-site digital badging, live organizer visual branding, and multi-model AI reporting into a single cohesive platform. Success is measured by sub-1.5s turnstile check-in speeds, seamless multi-region discovery across dedicated country editions, and automated enterprise intelligence for exhibition stakeholders.

## Positioning

Unlike generic consumer ticketing marketplaces (Eventbrite, Ticketmaster) or static convention center directory PDFs, XPO provides an integrated, multi-sided MICE operating system combining:
1. **Dedicated Country Editions** (`/id`, `/jp`, `/global`) tailored to local MICE ecosystems, currencies, and transit networks.
2. **Exact Spatial Campus Engineering**: Multi-wing campus breakdowns with technical hall engineering dossiers (floor loading $kN/m^2$, ceiling heights, freight roll-up dock clearance, and rapid rail wayfinding).
3. **Turnstile-Ready Cryptographic Badging**: HMAC-SHA256 vector passes with constant-time verification, turnstile scanner modes, and offline wallet caching.
4. **Live Visual Branding Customizer**: Side-by-side real-time typography, theme palette, and multi-device preview frames for organizers.
5. **OpenRouter Multi-Model AI Hub**: Multi-model intelligence comparing Gemini, DeepSeek, Qwen, and GPT for daily digests, sentiment feedback, and booth foot-traffic optimization.

## Operating Context

- **Convention Concourses & Gate Turnstiles**: Mobile devices operating under ambient sunlight, heavy outdoor glare, and cellular congestion inside reinforced concrete exhibition halls.
- **Organizer Operations Centers**: Multi-monitor desktop displays requiring high-density data tables, side-by-side visual customizers, and real-time check-in telemetry scanners.
- **International Trade Delegations**: Multi-day business itineraries spanning multiple halls, concurrent session tracks with simultaneous translation, and VIP buyer lounge access.

## Capabilities and Constraints

- **Capabilities**:
  - 15 specialized MICE event categories with distinct visual identities and layout components.
  - Interactive multi-month event calendar with iCalendar (`.ics`) standard export.
  - Multi-region venue directory and campus spatial explorer.
  - Cryptographic QR pass generation, 1-tap high-contrast turnstile scanner modal, and offline pass caching.
  - Live organizer visual branding customizer with real-time CSS variable injection and multi-device preview frame.
  - Multi-model AI reporting via OpenRouter supporting streaming Markdown and JSON report downloads.
- **Constraints**:
  - Strictly Next.js 15 App Router, React 19, TypeScript strict mode, Prisma ORM, Tailwind CSS, and `next-intl` internationalization.
  - Zero emojis in production code (strictly vector SVG icons from `lucide-react`).
  - Zero em-dashes (`—`) in production copy and code.
  - Modern institutional copywriting (avoid artificial AI buzzwords like "Command Center", "Archetype", or "Command & Intelligence").

## Brand Commitments

- **Tone & Voice**: Institutional, precise, authoritative, and frictionless. Copy mirrors high-profile international trade and diplomatic summit standards.
- **Visual Identity**: High contrast, crisp border radii (`rounded-2xl`, `rounded-3xl`), subdued slate surfaces, and accessible semantic palettes.
- **Iconography**: Exclusively modern vector SVGs from `lucide-react`.

## Evidence on Hand

- **Verified Venues Seed Data**: Exact hall specs and transit infrastructure for JIExpo Kemayoran, ICE BSD City, JCC Senayan, Tokyo Big Sight, Makuhari Messe, Pacifico Yokohama, and Marina Bay Sands (`src/lib/discovery/fallbackData.ts`).
- **Cryptographic Engine**: Constant-time HMAC-SHA256 pass verification suite (`src/lib/tickets/qrPass.ts`).
- **Comprehensive Test Harness**: 67 automated Vitest suites with 461 unit, integration, and stress tests (`tests/`).

## Product Principles

1. **Spatial Truth Over Generic Listings**: Every event is explicitly grounded in its exact physical hall, campus wing, and transit access route.
2. **Turnstile-Ready Reliability**: Digital passes must render instantly, work offline, and scan seamlessly on optical gate readers under direct sunlight.
3. **Live WYSIWYG Governance**: Organizers configure visual themes, typography pairings, and booth rosters with zero-latency live preview before publishing.
4. **Multi-Model Neutrality**: AI analysis leverages best-of-breed frontier models tailored to specific analytical tasks (fast digests, deep reasoning, multilingual trade synthesis).
5. **Institutional Cleanliness**: Zero visual slop, zero emojis, zero artificial jargon, and uncompromising typographic hierarchy.

## Accessibility & Inclusion

- Adherence to WCAG 2.1 AAA contrast on core admission barcodes and AA on all interactive controls.
- Full-card stretched links on discovery cards to eliminate mobile touch target failures.
- Native keyboard navigation and semantic ARIA structures across all tabs, dialogs, and drawer components.
- Multi-currency (`IDR`, `JPY`, `USD`) and multilingual (`en`, `id`, `ja`, `zh-CN`) support via `next-intl`.
