# BOCRA Digital Regulatory Platform — Hackathon Brief

---

## Part 1: For the BOCRA Team (Plain English)

### What is this app?

This is a new digital platform for BOCRA — built to modernize how licensed operators (like Mascom, Orange, and BTC) report their compliance data, and how BOCRA's own staff review and verify that data.

Right now, compliance reporting is mostly manual. Companies send PDFs and spreadsheets via email. BOCRA staff spend weeks reading through unstructured documents, sending correction requests, and chasing deadlines. There's no real-time visibility into who has submitted what, and there's no way to guarantee the data hasn't been tampered with.

**This platform changes that.**

### How does it work?

Instead of asking a company to "send us a report," BOCRA now sends a **digital container** — we call it an **Instance** — that contains all the rules, fields, and file requirements for a specific compliance task. The company fills it in directly on the platform, uploads their supporting files, and hits submit.

Here's what happens behind the scenes:

1. **BOCRA creates the rules.** An admin picks a template from the classification matrix (e.g., "Financial Audit for a Major Telecom") and assigns it to a company with a deadline.
2. **The company fills it in.** They see a guided form — no guesswork about what's needed. Every field has validation rules, and every file requirement is specified.
3. **Files are verified automatically.** When a company uploads a file, the system generates a digital fingerprint (a hash) of that file. If even one character is changed after upload, the system will catch it.
4. **Submission is locked and signed.** Once submitted, the data goes into a vault. The system generates a tamper-proof digital receipt that proves who submitted what, and when. Nobody — not even BOCRA — can alter submitted data.
5. **BOCRA reviews with real data.** Staff can see the raw numbers, download the original files, and get automated insights. Approve, flag for issues, or reject.

### What about regular citizens?

The platform also serves the public:

- **Anyone can file a complaint** against a service provider — with an anonymous option if they prefer.
- **Citizens can create a free account** to track their complaints, bookmark BOCRA documents, and follow upcoming events.
- **All the old BOCRA website content** — news, tenders, documents, careers, legislation — is organized under "Legacy Services" so nothing is lost during the transition.

### Who uses what?

| User | What they can do |
|------|-----------------|
| **Citizen** | File & track complaints, bookmark documents, star events |
| **Licensed Operator** | Fill and submit compliance Instances, view history |
| **BOCRA Admin** | Assign Instances, review submissions, view analytics |
| **Super Admin** | Manage templates, users, classification matrix, system settings |

### What's the bottom line?

BOCRA no longer has to chase companies for reports. Companies no longer guess what format BOCRA wants. Every submission is verified, signed, and stored permanently. And the public gets a cleaner, more personal experience with BOCRA's services.

**BOCRA shifts from data collection to data verification.**

---

## Part 2: For Developers (Technical Deep-Dive)

### Architecture

| Layer | Technology |
|-------|-----------|
| Framework | Next.js 14 (App Router), TypeScript |
| Database | PostgreSQL on Supabase |
| ORM | Prisma v5 |
| Auth | NextAuth.js v5 (beta) — Credentials provider, JWT sessions |
| UI | Tailwind CSS v3, shadcn/ui, Lucide icons |
| Charts | Recharts |
| Forms | React Hook Form + Zod (dynamic schema-to-Zod conversion) |
| File integrity | SHA-256 hashing (Web Crypto API client-side, Node crypto server-side) |
| Submission signing | JWT-signed receipts via jsonwebtoken |
| Package manager | Yarn v1 |

### Core Concept: Instances

An Instance is a row in the `Instance` table that links a `Template` (JSON schema defining fields + file requirements) to a `User` (licensee) with a deadline. The lifecycle is:

```
PENDING → IN_PROGRESS → SUBMITTED → APPROVED / FLAGGED / REJECTED
```

Templates are classified by a **6×6 matrix**: `DataType` (A–F) × `Scale` (1–6) = 36 compliance contexts. Each cell maps to a different reporting template with different field schemas, file requirements, and validation rules.

### Data Flow

```
Template (JSON schema)
    ↓ provisioned by Admin
Instance (assigned to Licensee)
    ↓ filled via Instance Runner
InstanceField[] (key-value pairs, validated against schema)
InstanceFile[] (uploaded, SHA-256 hashed client+server)
    ↓ submitted
submissionJwt (signed receipt binding user + data + timestamp)
    ↓ reviewed by Admin
status → APPROVED / FLAGGED / REJECTED + reviewNotes
```

### Database Schema (key models)

- **User** — roles: `PUBLIC`, `LICENSEE`, `ADMIN`, `SUPERADMIN`
- **Template** — JSON schema with fields[], required_files[], scale, dataType
- **Instance** — links template → licensee, tracks status + deadline + JWT receipt
- **InstanceField** — key-value storage for submitted field data
- **InstanceFile** — tracks uploaded files with clientHash + serverHash + storagePath
- **Complaint** — public complaints with trackingCode, anonymous flag, status lifecycle
- **Bookmark** / **StarredEvent** — citizen personalization (scoped to user)
- **AuditLog** — every significant action logged with actor, action, metadata
- **Notification** — per-user notification queue

### File Integrity Model

```
Client uploads file
    → Web Crypto API SHA-256 hash → sent as clientHash
Server receives file
    → Node crypto SHA-256 hash → stored as serverHash
    → clientHash === serverHash? ✓ stored : ✗ rejected

On review:
    → Admin downloads file → re-hash → compare with stored serverHash
```

### Auth & Middleware

NextAuth v5 with JWT strategy. The middleware at `src/middleware.ts` enforces route-level access:

- `/dashboard/admin/*` → ADMIN, SUPERADMIN
- `/dashboard/superadmin/*` → SUPERADMIN
- `/dashboard/licensee/*` → LICENSEE
- `/dashboard/citizen/*` → PUBLIC
- API routes have similar protection

### Key Routes

| Route | Purpose |
|-------|---------|
| `/` | Public homepage with mandate tabs, Instance explainer, legacy CTA |
| `/complaints` | File or track a complaint (anonymous mode available) |
| `/legacy` | All old BOCRA website sections in organized cards |
| `/register` | Citizen or Licensee account creation |
| `/dashboard/citizen` | Complaints, bookmarks, starred events |
| `/dashboard/licensee` | Instance list, runner wizard, playground, history |
| `/dashboard/admin` | Provision, review queue, analytics |
| `/dashboard/superadmin/*` | Templates, users, matrix, verification tools, settings |

### API Endpoints

| Endpoint | Method | Purpose |
|----------|--------|---------|
| `/api/auth/register` | POST | Create citizen or licensee account |
| `/api/instances/provision` | POST | Admin assigns Instance to licensee |
| `/api/instances/[id]/fields` | POST | Save field data |
| `/api/instances/[id]/upload` | POST | Upload file with hash verification |
| `/api/instances/[id]/submit` | POST | Lock instance + generate JWT receipt |
| `/api/instances/[id]/review` | POST | Admin approve/flag/reject |
| `/api/complaints` | POST | File a complaint |
| `/api/complaints/track` | GET | Public tracking by code |
| `/api/complaints/my` | GET | Citizen's own complaints |
| `/api/bookmarks` | GET/POST | Citizen bookmarks |
| `/api/starred-events` | GET/POST | Citizen starred events |
| `/api/sandbox/download` | GET | Download sandbox Instance template |

### Running Locally

```bash
yarn                    # install deps
cp .env.example .env    # configure DATABASE_URL, secrets
yarn db:generate        # generate Prisma client
yarn db:push            # sync schema to database
yarn db:seed            # seed demo users + templates + instances
yarn dev                # http://localhost:3000
```

### Demo Accounts

| Role | Email | Password |
|------|-------|----------|
| Super Admin | super@bocra.org.bw | password123 |
| Admin | admin@bocra.org.bw | password123 |
| Licensee | mascom@licensee.co.bw | password123 |
| Citizen | citizen@demo.co.bw | password123 |

### Project Structure

```
src/
  app/
    (public)/              Home, about, licensing, complaints, legacy, register, login
    dashboard/
      citizen/             Overview, complaints, bookmarks, events
      licensee/            Overview, instances, runner, playground, history
      admin/               Overview, provision, instances, review, analytics
      superadmin/          Templates, users, matrix, tools, settings
    api/                   REST endpoints
  components/
    home/                  MandateSection, InstanceDeepDive (collapsible)
    layout/                PublicHeader, DashboardSidebar, Footer
  lib/                     prisma.ts, auth.ts, hash.ts, jwt-sign.ts, schema-to-zod.ts, etl.ts
prisma/
  schema.prisma            Full data model
  seed.ts                  Demo data seeder
```
