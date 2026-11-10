# CEDA Innovation Management Portal — Hackathon 2026 Submission

## 1. Executive Summary & Vision

The **CEDA Innovation Management Portal** is an end-to-end, tamper-evident digital platform built to modernize national innovation funding, venture evaluation, and challenge administration for the Citizen Entrepreneurial Development Agency (CEDA) and its strategic partners (Botswana Digital & Innovation Hub, BTC Innovation).

Built specifically for the **CEDA Innovation Management Portal Hackathon 2026**, the platform transforms ad-hoc application intakes and spreadsheet evaluations into a programmable, mathematically verifiable competition operating system.

---

## 2. Platform Architecture & Core Innovations

### 2.1 Programmable Instances Engine
Competitions are no longer hardcoded database entries. Every challenge is defined as a machine-executable JSON specification:
- **Canonical Key-Order Invariance (`canonicalizeJson`)**: Normalizes AST rules, timelines, rubrics, and guard configurations into a standardized JSON representation.
- **SHA-256 RulesHash**: Produces a tamper-evident cryptographic fingerprint. Any alteration to judging rubrics, eligibility criteria, or deadlines immediately invalidates the hash.
- **Instance Studio Builder (`/dashboard/instances`)**: An 11-section studio where administrators create, dry-run simulate, compile, and publish new challenges.

### 2.2 Pre-Emptive Zero-Trust Security Guards
Client-side and server-side validation executes before files touch permanent storage:
- **Magic-Byte Sniffing**: Inspects raw binary headers (`%PDF-`, `PK\x03\x04`, `\x89PNG`, `\xFF\xD8\xFF`) to block executables (PE/MZ) disguised with safe extensions.
- **Zip-Slip & Compression Ratio Scanner**: Neutralizes path-traversal attacks (`../`) and decompression bombs (enforcing a 100:1 maximum expansion ratio).
- **Automated Secret & Malware Scanner**: Masks exposed API keys, private keys, or credentials and generates sealed SHA-256 integrity reports.
- **PDF Page Boundary Guard**: Enforces strict page caps (maximum 10 pages for technical proposals).

### 2.3 Mathematical Leaderboard Reproducibility & Audit Hash Chaining
- **Deterministic Leaderboard (`computeLeaderboard`)**: Recomputes standings from verified evaluator scorecards, applying rubric weights, tie-breaking criteria, and conflict exclusions to generate a public `leaderboardHash`.
- **Tamper-Evident Audit Chaining**: Every critical state transition (submission, pre-flight gate, scorecard submission, consensus recording, award disbursement) is sequentially chained (`prevHash` -> `hash`) using SHA-256. Continuous whole-ledger verification is publicly verifiable via `/api/audit/verify`.

### 2.4 Multi-Tenant Partner Spaces
- **Scoped Partner Workspaces (`/partners/bdih`, `/partners/btc`)**: Autonomous, dynamically branded tenant portals with dedicated corporate palettes, SVG logos, and isolated data boundaries.
- **Partner API v1 & HMAC Webhooks**: Scoped API credentials (`ceda_live_...`) with outbound webhook events signed with HMAC-SHA256 digests.

### 2.5 Operational Governance & Live Advisory
- **CEDA Consultant Live Chat**: In-app chat queue operating Monday to Friday from 09:00 to 16:00 CAT (UTC+2) respecting all official Botswana statutory holidays.
- **Statutory Regulatory Directory**: Verified directory of all 8 national regulatory authorities (CIPA, BURS, NBFIRA, BOCRA, CCA, IDPC, BOBS, LEA) embedded in `/support`.
- **Collaborative Consensus & Committee Observer**: Evaluator consensus alignment threads and real-time short-polling telemetry dashboards for statutory observers.

---

## 3. Strict Compliance with Official Hackathon Rules (Rule m)

In strict adherence to official competition directives:
- **Eligibility**: Open strictly to citizen youth aged 18 to 35, registered businesses (CIPA), with greater than 50% citizen youth equity shareholding.
- **Teams**: Teams of 1 to 5 members with designated citizen youth team leads.
- **Official 10-Stage Timeline**:
  1. Registration & Team Formation (09–12 Nov)
  2. Official Briefing Session (13 Nov)
  3. Build Window & Sprints (13–23 Nov)
  4. Clarification Checkpoints (16 & 20 Nov)
  5. Final Submission & Integrity Seal (20–23 Nov 15:00 UTC)
  6. Administrative & Pre-flight Screening (23–24 Nov)
  7. Independent Blind Scoring (25–30 Nov)
  8. Top 5 Shortlist Announcement (30 Nov–01 Dec)
  9. Top 5 In-Person Pitch & Prize-Giving (03 Dec)
  10. Award Ceremony & Disbursement (03 Dec)
- **Official 100-Point Rubric**:
  - Technical Architecture & Security (25%)
  - Portal Functionality & Workflows (20%)
  - General Platform & Cloud Hosting (15%)
  - UX, Accessibility & Design (15%)
  - Pitch Presentation & Documentation (15%)
  - Innovation & Distinctive Capabilities (10%)
  - 10% Public Vote weighting factored into adjudication.
- **Prizes**: 1st: P40,000 | 2nd: P25,000 | 3rd: P15,000 | 4th: P10,000 | 5th: P5,000.
- **Official Contact**: `hackathon@bih.co.bw`.

---

## 4. Hosting Infrastructure & Operating Economics

Publicly disclosed and live-monitored at `/status`:
- **Application Hosting**: Google Cloud Platform Firebase App Hosting (Region: `us-east4`, North Virginia).
- **Database**: Neon Serverless PostgreSQL (Region: `us-east-1`), featuring automated branching, WAL point-in-time recovery, and connection pooling.
- **Monthly Operating Economics (BWP & USD)**:
  - Cloud Compute (Firebase App Hosting Container Instances): P408.00 / $30.00 USD
  - Managed PostgreSQL Compute & Storage (Neon Serverless): P258.40 / $19.00 USD
  - Cloud Storage & Document Bundles (GCS): P40.80 / $3.00 USD
  - Networking & Global CDN Egress: P27.20 / $2.00 USD
  - **Total Estimated Operating Cost**: **P734.40 / $54.00 USD per month**.

---

## 5. Judge Walkthrough & 1-Click Persona Directory

Navigate directly to the **Judges' Guided Tour (`/judges`)** or use the 1-click role switcher on `/login` (all accounts use password `CedaDemo2026!`):

| Role | Demo Email | Key Capabilities to Test |
| :--- | :--- | :--- |
| **Innovator** | `innovator@demo.ceda.bw` | Submissions, pre-flight checks, alert subscriptions, award certificates. |
| **Evaluator** | `evaluator@demo.ceda.bw` | Blind scoring, conflict declarations, collaborative consensus alignment. |
| **Adjudicator** | `panel@demo.ceda.bw` | Deterministic leaderboard, shortlist ratification, award disbursement. |
| **Programme Admin**| `admin@demo.ceda.bw` | 11-section Studio builder, dry-run simulator, content manager. |
| **Superadmin** | `super@demo.ceda.bw` | Audit trail hash chaining, whole-ledger verification, system tools. |
| **Partner Admin (BDIH)**| `bdih.admin@demo.ceda.bw`| BDIH branded space (`/partners/bdih`), API keys, scoped audits. |
| **Partner Admin (BTC)** | `btc.admin@demo.ceda.bw` | BTC branded space (`/partners/btc`), 5G challenge configuration. |
| **CEDA Consultant** | `consultant@demo.ceda.bw` | Live chat queue, operating hours enforcement, analytics. |
| **Committee Observer**| `observer@demo.ceda.bw` | Real-time short-polling telemetry, independent statutory audit. |

### Verification Endpoints:
- Scoped Demo Inbox: [`/demo-inbox`](/demo-inbox)
- Telemetry & Hosting Economics: [`/status`](/status)
- Cryptographic Audit Verifier: [`/api/audit/verify`](/api/audit/verify)
- OpenAPI Specification & Webhook Docs: [`/api/v1/docs`](/api/v1/docs)
