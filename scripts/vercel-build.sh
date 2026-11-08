#!/usr/bin/env bash
# Vercel build: sync the schema, seed demo data on an empty database, then build.
# Works with Vercel's Neon/Postgres integration, which sets DATABASE_URL and
# DATABASE_URL_UNPOOLED but not DIRECT_URL.
set -euo pipefail

export DIRECT_URL="${DIRECT_URL:-${DATABASE_URL_UNPOOLED:-${POSTGRES_URL_NON_POOLING:-$DATABASE_URL}}}"

npx prisma db push --skip-generate
npx tsx scripts/seed-if-empty.ts
npx next build
