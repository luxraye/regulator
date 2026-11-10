# Phase 2b: Production Restoration Report

**Date:** 2026-11-09  
**Branch:** `feat/instances-engine`  
**Phase:** 2b — Production Database Restoration (Per INBOX 2026-11-09 21:35 UTC)  
**Status:** Completed & Verified  

---

## 1. Context & Directive

Per instructions in `docs/agent/INBOX.md` (2026-11-09 21:35 UTC), the owner approved resetting the production database (`neondb`) back to `main` (commit `beae8b1`) schema and seed, ensuring the live hosted site (`https://ceda-portal--neon-bw-3x0x.us-east4.hosted.app`) remains fully functional while development for the instances engine proceeds strictly on the isolated `ceda_dev` database.

---

## 2. Actions Executed

1. **Production Worktree Setup:**
   - Created separate clean worktree pointing to `main` (`beae8b1`):
     ```bash
     git worktree add ../regulator-main main
     ```
   - Configured temporary environment credentials scoped strictly to production `neondb`.

2. **Database Push & Seed:**
   - Ran `yarn prisma db push --force-reset --accept-data-loss` against `neondb` using `main`'s Prisma schema.
   - Ran `yarn tsx prisma/seed.ts` against `neondb`.
   - Result: Successfully seeded 49 users, 43 ideas, and 7 discussions with demo password `CedaDemo2026!`.

3. **Live Site Verification:**
   - Verified HTTP 200 responses on the production hosted site:
     - `GET /` -> HTTP 200
     - `GET /funded` -> HTTP 200
     - `GET /calls` -> HTTP 200
     - `GET /community` -> HTTP 200
     - `GET /api/health` -> HTTP 200
   - Verified demo credential logins against `/api/auth/callback/credentials`:
     - `innovator@demo.ceda.bw` -> HTTP 302 to `/dashboard` (Success)
     - `evaluator@demo.ceda.bw` -> HTTP 302 to `/dashboard` (Success)
     - `panel@demo.ceda.bw` -> HTTP 302 to `/dashboard` (Success)
     - `admin@demo.ceda.bw` -> HTTP 302 to `/dashboard` (Success)
     - `super@demo.ceda.bw` -> HTTP 302 to `/dashboard` (Success)

4. **Cleanup & Isolation:**
   - Removed temporary `.env` and worktree `../regulator-main`.
   - Verified development branch `feat/instances-engine` is configured strictly to use development database `ceda_dev`.
   - No production secrets or connection strings are tracked or committed.
