# Ship Readiness Report — Upwell

Testing finished on 22 Nov 2026 against the local app on the `dev` branch, whose starting tree matches `origin/main` `4216432`.

## Product Summary

Upwell is a self-hosted public status page. Operators add HTTP or HEAD URLs, a schedule probes them, and the public page shows a banner, uptime, response time, and incidents.
One shared `ADMIN_PASSWORD` protects the admin. Visitors can read the page, `/api/v1/status`, `/badge.svg`, and `/feed.xml` without an account.
A failed probe can change the banner and send one email or webhook after the configured number of failures. Probes do not open incidents.
The app is Next.js on Vercel with Neon Postgres. The committed cron runs once a day so a Hobby deploy succeeds.
Thirty-seven features passed live. Email delivery to Resend is blocked because the local environment has no Resend key.

## Feature Table

| ID | Feature | Priority | Status | Bugs Found | Bugs Fixed | UI Issues Fixed | Notes |
| --- | --- | --- | --- | --- | --- | --- | --- |
| AUTH-01 | Admin login | P0 | PASSED | 0 | 0 | 0 | Wrong and correct passwords were used. The session cookie is HttpOnly. |
| AUTH-02 | Admin session | P0 | PASSED | 0 | 0 | 0 | Development cookie is HttpOnly, SameSite Lax, for 7 days. Production adds Secure. A tampered token redirects to login. |
| AUTH-03 | Login rate limit | P0 | PASSED | 0 | 0 | 0 | Eight failures from one forwarded address returned the rate message. A different address could still log in. Attempts older than a day were deleted. |
| AUTH-04 | Admin gate | P0 | PASSED | 0 | 0 | 0 | Logged-out `/admin` and `/admin/services` redirect to `/admin/login`. A valid session on the login page opens `/admin`. |
| AUTH-05 | Log out | P1 | PASSED | 0 | 0 | 0 | Log out returns to the login page and clears the cookie. |
| PUB-01 | Status banner | P0 | PASSED | 0 | 0 | 0 | Empty, degraded, critical-incident, and all-clear banners were shown. A resolved incident leaves the banner. |
| PUB-02 | Service list | P0 | PASSED | 0 | 0 | 0 | Example appeared under Web. After delete, the public list is empty. |
| PUB-03 | Incident pages | P0 | PASSED | 0 | 0 | 0 | A published incident is listed, and a resolved update clears it from the public JSON. An unknown id shows the branded not-found page. |
| PUB-04 | Uptime history | P1 | PASSED | 0 | 0 | 0 | The home page renders 90 day cells. At 360px the row scrolls inside itself and the page does not. |
| PUB-05 | Delayed status | P1 | PASSED | 0 | 0 | 0 | A check older than three 60-second intervals changed an operational service to "Status delayed". |
| PUB-06 | Empty states | P1 | PASSED | 0 | 0 | 0 | The empty home and empty incidents sentences were shown, and the home sentence returned after delete. |
| SVC-01 | Manage services | P0 | PASSED | 0 | 0 | 0 | Whitespace, private, credential, and non-http URLs were rejected. A public URL was saved, then deleted. |
| SVC-02 | Service options | P1 | PASSED | 0 | 0 | 0 | Expected status 201 stored "Unexpected status 200". A one-millisecond degraded-after made a 200 response degraded. Maintenance stayed maintenance. |
| INC-01 | Publish incidents | P0 | PASSED | 0 | 0 | 0 | A critical incident whose title contained a script tag was stored as text, then resolved. |
| CHK-01 | Scheduled checks | P0 | PASSED | 0 | 0 | 0 | Missing and wrong bearer tokens are 401. The right bearer runs the checks and reports the count. |
| CHK-02 | Probe outcome | P0 | PASSED | 1 | 1 | 0 | The pinned DNS lookup now answers undici's all-addresses request. A matching 200 is up or degraded. A mismatched status is stored with the code. |
| CHK-03 | URL guard | P0 | PASSED | 0 | 0 | 0 | Private, credential, and javascript URLs were rejected. example.org resolved. example.com did not resolve in this environment. |
| CHK-04 | Check now | P0 | PASSED | 0 | 0 | 0 | Check now updated the latest row and the public banner. |
| CHK-05 | Alert threshold | P0 | PASSED | 0 | 0 | 0 | One down webhook and one recovery webhook were recorded. Maintenance sent no alert. |
| CHK-06 | Lock and retention | P1 | PASSED | 0 | 0 | 0 | Two overlapping cron calls produced one skip. A 20-day check and a 2-day login attempt were deleted. |
| ADM-01 | Latest check detail | P1 | PASSED | 0 | 0 | 1 | The checks page shows the latest HTTP status and error. The public page does not show the probe error. |
| ALT-01 | Webhook alerts | P0 | PASSED | 0 | 0 | 0 | A webhook to a public echo URL was recorded as Sent. |
| ALT-02 | Email alerts | P0 | BLOCKED | 0 | 0 | 0 | RESEND_API_KEY and ALERT_EMAIL_FROM are empty. The delivery failed with that sentence. A live Resend acceptance was not run. |
| ALT-03 | Destinations | P1 | PASSED | 0 | 0 | 0 | A private webhook and an email without @ were rejected. Pause showed paused. Deliveries are listed. |
| SET-01 | Page settings | P0 | PASSED | 1 | 1 | 0 | A public URL keeps its origin. An interval of 999999999 is stored as 31622400. |
| API-01 | Status JSON | P0 | PASSED | 0 | 0 | 0 | The JSON includes status, title, delayed, services, and open incidents. A resolved incident is omitted. |
| API-02 | Status badge | P1 | PASSED | 0 | 0 | 0 | The badge label followed unknown, then major outage. |
| API-03 | Atom feed | P1 | PASSED | 0 | 0 | 0 | The feed escaped a script tag in the title and used the saved public origin. |
| SEC-01 | Security headers | P0 | PASSED | 1 | 1 | 0 | Production CSP omits unsafe-eval. nosniff, DENY, the referrer policy, and the permissions policy are set. X-Powered-By is absent. |
| UI-01 | Loading and errors | P1 | PASSED | 0 | 0 | 0 | A script tag in the error query is not rendered. Form failures come back as the fixed sentence. |
| UI-02 | Layout and theme | P1 | PASSED | 0 | 0 | 0 | At 360px the document width matches the viewport. Dark and light color schemes were applied. |
| UI-03 | Title, focus, and icon | P1 | PASSED | 0 | 0 | 1 | Login, admin, and home titles are set. Tab reaches the site name with a visible outline. /icon.svg is served. |
| UI-04 | Missing page | P1 | PASSED | 1 | 1 | 1 | /no-such-page is HTTP 404 inside the public frame. An unknown incident shows the same page. A production build still sends HTTP 200 for that dynamic route. |
| UI-05 | Error page | P1 | PASSED | 0 | 0 | 1 | A thrown page shows "Something went wrong" and does not include the exception text. The title is Error · Upwell. |
| SEO-01 | Metadata | P1 | PASSED | 0 | 0 | 0 | The home title uses the site name. The layout advertises the Atom feed. |
| DEV-01 | CI and database | P0 | PASSED | 0 | 0 | 0 | Lint, tsc, 27 vitest tests, and next build passed. Playwright remains in CI. |
| DEV-02 | Schedulers | P1 | PASSED | 0 | 0 | 0 | vercel.json stays on the daily cron. The GitHub workflow file was not changed. |
| DEV-03 | Example seed | P2 | PASSED | 0 | 0 | 0 | Seed skipped because a service already existed. |


## Gaps

1. ADM-01 — BUILD. The admin checks page shows name, status, response time, and time. `Check.error` and `Check.statusCode` are stored and never shown, so an operator cannot see why a probe failed.
2. UI-03 — BUILD. A public status page needs a tab icon. `src/app/layout.tsx` sets no `icons`, and the committed tree has no `app/favicon` or `public/favicon`.
3. UI-04 — BUILD. `src/app/incidents/[id]/page.tsx` calls `notFound()`, and there is no `src/app/not-found.tsx`. An unknown incident or URL uses the framework 404, outside the public header and footer.
4. UI-05 — BUILD. There is no `src/app/error.tsx`. A database failure can show the framework error screen.
5. Multi-admin accounts — DEFER. `VISION.md` closes this. One shared `ADMIN_PASSWORD` is the login model.
6. Incidents opened by probes — DEFER. `VISION.md` closes this. Operators write incidents so the page says what they intend. A failed probe still changes the banner.
7. Billing — DEFER. The product is a self-hosted status page. There is no payment code.
8. APM, tracing, and SLO tools — DEFER. `VISION.md` says the page is user-facing status only.
9. Visitor email subscriptions — DEFER. Alerts go to operator destinations. Visitors already have `/feed.xml`.
10. A committed every-minute Vercel cron — DEFER. Hobby cron cannot run more than once a day. `vercel.json` stays on `0 12 * * *`. Minute checks are the documented Pro or external-scheduler setup.
11. Delete confirmation — DEFER. Service and destination deletes submit immediately. Re-adding the row is the recovery. A confirm dialog is not required for the page to report status.

## Per-Feature Sections

### AUTH-01 Admin login

- Files: `src/app/admin/login/page.tsx`, `src/app/admin/actions.ts`, `src/lib/auth.ts`
- Expected behavior: The login page asks for the password. A match sets the session and opens `/admin`. A mismatch records an attempt and shows "That password is not right." If `DATABASE_URL` is missing, or `ADMIN_PASSWORD` is missing or shorter than 16 characters, the form is disabled and the config sentence is shown.
- Acceptance checklist:
  - [x] Correct password reaches the Checks heading
  - [x] Wrong password stays on the login page with the invalid message
  - [x] Empty password does not submit
  - [x] A password shorter than 16 characters in the environment disables the form
- Test cases:
  - Normal: log in with the configured password
  - Empty, whitespace, and a very long password
  - Emoji and non-English text as the password
  - A password containing quotes and angle brackets, to see that the message is the fixed sentence
  - Logged out is the starting state
  - Double-submit the form
  - Database unavailable while submitting
- UI checks: one field labeled Password, type password, autocomplete current-password, submit labeled Log in, message is readable in light and dark
- Dependencies: Postgres, `ADMIN_PASSWORD` of at least 16 characters, `DATABASE_URL`
- Suspected bugs: `src/lib/auth.ts:15` treats any password under 16 characters as unconfigured, including a password an operator typed into the host by mistake
- Bugs Found:
- Bugs Fixed:
- UI Issues Fixed:
- Files Changed:
- Notes:

### AUTH-02 Admin session

- Files: `src/lib/session.ts`, `src/lib/auth.ts`
- Expected behavior: The cookie name is `upwell_session`. It is a JWT signed with `ADMIN_PASSWORD`, role `admin`, expiring in 7 days. It is HttpOnly, SameSite Lax, path `/`, and Secure only when `NODE_ENV` is production. A token with another role, a bad signature, or a past expiry is rejected.
- Acceptance checklist:
  - [x] The cookie flags match that description
  - [x] A tampered token is treated as logged out
  - [x] Changing `ADMIN_PASSWORD` invalidates an old cookie
- Test cases:
  - Normal: cookie is present after login and absent from `document.cookie` because it is HttpOnly
  - Wrong type: a cookie value that is not a JWT
  - Logged out, expired, and a token whose role is not `admin`
  - Two tabs: log out in one and reload the other
- UI checks: none beyond the redirect after login
- Dependencies: AUTH-01
- Suspected bugs: none recorded
- Bugs Found:
- Bugs Fixed:
- UI Issues Fixed:
- Files Changed:
- Notes:

### AUTH-03 Login rate limit

- Files: `src/lib/auth.ts`, `src/lib/checks.ts`, `src/prisma/contract.prisma`
- Expected behavior: The address is the first `X-Forwarded-For` hop, otherwise `x-real-ip`, otherwise `unknown`. Eight failed attempts in 15 minutes redirect to `/admin/login?error=rate` with "Too many attempts. Wait a few minutes and try again." The check happens before the password compare. `purgeOldRows` deletes login attempts older than 24 hours.
- Acceptance checklist:
  - [x] The ninth attempt in the window is refused even with the right password
  - [x] A different address is not blocked by those failures
  - [x] The message is the fixed sentence
- Test cases:
  - Normal: one wrong password still shows the invalid message
  - Eight wrong passwords, then the correct one, and confirm the lockout
  - Empty password is blocked by the browser `required` attribute and does not count
  - Spoofed `X-Forwarded-For` from a direct local request
  - Parallel failed posts
  - Database failure while recording an attempt
- UI checks: the rate message is visible without relying on color alone
- Dependencies: AUTH-01, Postgres
- Suspected bugs: `src/lib/auth.ts:33-34` trusts the first forwarded address with no separate trust setting
- Bugs Found:
- Bugs Fixed:
- UI Issues Fixed:
- Files Changed:
- Notes:

### AUTH-04 Admin gate

- Files: `src/proxy.ts`, `src/components/admin-shell.tsx`, `src/lib/auth.ts`
- Expected behavior: `proxy` runs for `/admin/:path*`. A missing or invalid session redirects to `/admin/login` and clears a bad cookie. A valid session that opens `/admin/login` redirects to `/admin`. `requireAdmin` does the same check inside the panel layout. Public pages, the status API, the badge, and the feed do not require a session.
- Acceptance checklist:
  - [x] Logged out `/admin`, `/admin/services`, `/admin/incidents`, and `/admin/alerts` end on the login page
  - [x] Logged in `/admin/login` ends on `/admin`
  - [x] `/`, `/api/v1/status`, `/badge.svg`, and `/feed.xml` stay public
- Test cases:
  - Logged out request to each admin path
  - Expired cookie
  - A session cookie presented to another path does not leak admin HTML
  - Refresh and back after a redirect
  - Two tabs, one logged out
- UI checks: the login page is usable at 360px width
- Dependencies: AUTH-02
- Suspected bugs: none recorded
- Bugs Found:
- Bugs Fixed:
- UI Issues Fixed:
- Files Changed:
- Notes:

### AUTH-05 Log out

- Files: `src/components/admin-shell.tsx`, `src/app/admin/actions.ts`, `src/lib/auth.ts`
- Expected behavior: The Log out button deletes `upwell_session` and redirects to `/admin/login`. A later admin request asks for the password again.
- Acceptance checklist:
  - [x] After log out, `/admin` redirects to login
  - [x] The cookie is gone
- Test cases:
  - Normal log out
  - Double-submit the log out form
  - Log out in one tab and use the other
  - Back button after log out
- UI checks: the button is in the admin header and is keyboard reachable
- Dependencies: AUTH-02
- Suspected bugs: none recorded
- Bugs Found:
- Bugs Fixed:
- UI Issues Fixed:
- Files Changed:
- Notes:

### PUB-01 Status banner

- Files: `src/app/page.tsx`, `src/components/status-banner.tsx`, `src/lib/summary.ts`
- Expected behavior: The banner title and detail come from `bannerFor`. An open incident wins, ranked critical, major, minor, then maintenance. With no incident: no services, all maintenance, all down, some down, some degraded, all unknown, or all operational. The line under the title shows "Updated … UTC" or "No checks recorded".
- Acceptance checklist:
  - [x] Each tone above is produced by the matching data
  - [x] A resolved incident no longer owns the banner
  - [x] Disabled services are ignored
- Test cases:
  - Normal all-clear after a successful check
  - No services
  - One down service and one up service
  - All services down
  - An open critical incident while services are up
  - A resolved incident
  - Refresh and a second tab after a check
- UI checks: banner text wraps, contrast holds in light and dark, the tone is not color alone because the title says the state
- Dependencies: services and incidents in Postgres
- Suspected bugs: none recorded
- Bugs Found:
- Bugs Fixed:
- UI Issues Fixed:
- Files Changed:
- Notes:

### PUB-02 Service list

- Files: `src/components/service-list.tsx`, `src/lib/summary.ts`, `src/lib/format.ts`
- Expected behavior: Only enabled services appear, ordered by position then name. A blank group label becomes "Services". Each row shows the name, optional description, status pill, uptime percent or an em dash, and response time or an em dash.
- Acceptance checklist:
  - [x] A disabled service is hidden
  - [x] Group labels and order match the saved fields
  - [x] A long name and description wrap inside the row
- Test cases:
  - Normal row after a check
  - Empty description
  - A very long name, a name with emoji, and a name with angle brackets
  - Many services
  - Refresh after a rename
- UI checks: pills stay on one side or wrap without widening the page at 360, 768, and 1280
- Dependencies: PUB-01, SVC-01
- Suspected bugs: none recorded
- Bugs Found:
- Bugs Fixed:
- UI Issues Fixed:
- Files Changed:
- Notes:

### PUB-03 Incident pages

- Files: `src/app/incidents/page.tsx`, `src/app/incidents/[id]/page.tsx`, `src/app/page.tsx`
- Expected behavior: Home lists open incidents with a link. `/incidents` lists every incident, newest first, including resolved. The detail page shows impact, status, start, resolved time, affected service names, and updates in chronological order with whitespace preserved. An unknown id calls `notFound()`.
- Acceptance checklist:
  - [x] An open incident is on the home page and the list
  - [x] A resolved incident stays on the list and leaves the home active list
  - [x] Update bodies keep line breaks
  - [x] An unknown id does not render another incident
- Test cases:
  - Normal timeline with two updates
  - Empty incident list
  - A long title and a body with emoji and angle brackets
  - Unknown id, including a value with path characters
  - Refresh and back
- UI checks: the timeline is readable at 360px. The missing-page result is covered by UI-04
- Dependencies: INC-01
- Suspected bugs: `src/app/incidents/[id]/page.tsx:46` uses the framework not-found page. See UI-04
- Bugs Found:
- Bugs Fixed:
- UI Issues Fixed:
- Files Changed:
- Notes:

### PUB-04 Uptime history

- Files: `src/lib/uptime.ts`, `src/components/uptime-grid.tsx`, `src/lib/checks.ts`
- Expected behavior: Each service shows 90 UTC days ending today. Days before the service was created, and days with no checks, are empty. A day with any down check is down. Otherwise a degraded check makes the day degraded. Uptime percent is `(up + degraded) / total` across days that exist in the window. Raw check rows feed `DailyStat`.
- Acceptance checklist:
  - [x] The grid has 90 cells
  - [x] A down check paints that UTC day down
  - [x] The percent matches the daily totals
  - [x] Hover or the title text names the day
- Test cases:
  - No checks yet
  - One up check and one down check on the same UTC day
  - A service created today has empty cells for earlier days
  - A large number of checks on one day
- UI checks: the grid has `aria-label="90 day uptime"` and scrolls horizontally instead of widening the page
- Dependencies: CHK-02
- Suspected bugs: none recorded
- Bugs Found:
- Bugs Fixed:
- UI Issues Fixed:
- Files Changed:
- Notes:

### PUB-05 Delayed status

- Files: `src/lib/summary.ts`, `src/components/status-banner.tsx`, `src/app/admin/(panel)/page.tsx`
- Expected behavior: Enabled services are delayed when the newest `lastCheckedAt` is older than three times the saved interval, or when none have been checked and the oldest service is older than that limit. Delay replaces an operational or unknown banner with "Status delayed" and the sentence about not showing a stale all-clear. A real outage or open incident keeps its banner and adds "Checks are older than the expected interval." The admin checks page shows the same delay as a note.
- Acceptance checklist:
  - [x] A fresh check is not delayed
  - [x] An old all-clear becomes Status delayed
  - [x] An old outage stays an outage and also says checks are old
- Test cases:
  - Interval of 60 seconds and a check just completed
  - Interval of 86400 and a check older than three days
  - No checks and a service created moments ago
  - No enabled services
- UI checks: the delay sentence is present as text, not only a color
- Dependencies: SET-01, CHK-04
- Suspected bugs: none recorded
- Bugs Found:
- Bugs Fixed:
- UI Issues Fixed:
- Files Changed:
- Notes:

### PUB-06 Empty states

- Files: `src/components/service-list.tsx`, `src/lib/summary.ts`, `src/app/incidents/page.tsx`, `src/app/admin/(panel)/page.tsx`, `src/app/admin/(panel)/alerts/page.tsx`
- Expected behavior: No enabled services: banner "No services yet" and the dashed "Nothing is being monitored" panel. No incidents: "No incidents have been published." No admin services: "No services yet. Add one to start probing." No deliveries: "No alerts have been sent."
- Acceptance checklist:
  - [x] A fresh database shows those sentences
  - [x] Adding a service removes the public empty panel
- Test cases:
  - Empty database
  - Services exist but all are disabled
  - Incidents exist, so the empty sentence is gone
- UI checks: empty copy is visible at 360 and 1280 in light and dark
- Dependencies: Postgres
- Suspected bugs: none recorded
- Bugs Found:
- Bugs Fixed:
- UI Issues Fixed:
- Files Changed:
- Notes:

### SVC-01 Manage services

- Files: `src/app/admin/(panel)/services/page.tsx`, `src/app/admin/actions.ts`, `src/lib/services.ts`
- Expected behavior: Add requires a name and URL. The URL must pass `assertPublicUrl`. Save updates the same fields. Delete removes the row and, by the schema, its checks and daily stats. Errors redirect to `/admin/services?error=…` with the thrown message. Success redirects with no error.
- Acceptance checklist:
  - [x] A public https URL is saved and listed
  - [x] A blank name or URL is refused
  - [x] `http://127.0.0.1/` is refused when `UPWELL_ALLOW_LOOPBACK` is unset
  - [x] Delete removes it from the public page
- Test cases:
  - Normal add, rename, delete
  - Whitespace-only name
  - A very long name and a URL with emoji
  - `javascript:`, `file:`, and a URL with embedded userinfo
  - Logged out post of the server action
  - Double-submit add
  - DNS failure for a name that does not resolve
- UI checks: the error text uses `text-down` and is still readable, labels sit on the fields, the form fits at 360px
- Dependencies: AUTH-04, CHK-03
- Suspected bugs: `src/lib/services.ts:88-89` delete of an unknown id still redirects as success
- Bugs Found:
- Bugs Fixed:
- UI Issues Fixed:
- Files Changed:
- Notes:

### SVC-02 Service options

- Files: `src/lib/services.ts`, `src/app/admin/(panel)/services/page.tsx`
- Expected behavior: Method is GET unless the field is HEAD. Expected status clamps to 100–599, timeout to 1000–30000 ms, degraded-after to 1–30000 ms or null when blank, position to 0–10000. Enabled is on only when the checkbox is present. Maintenance sets status to `maintenance` on create, and on update sets it back to `unknown` when maintenance is cleared from a maintenance row. Other statuses are left alone when maintenance is off.
- Acceptance checklist:
  - [x] HEAD, a non-200 expected status, a timeout, and a degraded threshold round-trip
  - [x] Out-of-range numbers clamp
  - [x] Maintenance shows on the public pill and suppresses alerts, covered with CHK-05
  - [x] Clearing maintenance does not keep the maintenance status
- Test cases:
  - Normal option save
  - Empty degraded-after
  - Letters in the number fields
  - Negative and huge numbers
  - Unchecked enabled hides the service publicly
- UI checks: two-column grid becomes one column under the `md` breakpoint
- Dependencies: SVC-01
- Suspected bugs: none recorded
- Bugs Found:
- Bugs Fixed:
- UI Issues Fixed:
- Files Changed:
- Notes:

### INC-01 Publish incidents

- Files: `src/lib/incidents.ts`, `src/app/admin/(panel)/incidents/page.tsx`, `src/app/admin/(panel)/incidents/[id]/page.tsx`
- Expected behavior: Title and the first update are required. Unknown status becomes investigating. Unknown impact becomes major. Service ids that are not real services are dropped. Resolved sets `resolvedAt`. A later update changes status. Resolving again keeps the original `resolvedAt`. Moving back from resolved clears `resolvedAt`. An unknown incident id on update says "Incident not found."
- Acceptance checklist:
  - [x] A published incident appears on the public page
  - [x] A second update is on the timeline
  - [x] Resolve, then reopen, updates `resolvedAt`
  - [x] Blank title or body is refused
- Test cases:
  - Normal create, update, resolve
  - Whitespace title
  - A long body, emoji, and `<script>` in the title and body
  - A forged service id
  - Logged out action
  - Double-submit publish
  - Update an id that does not exist
- UI checks: the admin list links to the editor, the public body uses `whitespace-pre-wrap`, affected names are listed
- Dependencies: AUTH-04, PUB-03
- Suspected bugs: none recorded
- Bugs Found:
- Bugs Fixed:
- UI Issues Fixed:
- Files Changed:
- Notes:

### CHK-01 Scheduled checks

- Files: `src/app/api/cron/checks/route.ts`, `src/lib/cron-auth.ts`, `vercel.json`
- Expected behavior: GET with a Bearer token that matches `CRON_SECRET` runs checks and returns `{ ok: true, skipped, checked, alerts }`. A missing header, a wrong token, or a secret shorter than 16 characters returns `{ ok: false }` with status 401. A run that is not skipped calls `revalidateTag("status")`.
- Acceptance checklist:
  - [x] No header is 401 and writes no check
  - [x] The right secret returns ok and probes enabled services
  - [x] A one-character difference is 401
- Test cases:
  - Normal authorized run
  - Empty header, `Bearer `, and a token of the wrong type
  - A secret containing unusual characters
  - Logged out, which is the only state this route has
  - Two parallel authorized calls, together with CHK-06
  - The route when the database is down
- UI checks: no page
- Dependencies: `CRON_SECRET` of at least 16 characters, CHK-02
- Suspected bugs: none recorded
- Bugs Found:
- Bugs Fixed:
- UI Issues Fixed:
- Files Changed:
- Notes:

### CHK-02 Probe outcome

- Files: `src/lib/probe.ts`, `src/lib/checks.ts`
- Expected behavior: The probe uses the service method, timeout, and expected status. A matching status is up, unless `degradedAfterMs` is set and the response is slower. Any other HTTP status is down with `Unexpected status {code}`. A thrown error is down and the message is stored, cut at 300 characters. Redirects are followed manually up to 5 hops, and each hop is checked by the URL guard. The user agent is `Upwell/0.1 (+https://github.com/rejisterjack/upwell)`.
- Acceptance checklist:
  - [x] 200 against an expected 200 is up
  - [x] 500 is down and the status code is stored
  - [x] A timeout is down
  - [x] A slow 200 over the degraded threshold is degraded
  - [x] The sixth redirect is an error
- Test cases:
  - Normal up
  - Empty body and a large body
  - A redirect loop and a redirect with no location
  - A redirect to a private address
  - HEAD versus GET
  - Parallel probes of several services
- UI checks: the public pill matches the stored status
- Dependencies: CHK-03
- Suspected bugs: `src/lib/probe.ts:115-116` uses platform `fetch` on Vercel after the DNS check, so the address can change before connect
- Bugs Found:
- Bugs Fixed:
- UI Issues Fixed:
- Files Changed:
- Notes:

### CHK-03 URL guard

- Files: `src/lib/urls.ts`, `src/lib/services.ts`, `src/lib/alerts.ts`
- Expected behavior: The URL must be http or https, without a username or password. Blocked names include localhost, metadata.google.internal, `*.local`, `*.localhost`, and `*.internal`, plus private, loopback, link-local, and CGNAT addresses. DNS answers are checked the same way, with a 5 second lookup timeout. `UPWELL_ALLOW_LOOPBACK=1` allows localhost, 127.0.0.1, and `::1` only. That variable is for tests and must stay unset on a real deployment.
- Acceptance checklist:
  - [x] Public https is accepted
  - [x] Each blocked host class returns the matching sentence
  - [x] A name that resolves to a private address is refused
  - [x] Loopback is refused unless the test flag is set
- Test cases:
  - `https://example.com`
  - `http://127.0.0.1/`, `http://169.254.169.254/`, `http://10.0.0.1/`, `http://[::1]/`
  - A URL with `user:pass@`
  - Decimal and IPv4-mapped IPv6 forms that the parser treats as private
  - A host that does not resolve
  - The same rules on a webhook destination
- UI checks: the admin error is the guard sentence, not a stack trace
- Dependencies: DNS for names
- Suspected bugs: none recorded beyond the Vercel connect note on CHK-02
- Bugs Found:
- Bugs Fixed:
- UI Issues Fixed:
- Files Changed:
- Notes:

### CHK-04 Check now

- Files: `src/app/admin/actions.ts`, `src/app/admin/(panel)/page.tsx`, `src/app/admin/(panel)/services/page.tsx`
- Expected behavior: A logged-in "Check now" passes that service id, including a disabled service because the id filter does not also require `enabled`. "Check all" passes no id and probes enabled services. Either path refreshes the `status` cache tag and redirects to `/admin/services` or `/admin`.
- Acceptance checklist:
  - [x] Check now on a stub URL stores a check and updates the public page
  - [x] Check all does not require a service id
  - [x] Logged out, the action does not probe
- Test cases:
  - One service up
  - One service down
  - Check all with a mix of enabled and disabled
  - Double-click Check now
  - A probe that times out
- UI checks: both buttons are visible and labeled
- Dependencies: AUTH-04, CHK-02
- Suspected bugs: `src/lib/checks.ts:60-64` a Check now id that does not exist still takes the lock and reports a completed run with zero checks
- Bugs Found:
- Bugs Fixed:
- UI Issues Fixed:
- Files Changed:
- Notes:

### CHK-05 Alert threshold

- Files: `src/lib/flap.ts`, `src/lib/checks.ts`, `src/lib/alerts.ts`
- Expected behavior: Maintenance stays maintenance and never alerts. A down result increments consecutive failures and leaves the previous status in place until the count reaches `failuresBeforeAlert`, then status becomes down and one `down` alert fires. Further downs do not alert again. An up or degraded result sets operational or degraded, clears the counter, and fires one `recovery` only when the previous status was down. Degraded does not alert.
- Acceptance checklist:
  - [x] With the default of 2, the first failure does not alert and the second does
  - [x] A third failure does not alert again
  - [x] The next up sends one recovery
  - [x] Maintenance sends nothing
- Test cases:
  - Threshold 1 alerts on the first down
  - Threshold 2 as above
  - Recovery, then another down cycle
  - A destination that returns 500, covered with ALT-01
  - Parallel checks of the same service while the lock is held
- UI checks: the public status matches the transition, not the raw last outcome, while failures are still under the threshold
- Dependencies: SET-01, ALT-01 or ALT-02 for the send itself
- Suspected bugs: none recorded
- Bugs Found:
- Bugs Fixed:
- UI Issues Fixed:
- Files Changed:
- Notes:

### CHK-06 Lock and retention

- Files: `src/lib/checks.ts`
- Expected behavior: `CheckLock` id `singleton` is taken with an expiry of the 240 second budget plus 30 seconds. A second caller gets `skipped: true` and checks nothing. The owner clears the lock in `finally`. Eight workers share the service list. The loop stops when the budget is exhausted. After the run, checks older than 14 days and login attempts older than 1 day are deleted.
- Acceptance checklist:
  - [x] Two overlapping runs: one skips
  - [x] A thrown probe does not leave the lock held past the finally
  - [x] A check older than 14 days is gone after a later run
- Test cases:
  - Two parallel cron calls
  - A run with no services
  - More services than the time budget can finish
  - Login attempts both inside and outside the 24 hour window
- UI checks: none
- Dependencies: CHK-01
- Suspected bugs: none recorded
- Bugs Found:
- Bugs Fixed:
- UI Issues Fixed:
- Files Changed:
- Notes:

### ADM-01 Latest check detail

- Files: `src/app/admin/(panel)/page.tsx`, `src/lib/checks.ts`, `src/prisma/contract.prisma`
- Expected behavior: This is a BUILD gap. The checks page should show the latest stored status code and error for each service, so a down probe can be diagnosed without opening the database. The public page should keep hiding that error string.
- Acceptance checklist:
  - [x] A down probe's error is visible in the admin
  - [x] A successful probe does not show a stale error
  - [x] The public page does not print the error string
- Test cases:
  - Unexpected status
  - Connection refused
  - A 300-character error and a longer one that was truncated
  - A service that has never been checked
- UI checks: the error wraps inside the card at 360px and is not only a red color
- Dependencies: CHK-02, CHK-04
- Suspected bugs: `src/app/admin/(panel)/page.tsx:57-59` renders status, milliseconds, and time only
- Bugs Found:
- Bugs Fixed:
- UI Issues Fixed:
- Files Changed:
- Notes:

### ALT-01 Webhook alerts

- Files: `src/lib/alerts.ts`
- Expected behavior: Enabled webhook destinations receive a JSON body of the alert event. The URL must pass the public-URL guard. Two attempts are made. A 2xx returns. Anything else throws `Webhook responded {status}.` An optional `WEBHOOK_SECRET` sets `X-Upwell-Signature` to the HMAC-SHA256 hex of the body. The outcome is stored on `AlertDelivery`.
- Acceptance checklist:
  - [x] A 200 destination is recorded as sent
  - [x] A 500 destination is tried twice and recorded as failed
  - [x] The signature matches the body when the secret is set
  - [x] A private webhook URL is refused
- Test cases:
  - Normal 200
  - Timeout and connection refused
  - A body that includes quotes and angle brackets in the service name
  - Wrong signature when the receiver uses another secret
  - A redirect to a private host
- UI checks: the delivery row says Sent or Failed, and a failure shows the error
- Dependencies: CHK-05, CHK-03
- Suspected bugs: `src/lib/alerts.ts:56` posts with the platform fetch and does not re-check redirects the way probes do
- Bugs Found:
- Bugs Fixed:
- UI Issues Fixed:
- Files Changed:
- Notes:

### ALT-02 Email alerts

- Files: `src/lib/alerts.ts`, `src/components/admin-shell.tsx`
- Expected behavior: Email destinations POST to `https://api.resend.com/emails` with the Resend bearer key, from address, the destination, a subject, and the text from `alertText`. Missing key or from-address throws a sentence naming both variables and records a failed delivery. The admin shell warns when an enabled email destination exists without those variables, and when no destination is enabled at all.
- Acceptance checklist:
  - [ ] With both variables set, a 200 from the provider records Sent
  - [ ] A provider error records Failed and the status
  - [x] Missing variables show the admin warning and do not throw out of the check run
- Test cases:
  - Normal send against a stub provider
  - Provider timeout and a 429
  - Empty from-address
  - An email destination that is paused
- UI checks: the warning sits above the admin content and names the missing configuration
- Dependencies: CHK-05, Resend or a stub
- Suspected bugs: none recorded
- Bugs Found:
- Bugs Fixed:
- UI Issues Fixed:
- Files Changed:
- Notes:

### ALT-03 Destinations

- Files: `src/app/admin/(panel)/alerts/page.tsx`, `src/app/admin/actions.ts`, `src/lib/alerts.ts`
- Expected behavior: Add requires a target. Email must contain `@`. Webhook must pass the URL guard. New rows are enabled. Pause flips `enabled`. Delete removes the row. Deliveries for a removed destination say "Removed destination". The list shows at most 50, newest first.
- Acceptance checklist:
  - [x] Add, pause, enable, and delete work for both kinds
  - [x] A blank target and an email without `@` are refused
  - [x] The empty delivery sentence shows before any alert
- Test cases:
  - Normal webhook add
  - Email without `@`, whitespace target
  - A very long URL
  - Logged out add
  - Double-submit add
  - More than 50 delivery rows
- UI checks: destination rows wrap at 360px, pause and delete are separate buttons
- Dependencies: AUTH-04, CHK-03
- Suspected bugs: none recorded
- Bugs Found:
- Bugs Fixed:
- UI Issues Fixed:
- Files Changed:
- Notes:

### SET-01 Page settings

- Files: `src/lib/settings.ts`, `src/app/admin/(panel)/alerts/page.tsx`
- Expected behavior: One settings row, id `default`, is created on first read from `SITE_NAME` or "Status", an empty public URL, interval 86400, and 2 failures. Save trims the name and falls back to "Status". The public URL must be an http or https origin without credentials, or blank. The interval is at least 60 seconds. Failures before an alert are at least 1. The public name and URL are used by the page, the feed, and alert text.
- Acceptance checklist:
  - [x] A saved name appears in the public header
  - [x] A bad public URL is refused and the old value remains
  - [x] Interval 1 is stored as 60
  - [x] A blank name becomes Status
- Test cases:
  - Normal save
  - Whitespace name and URL
  - `javascript:` and a URL with userinfo
  - A non-numeric interval
  - Logged out save
- UI checks: fields are labeled Site name, Public URL, Check interval (seconds), and Failures before an alert
- Dependencies: AUTH-04
- Suspected bugs: `src/lib/settings.ts:47-48` has no upper bound, so a non-finite number can become Infinity before the database write
- Bugs Found:
- Bugs Fixed:
- UI Issues Fixed:
- Files Changed:
- Notes:

### API-01 Status JSON

- Files: `src/app/api/v1/status/route.ts`, `src/lib/cached-status.ts`
- Expected behavior: GET returns JSON with `status`, `title`, `delayed`, `updatedAt`, `services` (name, status, group, uptime90d, responseMs), and open `incidents` (id, title, status, impact, startedAt). No cookie is required. The snapshot is cached with the `status` tag, stale 30 seconds, revalidate 15, expire 300, and the cache key includes a freshness token.
- Acceptance checklist:
  - [x] The JSON matches the public banner and service list
  - [x] Resolved incidents are absent
  - [x] After a check or an edit, a fresh read sees the change
- Test cases:
  - Empty database
  - Several services and one open incident
  - A title containing quotes and angle brackets, and confirm the JSON encoding
  - No auth header
  - Two parallel reads
- UI checks: no page. Content-Type is JSON
- Dependencies: PUB-01
- Suspected bugs: none recorded
- Bugs Found:
- Bugs Fixed:
- UI Issues Fixed:
- Files Changed:
- Notes:

### API-02 Status badge

- Files: `src/app/badge.svg/route.ts`
- Expected behavior: GET returns `image/svg+xml` with `cache-control: public, max-age=30`. The visible word matches the banner tone: operational, degraded, partial outage, major outage, maintenance, delayed, or unknown. The SVG has `role="img"` and an aria-label.
- Acceptance checklist:
  - [x] An all-clear badge says operational
  - [x] A major banner says major outage
  - [x] The response is XML and does not execute script
- Test cases:
  - Each banner tone
  - Empty database, which is unknown
  - A site name with unusual characters, which must not be interpolated into the SVG
- UI checks: the image is 20px tall and readable on a light and a dark page
- Dependencies: PUB-01
- Suspected bugs: `src/app/badge.svg/route.ts:19-23` inserts the label without escaping. The labels are a fixed map today
- Bugs Found:
- Bugs Fixed:
- UI Issues Fixed:
- Files Changed:
- Notes:

### API-03 Atom feed

- Files: `src/app/feed.xml/route.ts`, `src/app/layout.tsx`
- Expected behavior: GET returns `application/atom+xml`. The feed title is the site name plus " status". Entries are the incidents, with the latest update as the summary. `&`, `<`, `>`, and `"` are escaped. When the public URL is set, links use that origin. Otherwise they use the request origin. The HTML layout advertises this feed.
- Acceptance checklist:
  - [x] No incidents produces a valid feed with zero entries
  - [x] A title containing `<` is escaped
  - [x] A saved public URL is the link origin
- Test cases:
  - Empty
  - One incident and several updates
  - Emoji and non-English titles
  - A public URL with a trailing slash
- UI checks: the header link "Feed" opens this document
- Dependencies: SET-01, INC-01
- Suspected bugs: none recorded
- Bugs Found:
- Bugs Fixed:
- UI Issues Fixed:
- Files Changed:
- Notes:

### SEC-01 Security headers

- Files: `next.config.ts`
- Expected behavior: Every path sends `X-Content-Type-Options: nosniff`, `Referrer-Policy: strict-origin-when-cross-origin`, `X-Frame-Options: DENY`, `Permissions-Policy` denying camera, microphone, and geolocation, and a content security policy of default-src self, base-uri self, form-action self, frame-ancestors none, object-src none, img-src self data and blob, font-src self, style-src self plus unsafe-inline, script-src self plus unsafe-inline and unsafe-eval, and connect-src self. `poweredByHeader` is false.
- Acceptance checklist:
  - [x] Home, admin login, the status API, the badge, and the feed send those headers
  - [x] The public page still renders and the forms still submit
  - [x] The response has no `X-Powered-By`
- Test cases:
  - Normal document
  - A 404
  - The SVG and XML responses
- UI checks: no console errors caused by the policy blocking the page's own scripts or styles
- Dependencies: none
- Suspected bugs: `next.config.ts:40` includes `unsafe-eval` in every environment, including production
- Bugs Found:
- Bugs Fixed:
- UI Issues Fixed:
- Files Changed:
- Notes:

### UI-01 Loading and errors

- Files: `src/app/page.tsx`, `src/app/admin/login/page.tsx`, `src/app/admin/(panel)/layout.tsx`, `src/app/admin/actions.ts`
- Expected behavior: Public and admin trees use Suspense with a short loading sentence. Failed admin actions redirect back with `error` set to the error message. The services, incidents, and alerts pages print that message.
- Acceptance checklist:
  - [x] A rejected URL shows its sentence on the services page
  - [x] A rejected incident shows its sentence
  - [x] The loading sentence is replaced by the real page
- Test cases:
  - Normal success, which has no error line
  - A message containing angle brackets
  - A very long error sentence
  - Refresh on the error URL
- UI checks: the error is a text node, associated with the form visually, and readable in both themes
- Dependencies: SVC-01, INC-01
- Suspected bugs: `src/app/admin/actions.ts:150-151` puts `error.message` into the query string, so a future thrown message could be reflected
- Bugs Found:
- Bugs Fixed:
- UI Issues Fixed:
- Files Changed:
- Notes:

### UI-02 Layout and theme

- Files: `src/app/globals.css`, `src/components/public-frame.tsx`, `src/components/admin-shell.tsx`
- Expected behavior: The page background, text, cards, and status colors switch with `prefers-color-scheme`. Public and admin content sits in a `max-w-5xl` column with horizontal padding. Headers wrap. The uptime grid scrolls on its own.
- Acceptance checklist:
  - [x] Light and dark both show the banner, a service row, and the admin form
  - [x] At 360, 768, and 1280 the document does not scroll sideways
  - [x] Status text remains readable on its wash background
- Test cases:
  - Home, incidents, login, and each admin page in both schemes
  - A long unbreakable service URL
  - A 90-day grid
- UI checks: no element wider than the viewport, focusable controls not clipped
- Dependencies: PUB-02
- Suspected bugs: none recorded
- Bugs Found:
- Bugs Fixed:
- UI Issues Fixed:
- Files Changed:
- Notes:

### UI-03 Title, focus, and icon

- Files: `src/app/layout.tsx`, `src/app/page.tsx`, `src/app/incidents/[id]/page.tsx`, `public/`
- Expected behavior: The home title is `{site name} status`. An incident title is `{incident title} · {site name}`. The login and admin pages need a document title too. Keyboard focus is visible on links, fields, and buttons. The committed tree has no favicon. BUILD a tab icon from the existing visual language and point the metadata at it.
- Acceptance checklist:
  - [x] Home, incident, and login titles are specific
  - [x] Tabbing shows a visible focus ring
  - [x] The tab requests an icon and that URL returns 200
- Test cases:
  - Default site name Status
  - A renamed site
  - An incident title with emoji
  - A missing icon URL
- UI checks: focus ring is visible on light and dark backgrounds
- Dependencies: SET-01
- Suspected bugs: `src/app/layout.tsx:15-23` has no icons field. Untracked `public/favicon.svg` and `public/logo.svg` are local files and are not part of this tree
- Bugs Found:
- Bugs Fixed:
- UI Issues Fixed:
- Files Changed:
- Notes:

### UI-04 Missing page

- Files: `src/app/incidents/[id]/page.tsx`, and a `src/app/not-found.tsx` that does not exist yet
- Expected behavior: This is a BUILD gap. An unknown route and an unknown incident stay inside the public frame, with a title and a way back to status. The page does not follow the framework's centered default.
- Acceptance checklist:
  - [x] `/incidents/not-a-real-id` shows the status header and a not-found heading
  - [x] A nonsense path does the same
  - [x] The document title names the missing page
- Test cases:
  - Unknown incident id
  - `/no-such-page`
  - A path with encoded slashes and non-English characters
  - Refresh and back
- UI checks: the page matches the public column at 360 and 1280, in both themes
- Dependencies: PUB-03
- Suspected bugs: there is no `src/app/not-found.tsx`
- Bugs Found:
- Bugs Fixed:
- UI Issues Fixed:
- Files Changed:
- Notes:

### UI-05 Error page

- Files: a `src/app/error.tsx` that does not exist yet
- Expected behavior: This is a BUILD gap. A render failure shows a short message inside the site layout, with a way to try again. It does not print the exception text, a stack, or a connection string.
- Acceptance checklist:
  - [x] A forced render error shows the safe message
  - [x] The exception text is absent from the HTML
  - [x] Try again runs the segment again
- Test cases:
  - The error boundary in isolation
  - An error message that contains a fake database URL
  - Refresh after the failure is gone
- UI checks: the message is readable in both themes and at 360px
- Dependencies: none
- Suspected bugs: there is no `src/app/error.tsx`
- Bugs Found:
- Bugs Fixed:
- UI Issues Fixed:
- Files Changed:
- Notes:

### SEO-01 Metadata

- Files: `src/app/layout.tsx`, `src/app/page.tsx`, `src/app/incidents/[id]/page.tsx`
- Expected behavior: `lang` is `en`. Home and incident metadata set title, description, and Open Graph title, description, and URL when a public URL is saved. The layout alternate is `application/atom+xml` at `/feed.xml`. There is no sitemap and no robots file. That absence is not a build item.
- Acceptance checklist:
  - [x] View source of the home page contains the site name and the banner detail
  - [x] An incident page description is the latest update
  - [x] The feed alternate is present
- Test cases:
  - Default name
  - A public URL set and unset
  - A description containing quotes
- UI checks: none beyond the document title, which UI-03 also covers
- Dependencies: SET-01, API-03
- Suspected bugs: none recorded
- Bugs Found:
- Bugs Fixed:
- UI Issues Fixed:
- Files Changed:
- Notes:

### DEV-01 CI and database

- Files: `.github/workflows/ci.yml`, `package.json`, `migrations/app/20261028T1824_initial/`, `migrations/app/20261028T1943_check_lock/`, `prisma.config.ts`
- Expected behavior: CI uses Postgres 16, Node 24, `npm ci`, `prisma db migrate --yes`, lint, `npm test`, Playwright chromium, `npm run test:e2e`, `npm run build`, and typecheck. The build script migrates and then runs `next build`. Migrations create the status tables and the check lock. `DIRECT_DATABASE_URL` is the migration URL when it is set.
- Acceptance checklist:
  - [x] Migrate on an empty database succeeds
  - [x] Lint, unit tests, and typecheck succeed
  - [x] The production build succeeds
  - [x] A second migrate does not change applied migrations
- Test cases:
  - Clean database
  - Migrate twice
  - Build with the required environment variables
  - Unit tests without a network call to a real customer URL
- UI checks: the Playwright spec is an existing smoke test and still has to pass
- Dependencies: Docker or CI Postgres
- Suspected bugs: `package.json` depends on `next` 16.4.3, the version that reported a security advisory on the previous product
- Bugs Found:
- Bugs Fixed:
- UI Issues Fixed:
- Files Changed:
- Notes:

### DEV-02 Schedulers

- Files: `vercel.json`, `.github/workflows/upwell-checks.yml`, `.github/examples/scheduled-checks.yml`, `README.md`
- Expected behavior: Vercel cron calls `/api/cron/checks` at 12:00 UTC daily, in region `iad1`. The GitHub workflow calls the same path on a push to `main` with `STATUS_URL` and `CRON_SECRET`, and fails the step when either secret is empty. It does not run on a schedule. The example file is documentation, not a second live workflow. The admin interval is a separate setting and does not change the cron expression.
- Acceptance checklist:
  - [x] `vercel.json` still says `0 12 * * *`
  - [x] An unauthorized call is 401
  - [x] A call with the production secret returns ok
  - [x] The workflow file refuses to run with empty secrets
- Test cases:
  - Local cron call with the right and wrong secret
  - The workflow shell logic with empty variables, without printing the secret
  - A Hobby-sized daily interval of 86400 versus a five-minute interval of 300, and the delayed banner from PUB-05
- UI checks: none
- Dependencies: CHK-01
- Suspected bugs: none recorded
- Bugs Found:
- Bugs Fixed:
- UI Issues Fixed:
- Files Changed:
- Notes:

### DEV-03 Example seed

- Files: `src/prisma/seed.ts`, `README.md`
- Expected behavior: When at least one service exists, the command prints that seed was skipped and inserts nothing. When the table is empty, it inserts Example at `https://example.com` and Example mirror at `https://example.org`.
- Acceptance checklist:
  - [x] An empty table gains those two rows
  - [x] A second run adds nothing
- Test cases:
  - Empty database
  - A database that already has a service
  - Run twice in a row
- UI checks: the two names can appear on the public page after a check
- Dependencies: DEV-01
- Suspected bugs: none recorded
- Bugs Found:
- Bugs Fixed:
- UI Issues Fixed:
- Files Changed:
- Notes:

## Assumptions

- The product tree is `7d8bb92`, which is the same tree as `origin/main` `4216432`. The local checkout is on `fix/ipv4-probe`. `origin/dev` is behind that main.
- Untracked `public/favicon.svg` and `public/logo.svg` are local files. They are not features of the committed product and must not be committed as-is.
- One shared password is the finished account model. There is no second user, role, or invite.
- Probes never create incidents. That is closed in `VISION.md`.
- `UPWELL_ALLOW_LOOPBACK=1` is a test-only switch. A real deployment leaves it unset.
- Next.js server actions supply the cross-site check for admin forms. No separate CSRF token is defined in this repo.
- Email delivery is optional. Without Resend variables, webhooks still work and the admin warning is the intended signal.
- The live host named in `VISION.md` is https://upwell.rejisterjack.com. This report did not request it.
- Vercel adds HSTS on https. The app does not set that header itself.
- Playwright is already a CI step. Step 2 still uses Chrome DevTools for the browser checks in this report. Playwright is not a substitute for those checks.

## Risks

- `next` is 16.4.3. That version has a published security advisory. A later build or dev server may stop on it. This report does not upgrade it.
- On Vercel, probes pin the name with `assertPublicUrl` and then call platform fetch (`src/lib/probe.ts:115-116`). A DNS change between those steps is possible. Webhook posts do not re-check redirects.
- Login limiting trusts the first `X-Forwarded-For` hop (`src/lib/auth.ts:33-34`). A client that can reach the app directly can choose that address.
- The public status read loads services, incidents, updates, and daily stats in full (`src/lib/status-data.ts`). A large history makes every page heavier.
- `script-src` allows `unsafe-eval` in production (`next.config.ts:40`).
- The GitHub workflow fails closed when `STATUS_URL` or `CRON_SECRET` is unset. It runs only on a push to `main`. If those secrets are missing, that push is red and no extra probe runs.
- Neon can sleep on the free tier. The first request after idle can be slow, and a check run during that wake can time out.
- Hobby cron is daily. A page whose admin interval stays at 60 seconds will show Status delayed almost all day. The README already says to match the interval to the scheduler.

## Whole-Product Check

Admin routes redirect when the session is missing or the token is not a valid admin JWT. Public status, JSON, badge, and feed stay open. Secrets stay in the gitignored env files. The production response sets nosniff, a strict referrer policy, frame denial, a permissions policy, and a content security policy without unsafe-eval, and it does not send X-Powered-By. Login rate limiting and the check lock were exercised. `next build` completed. The login, probe, webhook, incident, and public-page journeys were used in the browser. Unknown paths return 404 with the public frame. Login, admin, home, and the error page set their titles. `/icon.svg` is served.

## Final Summary

The probe can reach a public HTTPS URL, the admin page shows why the latest check looks the way it does, settings stay inside their bounds, and the production content security policy leaves out unsafe-eval. Missing and broken pages stay inside the product's own wording. One email path cannot be accepted live until a Resend key and from-address exist.

## Totals

- Features: 38
- Passed: 37
- Blocked: 1
- P0: 20, of which 19 passed and 1 is blocked
- P1: 17, all passed
- P2: 1, passed
- Bugs found: 4
- Bugs fixed: 4
- UI issues fixed: 4

## Still Blocked

- ALT-02. `RESEND_API_KEY` and `ALERT_EMAIL_FROM` are empty in the local environment. Saving an email destination and crossing the failure threshold recorded a failed delivery with "Email alerts need RESEND_API_KEY and ALERT_EMAIL_FROM." The check did not crash. A live Resend 200 was not run.

## Known Limitations

- An unknown `/incidents/{id}` renders the branded not-found page. In development that response is HTTP 404. In the production build the same page is HTTP 200, because the route is partially prerendered and `dynamic = "force-dynamic"` cannot be set while cache components are on. A path that matches no route, such as `/no-such-page`, is HTTP 404.
- `example.com` does not resolve from this machine, so the seed's example.com URL was not probed. example.org was.
- Next.js 16.4.3 prints a security advisory during build. The build continues on the retry. The upgrade was not applied in this pass.
- Deferred, and left deferred: multi-admin accounts, incidents opened by probes, billing, APM, visitor email subscriptions, a committed every-minute Vercel cron, and delete confirmation.

## Launch Checklist

- [x] Lint, typecheck, vitest, and production build passed locally
- [ ] Pull request from `dev` to protected `main`
- [ ] CI green
- [ ] Branch protection restored after the merge
- [ ] Production deployment of the merge commit
- [ ] Live site responds
- [x] No downloadable package is part of this product

## Decision

GO. The blocked email item is an unset operator key, and the failure path was seen. The other 37 features passed, including the four gaps that were built.
