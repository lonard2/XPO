# XPO System & Coding Agent Guidelines

Welcome to the **XPO (MICE Digital Ecosystem)** codebase. This document establishes the core rules, architectural standards, conventions, and operational guidelines for all AI agents and contributors working in this repository.

---

## 1. Project Mission & Identity

XPO is a next-generation, multi-sided MICE (Meetings, Incentives, Conferences, and Exhibitions) digital ecosystem encompassing:
* **Attendee Portal**: Discovery, regional hubs (Indonesia, Japan, Global), venue & hall mapping, 9 MICE archetype event experiences, ticket checkout, interactive event day guidebooks & perks, opt-in floating AI Concierge.
* **Organizer Command Center**: Event creation, live branding customizer (real-time preview), booth/tenant manager, attendee QR check-in scanner, multi-model AI analytics reports.
* **Admin Governance**: Venue directory management, automated event crawler/scraper pipeline, verification, and audit logs.
* **Settings Suite**: Custom UI/UX preferences (theming, font engine, expressive animations, density, AI assistant toggle) and Account profiles.

---

## 2. Core Non-Negotiable Rules

### A. Zero-Emoji Design Craft
* **Strict Rule**: DO NOT use Unicode emojis in any user-facing UI component, button, badge, header, or notification.
* **Solution**: Always use vector SVG icons from `lucide-react`. Maintain an institutional, modern, ultra-clean aesthetic.

### B. Type Safety & TypeScript Strict Mode
* Every interface, model, function argument, and API route must be strictly typed.
* Never use `any`. Use TypeScript generics, `unknown` with type narrowing, or specific interface types in `src/types/`.

### C. Category Archetypes & Theming
* Events belong to one of 9 domain archetypes (`INDUSTRIAL_B2B`, `TECH_DEV_SUMMIT`, `MEDICAL_SYMPOSIUM`, `FINANCE_INVESTOR`, `POP_CULTURE_GAMING`, `MUSIC_FESTIVAL`, `MEGA_EXPO_PAVILION`, `GOVERNMENT_DIPLOMATIC`, `INCENTIVE_RETREAT`).
* Always respect archetype layout structures and CSS variable theming. Do not hardcode static colors that break theme overrides.

### D. Multi-Model OpenRouter AI Standard
* AI capabilities are routed through OpenRouter (`OPENROUTER_API_KEY`).
* Supported models:
  * `google/gemini-3.5-flash-lite`
  * `google/gemini-3.7-flash`
  * `deepseek/deepseek-v4-pro-0813`
  * `qwen/qwen3.7-plus`
  * `openai/gpt-5.6-luna`
  * `google/gemma-4-26b-a4b-it`
* Always implement error handling, schema parsing, and graceful fallbacks for LLM calls.

### E. Internationalization & Regional Localization
* Support localized routing (`/en`, `/ja`, `/zh-CN`, `/id`, `/de`, `/es`) via `next-intl`.
* Regional hubs (`/id`, `/jp`, `/global`) must highlight accurate local venues, exact halls, and transit lines.

---

## 3. Directory Structure & AGENTS.md Hierarchy

```
XPO/
├── AGENTS.md                # Root agent instructions (this file)
├── CHECKLIST.md             # 12-Phase progress & verification checklist
├── docs/                    # Architectural specs and educational guides
│   ├── AGENTS.md            # Documentation standards
│   ├── superpowers/specs/   # Formal technical specs
│   ├── guides/              # Phase-by-phase educational walkthroughs (docs/guides/phase-XX.md)
│   └── architecture/        # Architecture diagrams and design decisions
├── prisma/                  # Relational database schema and seed data
│   ├── AGENTS.md            # Database modeling & migration rules
│   ├── schema.prisma        # PostgreSQL models
│   └── seed.ts              # Seeding engine for global & Indonesian venues
├── public/                  # Static assets (icons, images, manifest)
├── src/
│   ├── AGENTS.md            # Source code architectural standards
│   ├── app/                 # Next.js App Router (pages & API routes)
│   │   ├── AGENTS.md        # Routing, layouts, and server actions rules
│   │   ├── [locale]/        # Localized route tree (attendee, organizer, admin, settings)
│   │   └── api/             # API routes (AI concierge, AI reports, tickets, crawler)
│   ├── components/          # React component system
│   │   ├── AGENTS.md        # UI/UX, primitives & archetype components rules
│   │   ├── ui/              # Accessible headless design tokens & primitives
│   │   ├── layout/          # Topbar, footer, language/region switcher
│   │   ├── discovery/       # Carousel, spotlight cards, faceted filters
│   │   ├── themed/          # 9 Archetype components & EventPageShell
│   │   ├── tickets/         # Checkout drawer, QR pass generator
│   │   ├── perks/           # Interactive guidebook, hall floor maps
│   │   ├── ai/              # Attendee AI concierge, multi-model selector
│   │   ├── organizer/       # Live customizer, booth roster, QR scanner
│   │   └── settings/        # UI/UX preferences & account forms
│   ├── lib/                 # Core domain services & utilities
│   │   ├── AGENTS.md        # Services, theming, AI client & auth rules
│   │   ├── ai/              # OpenRouter API client & prompts
│   │   ├── db.ts            # Prisma singleton client
│   │   ├── theming.ts       # Archetype CSS tokens
│   │   ├── tickets/         # QR generation & signature validation
│   │   ├── crawler/         # Venue event ingestion pipeline
│   │   ├── auth/            # RBAC session & permission checks
│   │   └── seo/             # JSON-LD Schema.org generators
│   ├── messages/            # next-intl translation dictionaries (en, ja, zh-CN, id, de, es)
│   └── types/               # Shared TypeScript types & interfaces
└── tests/                   # Automated test suite
    ├── AGENTS.md            # Testing standards & mock instructions
    ├── unit/                # Unit tests (models, utils, theming)
    ├── integration/         # Integration tests (APIs, checkout, AI streaming)
    └── e2e/                 # Playwright user journey tests
```

---

## 4. Operational Workflow for Phased Development

For every phase:
1. **Reference the Checklist**: Check `CHECKLIST.md` for current phase tasks and dependencies.
2. **Implement & Verify**: Write clean, modular TypeScript code and add corresponding unit/integration tests.
3. **Draft Learning Guide**: Write a detailed, educational Markdown guide in `docs/guides/phase-XX-*.md` covering architectural rationale, algorithms, and key code patterns.
4. **Update Checklist**: Mark completed items in `CHECKLIST.md` with timestamps and test verification receipts.
