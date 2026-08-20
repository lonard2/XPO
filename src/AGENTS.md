# Source Root Subdirectory Guidelines (`src/`)

This directory houses the entire application source code: App Router pages, React UI components, domain service libraries, message dictionaries, and shared TypeScript types.

---

## 1. Directory Structure

```
src/
├── AGENTS.md        # This guide
├── app/             # Next.js App Router (pages, layouts, route handlers)
├── components/      # UI components (primitives, themed archetypes, layout, AI)
├── lib/             # Business logic, Prisma client, OpenRouter AI, theming
├── messages/        # next-intl i18n JSON dictionaries (en, ja, zh-CN, id, de, es)
└── types/           # Global and domain TypeScript interfaces
```

---

## 2. Coding Rules & Best Practices

1. **Import Aliases**: Always use `@/...` to import from `src/` (e.g. `@/lib/db`, `@/components/ui/button`).
2. **Server vs Client Components**:
   * Default to Server Components (`RSC`) for SEO, data fetching, and fast initial HTML.
   * Mark interactive components with `"use client"` at the very top (e.g. drawers, modals, carousels, AI concierge, customizer).
3. **No Hardcoded Strings**: All user-visible strings must be retrieved via `useTranslations()` or `getTranslations()` from `next-intl`.
4. **Clean Design Standards**: Use Lucide icons (`lucide-react`). Zero emojis in UI code.
