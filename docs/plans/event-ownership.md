# Event Ownership Enforcement

Decision: strict ownership. Organizers touch only their own events; platform-curated
(`organizerId: null`) events are admin-only. Reads stay open where operations need
them (scanner verification, public customizer load). Caller identity follows existing
conventions: `xpo_role` cookie / `x-xpo-user-role` header plus `xpo_auth_user` cookie
/ `x-xpo-user-id` / `x-xpo-user-email` for the user.

- [x] **1. Ownership helper + dashboard scoping** (`helper + dashboard`): `resolveEventAccess()` in `src/lib/auth/` unit-tested; organizer dashboard lists owned events only, admins see all grouped with curated section.
- [x] **2. Branding PUT guard** (`api`): writer must be ADMIN or owning organizer; probes for allow/deny.
- [x] **3. Booths, AI reports, scanner scoping** (`api + pages`): same rule on mutations; verification reads stay open.
- [x] **4. Release back to platform** (`api`): ADMIN-only `release` endpoint (reverse of `assign`).
- [ ] **5. Ownership identity badges** (`ui`): curated vs org badges on dashboard rows, customizer header, reports/booths headers.

Each ships as its own commit pushed to `origin/main`. Verify by execution: unit tests,
live RBAC probes (admin-allowed, foreign-organizer-denied, attendee-denied), tsc.
