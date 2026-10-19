# Organizer Dashboard Critique Fixes

Source: Impeccable critique `2026-10-19T09-53-51Z` (23/40, Weak-acceptable).
Direction: booth scope first, all five issues, whole-card tap to scanner.

- [x] **1. Harden booth scope** (`$impeccable harden`): booth occupancy computed
  over owned events only; platform-wide label retained for the admin full view.
- [x] **2. Clarify dashboard i18n** (`$impeccable clarify`): header, KPI strip,
  roster, and onboarding strings into dictionaries with English as values.
- [ ] **3. Layout roster cards** (`$impeccable layout`): two-badge identity cap;
  stretched link retargeted to the scanner with event context.
- [ ] **4. Distill header actions** (`$impeccable distill`): one canonical create
  action; single H1 with the live badge as eyebrow.
- [ ] **5. Clarify liveness claim** (`$impeccable clarify`): snapshot labeling
  with state-preserving refresh instead of the Live pulse.
- [ ] **6. Polish final pass** (`$impeccable polish`): detector, screenshots,
  full suite green.

Each ships as its own commit pushed to `origin/main`. Verify by execution;
no regressions: existing suites must stay green throughout.
