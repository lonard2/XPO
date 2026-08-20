# Prisma & Database Subdirectory Guidelines (`prisma/`)

This directory contains the database schema, migration history, and realistic data seeding engine for the XPO MICE platform.

---

## 1. Schema Conventions (`prisma/schema.prisma`)

* **Primary Keys**: Always use `cuid()` strings for IDs (`id String @id @default(cuid())`), or short semantic slugs for fixed entities (e.g. `Region.id = "id" | "jp" | "global"`).
* **Relations**: Explicit foreign key fields with index considerations (e.g. `venueId`, `regionId`, `organizerId`).
* **Enums**: PascalCase enums with UPPER_SNAKE_CASE values (e.g. `EventArchetype`, `Role`, `TicketStatus`).
* **Cascading Deletes**: Child items like `VenueHall`, `TicketTier`, `AgendaItem`, and `BoothTenant` must specify `onDelete: Cascade` when tied to their parent.

---

## 2. Seeding Rules (`prisma/seed.ts`)

* **Authentic MICE Seed Data**:
  * Real-world venue names, exact hall names, accurate transit directions, and realistic event schedules.
  * Indonesia hub: JIExpo Kemayoran, ICE BSD City, JICC Senayan, NICE PIK 2, GBK Sports Complex, JIS.
  * Japan hub: Tokyo Big Sight, Makuhari Messe, Pacifico Yokohama.
  * Global hub: Marina Bay Sands Expo, Messe Frankfurt, ExCeL London, McCormick Place.
* **Idempotency**: Seed scripts must use `upsert` or clean-repopulate logic so they can be safely re-run without throwing unique constraint violations.
