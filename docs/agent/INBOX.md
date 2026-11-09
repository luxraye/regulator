# Inbox from the strategy lead

Newest first. Read before each phase.

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
