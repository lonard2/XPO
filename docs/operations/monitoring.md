# Monitoring and Alerting

What the platform emits, what to watch, and what to do when something fires.

## Signals in place

| Signal | Where | Notes |
|---|---|---|
| Liveness and DB latency | `GET /api/health` | 200 when the database answers, 503 with `status: "degraded"` when it does not. Unauthenticated, cheap. |
| Structured server logs | stdout, one JSON object per line | `{ts, level, scope, message, ...context}` from `src/lib/observability/logger.ts`. Ship them with the platform's log collector. |
| Alerts | `ALERT_WEBHOOK_URL` | Slack-compatible `{ text }` payload, deduplicated per key. Wired to every `reportError` call. |
| Client errors | `POST /api/telemetry/error` | Uncaught browser errors and unhandled rejections, capped at five per page load. |
| Business metrics | `GET /api/admin/metrics` | Admin-only counts: users, events, bookings, check-ins, sessions, audit volume. |
| Gate anomalies | `src/lib/observability/anomalies.ts` | Admission spikes, override clusters, quiet gates, derived from stored evidence. |

## Configuration

```env
ALERT_WEBHOOK_URL="https://hooks.slack.com/services/..."
ALERT_COOLDOWN_MS="900000"   # optional, defaults to 15 minutes
```

Without `ALERT_WEBHOOK_URL` the platform logs everything and alerts nothing. That is acceptable for local work and wrong for production.

## Uptime check

Point an external monitor at `https://<host>/api/health` every 60 seconds.

- Alert after 2 consecutive non-200 responses (avoids a single blip).
- Treat a 503 body with `db: "error"` as a database incident, not a web incident.
- Treat a connection refusal as a deploy or platform incident.

## Alert thresholds

| Metric | Healthy | Investigate | Page |
|---|---|---|---|
| `/api/health` | 200 | one failure | two consecutive failures |
| 5xx rate | within 10% of baseline | 10 to 100% above baseline | more than 2x baseline |
| p95 latency | within 20% of baseline | 20 to 50% above | more than 50% above |
| Client error reports | no new message shapes | new shapes under 0.1% of sessions | above 0.1% |
| Check-in failures at a live event | none | isolated | any sustained failure during an event |

## First response by alert

- **`Server error in <route>`**: read the log line for that scope, reproduce the request, check whether the route is user-facing or background. The alert repeats at most once per cooldown, so treat a single alert as "still failing", not "one failure".
- **`Server error in client`**: a browser-side exception. Check the reported path and stack, then reproduce with the same locale and viewport.
- **Health 503**: check the database container or connection string first; the web tier is usually fine.
- **Check-in failure during an event**: this is the highest severity case. The scanner has an offline mode; confirm the gate staff are using it while the API is investigated.

## Known gaps

- No request-level metrics or latency histograms in the app. Until a collector is attached, derive 5xx rate and latency from the JSON logs.
- Rate limiting is in-memory, so counters are per instance. A multi-instance deployment needs a shared store before those counters mean anything.
- Alerts are best-effort: the webhook call is not awaited by the failing request, so a platform that freezes background work can drop an alert. The log line is always written.
