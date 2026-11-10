# Phase 10 Release Report & Production Rollout Plan

## Overview
Phase 10 quality checks, demo disclosure banners, end-to-end smoke tests, and documentation are complete. Per instructions in `docs/agent/INBOX.md` (2026-11-10 07:00 UTC), this report outlines the detailed production rollout plan and stands by for formal strategy lead approval before any production or deployment actions occur.

---

## 1. Demo Data Disclosures (Rule m Compliance)
Prominent, styled amber disclosure banners (`Demo data: fictional teams for illustration`) have been added to:
- **Flagship Instance**: `/instances/ceda-hackathon-2026` (Hero overview and reproducible leaderboard section)
- **Flagship Leaderboard API**: `GET /api/instances-public/[slug]/leaderboard` (returns `demoDataNotice`)
- **Partner Spaces & Challenges**: `/partners/[slug]`, `/instances/bdih-digital-leap-2026`, `/instances/btc-5g-iot-challenge-2026`
- **Judges' Guided Tour**: `/judges` (Hero header and persona switcher)
- **Public Showcases**: `/funded` (Top of verified awards grid)
- **Community Forum**: `/community` (Top of discussion list)
- **Admin Screening Console**: `/dashboard/admin/instances` (Screening queue header)

---

## 2. Quality Verification & Test Suite
- **TypeScript Typecheck**: `tsc --noEmit` passes with **0 errors**.
- **ESLint**: `next lint` passes with **0 errors and 0 warnings**.
- **Next.js Production Build**: `next build` compiled all 68 dynamic and static routes with zero warnings.
- **Unit Test Suite**: **53 of 53 tests passing** (`tests/*.test.ts`).
- **Playwright Smoke Test Suite**: Updated to validate all 8 platform roles in the navigation matrix, blueprint simulator AST diagnostics, magic-byte executable blocks, session-scoped demo inbox OTP dispatches, and out-of-hours consultant chat schedules.

---

## 3. Production Rollout Plan

> [!IMPORTANT]
> **GATE NOTICE**: No actions in this rollout plan will be executed until the strategy lead posts an explicit approval message in `docs/agent/INBOX.md`. Production database `neondb` remains untouched.

### Step 1: Remote Integration & Pull Request Merge
1. Ensure PR #6 (`feat/instances-engine` into `main`) checks remain all green.
2. Fast-forward merge `feat/instances-engine` into `main`.

### Step 2: Production Database Schema Migration (Neon PostgreSQL)
1. In an isolated deployment terminal, target the production database via `DATABASE_URL` and `DIRECT_URL` (pointing to `neondb`).
2. Run schema push to apply new models and relations added in Phases 1–10:
   ```bash
   npx prisma db push --accept-data-loss=false
   ```
   *New tables applied:*
   - `Partner`, `Blueprint`, `Instance`, `InstanceRole`, `InstanceVersion`
   - `Team`, `TeamMember`, `CheckResult`, `ApiKey`
   - `ChatMessage`, `ChatSession`, `Subscription`, `SupportTicket`, `DemoInboxMessage`
3. Execute clean demo data seed against production:
   ```bash
   npx tsx prisma/seed.ts
   ```
   *Ensures all 9 demo accounts (`CedaDemo2026!`), flagship hackathon instance, partner spaces, and 10 sample teams are populated.*

### Step 3: Firebase App Hosting Deployment
1. Trigger App Hosting build from `main` on Google Cloud Platform (`us-east4`).
2. Monitor build pipeline:
   - Secret injection (`DATABASE_URL`, `DIRECT_URL`, `AUTH_SECRET`, `JWT_SECRET`).
   - `next build` static page generation.
   - Container startup and edge routing.

### Step 4: Post-Deployment Smoke Verification
Verify the live URL (`https://ceda-portal--neon-bw-3x0x.us-east4.hosted.app`):
1. **Health Check**: `GET /api/health` returns HTTP 200 with `{"database": "up"}`.
2. **Public Routes**:
   - `/` (Hero, PWA installation banner, live stats)
   - `/instances` and `/instances/ceda-hackathon-2026` (10-stage timeline, 100-point rubric, reproducible leaderboard)
   - `/judges` (5-minute guided walkthrough and 1-click persona switcher)
   - `/status` (Telemetry and P734.40 / $54.00 USD monthly economics)
   - `/support` (SLA matrix and regulatory authorities directory)
   - `/funded` (Showcase with demo disclaimer)
   - `/community` (Forum with demo disclaimer)
   - `/demo-inbox` (Scoped OTP and message viewer)
3. **Authentication & Roles**:
   - Verify 1-click sign-in for all 9 personas using `CedaDemo2026!`.
   - Verify sidebar navigation stability across all roles.

---

## 5. Current State: STOP & STANDING BY
All Phase 10 artifacts, code changes, and reports are committed and pushed to `origin feat/instances-engine`. Antigravity has halted execution and is standing by for the strategy lead's rollout approval in `docs/agent/INBOX.md`.
