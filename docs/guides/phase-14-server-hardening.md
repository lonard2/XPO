# Phase 14 — Server Hardening Arc (Plans B, C, D)

## 1. Phase Overview & Objectives

Three plans moved XPO from demo-grade persistence to server-grade
operations: **B** (Postgres, migrations, transactions, pagination),
**C** (fail-closed secrets, rate limits, health, structured errors, CI),
**D** (audit trail, anomaly feed, metrics).

## 2. Key Concepts & Technical Rationale

- **Migrations authored against the target.** The provider switch came
  first because SQLite-authored DDL would have been thrown away. `db push`
  is retired; `db:up/migrate/deploy/seed` is the workflow.
- **Atomicity where money moves.** Checkout claims stock with a guarded
  conditional increment inside one transaction — a 20-burst concurrency
  test proved the old code sold 20 passes on capacity 3.
- **Bounded everything.** List endpoints take `take`/`skip` with totals
  (default 200, max 500); rate limits answer 429 with `Retry-After`.
- **Fail-closed defaults.** Missing HMAC secret refuses to sign in
  production; demo auth defaults off in production; unknown callers
  resolve empty and every write gate denies them.
- **Evidence-only observability.** The audit trail records successes with
  actor attribution; anomalies derive strictly from persisted data
  (admissions + audit), never from heuristics over thin air. The admin
  dashboard's hardcoded fiction rows were replaced with the live feed.

## 3. Core Code Walkthrough & Snippets

- `prisma/migrations/*` — reviewable DDL history; `docker-compose.yml`
  runs Postgres 16 for dev/test.
- `src/app/api/tickets/checkout/route.ts` — transaction with
  `updateMany({ where: { soldCount: { lte: capacity - qty } } })`.
- `src/lib/api/rateLimit.ts` + `parsePagination` in `src/lib/api/pagination.ts`.
- `src/lib/auth/*` — scrypt passwords, hashed sessions/OTPs, session-first
  `resolveEventCaller` with flagged demo fallback.
- `src/lib/observability/*` — JSON logger, best-effort audit writer,
  admission-spike and override-cluster detection.
- `.github/workflows/ci.yml` — Postgres service, migrate, seed,
  type-check, full suite on push/PR.

## 4. Testing & Verification

- Suite: 800+ tests, all green on Postgres; tsc clean.
- Adversarial proofs: oversell burst, lockout counts, 429 budget,
  forged/expired sessions, demo-off denial, EVENT_MISMATCH.
- Live probes: paginated reads, register→login→me→logout→401,
  listing boundary on four surfaces, health/metrics/anomalies endpoints.

## 5. Key Takeaways & Educational Insights

- Prove race fixes with bursts, not assertions — a passing unit test
  cannot distinguish a transaction from luck; 20 parallel checkouts can.
- Keep demo conveniences behind flags with production-closed defaults;
  every fallback (`||` copy, permissive default) is a future incident.
- When a sweep touches shared helpers, re-run the whole suite: three
  separate passes in this arc caught regressions only the full run shows.
