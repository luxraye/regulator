# Inbox from the strategy lead

Newest first. Read before each phase.

## 2026-11-10 09:50 UTC — HEADLINE VISION added to the brief (Fix 5)
The owner wants a signature "tech brought to life" experience: a **singularity / constellation hub** where an idea sits at the centre and the lifecycle stages orbit as nodes you click to branch into each section (the hub becomes the site index, collapsing the long page into one explorable map), plus a **"Play the journey"** control that animates one demo idea through the whole lifecycle end-to-end and loops (the "closed lifecycle sample timeline"), with restrained carousels/motion elsewhere. Think reach-everything-nothing-cumbersome, but **never at the cost of findability** — keep the plain nav + section list as a fallback, honour reduced-motion, keep Lighthouse ≥ 90. Full spec in **`docs/agent/ux-image-brief.md` → Fix 5 (5a constellation, 5b timeline, 5c motion, 5d non-negotiables)**. Build order: Fix 1 (navbar) + Fix 2 (hero) first for a fast win, then Fix 5a (static constellation + branching) for screenshots before polishing.

## 2026-11-10 09:40 UTC — NEW TASK: UX polish + image refresh (post-rollout)
The owner's feedback: the portal has all the features but "feels a bit much" and "it's not beautiful". The judging panel is not all developers — sophistication we must explain loses marks; depth that is self-explanatory wins. They want: a lab-interior hero, all images reviewed/replaced, the clumsy free-floating top navbar grouped into a few dropdown "cards", progressive disclosure (collapsibles + corner `(i)` info-buttons + simpler language), and an overall "wow" first impression where a visitor learns each section without guidance.
Full, buildable brief with the navbar grouping, the slot-by-slot image table (license-free Pexels/Unsplash candidates) and the copy examples: **`docs/agent/ux-image-brief.md`**. Read it in full.
Branch fresh from `main` (e.g. `feat/ux-polish`), open a PR, do NOT touch production. No schema/engine changes — presentation only, keep every feature working. Do Fix 1 (navbar) and Fix 2 (hero) first, push, and I'll review screenshots before the rest.

## 2026-11-10 07:10 UTC — ROLLOUT APPROVED (owner approved: "Yes, using a fresh DB copy")
Use this plan, not the in-place one in report 10. Production database `neondb` must not be changed, migrated, pushed to or seeded. It is our fallback.
1. Confirm CI on PR #6 is green, then merge `feat/instances-engine` into `main`.
2. On the same Neon production server (the host in the current prod DIRECT_URL), run `CREATE DATABASE ceda_instances;`. Make no other changes on that server.
3. Build connection strings for `ceda_instances` (same host and user, database name swapped). With ONLY those in your shell env, run `npx prisma db push` then `npx tsx prisma/seed.ts`. Before running, check that the env doesn't contain `neondb`.
4. Write down the current secret versions for DATABASE_URL and DIRECT_URL (version numbers, not the values). Then set new versions pointing at `ceda_instances` (`firebase apphosting:secrets:set`, backend ceda-portal, project neon-bw-3x0x).
5. Roll out App Hosting from `main`.
6. Verify every URL in report 10 step 4, including /api/health and all one-click logins.
7. If anything fails: point both secrets back at their previous versions and roll out the previous build. That restores the old site on `neondb`.
Never paste secret values into reports, STATUS.md or commits. Write reports/11-rollout.md with the result, then wait for the next instruction.

## 2026-11-10 07:00 UTC — Phase 9 reviewed, notes for Phase 10
- Phase 9 looks good, and I found no invented facts about the real event.
- The 10 seeded teams sit inside the real flagship hackathon Instance. A judge could read them as real registrants, which is wrong information under rule (m). Add a clear "Demo data: fictional teams for illustration" banner on /instances/ceda-hackathon-2026, its leaderboard and console, the partner Instances and the judges' tour. Do the same anywhere seeded people or companies appear publicly (/funded, /community).
- Phase 10 checklist: fresh-DB CI sequence green; Lighthouse mobile >= 90 on /, /instances, /judges; no console errors on the main pages; README and user manual updated for Instances; `yarn build` has no warnings you can fix. Then write reports/10-release.md with a rollout plan (schema migration steps for prod) and STOP. I'll review it and approve the rollout in this file. Do not touch prod before that.

## 2026-11-10 06:55 UTC
- Thanks for 08b, mostly right. One hole left: forgot-password and otp/send mirrored the code to the *requester's* inbox, so anyone could request a reset or OTP for another person's (non-demo) account and read it in their own browser. I pushed a fix: `inboxOwnsDestination()` in `src/lib/comms/session.ts`. Codes and reset links now reach the demo inbox only when this browser registered that account. Tested: the attacker's inbox stays empty, and the owner still sees everything. All 33 smoke tests pass. Pull before touching those files.
- Carry on with Phase 9.

## 2026-11-10 01:10 UTC — Phase 8 security fix BEFORE Phase 9 (blocks rollout)
Phase 8 looks good overall, but the demo inbox opens an account takeover:
- `GET /api/demo-inbox` is public and returns every message, including password reset tokens and OTP codes. Anyone can request a reset for `super@demo.ceda.bw` (or any real person who registers), read the token, and take the account. They can also lock judges out of the one-click demo logins by changing those passwords.
- `DELETE /api/demo-inbox` has no auth at all.

Fix, in this order:
1. `DELETE /api/demo-inbox`: SUPERADMIN only.
2. Seeded demo accounts (`*@demo.ceda.bw`) can't have their password changed or reset, and OTP sign-in can't be used to enter them. Show a friendly "demo accounts use the shared demo password" message. This keeps the one-click logins working for judges.
3. Scope the inbox to the requester: when `/api/auth/forgot-password`, `/api/auth/otp/send` or registration sends a message, set an httpOnly cookie with a random inbox id and store that id on the DemoInboxMessage. `GET /api/demo-inbox` returns only messages whose inbox id matches the caller's cookie (SUPERADMIN can see all, with tokens and codes masked). So a judge sees their own codes in the same browser, and nobody else can.
4. Add rate limiting to forgot-password, otp/send and otp/verify (for example 5 per 15 minutes per IP and per destination, in-memory is fine), and lock OTP verification after 5 wrong codes.
5. Add smoke tests: an anonymous `GET /api/demo-inbox` sees no reset tokens from another session, an anonymous DELETE returns 401/403, and a reset request for a demo account doesn't change its password.
Write report 08b-inbox-security.md, keep CI green, then carry on with Phase 9.

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
