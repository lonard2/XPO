# Plan B — Postgres + Migrations + Transactions + Pagination

Goal: a server-grade database story. SQLite file + `db push` becomes
Postgres (docker compose for dev/test) with reviewable migration history,
atomic multi-write routes, and bounded list endpoints.

Order is load-bearing: provider switch first (migrations must be authored
against the target), then transactions, then pagination, then polish.

- [x] **B1. Postgres up.** Compose service, provider switch, `migrate dev`
  baseline on PG, seed green, scripts/README/env updated.
- [x] **B2. Transactions.** `$transaction` on event-create, booth bulk,
  voucher claims, and ticket checkout paths.
- [ ] **B3. Pagination.** Bounded `take`/`skip` (+ totals) on list
  endpoints: organizer events/booths plus admin lists.
- [ ] **B4. Polish + docs.** Full suite green on PG, tsc clean, sqlite
  leftovers retired, deployment notes.

Each ships as its own commit pushed to `origin/main`. Verify by execution;
no regressions: existing suites must stay green throughout (against PG
once B1 lands).
