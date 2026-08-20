# Project: XPO (MICE Digital Ecosystem)

## Architecture
XPO is a next-generation multi-sided MICE (Meetings, Incentives, Conferences, and Exhibitions) digital platform connecting Attendees, Organizers, and Admins across localized regional hubs (Indonesia, Japan, Global).

### Core Architectural Layers
1. **Presentation & Viewport Layer**: Responsive App Router layout adapting seamlessly to Mobile (<768px with ergonomic bottom navigation & sticky drawer), Tablet (768-1024px with 2-column grid & split agenda), and Desktop (>1024px with multi-column command center and live split-screen preview).
2. **Localization & Routing Layer (`/[locale]`)**: Multi-locale Next.js routing with `next-intl` (supporting 6 languages: `en`, `ja`, `zh-CN`, `id`, `de`, `es`) and 3 regional portals (`/id`, `/jp`, `/global`).
3. **Domain Engine Layer**:
   - 9-Archetype Dynamic MICE Category Theming Engine (`src/lib/theming.ts`, `EventPageShell.tsx`, 9 specialized archetype views)
   - Cryptographic Ticket & QR Pass Engine (`src/lib/tickets/qrPass.ts` with HMAC-SHA256 anti-tamper signing)
   - OpenRouter Multi-Model AI Gateway (`src/lib/ai/openrouter.ts` supporting 6 models: `gemini-3.5-flash-lite`, `gemini-3.7-flash`, `deepseek-v4-pro-0813`, `qwen3.7-plus`, `gpt-5.6-luna`, `gemma-4-26b-a4b-it`)
   - Simulated Venue Calendar Scraper Pipeline (`src/lib/crawler/venueScraper.ts`)
   - RBAC Auth & Session Guard (`src/lib/auth/session.ts`)
4. **Data & Persistence Layer**: Prisma ORM with relational schema (`prisma/schema.prisma`), singleton client (`src/lib/db.ts`), and rich seed data (`prisma/seed.ts`).

---

## Feature Inventory
Every feature identified during the codebase survey and user requirements is cataloged and assigned to a milestone:

| # | Feature | Description | Milestone | Source |
|---|---|---|---|---|
| 1 | Next-intl 6-Language Dictionaries | English, Japanese, Chinese, Indonesian, German, Spanish JSON dictionaries | M1 | R1, Phase 3 |
| 2 | Regional Localization Hubs | Regional portals (`/id`, `/jp`, `/global`) with venue transit info and local currency/timezones | M1 | R1, Phase 3 |
| 3 | Localized Currency & Date Formatters | Formatters for IDR, JPY, USD, EUR, SGD and Asia/Jakarta, Asia/Tokyo, UTC dates | M1 | R1, Phase 3 |
| 4 | Language & Region Switcher UI | Accessible language dropdown and regional hub switcher components | M1 | R1, Phase 3 |
| 5 | Hero Banner Carousel | Auto-advancing banner with countdown timer, touch swipe, keyboard navigation | M2 | R2, Phase 4 |
| 6 | Venue Spotlight Section | Regional venue cards (JIExpo, ICE BSD, JCC, NICE PIK 2, Tokyo Big Sight, Marina Bay Sands) | M2 | R2, Phase 4 |
| 7 | Real-Time Faceted Search & Filters | Debounced search by keyword, city, date, format, scale, and 9 MICE archetypes | M2 | R2, Phase 4 |
| 8 | Event Discovery & Venue Hub Pages | Responsive `/events`, `/venues`, and `/venues/[slug]` detail routes | M2 | R2, Phase 4 |
| 9 | 9-Archetype Dynamic CSS Theming | Color tokens, surface styles, font pairings, and organizer branding overrides | M3 | R3, Phase 5 |
| 10 | 9 Specialized Archetype Views | Industrial B2B, Tech Summit, Medical, FinTech, Gaming, Music, Mega Expo, Diplomatic, Retreat | M3 | R3, Phase 5 |
| 11 | EventPageShell Container | Dynamic CSS variable injection and mobile sticky action bar | M3 | R3, Phase 5 |
| 12 | Event Detail Dynamic Route | `/[locale]/(attendee)/events/[slug]` rendering archetype views | M3 | R3, Phase 5 |
| 13 | Multi-Tier Ticket Checkout Drawer | Interactive tier selection, price computation, and attendee reservation | M4 | R4, Phase 6 |
| 14 | Cryptographic HMAC SHA-256 QR Pass | Tamper-proof SVG QR pass generator with security hash and signature verification | M4 | R4, Phase 6 |
| 15 | Interactive Digital Guidebook | Day-of agenda tracker, personal agenda stars, countdown timers, room change alerts | M4 | R4, Phase 6 |
| 16 | Interactive SVG Hall Floor Map | Hall selector, interactive booth pins, sponsor highlights, amenity markers | M4 | R4, Phase 6 |
| 17 | Tier Perks Gating & Wallet Route | `/[locale]/(attendee)/my-tickets` and `/[locale]/(attendee)/my-tickets/[id]` | M4 | R4, Phase 6 |
| 18 | Ticket Checkout & Verification APIs | `POST /api/tickets/checkout` and `POST /api/tickets/verify` | M4 | R4, Phase 6 |
| 19 | UI/UX Settings Suite | Typography selector (4 fonts), font scale slider (90%-125%), motion controller (3 modes) | M5 | R5, Phase 7 |
| 20 | Settings Context & Preferences | Reactive SettingsProvider with localStorage persistence and zero SSR hydration mismatch | M5 | R5, Phase 7 |
| 21 | Attendee AI Concierge FAB & Modal | Floating chat modal with quick suggestions and markdown streaming | M5 | R5, Phase 7 |
| 22 | AI Concierge API Route | `POST /api/ai/concierge` streaming route with event & venue context | M5 | R5, Phase 7 |
| 23 | RBAC Auth & Session Guards | Role guards (`ATTENDEE`, `ORGANIZER`, `ADMIN`), auth modal, dev switcher | M6 | R6, Phase 8 |
| 24 | Organizer Command Dashboard | KPI metrics (revenue, tickets sold, check-in velocity, booth occupancy) | M6 | R6, Phase 9 |
| 25 | Multi-Step Event Creation Wizard | Step-by-step form creating events with tiers, halls, and schedule items | M6 | R6, Phase 9 |
| 26 | Live Split-Screen Branding Customizer | Real-time preview frame with device toggles (Mobile/Tablet/Desktop) | M6 | R6, Phase 9 |
| 27 | Booth / Tenant Manager | Booth allocation, hall assignment, and exhibitor roster management | M6 | R6, Phase 9 |
| 28 | QR Door Check-In Scanner UI | Camera stream/manual hash input with instant cryptographic validation | M6 | R6, Phase 9 |
| 29 | OpenRouter Multi-Model AI Gateway | Unified client supporting 6 models with Zod schemas and offline test fallback | M7 | R6, Phase 10 |
| 30 | Multi-Model AI Reports Generator | Organizer UI & `POST /api/ai/reports` for digests, sentiment, and booth traffic | M7 | R6, Phase 10 |
| 31 | Admin Venue Directory Manager | Admin portal for managing global/regional venues, halls, and transit specs | M8 | R7, Phase 11 |
| 32 | Simulated Venue Scraper Pipeline | Ingestion engine (`src/lib/crawler/venueScraper.ts`) & `POST /api/crawler` | M8 | R7, Phase 11 |
| 33 | Admin Audit Logging | Centralized audit log tracking administrative changes and crawl runs | M8 | R7, Phase 11 |
| 34 | PWA Manifest & SEO JSON-LD | `public/manifest.json`, `app/manifest.ts`, Schema.org Event/Place JSON-LD generator | M8 | Phase 12 |
| 35 | Educational Learning Guides | Comprehensive markdown guides in `docs/guides/phase-01` through `phase-12` | M8 | R7 |
| 36 | Comprehensive E2E Testing Suite | Tiers 1-4 requirement-driven test suite with 100% pass rate across all journeys | M9 | Acceptance |
| 37 | Adversarial Hardening (Tier 5) | White-box stress testing, zero-emoji compliance validation, tamper security checks | M9 | Acceptance |

---

## Milestones

| # | Name | Scope | Dependencies | Status |
|---|---|---|---|---|
| M1 | Multilingual i18n & Regional Localization Hubs | Phase 3: next-intl, 6 message files, middleware, formatters, switchers, regional routes | Base (P1, P2) | DONE |
| M2 | Attendee Discovery Engine & Faceted Search | Phase 4: Carousel, spotlight cards, faceted search filters, event & venue hub routes | M1 | DONE |
| M3 | 9-Archetype Dynamic MICE Category Theming | Phase 5: Theming token engine, EventPageShell, 9 archetype views, event detail route | M1 | DONE |
| M4 | Ticket Checkout & Event-Day Treats Portal | Phase 6: HMAC-SHA256 QR passes, checkout drawer, digital guidebook, SVG floor map, APIs | M2, M3 | PLANNED |
| M5 | UI/UX Settings Suite & Attendee AI Concierge | Phase 7: Typography selector, font scaling, motion controller, AI Concierge FAB & API | M1 | PLANNED |
| M6 | Multi-Role RBAC & Organizer Command Center | Phases 8 & 9: RBAC guards, dashboard, event wizard, live customizer, booth manager, scanner | M3, M4 | PLANNED |
| M7 | OpenRouter Multi-Model AI Reporting Suite | Phase 10: Unified 6-model OpenRouter gateway, Zod schemas, organizer AI reports UI & API | M6 | PLANNED |
| M8 | Admin Governance, Crawler, PWA, SEO & Guides | Phases 11 & 12: Venue manager, scraper pipeline, audit logs, PWA, SEO JSON-LD, all phase guides | M7 | PLANNED |
| M9 | E2E Testing Track & Adversarial Coverage Hardening | Test infra, Tier 1-4 test suite (`TEST_READY.md`), Tier 5 adversarial stress testing | M1-M8 | PLANNED |

---

## Interface Contracts

### 1. `i18n` & Regional Formatting (`src/lib/i18n/formatters.ts`)
```typescript
export type SupportedLocale = 'en' | 'ja' | 'zh-CN' | 'id' | 'de' | 'es';
export type SupportedCurrency = 'IDR' | 'JPY' | 'USD' | 'EUR' | 'SGD';

export function formatCurrency(amount: number, currency: SupportedCurrency, locale: string): string;
export function formatDateRange(startDate: Date | string, endDate: Date | string, locale: string, timeZone?: string): string;
export function getLocaleDirection(locale: string): 'ltr' | 'rtl';
```

### 2. Theming & Archetype Tokens (`src/lib/theming.ts`)
```typescript
export type MiceArchetype =
  | 'INDUSTRIAL_B2B'
  | 'TECH_DEV_SUMMIT'
  | 'MEDICAL_SYMPOSIUM'
  | 'FINANCE_INVESTOR'
  | 'POP_CULTURE_GAMING'
  | 'MUSIC_FESTIVAL'
  | 'MEGA_EXPO_PAVILION'
  | 'GOVERNMENT_DIPLOMATIC'
  | 'INCENTIVE_RETREAT';

export interface ArchetypeThemeTokens {
  primary: string;
  accent: string;
  background: string;
  surface: string;
  border: string;
  fontFamily: string;
  badgeStyle: string;
}

export interface BrandingConfig {
  primaryColor?: string;
  accentColor?: string;
  heroBadge?: string;
  bannerOverlayOpacity?: number;
}

export function getArchetypeTokens(archetype: MiceArchetype, overrides?: BrandingConfig): ArchetypeThemeTokens;
export function getArchetypeCssVariables(archetype: MiceArchetype, overrides?: BrandingConfig): Record<string, string>;
```

### 3. Cryptographic QR Passes (`src/lib/tickets/qrPass.ts`)
```typescript
export interface TicketPassPayload {
  bookingId: string;
  eventId: string;
  tierId: string;
  attendeeEmail: string;
  issuedAt: number;
  nonce: string;
}

export function generateTicketHash(payload: TicketPassPayload): { qrCodeHash: string; signature: string; payloadString: string };
export function verifyTicketHash(payloadString: string, signature: string): { valid: boolean; payload?: TicketPassPayload };
export function generateSvgQrCode(data: string, options?: { size?: number; primaryColor?: string }): string;
```

### 4. OpenRouter Multi-Model AI Gateway (`src/lib/ai/openrouter.ts`)
```typescript
export type OpenRouterModel =
  | 'google/gemini-3.5-flash-lite'
  | 'google/gemini-3.7-flash'
  | 'deepseek/deepseek-v4-pro-0813'
  | 'qwen/qwen3.7-plus'
  | 'openai/gpt-5.6-luna'
  | 'google/gemma-4-26b-a4b-it';

export interface ChatMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

export interface StreamChatOptions {
  model: OpenRouterModel;
  messages: ChatMessage[];
  temperature?: number;
  maxTokens?: number;
}

export interface StructuredReportOptions<T> {
  model: OpenRouterModel;
  prompt: string;
  schema: import('zod').ZodSchema<T>;
  contextData?: Record<string, unknown>;
}

export function streamOpenRouterChat(options: StreamChatOptions): Promise<ReadableStream<Uint8Array>>;
export function generateStructuredReport<T>(options: StructuredReportOptions<T>): Promise<T>;
```

---

## Code Layout
```
XPO/
├── docs/
│   └── guides/
│       ├── phase-01-architecture-and-design-system.md
│       ├── phase-02-relational-data-modeling-and-seeding.md
│       ├── phase-03-multilingual-and-regional-routing.md
│       ├── phase-04-discovery-engine-and-faceted-search.md
│       ├── phase-05-category-archetypes-and-theming.md
│       ├── phase-06-ticket-checkout-and-event-treats.md
│       ├── phase-07-settings-suite-and-ai-concierge.md
│       ├── phase-08-rbac-authentication-and-security.md
│       ├── phase-09-organizer-command-center.md
│       ├── phase-10-ai-multi-model-reporting-suite.md
│       ├── phase-11-admin-governance-and-crawler.md
│       └── phase-12-pwa-seo-hardening-and-e2e.md
├── prisma/
│   ├── schema.prisma
│   └── seed.ts
├── src/
│   ├── app/
│   │   ├── [locale]/
│   │   │   ├── (attendee)/
│   │   │   │   ├── page.tsx
│   │   │   │   ├── events/page.tsx & events/[slug]/page.tsx
│   │   │   │   ├── venues/page.tsx & venues/[slug]/page.tsx
│   │   │   │   ├── region/[code]/page.tsx
│   │   │   │   └── my-tickets/page.tsx & my-tickets/[bookingId]/page.tsx
│   │   │   ├── (organizer)/
│   │   │   │   ├── dashboard/page.tsx
│   │   │   │   ├── events/new/page.tsx
│   │   │   │   ├── events/[id]/customizer/page.tsx
│   │   │   │   ├── events/[id]/ai-reports/page.tsx
│   │   │   │   ├── booths/page.tsx
│   │   │   │   └── scanner/page.tsx
│   │   │   ├── (admin)/
│   │   │   │   ├── dashboard/page.tsx
│   │   │   │   ├── venues/page.tsx
│   │   │   │   └── audit/page.tsx
│   │   │   └── settings/page.tsx
│   │   └── api/
│   │       ├── tickets/checkout/route.ts & tickets/verify/route.ts
│   │       ├── ai/concierge/route.ts & ai/reports/route.ts
│   │       └── crawler/route.ts
│   ├── components/
│   │   ├── ui/
│   │   ├── layout/
│   │   ├── discovery/
│   │   ├── themed/
│   │   │   ├── EventPageShell.tsx
│   │   │   └── archetypes/ (9 specialized views)
│   │   ├── tickets/
│   │   ├── perks/
│   │   ├── settings/
│   │   ├── ai/
│   │   └── organizer/
│   ├── lib/
│   │   ├── db.ts, utils.ts
│   │   ├── theming.ts
│   │   ├── i18n/formatters.ts
│   │   ├── tickets/qrPass.ts
│   │   ├── ai/openrouter.ts & types.ts
│   │   ├── auth/session.ts & rbac.ts
│   │   ├── crawler/venueScraper.ts
│   │   └── seo/jsonLd.ts
│   └── messages/ (en, ja, zh-CN, id, de, es)
└── tests/
    ├── unit/
    ├── integration/
    └── e2e/
```
