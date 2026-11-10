# Phase 9 Report — Seeds and Demo Experience

## Overview
Phase 9 has been delivered in full accordance with Section 9 of `docs/agent/DIRECTIVE.md`. The comprehensive demo dataset has been seeded to demonstrate the breadth, programmable extensibility, deterministic evaluation, and multi-tenant isolation of the CEDA Innovation Management Portal.

---

## 1. Flagship Instance: "CEDA Innovation Management Portal Hackathon 2026"
- **Canonical Definition (`src/lib/instance-engine/flagship.ts`)**:
  - Exact timeline across all 10 stages:
    1. Registration & Team Formation (2026-11-09 to 2026-11-12)
    2. Official Briefing Session (2026-11-13)
    3. Build Window & Sprints (2026-11-13 to 2026-11-23)
    4. Clarification Checkpoints (2026-11-16 & 2026-11-20)
    5. Final Submission & Integrity Seal (2026-11-20 to 2026-11-23 15:00 UTC)
    6. Administrative & Pre-flight Screening (2026-11-23 to 2026-11-24)
    7. Independent Blind Scoring (2026-11-25 to 2026-11-30)
    8. Top 5 Shortlist Announcement (2026-11-30 to 2026-12-01)
    9. Top 5 In-Person Pitch & Prize-Giving (2026-12-03)
    10. Award Ceremony & Disbursement (2026-12-03)
  - **Official 100-Point Rubric**:
    - Technical Architecture & Security (25%)
    - Portal Functionality & Workflows (20%)
    - General Platform & Cloud Hosting (15%)
    - UX, Accessibility & Design (15%)
    - Pitch Presentation & Documentation (15%)
    - Innovation & Distinctive Capabilities (10%)
    - 10% Public Vote weighting factored into adjudication.
  - **Statutory Eligibility Rules**:
    - Ages 18–35 (citizen youth).
    - >50% citizen youth equity shareholding.
    - CIPA registered entities only.
    - Full conflict declaration and Data Protection Act (DPA 2024) statutory consents.
  - **Official Prizes**:
    - 1st: P40,000 | 2nd: P25,000 | 3rd: P15,000 | 4th: P10,000 | 5th: P5,000.
    - Official contact: `hackathon@bih.co.bw`.

---

## 2. 10 Registered Teams Seeded as Sample Entries
Ten realistic Botswana youth teams were generated with complete team rosters, CIPA numbers, Omang IDs, submission files, fields, check results, evaluations, and audit chains:

1. **Team Kalahari Tech (`CEDA-HACK-001`)** — *Kalahari Engine — Tamper-Evident Portal*
   - Lead: Naledi Molefe (`innovator@demo.ceda.bw`, 3 members).
   - Status: `SHORTLISTED` | Rank: 1 | Mean Score: 94.5 | Consensus: 94.5.
   - Pre-flight checks: All PASS (magic bytes, size caps, zip-slip, 8/10 pdf pages, secrets scan, youth age, 100% shareholding, README present).
2. **Team Okavango Digital (`CEDA-HACK-002`)** — *Okavango Innovation Cloud & Adjudication Suite*
   - Lead: Kabelo Dintwe (`kabelo@demo.ceda.bw`, 2 members).
   - Status: `SHORTLISTED` | Rank: 2 | Mean Score: 91.0 | Consensus: 91.0.
   - Pre-flight checks: All PASS.
3. **Team Tswapong Systems (`CEDA-HACK-003`)** — *Tswapong Agile Grant Orchestrator*
   - Lead: Boitumelo Tau (`boitumelo@demo.ceda.bw`, 2 members).
   - Status: `SHORTLISTED` | Rank: 3 | Mean Score: 88.0 | Consensus: 88.0.
   - Pre-flight checks: All PASS.
4. **Team Chobe Code (`CEDA-HACK-004`)** — *Chobe Flow — Programmable Instance Runner*
   - Lead: Onalenna Kgari (`onalenna@demo.ceda.bw`, 2 members).
   - Status: `SHORTLISTED` | Rank: 4 | Mean Score: 85.5 | Consensus: 85.5.
   - Pre-flight checks: All PASS.
5. **Team Makgadikgadi Solutions (`CEDA-HACK-005`)** — *Makgadikgadi Verifiable Ideas Engine*
   - Lead: Tumelo Ramotswa (`tumelo@demo.ceda.bw`, 2 members).
   - Status: `SHORTLISTED` | Rank: 5 | Mean Score: 82.0 | Consensus: 82.0.
   - Pre-flight checks: All PASS.
6. **Team Shashe Cyber (`CEDA-HACK-006`)** — *Shashe Trust Engine & Zero-Trust Submissions*
   - Lead: Lorato Sebina (`lorato@demo.ceda.bw`, 2 members).
   - Status: `UNDER_REVIEW` | Rank: 6 | Mean Score: 78.0.
   - Pre-flight checks: All PASS.
7. **Team Limpopo Ventures (`CEDA-HACK-007`)** — *Limpopo Portal Core*
   - Lead: Mpho Kebonang (`mpho@demo.ceda.bw`, 2 members).
   - Status: `UNDER_REVIEW` | Rank: 7 | Mean Score: 74.0.
   - Pre-flight checks: All PASS.
8. **Team Tsodilo Labs (`CEDA-HACK-008`)** — *Tsodilo Innovation Matrix*
   - Lead: Thato Mosweu (`thato@demo.ceda.bw`, 1 member).
   - Status: `SUBMITTED` | Rank: 8 | Mean Score: 68.0.
   - Pre-flight checks: **`WARN` on `readme_check`** (*README.md missing from submission bundle; flagged for screener manual check*).
9. **Team Kgalagadi Pioneers (`CEDA-HACK-009`)** — *Kgalagadi NextGen Portal*
   - Lead: Neo Letswalo (`neo.innovator@demo.ceda.bw`, 2 members).
   - Status: `FLAGGED`.
   - Pre-flight checks: **`FAIL` on `magic_bytes`** (*Binary executable signature (MZ/PE) detected inside disguised PDF upload; blocked by pre-flight guard*).
10. **Team Motloutse Dynamics (`CEDA-HACK-010`)** — *Motloutse Developer Hub*
    - Lead: Kutlwano Ditshupo (`kutlwano@demo.ceda.bw`, 1 member).
    - Status: `DRAFT` (*Team formation and registration complete; submission in progress*).

---

## 3. Programmable Partner Challenges
- **"CEDA Youth Innovation Ideas Call 2026" (`ceda-ideas-2026`)**:
  - The legacy ideas flow fully migrated into a programmable Instance.
  - 6 categories (Agri, Digital, Green, Creative, Health/Education, Manufacturing).
  - 34 seeded applications with evaluations, discussions, and award records.
- **"BDIH Digital Leap Innovation Accelerator 2026" (`bdih-digital-leap-2026`)**:
  - Custom 3-criteria rubric (Technical Merit 40%, Market Traction 35%, Botswana Employment 25%).
  - Branded space at `/partners/bdih` with BDIH blue corporate palette.
- **"BTC 5G & Commercial IoT Challenge 2026" (`btc-5g-iot-challenge-2026`)**:
  - Rapid single-pitch challenge model (5G Fit 45%, Enterprise Scalability 35%, Data Sovereignty 20%).
  - Branded space at `/partners/btc` with BTC green & gold corporate palette.

---

## 4. Judges' 5-Minute Tour & Quick-Login Personas
- **Guided Tour View (`/judges`)**:
  - Accessible without login, linked prominently in header navigation.
  - 5 sequential 1-minute milestones:
    1. Multi-Tenant Architecture & Dynamic Branding
    2. Programmable Instance Engine & Cryptographic RulesHash
    3. Pre-Emptive Security Guards & Sealed Reports
    4. Deterministic Leaderboard & Collaborative Consensus
    5. Operational Governance, Live Chat & P734/mo Economics
- **Instant Role-Switcher**:
  - 1-click authentication into all 9 platform roles with password `CedaDemo2026!`:
    - Innovator: `innovator@demo.ceda.bw`
    - Evaluator: `evaluator@demo.ceda.bw`
    - Adjudicator / Panel: `panel@demo.ceda.bw`
    - Programme Admin: `admin@demo.ceda.bw`
    - Superadmin: `super@demo.ceda.bw`
    - Partner Admin (BDIH): `bdih.admin@demo.ceda.bw`
    - Partner Admin (BTC): `btc.admin@demo.ceda.bw`
    - Consultant: `consultant@demo.ceda.bw`
    - Committee Observer: `observer@demo.ceda.bw`
- Deep-link directory for instant verification of `/demo-inbox`, `/status`, `/api/audit/verify`, and `/api/v1/docs`.

---

## 5. Verification & Test Integrity
- `tsc --noEmit`: 0 errors.
- `next lint`: 0 errors, 0 warnings.
- `next build`: 68 routes statically and dynamically generated with zero compilation errors.
- Unit test suite: **53 of 53 tests passing** (`tests/*.test.ts`).
