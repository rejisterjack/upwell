# Upwell

A self-hosted public status page. Add URLs, probe them on a schedule, and publish uptime, response time, and incidents without a status-page subscription.

## Local setup

PostgreSQL 15 or newer:

```bash
docker run --name upwell-pg -e POSTGRES_PASSWORD=postgres -e POSTGRES_DB=upwell -p 5432:5432 -d postgres:16
```

```bash
cp .env.example .env
npm install
npm run db:migrate
npm run db:seed
npm run dev
```

Open http://localhost:3000. The admin is at http://localhost:3000/admin/login. `ADMIN_PASSWORD` in `.env` is the only login.

`npm run db:seed` inserts example.com and example.org when the service table is empty.

## Deploy on Vercel and Neon

This takes a few minutes the first time.

1. Create a Neon project in the same region you will pin on Vercel. The default in `vercel.json` is `iad1` (US East). If you move the function region, move the database with it.
2. Copy the **pooled** connection string into `DATABASE_URL`. Copy the **direct** (non-pooler) string into `DIRECT_DATABASE_URL`. Migrations use the direct URL. The app uses the pooled URL.
3. Import the Git repository into Vercel. Set the production build command to `npm run build` (that runs `prisma db migrate --yes` and then `next build`).
4. Add production environment variables:
   - `DATABASE_URL`
   - `DIRECT_DATABASE_URL`
   - `CRON_SECRET` — at least 16 random characters. Vercel sends this as `Authorization: Bearer …` when it invokes the cron.
   - `ADMIN_PASSWORD` — at least 16 random characters.
   - `SITE_NAME` — the name on the public page. You can change it later in the admin.
   - `RESEND_API_KEY` and `ALERT_EMAIL_FROM` — only if you want email alerts.
   - `WEBHOOK_SECRET` — optional. When set, webhook bodies include `X-Upwell-Signature`, an HMAC-SHA256 hex digest.
5. Turn **off** Vercel Authentication for the production deployment. A status page has to be public. Keep protection on preview deployments if you want.
6. Give preview deployments their own `DATABASE_URL`. Neon’s Vercel integration can create a branch per preview. Do not point previews at the production database.
7. Deploy, open `/admin/login`, add a service, and press **Check now**.

### Hobby vs minute-level checks

| Plan / setup | Cron schedule | Admin **Check interval** | Fit |
| --- | --- | --- | --- |
| Vercel Hobby (committed default) | `0 12 * * *` (once daily, 12:00 UTC) | `86400` | Prove a deploy; not a customer-facing freshness target |
| Vercel Pro | `* * * * *` | `60` | Minute probes on the platform cron |
| External scheduler (any plan) | Your scheduler's cadence | Match that cadence (`300`, `60`, …) | Hobby or Pro when you need more than daily without Pro cron |

Hobby cron cannot run more than once per day, and Hobby projects are for non-commercial personal use. The committed `vercel.json` stays on the daily schedule so a Hobby deploy succeeds. A daily check is enough to verify wiring; a page customers trust should probe far more often.

### Checks every minute (recommended for a customer-facing page)

On Vercel Pro, change the schedule in `vercel.json` to:

```json
{ "path": "/api/cron/checks", "schedule": "* * * * *" }
```

Then set **Check interval (seconds)** in the admin to `60`. The public page uses that interval to decide when results are stale. If the newest check is older than about three intervals, the page says status is delayed instead of leaving a green banner up.

### External scheduler (Hobby or any host)

Point any HTTPS scheduler at the production URL. Example with curl:

```bash
curl -H "Authorization: Bearer $CRON_SECRET" https://your-status-host/api/cron/checks
```

GitHub Actions example (about every five minutes; schedules can slip):

```yaml
# .github/workflows/upwell-checks.yml
name: upwell-checks
on:
  schedule:
    - cron: "*/5 * * * *"
  workflow_dispatch:
jobs:
  check:
    runs-on: ubuntu-latest
    steps:
      - name: Trigger Upwell checks
        run: |
          curl -fsS -H "Authorization: Bearer ${{ secrets.CRON_SECRET }}" \
            "${{ secrets.STATUS_URL }}/api/cron/checks"
```

A fuller sample is in [`.github/examples/scheduled-checks.yml`](.github/examples/scheduled-checks.yml). Copy it into `.github/workflows/` and set the `STATUS_URL` and `CRON_SECRET` secrets. Set the admin interval to match the scheduler you actually use (`300` for five minutes, `86400` for the default daily cron).

Cron runs on the production deployment only. Locally, call the same URL against `http://localhost:3000`.

Admin login is a single shared `ADMIN_PASSWORD`. Multi-admin accounts are out of scope; share that secret with operators who need the panel.

## Custom domain

In the Vercel project, add the domain you want (for example `status.example.com`). At your DNS host, create the CNAME Vercel shows you. After the domain is verified, set **Public URL** in the admin to `https://status.example.com` so alerts and the feed use that origin.

## What the page does

- Public status, 90-day uptime, and the last response time for each HTTP or HEAD URL.
- Incidents with a public timeline: investigating, identified, monitoring, resolved.
- Email through [Resend](https://resend.com) and JSON webhooks when a service goes down or recovers. Alerts wait until the configured number of failures in a row, then fire once. Recovery fires once.
- JSON at `/api/v1/status`, an SVG badge at `/badge.svg`, and an Atom feed at `/feed.xml`.

Probes do not open incidents. Write those yourself so the page can say what you want it to say. A failed probe still changes the banner when no incident is open.

## Scripts

- `npm run dev` — local app
- `npm run db:migrate` — apply migrations
- `npm run db:seed` — example services
- `npm test` — unit tests and, when `DATABASE_URL` is set, the database round trip
- `npm run test:e2e` — browser smoke against the dev server. The server is started with `UPWELL_ALLOW_LOOPBACK=1` so the test can probe a local stub. Leave that variable unset in any real deployment.
- `npm run build` — migrate, then build
