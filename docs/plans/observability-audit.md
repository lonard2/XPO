# Plan D — Observability + Audit

Goal: every admin/organizer mutation is attributed, check-in anomalies
surface without manual log-diving, and basic platform metrics exist.

- [x] **D1. AuditLog model + helper.** Actor, action, entity, entityId,
  metadata; best-effort writes that never break the mutation.
- [x] **D2. Instrument mutations.** Admin venue/event, organizer event,
  booth, branding/showcase, and override re-admit paths.
- [x] **D3. Check-in anomaly feed.** Double-scan/wrong-event/failure
  burst detection with an admin endpoint (plus dashboard surface).
- [x] **D4. Metrics endpoint.** Platform counts for ops overview.
- [x] **D5. Polish + docs.** Full suite green, tsc clean, guide note.

Each ships as its own commit pushed to `origin/main`. Verify by execution;
no regressions: existing suites must stay green throughout.
