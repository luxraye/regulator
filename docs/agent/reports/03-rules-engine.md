# Phase 3: Definition Schema, Rules Engine & Compiler Report

**Date:** 2026-11-09  
**Branch:** `feat/instances-engine`  
**Phase:** 3 — Definition Schema, Rules Engine and Compiler  
**Status:** Completed & Tested (11/11 tests passing, zero lint warnings, full Next.js production build passing)  

---

## 1. Objectives Achieved

1. **TypeScript Type System & Zod Schema for the 11 Programmable Sections (`src/lib/instance-engine/types.ts` & `schema.ts`):**
   - Implemented strong types and complete Zod schemas for all 11 competition sections:
     1. **`meta`**: title, slug, partner tenant, description, category, tiered prizes (`Pula` and reward perks), banner, and contact email.
     2. **`timeline`**: multi-stage timeline (`registration`, `eligibility_check`, `briefing`, `build_window`, `submission`, `screening`, `scoring_round`, `shortlist`, `clarification`, `live_pitch`, `public_vote`, `award`), active dates, role permissions, and gate transitions.
     3. **`eligibility`**: atomic and compound AST predicates (`eq`, `neq`, `gt`, `gte`, `lt`, `lte`, `between`, `in`, `contains`, `all`, `any`, `not`) with bilingual diagnostics (Setswana/English).
     4. **`team`**: bounds (`minSize` 1 to `maxSize` 5), lead Omang verification, youth shareholding threshold (> 50%), and CIPA company registration requirement.
     5. **`forms`**: dynamic per-stage form schemas (`short_text`, `long_text`, `number`, `select`, `multiselect`, `file_upload`, `date`, `checkbox`, `currency`), validation rules, and file constraints.
     6. **`guards`**: pre-flight security guards (magic byte MIME verification, uncompressed archive explosion limits, mock malware / EICAR signature scanner).
     7. **`faithfulness`**: tamper-evident hash chaining and submission cryptographic signing checks.
     8. **`rubric`**: multi-criteria scoring rubric, explicit percentage weights (enforcing strict 100% sum), blind evaluation, consensus triggers, and disagreement variance threshold.
     9. **`workflow`**: progression state machine, evaluation assignment modes (`ROUND_ROBIN`, `MANUAL`, `EXPERTISE_MATCHED`), and auto-advance policies.
     10. **`privacy`**: Botswana Data Protection Act 2024 compliance settings, PII masking rules, Omang obfuscation, and data retention windows.
     11. **`channels`**: SMS/Email/In-portal notifications, structured FAQ accordions, direct support directory with turnaround SLAs, and live advisor chat configuration.
   - Strictly excluded repository commit-window/date checks per directive amendment.

2. **Friendly Diagnostics Validator (`src/lib/instance-engine/validator.ts`):**
   - Returns structured `ValidationErrorDetail` items with exact section, path, and human-readable feedback.
   - Validates business integrity:
     - Rubric criterion weights must sum to exactly 100%.
     - Stage start dates cannot exceed end dates.
     - Minimum team size cannot exceed maximum team size.
     - Warns on stage ordering and orphaned stage references in form configurations.

3. **Deterministic Canonicalizer & Cryptographic Fingerprinter (`src/lib/instance-engine/canonical.ts`):**
   - `canonicalizeJson(obj)` performs deep recursive lexicographical key sorting and normalized JSON serialization.
   - `computeRulesHash(obj)` calculates a deterministic SHA-256 hex digest (`rulesHash`) guaranteeing byte-for-byte reproducibility regardless of object property ordering.

4. **Deterministic Rule Evaluator (`src/lib/instance-engine/rules.ts`):**
   - Evaluates applicant and team dossiers against atomic rules and nested AST structures (`all`, `any`, `not`).
   - Supports contextual lookups against Omang, youth shareholding, CIPA registration, team sizing, and custom submission fields.
   - Generates bilingual pass/fail audit messages in English and Setswana.

5. **Runtime Compiler (`src/lib/instance-engine/compiler.ts`):**
   - Compiles raw `InstanceDefinition` into active stage timeline status (`PAST`, `ACTIVE`, `FUTURE`), time remaining countdowns, active stage gates, active stage forms, normalized rubric criteria, and guard checklists.

6. **Flagship Competition Definition (`src/lib/instance-engine/flagship.ts`):**
   - Authored the flagship `CEDA Innovation Management Portal Hackathon 2026` (`ceda-hackathon-2026`) fully configuring all 11 sections.

7. **Immutability & Audit Service (`src/lib/instance-engine/service.ts`):**
   - `publishInstance`: Validates definition, compiles runtime configuration, generates canonical `rulesHash`, freezes status to `PUBLISHED`, and logs initial audit record.
   - `updateLiveInstance`: Enforces immutability on live instances. Rejects updates with unchanged definitions; requires an audit reason, validates modifications, bumps `InstanceVersion`, updates `rulesHash`, logs audit entry, and dispatches change alerts to participants.

---

## 2. Test Suite & Verification Results

- **Automated Unit Tests (`tests/instance-engine.test.ts`):**
  - **11 / 11 tests passing (100% pass rate in 1.67s)**:
    - `Flagship Hackathon 2026 definition passes full validation with zero errors` (✔)
    - `Fails validation when rubric weights do not sum to 100%` (✔)
    - `Fails validation when timeline dates are inverted` (✔)
    - `Fails validation when team min exceeds team max` (✔)
    - `Deep key order invariance produces identical canonical JSON and rulesHash` (✔)
    - `Any modification to definition payload strictly alters the rulesHash fingerprint` (✔)
    - `Passes fully eligible youth innovator team` (✔)
    - `Fails with clear diagnostic when youth shareholding is <= 50%` (✔)
    - `Fails when applicant age is outside youth window (> 35)` (✔)
    - `Evaluates compound ASTs (ALL, ANY, NOT) accurately` (✔)
    - `Compiles definition into active stage timeline, form schema and guard checklist` (✔)
- **TypeScript Static Verification:**
  - `yarn typecheck` (`tsc --noEmit`): **0 errors across entire repository**.
- **ESLint Quality Verification:**
  - `yarn lint` (`next lint`): **0 errors, 0 warnings**.
- **Production Build Verification:**
  - `yarn build`: **All 43 static & dynamic routes compiled cleanly in Next.js 14.2.35**.
- **Dev Database Isolation:**
  - `ceda_dev` database schema pushed and fully seeded with 49 demo users, competition instances, and ideas.
