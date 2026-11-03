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

## First deploy checklist

- [ ] `QR_HMAC_SECRET` is random, unique per environment, and stored outside the repo
- [ ] `ALLOW_DEMO_AUTH` is false (compose default; verify, do not assume)
- [ ] Email provider delivers (request a code, confirm it arrives)
- [ ] `ALERT_WEBHOOK_URL` fires (trigger a test alert, confirm the channel)
- [ ] External uptime monitor points at `/api/health` every 60 seconds
- [ ] Nightly backup cron exists and one restore has been rehearsed
- [ ] Images are tagged per release
