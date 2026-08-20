# App Router Subdirectory Guidelines (`src/app/`)

This directory implements the Next.js 15 App Router architecture, localized route groups, and API endpoints.

---

## 1. Route Hierarchy

```
src/app/
├── AGENTS.md            # This guide
├── [locale]/            # Dynamic locale wrapper for next-intl (en, ja, zh-CN, id, de, es)
│   ├── (attendee)/      # Public & attendee routes (Homepage, Events, Venues, My Tickets)
│   ├── (organizer)/     # Organizer protected routes (Dashboard, New Event, Customizer, Booths)
│   ├── (admin)/         # Admin protected routes (Dashboard, Venues, Crawler, Audit)
│   ├── settings/        # UI/UX & Account settings page
│   └── layout.tsx       # Root localized layout with fonts, providers, and navigation
├── api/                 # Next.js Route Handlers
│   ├── ai/
│   │   ├── concierge/   # Streaming attendee AI assistant endpoint
│   │   └── reports/     # Multi-model organizer report generation endpoint
│   ├── tickets/         # Ticket checkout & QR pass verification endpoints
│   └── crawler/         # Venue event calendar ingestion endpoint
├── globals.css          # Global CSS variables, fonts, and Tailwind utilities
└── manifest.ts          # Progressive Web App manifest generator
```

---

## 2. Best Practices

* **Route Groups**: Route groups enclosed in parentheses `(attendee)`, `(organizer)`, `(admin)` allow distinct layout configurations without affecting the URL structure.
* **Layout Isolation**: Organizer and Admin routes use a dedicated sidebar and dashboard shell, while Attendee routes use the global topbar and footer.
* **Dynamic Metadata & SEO**: Implement `generateMetadata()` on event and venue pages for rich OpenGraph and JSON-LD schema generation.
