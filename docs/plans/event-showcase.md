# Data-Backed Showcase Widgets

Goal: restore differentiated per-type widgets where every rendered claim traces
to an organizer-entered row. Nullable everything; absent data means the section
stays hidden (gating from event-detail fixes already supports this).

- [x] **Phase 1 — Content model**: single nullable `showcaseJson` on Event plus
  a validated `ShowcaseContent` schema (stream URL + live flag, program rows,
  alerts, channels) with URL checks and row caps; organizer-scoped PATCH
  endpoint; parsed onto Discovery payloads; guide alerts wired from data.
- [x] **Phase 2 — Authoring UI**: per-archetype "Showcase content" editors
  (program rows, alerts, channels, stream URL + go-live) with validation.
- [ ] **Phase 3 — View wiring**: one gated block per view, rendered only with
  data; silent empties.
- [ ] **Phase 4 — Trust rails**: organizer attestation, admin visibility, and
  content-age stamps.
- [ ] **Phase 5 — Verification**: seeded content per type, render/hide tests,
  live pass.

Each phase ships as its own commit pushed to `origin/main`. Verify by execution.
