#!/usr/bin/env bash
# Vercel build: sync the schema, seed demo data on an empty database, then build.
# Works with Vercel's Neon/Postgres integration, which sets DATABASE_URL and
# DATABASE_URL_UNPOOLED but not DIRECT_URL. If the database can't be reached,
# the app still builds and the log says why the data step was skipped.
set -uo pipefail

if [ -n "${DATABASE_URL:-}" ]; then
  export DIRECT_URL="${DIRECT_URL:-${DATABASE_URL_UNPOOLED:-${POSTGRES_URL_NON_POOLING:-$DATABASE_URL}}}"
  if npx prisma db push --skip-generate; then
    npx tsx scripts/seed-if-empty.ts || echo "WARNING: seeding failed, see above."
  else
    echo "WARNING: database unreachable, skipped schema sync and seed. Connect a database (Vercel Storage → Neon) and redeploy."
  fi
else
  echo "WARNING: DATABASE_URL is not set, skipped schema sync and seed."
fi

set -e
npx next build
