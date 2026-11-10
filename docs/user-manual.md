# CEDA Innovation Management Portal — Comprehensive User Manual

This manual provides role-by-role operational guidance for all users and stakeholders of the Citizen Entrepreneurial Development Agency (CEDA) Innovation Management Portal.

---

## 1. Innovator Guide

### 1.1 Account Registration & Team Assembly
- **Self-Service Registration (`/register`)**: Register using your personal Omang number, CIPA company registration number, and contact details. Verify your email via the confirmation link or enter the SMS OTP passcode.
- **Team Formation (1 to 5 Members)**: Form or join a registered innovation venture. Designate a Team Lead (must be a citizen youth aged 18–35). Declare team members, shareholding percentages, and roles. Total citizen youth ownership must exceed 50%.

### 1.2 Exploring Challenges & Programmable Instances
- **Browsing Competitions (`/instances`)**: Review open national challenges, including the flagship *CEDA Innovation Management Portal Hackathon 2026* and partner-backed accelerators.
- **Rules & Rubric Inspection (`/instances/[slug]`)**: Every challenge displays its 10-stage timeline, active countdown, cryptographic `rulesHash`, prize pool, and evaluation rubric with criterion weights.

### 1.3 Submissions & Pre-Emptive Security Pre-Flight
- **Intake Dossier (`/dashboard/innovator/instance-runner/[id]`)**: Submit required technical files (PDF proposal <=10 pages, full source code zip archive, user manual, and README).
- **Automated Client & Server Pre-Flight Gates**:
  - *Magic-Byte MIME Sniffing*: Checks binary headers to ensure files match declared types and blocks disguised executables (PE/MZ).
  - *Archive Safety*: Validates against Zip-Slip path traversal (`../`) and compression bombs (max 100:1 ratio).
  - *Secret Scanning*: Scans code archives to block exposed private keys or cloud credentials.
  - *Page Boundary*: Enforces strict PDF page limits (<=10 pages).
- **Cryptographic Submission Receipts**: Upon passing pre-flight and signing statutory DPA 2024 declarations, an HMAC-signed cryptographic receipt with SHA-256 data hash is generated.

### 1.4 Notifications, Subscriptions & Advisory
- **Alert Subscriptions (`/dashboard/subscriptions`)**: Manage subscriptions across Email, SMS, and Portal notifications for deadline reminders and evaluation status transitions.
- **Live Consultant Chat**: Access the real-time CEDA advisory widget (09:00–16:00 CAT weekdays) for technical and business guidance.

---

## 2. Evaluator Guide

### 2.1 Workspace & Assignment Intake (`/dashboard/evaluator`)
- **Blind Review Protocol**: Personal identifiers, Omang numbers, and team names are cryptographically concealed during individual scoring rounds to ensure absolute impartiality.
- **Statutory Conflict Declaration**: Evaluators must formally declare whether a conflict of interest exists before unlocking dossier files. Declared conflicts automatically reassign the entry.

### 2.2 100-Point Rubric Scoring
- **Scoring Dossier (`/dashboard/evaluator/[id]`)**: Grade submissions against weighted criteria:
  - Technical Architecture & Security (25%)
  - Portal Functionality & Workflows (20%)
  - General Platform & Cloud Hosting (15%)
  - UX, Accessibility & Design (15%)
  - Pitch Presentation & Documentation (15%)
  - Innovation & Distinctive Capabilities (10%)
- **Disagreement Threshold (>20 Points)**: If peer evaluators diverge by more than 20 points, the portal flags the dossier for mandatory consensus alignment.

### 2.3 Collaborative Consensus
- Evaluators discuss divergent findings in an internal collaborative thread and record an agreed consensus note and score before panel elevation.

---

## 3. Adjudicator & Panel Guide

### 3.1 Shortlist Review (`/dashboard/panel`)
- **Deterministic Leaderboard**: View ranked contenders ordered by mathematically reproducible scores.
- **Tie-Breaking**: Ties are deterministically resolved by comparing criteria category weights and lexicographical reference code hashes.
- **Public Vote Weighting (10%)**: Factor the verified public voting score into the final ranking.

### 3.2 Adjudication Decisions & Awards
- **Panel Actions**: Ratify Top 5 Shortlists, request founder clarifications, or decline submissions with panel guidance.
- **Cryptographic Award Issuance**: Approving an award generates a verifiable public certificate with QR code and adds the recipient to `/funded`.

---

## 4. Programme Administrator Guide

### 4.1 Instance Studio & Challenge Builder (`/dashboard/instances`)
- **11-Section Blueprint Studio**: Create and configure competition instances:
  - Metadata & Branding (Custom slugs, categories, banner URLs, partner affiliation)
  - Multi-Stage Timelines (Configurable gates, start/end timestamps, role access)
  - Statutory Eligibility AST Rules (Age, CIPA entity status, youth equity thresholds)
  - Rubric Weights & Reviewer Quotas (Blind scoring flags, disagreement caps)
  - Security Guard Parameters (File limits, zip-slip checks, secret scanner gates)
  - Privacy Notices & Data Retention Limits (DPA 2024 compliance)
  - Communication Channels & Consultant Live Chat integration
- **Compiler & Canonical RulesHash**: Compiles raw JSON specifications into active database workflows, generating a canonical SHA-256 `rulesHash`.
- **Dry-Run Simulator (`/api/instances-engine/simulate`)**: Run synthetic entries through eligibility, guards, and scoring to identify configuration flaws before publication.

### 4.2 Content Manager & Operational Oversight (`/dashboard/admin/content`)
- Upload and manage application form templates, download guides, FAQs, and regulatory notices.
- Monitor active evaluation progress and chase overdue evaluator scorecards.

---

## 5. Superadmin Guide

### 5.1 Platform Governance & Cryptographic Auditing (`/dashboard/superadmin/audit`)
- **SHA-256 Hash Chaining**: Every critical action (submission, pre-flight gate, evaluation, consensus, award) is sequentially hashed into an immutable cryptographic chain (`prevHash` -> `hash`).
- **Chain Verification Tool (`/api/audit/verify`)**: Validates whole-ledger mathematical continuity and detects any data tampering.

### 5.2 User Management & Roles (`/dashboard/superadmin/users`)
- Manage system accounts across all 9 roles, assign permissions, and enforce multi-factor TOTP authentication.

---

## 6. Partner Administrator Guide (BDIH & BTC Innovation)

### 6.1 Multi-Tenant Partner Workspaces (`/dashboard/partner/settings`)
- **Dynamic Corporate Branding**: Customize primary and secondary brand colors, upload corporate SVG logos, and configure public partner landing pages (`/partners/bdih`, `/partners/btc`).
- **Strict Data Isolation**: Partner admins cannot view or mutate other partners' challenges, applications, or evaluators.

### 6.2 Partner API Keys & Outbound Webhooks (`/dashboard/partner/keys`)
- **Scoped API v1 Credentials**: Generate prefix-identifiable API keys (`ceda_live_...`) with SHA-256 hashing.
- **HMAC-SHA256 Webhooks**: Receive real-time event dispatches (`entry.submitted`, `stage.transitioned`, `evaluation.completed`) signed with partner HMAC secrets.

---

## 7. CEDA Consultant Guide

### 7.1 Advisory Console & Live Queue (`/dashboard/consultant`)
- **Operating Hours Protocol**: Active Monday to Friday from 09:00 to 16:00 CAT (UTC+2), respecting all official Botswana public holidays. Outside hours, queue switches to offline inquiry capture.
- **Queue Triage & Session Claiming**: Claim incoming applicant chat requests, review applicant background, and deliver real-time technical or business advice.

### 7.2 Advisory Analytics (`/dashboard/consultant/analytics`)
- Track chat volume, average response speed, resolution percentages, and peak hourly traffic distributions.

---

## 8. Committee Observer Guide

### 8.1 Statutory & Independent Oversight (`/dashboard/observer`)
- **Read-Only Telemetry**: Real-time 15-second polling dashboard displaying submission volume, screening pass rates, evaluation distributions, and consensus ratification.
- **Audit Compliance Verification**: Independent statutory members (BDIH, BOCRA, IDPC, LEA) verify evaluation integrity and procedural fairness without mutating live scoring data.
