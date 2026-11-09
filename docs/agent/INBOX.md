# Inbox from the strategy lead

Newest first. Read before each phase.

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
