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

## 2. Coding Notes & Standards

1. **Maintain active codebase hygiene without placeholder stubs**: Implement real, functional logic and production-ready data pipelines; do not leave empty mockup stubs or non-functional placeholders.
2. **Avoid using emoji in production code or artificial AI quirks**: Strictly use vector SVG icons from `lucide-react`. Maintain an institutional, modern, ultra-clean aesthetic without emojis or conversational quirks.
3. **Provide comprehensive testing across unit, UI, and integration layers**: Every phase must contain automated unit and integration tests verifying correctness, hash validation, theming logic, and route behavior.
4. **Always diagnose issues with concrete evidence before applying fixes**: Investigate root causes and inspect logs/types before applying targeted, minimal code modifications.
5. **Use the latest stable versions of libraries and frameworks**: Next.js 15+ App Router, React 19, TypeScript strict mode, Prisma ORM, and Tailwind CSS.
6. **Avoid overengineering; prioritize simple, robust implementations**: Favor standard library utilities, direct component compositions, and clean modular services over speculative abstractions.
7. **Maintain a concise and informative `README.md`**: Keep documentation up-to-date, clear, and actionable.

---

## 3. Responsive & Adaptive Multi-Device UX Guidelines

All three portals (Attendee, Organizer, and Admin) must be fully responsive and adapt gracefully to device viewports:

### A. Mobile Interface (`< 768px`):
* **Bottom Navigation & Thumb-Zone Ergonomics**: Core navigation tabs anchored to the bottom for single-handed mobile use.
* **Sticky Action Drawer**: Single-click "Book Pass" / "View Pass" sticky bottom bar on event pages.
* **Touch Optimization**: Minimum touch target size of 44x44px. Full-width swipeable cards and bottom-sheet drawers instead of bulky modals.
* **Compact Data Density**: Simplified cards with essential tags; expandable accordion rows for event agendas.

### B. Tablet Interface (`768px - 1024px`):
* **Hybrid Dual-Pane Layout**: Collapsible sidebars, 2-column event discovery grids, and split-view agenda schedules.
* **Balanced Density**: Touch-friendly buttons paired with expanded tabular data for exhibitor lists and ticket tiers.

### C. Desktop & Large Displays (`> 1024px / 1280px+`):
* **Full Multi-Column Experience**: Persistent navigation sidebars for Organizer & Admin command centers.
* **Side-by-Side Live Preview**: Real-time visual branding customizer with live preview frame and device toggle.
* **High-Density Data Grids**: Comprehensive faceted filter bars, multi-stage timetables, interactive floor maps, and multi-model AI comparison panes.

---

## 4. Multi-Model OpenRouter AI Standard

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

## 5. Sub-Agent Orchestration & Team Roster

The project utilizes specialized sub-agents working as an integrated engineering team:

| Agent Name | Role | Core Focus Area |
|---|---|---|
| `tech-lead` | **Technical Lead & Architect** | High-level system architecture, cross-cutting standards, review gates, Next.js App Router conventions |
| `backend-engineer` | **Senior Backend Engineer** | Prisma data modeling, database seeding, API routes, RBAC auth middleware, cryptographic QR pass hashing, crawler pipeline |
| `frontend-engineer` | **Senior Frontend & UI/UX Engineer** | Accessible React components, 9 MICE archetype view engines, responsive multi-device UX (mobile/tablet/desktop), dynamic theming, next-intl i18n |
| `ai-engineer` | **AI & Intelligence Systems Engineer** | OpenRouter multi-model gateway, Attendee AI Concierge, Organizer AI analytics reports, structured Zod schemas |
| `qa-engineer` | **Lead QA & Automation Engineer** | Vitest unit/integration test suites, QR verification tests, a11y checks, zero-emoji compliance audits, E2E user journeys |
| `docs-engineer` | **Documentation & Educational Engineer** | Phase-by-phase educational guides (`docs/guides/phase-XX-*.md`), architectural diagrams, CHECKLIST.md & README.md maintenance |

---

## 6. Directory Structure & AGENTS.md Hierarchy

```
XPO/
├── AGENTS.md                # Root agent instructions (this file)
├── CHECKLIST.md             # 12-Phase progress & verification checklist
├── README.md                # Project summary, architecture, and setup instructions
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

## 7. Operational Workflow for Phased Development

For every phase:
1. **Reference the Checklist**: Check `CHECKLIST.md` for current phase tasks and dependencies.
2. **Implement & Verify**: Write clean, modular TypeScript code and add corresponding unit/integration tests.
3. **Draft Learning Guide**: Write a detailed, educational Markdown guide in `docs/guides/phase-XX-*.md` covering architectural rationale, algorithms, and key code patterns.
4. **Update Checklist**: Mark completed items in `CHECKLIST.md` with timestamps and test verification receipts.
