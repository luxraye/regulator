# BOCRA Digital Regulatory Platform

Modern digital platform for the Botswana Communications Regulatory Authority (BOCRA), featuring the innovative **Instances** system for secure, schema-driven regulatory compliance.

> For a full hackathon overview (non-technical + technical), see [`hackathon.md`](hackathon.md).

## Tech Stack

- **Framework**: Next.js 14 (App Router) + TypeScript
- **Database**: PostgreSQL (Supabase) + Prisma v5
- **Auth**: NextAuth.js v5 (JWT + role-based access control)
- **UI**: Tailwind CSS v3 + shadcn/ui + Lucide icons
- **Charts**: Recharts
- **Security**: SHA-256 file hashing, JWT submission signing, audit logging

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
Secure, tamper-proof compliance containers that replace static PDF reporting:
- **Schema-driven**: JSON templates define fields, files, and validation rules
- **Classification Matrix**: Scale (1–6) × DataType (A–F) = 36 tailored compliance contexts
- **Zero-trust file integrity**: SHA-256 hashing on client and server
- **Digital signatures**: JWT-signed submission receipts
- **Immutable Compliance Vault**: Submitted data cannot be altered

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

## Deployment

```bash
# Environment variables needed:
DATABASE_URL=<postgres-connection-string>
DIRECT_URL=<postgres-direct-connection-string>
NEXTAUTH_SECRET=<random-secret>
NEXTAUTH_URL=<your-app-url>
JWT_SECRET=<random-secret>

# Build and start
yarn build
yarn start
```
