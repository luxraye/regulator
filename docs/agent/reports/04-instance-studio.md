# Phase 4: Instance Studio and Instance Console Report

**Date:** 2026-11-10  
**Branch:** `feat/instances-engine`  
**Phase:** 4 — Instance Studio and Instance Console  
**Status:** Completed & Tested (Quality gates green: 11/11 engine unit tests pass, `tsc --noEmit` 0 errors, `next lint` 0 errors/0 warnings, Next.js production build 49/49 routes compiled successfully, Playwright link-matrix smoke test passed).

---

## 1. Objectives Achieved

1. **Top-Level Navigation Priority (`src/lib/nav.tsx` & `src/middleware.ts`):**
   - Elevated **Instances** (`/dashboard/instances`) to the very first item in the dashboard navigation for CEDA staff (`ADMIN`, `SUPERADMIN`) and `PARTNER_ADMIN`.
   - Updated middleware route rules and Playwright E2E smoke test expectations to ensure role stability, aria-current active highlighting, and permission enforcement across the role matrix.

2. **Blueprint Catalog & Flagship Auto-Provisioning (`src/lib/instance-engine/blueprints.ts` & `flagship.ts`):**
   - Created reusable competition blueprints:
     - **Flagship Hackathon 2026**: 7-stage software competition with automated pre-flight security guards and P95,000 prize pool.
     - **AgriTech Innovation Challenge 2026**: Multi-stage agricultural innovation challenge focusing on smart irrigation, cold chain, and livestock tracking.
     - **CleanTech & Green Economy Accelerator 2026**: Renewable energy and circular economy challenge.
   - Built idempotent auto-seeder `ensureFlagshipInstance` to guarantee the flagship challenge is present on system startup.

3. **Instance Studio Builder (`src/components/instance-studio/studio-builder.tsx`, `/dashboard/instances/new`, `/[id]/edit`):**
   - Implemented an intuitive 11-section guided builder:
     1. Metadata (Name, slug, category, tiered Pula prize distribution, contact email).
     2. Timeline & Stages (Stage creation, kind selection, start/end ISO timestamps, role assignment, stage gates).
     3. Eligibility Rules (Atomic & compound predicates with failure messages).
     4. Team Policy (Min/max sizes, citizen lead requirement, required member fields).
     5. Form Builder (Multi-field per-stage questionnaires and file slots).
     6. Security Guards (Magic bytes binary MIME verification, archive inspection, size caps, malware detection).
     7. Faithfulness & Audit (Tamper-evident hash chaining, strict post-deadline freeze, DPA 2024 consent).
     8. Scoring Rubric (Interactive criterion weight editor with running total validation strictly enforcing 100%).
     9. Workflow & Gates (Screening gates, blind evaluation, conflict declarations, auto-advance thresholds).
     10. Privacy & Data Protection (DPA 2024 consent text, retention periods, regulatory authority attribution).
     11. Support Channels & Chat (Notification channels, FAQ manager, support contact directory, live chat setup).
   - **Bi-directional JSON Code View**: Real-time sync between visual section forms and raw JSON editor.
   - **Live Validation Panel**: Displays real-time pass/warn/error diagnostics powered by `validateInstanceDefinition`.
   - **Simulate Modal (Dry Run)**: Tests candidate profiles against rules and rubrics before publication.
   - **Publish Modal**: Seals the Instance, generates SHA-256 fingerprint, freezes version 1 snapshot, and activates public status.
   - **Versioned Mutation Modal**: Live published instances enforce version bumping with required audit log reason before mutations are committed.

4. **Instance Console (`src/app/dashboard/instances/[id]/page.tsx`):**
   - Single-pane oversight cockpit for competition administrators and judges:
     - Real-time stage progression with active countdown timer.
     - Operational KPI cards: Total registrations, eligible vs. rejected counts, guard check failures, evaluator progress percentage.
     - Automated Judge-Variance Flagging: Flags any submission where evaluator scores diverge by more than the rubric threshold (e.g. >= 20 points) requiring consensus review.
     - Consensus Status Indicator: Displays whether entries are ready for adjudication.
     - Version History Log: Displays historical sealed rulesets with timestamp, audit reason, and SHA-256 rules hash.
     - Tamper-Evident Audit Trail: Dedicated chronological event stream filtered to the instance.

5. **Public Challenge Directory & In-Browser Verifier (`src/app/instances/page.tsx`, `/[slug]/page.tsx`, `verifier-client.tsx`):**
   - Public directory displaying all active, upcoming, and past CEDA innovation challenges.
   - Dedicated public competition landing page featuring:
     - Live phase timeline and active countdown banner.
     - Human-readable eligibility requirements and team composition constraints.
     - Tiered prize rewards with Pula amounts.
     - Evaluation scoring rubric criteria breakdown.
     - FAQ accordions and DPA regulatory disclosure.
   - **In-Browser Rule Verifier (`verifier-client.tsx`)**: Allows participants and observers to verify the integrity of the published competition rules. Fetches definition from `/api/instances-public/[slug]/verify`, recomputes the SHA-256 canonical hash locally in the browser, and cryptographically matches it against the sealed server fingerprint.

6. **Home Page Integration (`src/app/(public)/page.tsx`):**
   - Updated hero messaging to: *"Every CEDA challenge, programmable and verifiable"*.
   - Added featured Flagship Hackathon 2026 card directing innovators to explore challenges and verify rules.

7. **Backend Engine APIs:**
   - `GET /api/instances-engine`: Lists all instances with partner tenant details and entry counts.
   - `POST /api/instances-engine`: Creates new instance from blueprint or custom definition.
   - `GET /api/instances-engine/[id]`: Full instance detail with console oversight metrics and audit logs.
   - `PUT /api/instances-engine/[id]`: Updates draft or triggers versioned live update (`updateLiveInstance`).
   - `DELETE /api/instances-engine/[id]`: Deletes empty draft or archives active instance.
   - `POST /api/instances-engine/[id]/publish`: Seals instance, computes `rulesHash`, freezes version snapshot.
   - `POST /api/instances-engine/[id]/clone`: Deep clones instance into a new editable DRAFT.
   - `POST /api/instances-engine/simulate`: Dry run execution against sample candidate profiles.
   - `GET /api/instances-public/[slug]`: Publicly accessible challenge metadata and timeline.
   - `GET /api/instances-public/[slug]/verify`: Public integrity verification endpoint returning canonical rules hash.

---

## 2. Quality Gates & Verification

- **TypeScript Typecheck:** `yarn typecheck` (`tsc --noEmit`) completed with **0 errors**.
- **ESLint:** `yarn lint` (`next lint`) completed with **0 errors, 0 warnings**.
- **Unit Tests:** `yarn tsx --test tests/instance-engine.test.ts` completed with **11/11 tests passing**.
- **Production Build:** `yarn build` completed with **49/49 static and dynamic routes successfully compiled**.
- **Smoke Tests:** `npx playwright test -g "role × link matrix"` passed cleanly.
