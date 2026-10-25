# Upwell — Self-Hostable Status Page

> A status page your users can trust—deployed in minutes, on infrastructure you control.

**Home:** [upwell.rejisterjack.com](https://upwell.rejisterjack.com)

## One-line idea

A self-hostable public status page that checks your services on a schedule and shows uptime, incidents, and history—deployable to Vercel and Neon without a Statuspage.io subscription.

## The problem

Statuspage.io and similar products are priced for companies that already spend heavily on ops. Upptime-style setups work for some teams but lack a proper admin experience. Products need a credible public status page and incident communication without paying more for the page than for the product itself. Upwell is a free, deployable alternative: add URLs, run scheduled checks, publish a clean public page.

## What Upwell does

- Monitor HTTP endpoints on a schedule (Vercel Cron in the default deployment)
- Public page: current status, uptime percentage, response time per service
- Incidents: create, update, resolve, with a public timeline
- Alerts on downtime and recovery (email or webhook)
- Historical uptime grid (e.g. 90-day view familiar from commercial status products)

## Who it's for

- Solo developers and small teams shipping customer-facing services
- Teams replacing paid status-page SaaS with self-hosted tooling
- Vercel + Neon users who want one stack for app and status page

## How you use it

1. Deploy via README (Vercel + Neon)
2. Add services by URL in the admin dashboard
3. Scheduled checks run via Vercel Cron
4. Share the public URL; optional custom domain via CNAME
5. On outage, receive alerts and show status on the public page

## How it runs

- Next.js full-stack on Vercel
- Vercel Cron for periodic health checks
- Neon Postgres for services, check results, and incidents
- Public page revalidates as checks complete

## Tech stack

- Next.js App Router (admin, public page, API)
- Neon (Postgres)
- Prisma (ORM)
- Vercel Cron
- Tailwind CSS

## Success criteria

- Documented deploy to a working status page in under five minutes
- Multiple services with live status and uptime history
- End-to-end incident create/update/resolve
- Down/up alerts via email or webhook
- Custom domain (CNAME) documented
- Open source at [github.com/rejisterjack/upwell](https://github.com/rejisterjack/upwell)

## Limitations & non-goals

- Vercel Cron minimum interval on Hobby is one minute—sufficient for most status use cases
- Neon free tier sleeps when idle; first admin load after idle may be slow
- User-facing status only—not internal APM, tracing, or SLO engineering
- End-user trust builds over time; commercial incumbents have brand advantage

## Deployment

| Component | Platform |
|-----------|----------|
| App, admin, public page | Vercel |
| Scheduled checks | Vercel Cron |
| Database | Neon |
