# CEDA Innovation Portal

A single place for young Batswana to submit innovative ideas to CEDA (Citizen Entrepreneurial Development Agency), have them scored fairly by independent evaluators, follow their application through every stage, and get funded or get feedback they can act on.

Built for the CEDA Innovation Portal hackathon (6–10 November 2026). See [`hackathon.md`](hackathon.md) for the plain-English pitch and a demo script.

## How it meets the brief (section 3.2)

| Requirement | What the portal does |
| --- | --- |
| **(a) Idea submission with mandatory fields** | Each call has its own form (problem, solution, novelty, customers, team, funding, jobs, impact, plus call-specific questions) with validation, draft saving, and required documents (pitch deck, CIPA certificate). Documents are SHA-256 hashed in the browser and on the server; a mismatch is refused. Submitting returns a signed receipt. |
| **(b) Multi-level evaluation** | Programme admin screens (with automatic eligibility, funding-ceiling, cost-per-job and answer-depth checks), then assigns 1–5 evaluators. Each evaluator declares conflicts of interest before seeing the idea, then scores blind on weighted criteria (1–5, weighted to 100) with feedback and a private note. When all scores are in, the idea moves to the adjudication panel, which sees a ranked shortlist, every scorecard side by side, and a flag where evaluators disagree by more than 20 points. Criteria and weights are customisable per call. |
| **(c) Real-time tracking and notifications** | Five-stage journey (Submission → Review → Feedback → Approval → Award) on every idea, in-app notifications for each transition, public tracking by reference, and USSD tracking with SMS confirmation for founders without data. |
| **(d) Role-based access** | Innovator, Evaluator, Adjudicator, Programme admin, Super admin. Enforced by middleware on pages and again in every API route. Evaluators never see Omang, age, gender or contact details. |
| **(e) Feedback and iteration** | Admins and the panel can request changes with a note; the innovator edits and resubmits (counted and audited). A message thread links innovator and CEDA, with internal notes for staff. After a decision, innovators see anonymous evaluator comments and per-criterion averages. |
| **(f) Reporting** | Participation (by call, sector, district, gender, age band, women-led and rural share), outcomes (funnel, success rate, total and average award, jobs promised), timelines (days to screening, shortlist, decision), evaluator workload, and CSV export without personal identifiers. |
| **(g) Scalability and modularity** | Calls are data, not code: a new call is a form schema plus criteria. Sector × stage matrix shows coverage. Stateless Next.js on Vercel with Postgres; files in the database with hashes; every list is indexed and paginated where it grows. |

**Eligibility (section 4.2):** citizens aged 18–35, applying through a CIPA-registered company more than 50% youth-owned. Checked at sign-up, again when starting an application, and shown on the innovator's dashboard. A public checker needs no account.

**Data Protection Act 2024:** recorded consent, privacy notice, Omang masked on screen, need-to-know access for evaluators, self-service JSON export of all personal data, and audit of every document download.

## Demo accounts

Every account uses the password `CedaDemo2026!`. The login page has one-click buttons for each role (hide them with `NEXT_PUBLIC_SHOW_DEMO_LOGINS=false`).

| Role | Email | What to look at |
| --- | --- | --- |
| Innovator | innovator@demo.ceda.bw | One idea awarded P320,000, one with changes requested and a message thread |
| Evaluator | evaluator@demo.ceda.bw | An idea waiting for a conflict declaration and scores |
| Adjudicator | panel@demo.ceda.bw | Ranked shortlist, including one with disagreeing evaluators |
| Programme admin | admin@demo.ceda.bw | Screening queue, assigning evaluators, calls, reports |
| Super admin | super@demo.ceda.bw | People and roles, sector matrix, verification tools, audit trail |

## Tech stack

Next.js 14 (App Router) and TypeScript, PostgreSQL with Prisma 5, Auth.js v5 (JWT sessions), Tailwind CSS, Recharts, Lucide icons. Installable as a PWA; English and Setswana on public pages.

## Running it

```bash
yarn
cp .env.example .env          # set DATABASE_URL, DIRECT_URL, AUTH_SECRET, JWT_SECRET
yarn db:generate
yarn db:push                  # on an existing BOCRA-era database: npx prisma db push --force-reset (wipes data)
yarn db:seed                  # demo calls, ideas, evaluations and accounts
yarn dev
```

## Deploying on Vercel

1. In the Vercel project, open **Storage**, create a **Neon** Postgres database and connect it to the project. This sets `DATABASE_URL` and `DATABASE_URL_UNPOOLED`.
2. Add `AUTH_SECRET` and `JWT_SECRET` (any long random strings) under **Settings → Environment Variables**.
3. Redeploy. The `vercel-build` script syncs the schema, seeds the demo data if the database is empty, then builds. Later deploys never re-seed a database that already has users.

## Security model

- **Document integrity:** SHA-256 in the browser before upload and again on the server; mismatches are rejected (HTTP 409). Files are stored in Postgres and re-hashed on every download.
- **Signed receipts:** on submission, an HS256 JWT binds the reference, title, answers hash and every document hash. Admins can re-verify any idea, or paste a receipt or file into the verification tools.
- **Locking:** submitted ideas can't be edited unless CEDA requests changes. Decisions use optimistic checks so two people can't decide at once.
- **Blind, conflict-checked review:** evaluators must declare before the idea is visible; a declared conflict hides it and alerts admins to reassign.
- **Audit trail:** every start, submission, assignment, declaration, score, decision, download, export and role change.

## Project structure

```
prisma/schema.prisma          Users, calls (Template), ideas (Instance), files, evaluations, messages, audit, notifications
prisma/seed.ts                Demo data for every role
src/lib/                      eligibility, scoring, decisions, reports, analysis (screening checks), labels, integrity
src/app/(public)/             home, calls, track, eligibility, register, login, about, privacy, USSD demo
src/app/dashboard/innovator   overview, open calls, my ideas, application runner, activity, my data
src/app/dashboard/evaluator   assignments, conflict declaration, scorecard
src/app/dashboard/panel       ranked shortlist and decisions
src/app/dashboard/admin       overview, ideas & screening, calls and criteria
src/app/dashboard/reports     participation, outcomes, timelines, CSV export
src/app/dashboard/superadmin  people & roles, sector matrix, verification, audit trail, settings
src/app/api/                  every action, each guarded by role
```

## Known limits

- Uploads are capped at 4 MB per file (Vercel request limit). Larger files would go to object storage.
- USSD and SMS are simulated in the browser; the same `/api/track` and `/api/calls` endpoints would sit behind a mobile-network gateway.
- Setswana copy covers the public pages and should be checked by a native speaker.
- This is a hackathon prototype, not an official CEDA service. Demo data is fictional.
