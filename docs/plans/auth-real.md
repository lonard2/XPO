# Plan A — Real Authentication (Password + Email OTP)

Goal: replace forgeable persona cookies with unforgeable server sessions,
keeping every existing `requireEventWrites` call site working. Demo personas
survive only behind an explicit dev-only flag.

## Design decisions

- **Two credential systems, one session system.** Password (scrypt via node
  crypto, no new dependency) and email OTP (6-digit, 10-minute TTL, 5-attempt
  cap, SHA-256 stored hashes) both mint the same opaque session token.
- **Sessions are DB-backed and hashed.** Cookie holds a random token;
  only its hash is stored, with expiry, user agent, and IP. Logout deletes.
- **Fail-closed conventions.** No default secrets. Demo fallback
  (`xpo_role` / `xpo_auth_user`) resolves only when `ALLOW_DEMO_AUTH=true`
  (dev/test default on, production default off). Session cookie is
  HttpOnly + Secure (in production) + SameSite=Lax.
- **OTP delivery is provider-shaped.** `log` provider (dev/test, writes to
  server log + test inbox hook) today; SMTP/Resend provider interface for
  production without touching call sites.
- **Caller resolution order** (in `getEventCaller`): session token first,
  then demo cookies only if allowed. No behavior change for the 40+ routes
  beyond an unforgeable caller.

## Todos

- [x] **A1. Schema + password primitives.** `User.passwordHash`,
  `User.emailVerifiedAt`; new `Session` + `OtpCode` models; `db push`;
  scrypt hash/verify helpers with unit tests (RED→GREEN).
- [x] **A2. Session mint/resolve/revoke.** Opaque token issuance, hashed
  storage, cookie flags, `/api/auth/me` + `/logout`; integration tests.
- [x] **A3. Password register + login.** Validation, duplicate handling,
  timing-safe compare, per-account login attempt caps; integration tests.
- [x] **A4. Email OTP request + verify.** Code issuance, TTL, attempt caps,
  log provider + test inbox; integration tests (happy + expired + locked).
- [x] **A5. Caller cutover.** Session-first resolution with demo fallback
  flagged; existing suites green unmodified (they run with demo on).
- [ ] **A6. UI cutover.** AuthModal gains password/OTP tabs; persona
  switcher renders only when demo auth is allowed; ATTENDEE barrier copy
  points at sign-in, not role theater.
- [ ] **A7. Polish + docs.** Full suite green, tsc clean, live register →
  login → mutate → logout probe, `.env.example` documented, guide note in
  `docs/guides/`.

Each ships as its own commit pushed to `origin/main`. Pre-agreed
follow-ups (not this plan): rate limiting (Plan C), Postgres (Plan B).
