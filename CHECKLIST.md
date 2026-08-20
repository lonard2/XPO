# XPO MICE Ecosystem: Comprehensive Development Checklist

This master checklist tracks the development, testing, and educational documentation across all 12 phases of the **XPO** MICE application.

---

## Global Quality & Architecture Gates

- [ ] **Zero-Emoji UI Verification**: All icons sourced from `lucide-react`. Zero raw emojis in UI components.
- [ ] **Strict Type-Safety**: `npm run type-check` / `tsc --noEmit` passes with 0 errors.
- [ ] **Multi-Language Support**: All strings externalized to `src/messages/` (`en`, `ja`, `zh-CN`, `id`, `de`, `es`).
- [ ] **OpenRouter AI Gateway**: Support for all 6 models with fallback handling and structured output.
- [ ] **Accessibility (a11y)**: WCAG AA color contrast, ARIA labels on modals/drawers, keyboard navigability.

---

## Phased Implementation Progress

### Phase 1: Core Architecture Blueprint & Non-Emoji Design System
*Focus: Project scaffolding, design tokens, App Router layouts, base UI primitives, and Phase 1 Learning Guide.*
- [x] Initialize `package.json` with Next.js 15, React 19, TypeScript, Tailwind CSS, Lucide icons.
- [x] Configure `tsconfig.json`, `tailwind.config.ts`, and `postcss.config.mjs`.
- [x] Build base layout shells (`app/[locale]/layout.tsx`, header topbar, navigation bar, footer).
- [x] Create accessible UI primitives in `src/components/ui/`:
  - [x] Button (Variants: primary, secondary, outline, ghost, destructive, archetype)
  - [x] Badge (Variants: default, neutral, success, warning, outline, archetype)
  - [x] Card (Header, Content, Footer, interactive hover)
  - [x] Modal / Dialog & Sheet / Drawer primitives
  - [x] Tabs & Dropdown Menu
  - [x] Input, Textarea, Select
- [x] Implement theme variable system (`globals.css` with CSS custom properties).
- [x] Add unit test harness (`vitest.config.ts`, `@testing-library/react`, zero-emoji audit).
- [x] Author educational guide: `docs/guides/phase-01-architecture-and-design-system.md`.
- [x] **Verification**: `npm run build` succeeds (100%), `npm test` runs 12 component & compliance tests (100% pass).

---

### Phase 2: Relational Data Modeling with Prisma & Global/Indonesian MICE Seeding
*Focus: PostgreSQL schema, relational modeling, venue/hall hierarchies, realistic seed data, and Phase 2 Guide.*
- [x] Configure Prisma ORM (`prisma/schema.prisma`) with models:
  - [x] `User`, `Role` (ATTENDEE, ORGANIZER, ADMIN)
  - [x] `Region` (`id`, `jp`, `global`)
  - [x] `Venue` & `VenueHall` (1-to-many relationship with capacity, transit data)
  - [x] `Event` & `EventArchetype` (9 MICE categories)
  - [x] `TicketTier`, `Booking`, `TicketStatus`
  - [x] `AgendaItem`, `BoothTenant`, `EventPerk`, `AIReport`
- [x] Implement `src/lib/db.ts` (Prisma singleton).
- [x] Build robust seed script (`prisma/seed.ts`):
  - [x] Seed Indonesian venues & exact halls: JIExpo Kemayoran, ICE BSD City, JICC Senayan, NICE PIK 2, GBK Complex, JIS.
  - [x] Seed Japan venues & exact halls: Tokyo Big Sight, Makuhari Messe, Pacifico Yokohama.
  - [x] Seed Global venues: Marina Bay Sands Expo, Messe Frankfurt, ExCeL London, McCormick Place.
  - [x] Seed realistic events spanning all 9 category archetypes (Manufacturing Expo, AI Summit, Jakarta Fair mega expo).
- [x] Author educational guide: `docs/guides/phase-02-prisma-modeling-and-mice-seeding.md`.
- [x] **Verification**: Seed script populates database without foreign key errors; DB query integration test passes (`tests/integration/db.test.ts`).

---

### Phase 3: Multilingual i18n (`next-intl`) & Regional Localization
*Focus: Locale negotiation, regional hubs, currency/timezone formatters, and Phase 3 Guide.*
- [x] Setup `next-intl` routing middleware (`src/middleware.ts`, `src/i18n/request.ts`, `src/i18n/routing.ts`).
- [x] Create translation dictionaries in `src/messages/` (`en.json`, `ja.json`, `zh-CN.json`, `id.json`, `de.json`, `es.json`).
- [x] Build Language Switcher & Region Switcher components in `src/components/layout/`.
- [x] Build currency conversion and localized date/time formatting utilities in `src/lib/i18n/formatters.ts`.
- [x] Author educational guide: `docs/guides/phase-03-multilingual-and-regional-routing.md`.
- [x] **Verification**: `npm run type-check` (0 errors), `npm test` (17 test files, 90 tests passing), `npm run build` (28/28 static localized routes generated).

---

### Phase 4: Attendee Discovery Engine (Homepage, Carousel, Venue Hubs, Search & Filters)
*Focus: Event discovery, hero carousel, venue spotlighting, multi-dimensional search, and Phase 4 Guide.*
- [x] Build homepage (`app/[locale]/(attendee)/page.tsx`):
  - [x] Top banner carousel (`BannerCarousel.tsx`) with countdown timer, featured badge, and autoplay/keyboard controls.
  - [x] Regional venue spotlight hubs ("Happening at JIExpo", "Happening at ICE BSD", etc.).
  - [x] Popular events and upcoming events categorized grids.
- [x] Build dedicated search & explore page (`app/[locale]/(attendee)/events/page.tsx`):
  - [x] Real-time debounced keyword search.
  - [x] Faceted filters (Region/City, Date Range, Category Archetype, Format [In-person/Hybrid/Virtual], Scale).
  - [x] Active filter chips & clear all functionality.
- [x] Build venue directory and hub detail pages:
  - [x] `app/[locale]/(attendee)/venues/page.tsx`: Global & regional venue directory with hall counts and transit badges.
  - [x] `app/[locale]/(attendee)/venues/[slug]/page.tsx`: Venue overview, hall directory, transit guide, interactive map pin, upcoming venue calendar.
- [x] Author educational guide: `docs/guides/phase-04-discovery-engine-and-faceted-search.md`.
- [x] **Verification**: `npm run type-check` (0 errors), `npm test` (26 test files, 159 tests passing with 100% rate), `npm run build` (94/94 static pages generated with 0 errors).

---

### Phase 5: 9-Archetype Dynamic MICE Category Theming Engine
*Focus: Domain-specific layout adapters, CSS variable theming, organizer branding overrides, and Phase 5 Guide.*
- [x] Build `EventPageShell.tsx` and dynamic theme injector in `src/lib/theming.ts`.
- [x] Implement the 9 specialized archetype components in `src/components/themed/archetypes/`:
  - [x] `IndustrialB2BView.tsx`: Machine specs, RFQ quote drawer, exhibitor booth directory.
  - [x] `TechDevSummitView.tsx`: Multi-track keynote schedule, speaker GitHub/X tags, livestream widgets.
  - [x] `MedicalSymposiumView.tsx`: Research abstract reader, CME credit tracker, speaker accreditation badges.
  - [x] `FinanceInvestorView.tsx`: Deal-room booking, pitch decks, VIP pass tiers, encrypted badge.
  - [x] `PopCultureGamingView.tsx`: Cosplay rules, creator alley map, autograph/photo-op slots, merch list.
  - [x] `MusicFestivalView.tsx`: Real-time stage timeline, setlist sneak-peek, crowd-meter, wristband guide.
  - [x] `MegaExpoPavilionView.tsx`: Multi-pavilion hall directory, fireworks schedule, promo radar.
  - [x] `GovernmentDiplomaticView.tsx`: Protocol briefings, bilateral meeting schedules, delegation lounges.
  - [x] `IncentiveRetreatView.tsx`: Daily excursion itinerary, gala seating charts, wellness scheduler.
- [x] Build organizer brand override layer (custom accent color, hero banner, logo badge).
- [x] Author educational guide: `docs/guides/phase-05-category-archetypes-and-theming.md`.
- [x] **Verification**: `npm run type-check` (0 errors), `npm test` (26 test files, 159 tests passing with 100% rate), `npm run build` (94/94 static pages generated with 0 errors).

---

### Phase 6: Ticket Reservation Flow & Interactive Event-Day Treats
*Focus: Checkout drawer, QR pass generator, digital guidebook, hall floor plan, and Phase 6 Guide.*
- [x] Build multi-tier ticket selector and checkout drawer (`TicketCheckoutDrawer.tsx`, `TierSelector.tsx`).
- [x] Implement secure ticket pass generator (`src/lib/tickets/qrPass.ts`) with tamper-proof signature hash.
- [x] Build attendee ticket & perks portal (`app/[locale]/(attendee)/my-tickets/[bookingId]/page.tsx` and `my-tickets/page.tsx`):
  - [x] `DigitalPassQR.tsx`: SVG QR pass with animated security watermark.
  - [x] `InteractiveGuidebook.tsx`: Live schedule tracker with "Add to My Agenda" & session alerts.
  - [x] `HallFloorMap.tsx`: Interactive SVG floor plan with booth & hall navigation.
  - [x] Tier-gated perks unlock (VIP lounge, barista voucher, slide downloads in `TierPerksGating.tsx`).
- [x] Author educational guide: `docs/guides/phase-06-ticket-checkout-and-event-treats.md`.
- [x] **Verification**: `npm run type-check` (0 errors), `npm test` (35 test files, 240 tests passing with 100% rate), `npm run build` (115/115 static localized pages generated).

---

### Phase 7: UI/UX & Account Settings Suite + Opt-in Attendee AI Concierge
*Focus: Settings page, custom fonts, expressive animations, OpenRouter AI Concierge, and Phase 7 Guide.*
- [x] Build settings suite (`app/[locale]/settings/page.tsx`):
  - [x] Theme mode (Light, Dark, System, High-Contrast).
  - [x] UI density (Comfortable, Compact).
  - [x] Typography selector (Modern Sans, Editorial Serif, Technical Mono Hybrid, Atkinson Hyperlegible) + Font scaling slider (90% - 125%).
  - [x] Motion controller: Off, Subtle, Expressive / Cinematic (3D tilt, ambient glows, staggered reveals).
  - [x] AI Concierge toggle (Enabled / Disabled).
  - [x] Profile form & MICE interest tags.
- [x] Build Attendee AI Concierge floating action button and chat modal (`src/components/ai/AttendeeAIConcierge.tsx`).
- [x] Implement AI Concierge API route (`app/api/ai/concierge/route.ts`) connected to OpenRouter (Gemini 3.5 Flash Lite / Gemini 3.7 Flash).
- [x] Author educational guide: `docs/guides/phase-07-settings-suite-and-ai-concierge.md`.
- [x] **Verification**: `npm run type-check` (0 errors), `npm test` (35 test files, 240 tests passing with 100% rate), `npm run build` (115/115 static pages generated with 0 errors).

---

### Phase 8: Multi-Role Authentication & Access Control (RBAC)
*Focus: Session management, role guards (ATTENDEE, ORGANIZER, ADMIN), and Phase 8 Guide.*
- [ ] Build authentication & session management in `src/lib/auth/`.
- [ ] Implement Auth Modal / Sign-In Dialog (`src/components/auth/AuthModal.tsx`).
- [ ] Implement middleware role guards protecting `/(organizer)` and `/(admin)`.
- [ ] Add fast role-switching simulation for development testing.
- [ ] Author educational guide: `docs/guides/phase-08-rbac-authentication-and-security.md`.
- [ ] **Verification**: Unauthorized route redirection tests, role permission matrix tests.

---

### Phase 9: Organizer Command Center (CRUD, Live Customizer & Booth Manager)
*Focus: Event creation wizard, live visual customizer, booth roster, QR check-in, and Phase 9 Guide.*
- [ ] Build organizer dashboard (`app/[locale]/(organizer)/dashboard/page.tsx`).
- [ ] Build multi-step event creation wizard (`app/[locale]/(organizer)/events/new/page.tsx`).
- [ ] Build live branding visual customizer (`app/[locale]/(organizer)/events/[id]/customizer/page.tsx`):
  - [ ] Real-time side-by-side preview frame (`LivePreviewFrame.tsx`).
  - [ ] Controls for primary color, font family, hero media, sponsor tiers, and section visibility.
- [ ] Build booth & tenant manager (`app/[locale]/(organizer)/booths/page.tsx`).
- [ ] Build door staff QR check-in scanner simulation (`src/components/organizer/CheckInScanner.tsx`).
- [ ] Author educational guide: `docs/guides/phase-09-organizer-command-center.md`.
- [ ] **Verification**: Live preview state sync tests, event CRUD mutation tests, check-in validation.

---

### Phase 10: AI Multi-Model Intelligence Suite (OpenRouter Analytics)
*Focus: Multi-model selection, automated executive digests, sentiment analysis, and Phase 10 Guide.*
- [ ] Build OpenRouter multi-model integration client (`src/lib/ai/openrouter.ts`) supporting:
  - `google/gemini-3.5-flash-lite`
  - `google/gemini-3.7-flash`
  - `deepseek/deepseek-v4-pro-0813`
  - `qwen/qwen3.7-plus`
  - `openai/gpt-5.6-luna`
  - `google/gemma-4-26b-a4b-it`
- [ ] Build report generator page (`app/[locale]/(organizer)/events/[id]/ai-reports/page.tsx`):
  - [ ] Model selection dropdown with model spec details (speed, context, strengths).
  - [ ] Report types: Daily Executive Digest, Sentiment & Feedback Synthesis, Foot-Traffic & Booth Optimization.
  - [ ] Structured JSON schema parsing + streaming markdown output.
- [ ] Author educational guide: `docs/guides/phase-10-ai-multi-model-reporting-suite.md`.
- [ ] **Verification**: OpenRouter API mock tests, schema validation tests, multi-model response benchmarks.

---

### Phase 11: Admin Governance, Venue Aggregator & Ingestion Pipeline
*Focus: Admin dashboard, venue manager, event scraper simulation, audit logs, and Phase 11 Guide.*
- [ ] Build admin dashboard (`app/[locale]/(admin)/dashboard/page.tsx`).
- [ ] Build global venue manager (`app/[locale]/(admin)/venues/page.tsx`) with hall creation & coordinates.
- [ ] Build simulated MICE event crawler pipeline (`src/lib/crawler/venueScraper.ts`) to ingest upcoming venue schedules.
- [ ] Build platform audit logging and organizer verification queue.
- [ ] Author educational guide: `docs/guides/phase-11-admin-governance-and-crawler.md`.
- [ ] **Verification**: Crawler batch processing tests, admin permission tests, venue data validation.

---

### Phase 12: Production Hardening, Multi-Platform PWA & Automated E2E
*Focus: PWA manifest, SEO JSON-LD schema, Vitest & Playwright test suites, and Phase 12 Guide.*
- [ ] Implement Progressive Web App (PWA) manifest (`public/manifest.json`, `app/manifest.ts`) and offline service worker.
- [ ] Implement Schema.org JSON-LD MICE event metadata (`src/lib/seo/jsonLd.ts`).
- [ ] Write end-to-end user journey tests:
  - [ ] Attendee discovery, filter, and ticket purchase flow.
  - [ ] Organizer event creation and live customizer flow.
  - [ ] Settings font and animation change persistence.
- [ ] Author educational guide: `docs/guides/phase-12-pwa-seo-hardening-and-e2e.md`.
- [ ] Produce final project walkthrough artifact.
- [ ] **Verification**: Full test suite passes (`npm test`), build passes (`npm run build`), zero console warnings.
