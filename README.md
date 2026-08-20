# XPO: Multi-Platform MICE Digital Ecosystem
*Event, reimagined.*

**XPO** is a next-generation MICE (Meetings, Incentives, Conferences, and Exhibitions) digital ecosystem connecting attendees, event organizers, and venue administrators.

---

## Key Features

* **Attendee Discovery & Regional Hubs**: Localized portals for **Indonesia** (`/id`), **Japan** (`/jp`), and **Global** (`/global`) with exact venue and hall mapping (e.g., JIExpo, ICE BSD, Tokyo Big Sight).
* **9 Specialized Category Archetypes**: Tailored layouts and components for Industrial B2B, Tech Summits, Medical Symposiums, FinTech Forums, Pop Culture Expos, Music Festivals, Mega Expositions (Jakarta Fair, World Expo), Diplomatic Summits, and Incentive Retreats.
* **Interactive Event-Day Perks**: SVG QR digital passes with verification hashes, interactive live guidebooks, and venue hall navigators.
* **Opt-In Attendee AI Concierge**: Floating AI assistant powered by OpenRouter for instant schedule, hall transit, and perk queries.
* **UI/UX & Account Settings Suite**: Selectable typography engines (Modern Sans, Editorial Serif, Technical Mono, Atkinson Hyperlegible), font scaling (90%–125%), and motion modes (Off, Subtle, Expressive 3D).
* **Organizer Command Center**: Multi-step event creation, live side-by-side branding customizer, booth/tenant manager, and QR check-in scanner.
* **Multi-Model AI Intelligence Suite**: Executive digests and sentiment reports powered by OpenRouter (`google/gemini-3.5-flash-lite`, `google/gemini-3.7-flash`, `deepseek/deepseek-v4-pro-0813`, `qwen/qwen3.7-plus`, `openai/gpt-5.6-luna`, `google/gemma-4-26b-a4b-it`).
* **Admin Governance & Scraper Pipeline**: Global venue directory and automated venue event calendar ingestion pipeline.
* **Zero-Emoji Craft & Full Responsiveness**: Institutional aesthetic with Lucide SVG vector icons, optimized across mobile, tablet, and desktop viewports.

---

## Technology Stack

* **Framework**: [Next.js 15+ (App Router)](https://nextjs.org/) + [React 19](https://react.dev/)
* **Language**: [TypeScript (Strict Mode)](https://www.typescriptlang.org/)
* **Styling**: [Tailwind CSS](https://tailwindcss.com/) + CSS Variables
* **Database & ORM**: PostgreSQL + [Prisma ORM](https://www.prisma.io/)
* **Internationalization**: [next-intl](https://next-intl-docs.vercel.app/) (`en`, `ja`, `zh-CN`, `id`, `de`, `es`)
* **AI Provider**: [OpenRouter API](https://openrouter.ai/)
* **Icons**: [Lucide React](https://lucide.dev/) (Strict zero raw emojis)
* **Testing**: Vitest + React Testing Library + Playwright

---

## Directory Structure

```
XPO/
├── docs/               # Specifications & Phase-by-phase Educational Guides
├── prisma/             # Schema & Realistic Venue/Hall Seeding Engine
├── public/             # Static Assets & PWA Manifest
├── src/
│   ├── app/            # App Router localized routes (Attendee, Organizer, Admin)
│   ├── components/     # UI primitives, themed archetypes, layout, AI concierge
│   ├── lib/            # Prisma client, OpenRouter AI, theming engine, ticket crypto
│   ├── messages/       # next-intl i18n dictionaries
│   └── types/          # TypeScript interfaces
└── tests/              # Unit, integration, and E2E test suites
```

---

## Getting Started

### 1. Prerequisites
* Node.js >= 20.x
* PostgreSQL database (or local SQLite/PostgreSQL instance)
* OpenRouter API key

### 2. Environment Setup
Create a `.env` file in the root directory:
```env
DATABASE_URL="postgresql://user:password@localhost:5432/xpo_db?schema=public"
OPENROUTER_API_KEY="your-openrouter-api-key"
NEXTAUTH_SECRET="your-secret-key"
```

### 3. Development Workflow
```bash
# Install dependencies
npm install

# Run database migrations and seed venue data
npx prisma db push
npm run db:seed

# Start development server
npm run dev

# Run test suite
npm test
```

---

## Documentation & Learning Guides

Comprehensive technical guides explaining design patterns and algorithms for each phase can be found in [`docs/guides/`](./docs/guides/):
* [`Phase 1: Architecture & Design System`](./docs/guides/phase-01-architecture-and-design-system.md)
* [`Phase 2: Prisma Modeling & MICE Seeding`](./docs/guides/phase-02-prisma-modeling-and-mice-seeding.md)
* ...*(Phases 1 through 12)*
