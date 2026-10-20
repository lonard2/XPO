# Plan C — Production Hardening

Goal: fail-closed secrets, bounded abuse surface, observable health,
structured errors, and CI gating every push.

- [x] **C1. Fail-closed secrets.** QR_HMAC_SECRET (and NEXTAUTH_SECRET)
  required in production; no hardcoded signing defaults.
- [x] **C2. Rate limits.** Verify, auth, import, and checkout routes bounded
  per IP with 429s.
- [x] **C3. Health endpoint.** `/api/health` with DB ping, uptime, version.
- [ ] **C4. Structured errors.** JSON logger adopted on security-sensitive
  routes.
- [ ] **C5. CI gating.** GitHub workflow running tsc + vitest (with PG
  service) on push/PR.

Each ships as its own commit pushed to `origin/main`. Verify by execution;
no regressions: existing suites must stay green throughout.
