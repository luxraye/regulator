# BOCRA Digital Regulatory Platform

Modern digital platform for the Botswana Communications Regulatory Authority (BOCRA), featuring the innovative **Instances** system for secure, schema-driven regulatory compliance.

> For a full hackathon overview (non-technical + technical), see [`hackathon.md`](hackathon.md).

## Tech Stack

- **Framework**: Next.js 14 (App Router) + TypeScript
- **Database**: PostgreSQL (Supabase) + Prisma v5
- **Auth**: Auth.js (NextAuth v5), JWT sessions, role checks in middleware and in every API route
- **UI**: Tailwind CSS v3 + Lucide icons
- **Charts**: Recharts
- **Security**: SHA-256 file hashing in browser and server, signed submission receipts, audit log

## Getting Started

### Prerequisites

- Node.js 18+
- PostgreSQL database (Supabase recommended)
- Yarn

### Setup

```bash
# Install dependencies
yarn

# Set up environment
cp .env.example .env
# Edit .env with your DATABASE_URL and secrets

# Generate Prisma client
yarn db:generate

# Push schema to database
yarn db:push
# (upgrading an older deployment? see "Upgrading from the first version" below)

# Seed demo data
yarn db:seed

# Start development server
yarn dev
```

Open [http://localhost:3000](http://localhost:3000).

### Demo Accounts

| Role | Email | Password |
|------|-------|----------|
| Super Admin | super@bocra.org.bw | password123 |
| Admin | admin@bocra.org.bw | password123 |
| Licensee (Mascom) | mascom@licensee.co.bw | password123 |
| Licensee (Orange) | orange@licensee.co.bw | password123 |
| Licensee (BTC) | btc@licensee.co.bw | password123 |
| Citizen | citizen@demo.co.bw | password123 |

## Key Features

### Instances System
Secure, tamper-evident compliance containers that replace static PDF reporting:
- **Schema-driven**: JSON templates define fields (text, number, textarea, date, select), files and validation rules. The same rules run in the browser and on the server.
- **Classification Matrix**: Scale (1–6) × DataType (A–F) = 36 compliance contexts
- **File integrity**: the browser hashes each file (SHA-256) before upload; the server hashes what it received and refuses the file if the two differ. Files are stored in Postgres and re-hashed on every download.
- **Signed receipts**: on submit, the server signs a receipt (HS256 JWT) containing a hash of the field data and the hash of every file. "Verify integrity" re-checks all of it at any time.
- **Lifecycle**: Pending → In progress → Submitted → Approved / Needs changes / Rejected. "Needs changes" reopens the instance so the licensee can fix and resubmit; each resubmission gets a new receipt.
- **Drafts**: licensees can save partially filled instances and come back later.

### Staff tools
- **Review**: per-instance page with integrity status, automated checks, data, file downloads, receipt and history
- **Provision**: issue a template to several licensees at once
- **Complaints desk**: triage public complaints, set status and write a response the complainant sees
- **Notifications**: in-app bell for new submissions, review outcomes, complaint updates and new assignments
- **Verification** (super admin): look up a file by its hash, and verify a receipt a licensee shared
- **Audit trail** (super admin): filterable log of every provision, submission, review, download and role change
- **Users** (super admin): change roles

### Citizen Portal
Personalized experience for the public:
- File and track complaints (with anonymous mode)
- Bookmark BOCRA documents and resources
- Star and follow upcoming events

### Legacy Services
All existing BOCRA website content organized in one searchable page — news, tenders, documents, careers, legislation, and external portals.

### User Roles

| Role | Capabilities |
|------|-------------|
| **Citizen** | File & track complaints, bookmark documents, star events |
| **Licensee** | Submit compliance data via Instance Runner, sandbox playground |
| **Admin** | Provision instances, review submissions, analytics dashboard |
| **Super Admin** | Manage templates, users, classification matrix, system settings |

## Project Structure

```
src/
  app/
    (public)/              Public pages (home, about, licensing, complaints, legacy)
    dashboard/
      citizen/             Complaints, bookmarks, starred events
      licensee/            Instance list, runner, playground, history
      admin/               Provision, review queue, analytics
      superadmin/          Templates, users, matrix, tools, settings
    api/                   REST API routes
  components/
    home/                  Mandate tabs, Instance deep-dive
    layout/                Header, sidebar, footer
  lib/                     Auth, Prisma, hashing, JWT, ETL utilities
prisma/
  schema.prisma            Database schema
  seed.ts                  Demo data seeder
```

## Upgrading from the first version

This version changes the `InstanceFile` table (files now live in the database) and adds a few columns.
On a demo database the simplest path is to reset and reseed, which **deletes all data**:

```bash
npx prisma db push --force-reset
yarn db:seed
```

The seed is safe to run again: it recreates the demo instances with dates relative to today and valid receipts.

## Known limits

- Uploads go through a serverless function, so each file is capped at 4 MB (Vercel's request limit is 4.5 MB). Larger files would need direct-to-storage uploads (e.g. Supabase Storage signed URLs).
- Licensee self-registration is open. A real rollout should verify licence numbers before granting access.

## Deployment

```bash
# Environment variables needed:
DATABASE_URL=<postgres-connection-string>
DIRECT_URL=<postgres-direct-connection-string>
AUTH_SECRET=<random-secret>
NEXTAUTH_URL=<your-app-url>
JWT_SECRET=<random-secret>

# Build and start
yarn build
yarn start
```
