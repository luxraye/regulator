# Phase 2: Data Model and Migration Report

**Date:** 2026-11-09  
**Branch:** `feat/instances-engine`  
**Phase:** 2 — Data Model and Migration  
**Status:** Completed  

---

## 1. Objectives Achieved

1. **Prisma Schema Overhaul (`prisma/schema.prisma`):**
   - **`Partner`**: Tenant isolation for competition organisers (`id`, `name`, `slug`, `logoUrl`, `primaryColor`, `secondaryColor`, `status`).
   - **`Blueprint`**: Versioned competition definitions (`id`, `key`, `name`, `version`, `definition` JSON, `status`, `publishedAt`).
   - **`Instance`**: One live competition run (`id`, `partnerId`, `blueprintId`, `name`, `slug`, `definition` JSON, `rulesHash`, `status` [DRAFT, PUBLISHED, LIVE, CLOSED, ARCHIVED], `opensAt`, `closesAt`).
   - **`InstanceRole`**: Scoped user roles per instance (`ORGANISER`, `EVALUATOR`, `ADJUDICATOR`, `OBSERVER`, `CONSULTANT`, `MENTOR`).
   - **`InstanceVersion`**: Audit trail of configuration modifications post-publish with diff, reason, rulesHash, and creator.
   - **`Team` & `TeamMember`**: Multi-member innovator teams (1 to 5 members), team leads, equity shareholding, national ID (Omang) verification.
   - **`CheckResult`**: Guard & pre-flight security evaluation entries with evidence hashes.
   - **Dynamic Classification Matrix**: `MatrixDimension`, `MatrixDimensionValue`, and `TemplateMatrixTag` to allow N-dimensional track classification.
   - **`ApiKey`**: Partner-scoped hashed API keys (`keyPrefix`, `keyHash`).
   - **`AuditLog`**: Hash-chaining readiness (`prevHash`, `hash`) and dual referencing (`entryId`, `instanceId`).
   - **Concept Disambiguation (`Instance` -> `Entry`)**:
     - Renamed regulatory submission model from `Instance` to `Entry` (mapped cleanly to table `"entries"`).
     - Renamed submission files and fields to `EntryFile` (`entry_files`) and `EntryField` (`entry_fields`).
     - Aligned `Evaluation`, `Message`, and `AuditLog` relations to `Entry` via `entryId`.

2. **Lossless Neon PostgreSQL Database Migration:**
   - Authored migration `prisma/migrations/20261109203000_init_instances_engine/migration.sql`.
   - Renamed existing tables:
     - `"Instance"` -> `"entries"`
     - `"InstanceFile"` -> `"entry_files"`
     - `"InstanceField"` -> `"entry_fields"`
   - Cast `entries.status` cleanly from `InstanceStatus` to `EntryStatus`.
   - Created all new engine tables with cascading foreign keys and indexes.
   - Seeded default partner: `"Citizen Entrepreneurial Development Agency"` (`slug: ceda`).
   - Seeded default competition instance: `"CEDA Youth Innovation Ideas Call 2026"` (`slug: ceda-ideas-2026`).
   - Linked all 43 existing idea dossiers and tracks to the default competition instance.
   - Baselined migration in `_prisma_migrations`.

3. **Application & Client Code Adaptation:**
   - Centralized type compatibility layer in `src/lib/types.ts`.
   - Adapted all submission and evaluator routes:
     - `/api/instances/` (listing & draft entry creation)
     - `/api/instances/[id]/fields`, `/api/instances/[id]/upload`, `/api/instances/[id]/files/[fileId]`
     - `/api/instances/[id]/submit`, `/api/instances/[id]/integrity`
     - `/api/instances/[id]/assign`, `/api/instances/[id]/decision`, `/api/instances/[id]/messages`
     - `/api/evaluations/[id]`, `/api/evaluations/reset-demo`
     - `/api/track`, `/api/verify`, `/api/me`, `/api/templates`
   - Adapted all dashboard and public pages:
     - Public portal (`/`, `/funded`, `/verify/[ref]/[code]`, `/calls/[code]`, `/community`)
     - Admin dashboard & ideas list (`/dashboard/admin`, `/dashboard/admin/instances`)
     - Evaluator scorecard queue & details (`/dashboard/evaluator`, `/dashboard/evaluator/[id]`)
     - Innovator dossier runner & history (`/dashboard/innovator`, `/dashboard/innovator/instances`, `/dashboard/innovator/instance-runner/[id]`)
     - Adjudication panel shortlist (`/dashboard/panel`)
     - Superadmin verification & reports (`/dashboard/superadmin/audit`, `/dashboard/superadmin/matrix`, `/dashboard/reports`)

4. **Demo Data Re-Seeding:**
   - Updated `src/lib/seed-demo.ts` and `prisma/seed.ts` to reset and seed the new relational model.
   - Executed `npx prisma db seed`:
     - 49 users
     - 43 ideas (all 5 existing demo roles work end-to-end)
     - 7 community discussions
     - Default credentials preserved (`CedaDemo2026!`).

5. **Verification & Quality Assurance:**
   - `npx tsc --noEmit` passed with 0 errors.
   - `npm run lint` passed with 0 errors.
   - Next.js production build (`npm run build`) succeeded across all 43 static and dynamic routes.
