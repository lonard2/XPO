# Deploy, Rollback, Backup

How this app reaches a server, how it comes back, and how its data survives.

## Environments

| Environment | How | Database |
|---|---|---|
| Local dev | `npm run dev` + `npm run db:up` | compose `db` on port 5433 |
| Staging / production | `docker compose --profile prod up -d --build` | compose `db`, same volume name |
| CI | GitHub Actions with Postgres service | ephemeral, seeded |

Staging and production share the same image and the same compose file. They
differ only in environment: domain, secrets, and email provider. Anything
else is a difference waiting to become an incident.

## Required environment

```bash
QR_HMAC_SECRET="$(openssl rand -hex 32)"
NEXT_PUBLIC_APP_URL="https://staging.example.com"
# Staging may use the log email provider; production must not.
EMAIL_PROVIDER="resend"
RESEND_API_KEY="re_..."
RESEND_WEBHOOK_SECRET="whsec_..." # bounce/complaint ingestion; see operations/email.md
ALERT_WEBHOOK_URL="https://hooks.slack.com/services/..."
```

Compose ships a dev-only placeholder secret so `npm run db:up` keeps working
with no env at all; production must export a real one (checklist item 1).

`ALLOW_DEMO_AUTH` is pinned to `"false"` for the prod profile in compose.
Do not override it outside a throwaway review environment.

## Deploy

```bash
git pull origin main
docker compose --profile prod up -d --build
```

Startup order is enforced: `db` must be healthy, then `migrate` applies
`prisma migrate deploy`, then `app` starts only when migrations succeed.
`cache` (Valkey) starts alongside; the app connects lazily and runs on
process-local counters if it is unreachable, so a cache outage degrades
limits instead of stopping traffic. Set `REDIS_URL` to point at it;
without the variable each instance counts alone.
Watch it come up:

```bash
docker compose --profile prod ps
curl -s http://localhost:3000/api/health
```

Expect `{"status":"ok","db":"ok",...}` within a minute. If `status` reads
`degraded`, the web tier is fine and the database is not: check the `db`
container before touching the app.

## Seed data

`npm run db:seed` is for local development and CI only. Never run it
against staging or production: it wipes tables in reverse dependency order
before inserting demo content.

## Rollback

Releases are container images, so rollback is redeploying the previous one:

```bash
# Find the last good image (tagged per release, e.g. xpo:2026-11-03-1)
docker images xpo --format '{{.Tag}} {{.CreatedAt}}'
docker tag xpo:2026-11-03-1 xpo:rollback
# Pin app to it temporarily
APP_IMAGE=xpo:rollback docker compose --profile prod up -d app
```

Database migrations only ever add (columns, tables, indexes); they never
drop or rename. That rule is what makes rollback a one-command operation:
the old code runs fine against the new schema. If a migration ever needs
to drop or rename something, it ships as two releases: first the new code
path alongside the old column (expand), then the drop in a later release
(contract). No exceptions during an event.

Tag images on every release so there is always something to roll back to:

```bash
docker build -t xpo:$(date +%F)-1 .
```

## Backup and restore

Nightly logical backup, kept 14 days. The database lives in the
`xpo-pgdata` volume, so dump through the running container:

```bash
# Backup
docker compose exec db pg_dump -U xpo -d xpo -Fc \
  > "backups/xpo-$(date +%F).dump"

# Restore into a scratch database first, never straight into production
docker compose exec db pg_restore -U xpo -d xpo_scratch "backups/xpo-$(date +%F).dump"
```

Restore to production only after the scratch restore opens cleanly and the
row counts match. Before any restore, take a fresh backup of the current
state: restores are the one operation that cannot itself be rolled back.

> Drill record (2026-11-04, dev database): `pg_dump -Fc` completed cleanly
> (133 KB). Restored into a scratch database with exit 0; row counts
> matched exactly (Event 10, Venue 12, User 38, Booking 1,
> MeetingRequest 0); the 15-row migration history came over intact; a
> three-table join across events, tiers and bookings read correctly.
> Scratch database dropped afterwards. Note for operators: `pg_restore`
> needs the dump file inside the container (`docker cp` it in) and the
> target database created beforehand; the one-liner in this section
> assumes both.

## Scheduled reminders

`GET /api/cron/reminders` sends the T-24h and T-2h reminder emails. It is
hosting-neutral: point any scheduler at it every 15 minutes with the secret.

```sh
curl -fsS -H "Authorization: Bearer $CRON_SECRET" https://<host>/api/cron/reminders
```

The route is idempotent: each booking carries `reminder24hSentAt` and
`reminder2hSentAt`, so overlapping runs do not double-send, and a booking
created inside the two-hour window gets only the short reminder. It returns
`{ sent, candidates }`; alert if `candidates` stays above zero across two
consecutive runs, which means delivery is failing.

Without `CRON_SECRET` the endpoint returns 401 for every call and boot logs a
warning in production.

## First deploy checklist

- [ ] `QR_HMAC_SECRET` is random, unique per environment, and stored outside the repo
- [ ] `ALLOW_DEMO_AUTH` is false (compose default; verify, do not assume)
- [ ] Email provider delivers (request a code, confirm it arrives)
- [ ] `ALERT_WEBHOOK_URL` fires (trigger a test alert, confirm the channel)
- [ ] External uptime monitor points at `/api/health` every 60 seconds
- [ ] `CRON_SECRET` is set and a scheduler calls `/api/cron/reminders` every 15 minutes
- [ ] Nightly backup cron exists (restore rehearsed 2026-11-04, see above)
- [ ] Images are tagged per release
