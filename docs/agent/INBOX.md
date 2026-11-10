# Inbox from the strategy lead

Newest first. Read before each phase.

## 2026-11-10 00:40 UTC
- Good progress: Phases 5 to 7 reviewed, CI green on each. API key auth and partner scoping in v1 look right.
- Rule (m) says wrong information can disqualify us, so facts about the real hackathon must match the official guidelines exactly. I removed invented details from the flagship: prize extras ("Incubation & Pilot Deployment Contract", "CEDA Mentorship", "Tech Advisory"), the contact email (it is hackathon@bih.co.bw, not @ceda.co.bw), eligibility (businesses only, citizen youth 18 to 35, teams of 1 to 5), and the home page now says 10 stages to match the timeline. This changes the flagship rulesHash: re-create the flagship Instance on your dev DB.
- From now on, never invent facts about the real CEDA hackathon. If unsure, leave it out or ask in STATUS.md. Demo partners (BDIH, BTC) in seed data can stay fictional, but label them as demo data in the UI.
- Next: Phase 8, then 9 and 10. No rollout to App Hosting until I approve here.

## 2026-11-09 23:55 UTC
- CI on PR #6 was red again after e7cb3d7: `/` and `/instances` returned 500. Cause: `ensureFlagshipInstance` wrote a `publishedAt` field that the Instance model doesn't have, never set the required `createdById` on InstanceVersion, and relied on a "ceda" partner that only the SQL migration creates (CI uses `db push` + seed). The `prismaClient: any` type hid all three from tsc.
- I pushed a fix to `src/lib/instance-engine/flagship.ts`: it upserts the CEDA partner, credits version 1 to the first SUPERADMIN/ADMIN, and catches errors so a page never 500s because of it. All 28 smoke tests pass against a fresh `db push` + seed. Pull before touching that file.
- Rules from here: type Prisma clients as `PrismaClient` (not `any`), and before each push run the CI sequence on a fresh DB: `prisma db push` → `tsx prisma/seed.ts` → `yarn build` → `yarn start` → `npx playwright test`. Anything the app needs at runtime must be seeded in `src/lib/seed-demo.ts`, not only in a SQL migration.
- Next: carry on with Phase 5 (guards and pre-flight).

## 2026-11-09 21:45 UTC
- CI on PR #6 was red: the smoke test looked for the old `bg-ceda-blue` active class. I pushed f28271a, which adds `aria-current="page"` to the active sidebar link and makes the test look for that. Pull before editing `dashboard-sidebar.tsx` or `smoke.spec.ts`.
- Keep CI green: check the PR's checks after each push and fix any red before moving on.

## 2026-11-09 21:35 UTC — APPROVED by the owner: restore production now
The owner approved resetting the production database. Do this before continuing:
1. Make sure your dev database is already set up and your working `.env` points at it.
2. Check out `main` (beae8b1) in a separate folder, for example `git worktree add ../regulator-main main`.
3. In that folder, using the **production** `DATABASE_URL` and `DIRECT_URL` (set them only for this command, not in your working `.env`):
   - run `npx prisma db push --force-reset --accept-data-loss`, then `npx tsx prisma/seed.ts`
   - also run `prisma/seed-community.ts` if `main`'s seed doesn't include the forum data
4. Verify on https://ceda-portal--neon-bw-3x0x.us-east4.hosted.app that `/`, `/funded`, `/calls`, `/community` and `/api/health` respond, and that all 5 demo logins work.
5. Write `reports/02b-prod-restore.md`, update STATUS.md and push. Then continue Phase 3 on the dev database only.

## 2026-11-09 21:25 UTC — IMPORTANT
- Your Phase 2 migration ran on the **production** Neon database, which the live site uses. The live site's `/` and `/funded` now return HTTP 500.
- **Do not run anything else against the production database.** A fix is waiting on the owner's approval. I will post it here.
- For your own work, create a separate dev database and point your working `.env` at it:
  - Preferred: `CREATE DATABASE ceda_dev;` in the same Neon project.
  - Otherwise, a Neon branch named `dev`.
- Apply migrations and seeds only to the dev database. Keep the production URLs out of your working `.env`.
- Continue with Phase 3.

## 2026-11-09 19:36 UTC
- Do NOT build any repository commit-window / commit-date check. It has been removed from the directive. Skip it everywhere (definition schema, guards, Simulate, seeds, docs).

## 2026-11-09 19:45 UTC
- Start with `docs/agent/DIRECTIVE.md`, Phase 1. Open the draft PR from `feat/instances-engine` as soon as you have your first commit.
