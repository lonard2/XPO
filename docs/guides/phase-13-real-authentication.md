# Phase 13 — Real Authentication (Passwords + Email OTP)

## 1. Phase Overview & Objectives

Plan A replaces XPO's forgeable persona cookies with unforgeable server
sessions while offering two sign-in systems: passwords and email OTP codes.
Every ownership gate (`requireEventWrites`, `canWriteEvent`, dashboard
scoping) keeps working — only the caller behind it becomes trustworthy.
Demo personas survive strictly behind `ALLOW_DEMO_AUTH` (on in dev/test,
off in production).

## 2. Key Concepts & Technical Rationale

- **Opaque sessions, hashed storage.** The cookie holds a 256-bit random
  token; Postgres stores only its SHA-256. A database leak reveals no
  usable sessions, and logout is a row delete.
- **scrypt passwords.** Node-crypto scrypt with per-password salts and a
  10-character, 4-class policy. Verification is constant-time and never
  throws; unknown emails take a dummy verify pass so login timing does
  not reveal which addresses exist.
- **OTP as inbox-ownership proof.** Six digits, 10-minute TTL, five grace
  attempts then lockout. First successful verify creates the ATTENDEE
  account and stamps `emailVerifiedAt`. Responses stay generic so the
  endpoints never enumerate registered addresses.
- **Per-account login lockout.** Five failures trip a 15-minute lock;
  success resets. Attempt state lives on the user row — no extra service.
- **Session-first caller resolution.** `resolveEventCaller` checks the
  session, then demo cookies only when allowed, else an empty caller
  (which every write gate denies). Read paths stay open by design.

## 3. Core Code Walkthrough & Snippets

- `src/lib/auth/password.ts` — `hashPassword` (`scrypt$salt$key`),
  `verifyPassword` (constant-time, total), `randomToken`, `sha256hex`.
- `src/lib/auth/sessionStore.ts` — `createSession` (returns the raw token
  once), `resolveSession` (expiry + lazy sweep), `revokeSession`,
  cookie serializers (HttpOnly, Secure in production), `allowDemoAuth()`.
- `src/lib/auth/otp.ts` + `otpProvider.ts` — code issuance with prior-code
  invalidation, attempt counting, `deliverOtp` behind a swappable provider
  (log default with a test outbox; SMTP later without call-site changes).
- `src/app/api/auth/{register,login,otp/request,otp/verify,me,logout,demo-status}/route.ts`
  — thin HTTP shells; public register always mints ATTENDEE (no privilege
  escalation path).
- `src/lib/auth/session.ts` — provider login/logout/refresh hit the API;
  init prefers a live session, then demo convenience. AuthModal gains an
  Email Code tab and hides the persona switcher when demo auth is off;
  the organizer RBAC barrier opens sign-in instead of role theater.

## 4. Testing & Verification

- Unit: scrypt policy/hash/verify/timing, OTP-agnostic primitives.
- Integration: session lifecycle (resolve/forge/expire/logout),
  register + duplicate + weak, login cookie + lockout after five,
  OTP happy/generic/lockout, caller cutover (session auth without role
  cookie, stranger 403, demo-off 403), modal UI flows.
- Live probe: register → login (HttpOnly cookie) → me → logout → 401.

## 5. Key Takeaways & Educational Insights

- Cut over identity *behind* existing gates instead of rewriting them:
  40+ routes changed only in how the caller is constructed.
- Demo conveniences need kill switches from day one; `ALLOW_DEMO_AUTH`
  defaults closed in production so a misconfigured deploy fails shut.
- Concurrency proofs beat assertions for security code: the OTP and
  lockout tests drive real attempt counters, not mocks.
