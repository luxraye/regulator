# CEDA Innovation Management Portal

A tamper-evident, programmable innovation challenge and venture management portal for the **Citizen Entrepreneurial Development Agency (CEDA)**, built in partnership with the **Botswana Digital & Innovation Hub (BDIH)** and **BTC Innovation**.

Developed for the **CEDA Innovation Management Portal Hackathon 2026** (6–10 November 2026).
- **Pitch & Hackathon Submission**: [`hackathon.md`](hackathon.md)
- **Role-by-Role User Manual**: [`docs/user-manual.md`](docs/user-manual.md)
- **Judges' 5-Minute Guided Tour**: Accessible at [`/judges`](/judges)

---

## Key Capabilities & Architectural Pillars

### 1. Programmable Instances Engine
Competitions and grant calls are machine-executable JSON blueprints:
- **Canonical Key-Order Invariance & SHA-256 RulesHash**: Every stage, timeline boundary, AST eligibility rule, and rubric weight is canonicalized into a tamper-evident cryptographic fingerprint.
- **Instance Studio Builder (`/dashboard/instances`)**: 11-section studio builder allowing programme staff to construct, simulate (dry run), compile, and publish challenges.
- **Dynamic AST Eligibility**: Compound logic engines (`ALL`, `ANY`, `NOT`) enforcing statutory citizen youth criteria (ages 18–35, >50% youth equity, CIPA registration).

### 2. Pre-Emptive Security Pre-Flight Guards
Zero-trust file inspection before uploads touch permanent database storage:
- **Magic-Byte Sniffing**: Inspects raw binary byte signatures to block executables (PE/MZ) disguised as PDFs or archives.
- **Zip-Slip & Bomb Neutralizer**: Protects against directory traversal (`../`) and decompression bombs (100:1 ratio cap).
- **Automated Secret & Credential Scanning**: Blocks source code archives containing exposed AWS credentials or private keys.
- **PDF Page Boundary Guard**: Enforces strict page caps (<=10 pages for technical proposals).

### 3. Reproducible Leaderboard & Audit Hash Chaining
- **Deterministic Rubric Standings**: Automatically ranks ventures using the official 100-point rubric with conflict declarations, disagreement flags (>20 points), and consensus notes, generating a reproducible `leaderboardHash`.
- **SHA-256 Chained Audit Trail**: State transitions are sequentially chained (`prevHash` -> `hash`) and verifiable whole-ledger via `/api/audit/verify`.

### 4. Multi-Tenant Partner Spaces
- **Autonomous Partner Workspaces**: Dedicated spaces for BDIH (`/partners/bdih`) and BTC Innovation (`/partners/btc`) with dynamic theme token injection, isolated evaluator rosters, and partner-scoped audit trails.
- **Partner API v1 & Webhooks**: Scoped API keys with HMAC-SHA256 signed event delivery.

### 5. Operational Governance, Live Chat & P734/mo Economics
- **CEDA Consultant Live Chat**: In-app advisory queue enforcing 09:00–16:00 CAT weekday operating hours and Botswana public holidays.
- **Statutory Regulatory Directory**: Verified contacts for all 8 national regulatory authorities (CIPA, BURS, NBFIRA, BOCRA, CCA, IDPC, BOBS, LEA) embedded in `/support`.
- **Hosting Statement (`/status`)**: Operating on GCP Firebase App Hosting (`us-east4`) and Neon Postgres Serverless (`us-east-1`) at an itemized cost of P734.40 / $54.00 USD per month.

---

## Demo Accounts & Instant Personas

Every demo account uses the shared password `CedaDemo2026!`. The login page (`/login`) and Judges' Tour (`/judges`) feature 1-click authentication into all 9 platform roles:

| Role | Email | Purpose & Primary Dashboard |
| :--- | :--- | :--- |
| **Innovator** | `innovator@demo.ceda.bw` | Submissions, pre-flight checks, alert subscriptions (`/dashboard/innovator`) |
| **Evaluator** | `evaluator@demo.ceda.bw` | Conflict declarations, blind 100-point rubric grading (`/dashboard/evaluator`) |
| **Adjudicator** | `panel@demo.ceda.bw` | Shortlist ratification, disagreement triage, awards (`/dashboard/panel`) |
| **Programme Admin** | `admin@demo.ceda.bw` | Instance studio builder, challenge publishing, content manager (`/dashboard/admin`) |
| **Superadmin** | `super@demo.ceda.bw` | Audit trail verification, global permissions, system settings (`/dashboard/superadmin/audit`) |
| **Partner Admin (BDIH)** | `bdih.admin@demo.ceda.bw` | BDIH branded space, partner challenges, API keys (`/dashboard/partner/settings`) |
| **Partner Admin (BTC)** | `btc.admin@demo.ceda.bw` | BTC 5G & IoT challenge, partner telemetry (`/dashboard/partner/settings`) |
| **CEDA Consultant** | `consultant@demo.ceda.bw` | Live chat queue, applicant advisory, chat analytics (`/dashboard/consultant`) |
| **Committee Observer** | `observer@demo.ceda.bw` | Real-time short-polling telemetry, read-only audit oversight (`/dashboard/observer`) |

---

## Local Setup & Development

### Prerequisites
- Node.js 18+ (tested on Node 20 and Node 24)
- Yarn v1 (`npm install -g yarn`)
- PostgreSQL database (or Neon serverless instance)

### Quickstart
```bash
# 1. Install dependencies
yarn

# 2. Configure environment
cp .env.example .env
# Ensure DATABASE_URL, DIRECT_URL, AUTH_SECRET, and JWT_SECRET are set

# 3. Apply schema & seed demo data
yarn db:push
yarn db:seed

# 4. Start development server
yarn dev
```

### Verification & Testing
```bash
# Typecheck
yarn typecheck

# Lint
yarn lint

# Unit Test Suite (53 unit tests)
npx tsx --test tests/*.test.ts

# Production Build
yarn build

# Playwright Smoke Tests
npx playwright test
```
