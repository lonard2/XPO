# Business Logic & Libraries Subdirectory Guidelines (`src/lib/`)

This directory contains pure functions, domain services, database clients, API wrappers, and utilities.

---

## 1. Directory Structure

```
src/lib/
├── AGENTS.md        # This guide
├── db.ts            # Prisma client singleton instance
├── theming.ts       # Archetype CSS tokens, palette mappings, and theme builders
├── ai/              # OpenRouter multi-model client, prompt engineering, schema validators
├── i18n/            # Currency conversion, timezone formatters, locale utilities
├── tickets/         # Digital pass generator, cryptographic QR signature and hash verification
├── crawler/         # Venue event calendar parser & scraper simulation
├── auth/            # RBAC session helpers, role guards, JWT token verification
└── seo/             # Structured JSON-LD metadata builders (Google Event Schema)
```

---

## 2. Module Rules

* **`ai/`**:
  * Implement unified OpenRouter API calls supporting streaming and non-streaming responses.
  * Always define and validate JSON schemas with Zod / TypeScript for structured outputs.
  * Handle rate limits, timeouts, and fallbacks cleanly.
* **`tickets/`**:
  * QR code payloads must contain a tamper-proof SHA-256 HMAC hash generated with an internal secret.
* **`theming.ts`**:
  * Provide archetype color presets, CSS variable generators, and contrast ratio validation.
