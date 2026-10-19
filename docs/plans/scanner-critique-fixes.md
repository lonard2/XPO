# Scanner Critique Fixes

Source: Impeccable critique `2026-10-19T11-31-30Z` (23/40, Weak-acceptable).
Direction: honest record first, all five issues, server re-admit.

- [x] **1. Harden honest record** (`$impeccable harden`): server-routed
  override re-admit; training-partitioned simulator rows with mid-shift
  confirm.
- [x] **2. Harden event scope** (`$impeccable harden`): eventId in verify
  body, event banner with change control, fix hardcoded ev-1 case.
- [x] **3. Clarify ownership UI + i18n** (`$impeccable clarify`): owned-event
  selector defaulting from `?eventId=`, triage dictionary pass.
- [x] **4. Layout single triage** (`$impeccable layout`): one authoritative
  triage card on `<lg`, 44px audit buttons.
- [x] **5. Clarify recognition** (`$impeccable clarify`): affiliation/photo
  and perk descriptions when provided.
- [ ] **6. Polish final pass** (`$impeccable polish`): detector, screenshots,
  full suite green.

Each ships as its own commit pushed to `origin/main`. Verify by execution;
no regressions: existing suites must stay green throughout.
