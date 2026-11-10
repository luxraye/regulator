-- Safe migration for Instances challenge engine and Entry rename
-- Preserves all existing templates, ideas, evaluations, files, and users.

DO $$ BEGIN
  CREATE TYPE "Role" AS ENUM ('INNOVATOR', 'EVALUATOR', 'ADJUDICATOR', 'ADMIN', 'SUPERADMIN', 'PARTNER_ADMIN', 'COMMITTEE_OBSERVER', 'CONSULTANT');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

ALTER TYPE "Role" ADD VALUE IF NOT EXISTS 'PARTNER_ADMIN';
ALTER TYPE "Role" ADD VALUE IF NOT EXISTS 'COMMITTEE_OBSERVER';
ALTER TYPE "Role" ADD VALUE IF NOT EXISTS 'CONSULTANT';

DO $$ BEGIN
  CREATE TYPE "InstanceRoleType" AS ENUM ('ORGANISER', 'EVALUATOR', 'ADJUDICATOR', 'OBSERVER', 'CONSULTANT', 'MENTOR');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE "PartnerStatus" AS ENUM ('ACTIVE', 'SUSPENDED');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE "BlueprintStatus" AS ENUM ('DRAFT', 'PUBLISHED', 'ARCHIVED');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE "InstanceLifecycleStatus" AS ENUM ('DRAFT', 'PUBLISHED', 'LIVE', 'CLOSED', 'ARCHIVED');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE "EntryStatus" AS ENUM ('DRAFT', 'SUBMITTED', 'UNDER_REVIEW', 'SHORTLISTED', 'FLAGGED', 'APPROVED', 'AWARDED', 'REJECTED');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE "CheckStatus" AS ENUM ('PASS', 'WARN', 'FAIL');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- 1. Rename existing idea tables to entries / entry_files / entry_fields
DO $$
BEGIN
  IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'Instance') THEN
    ALTER TABLE "Instance" RENAME TO "entries";
  END IF;
  IF EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'Instance_pkey') THEN
    ALTER TABLE "entries" RENAME CONSTRAINT "Instance_pkey" TO "entries_pkey";
  END IF;
  IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'InstanceFile') THEN
    ALTER TABLE "InstanceFile" RENAME TO "entry_files";
  END IF;
  IF EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'InstanceFile_pkey') THEN
    ALTER TABLE "entry_files" RENAME CONSTRAINT "InstanceFile_pkey" TO "entry_files_pkey";
  END IF;
  IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'InstanceField') THEN
    ALTER TABLE "InstanceField" RENAME TO "entry_fields";
  END IF;
  IF EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'InstanceField_pkey') THEN
    ALTER TABLE "entry_fields" RENAME CONSTRAINT "InstanceField_pkey" TO "entry_fields_pkey";
  END IF;
END $$;

-- 2. Create Partner
CREATE TABLE IF NOT EXISTS "Partner" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "logoUrl" TEXT,
    "primaryColor" TEXT,
    "secondaryColor" TEXT,
    "status" "PartnerStatus" NOT NULL DEFAULT 'ACTIVE',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Partner_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX IF NOT EXISTS "Partner_slug_key" ON "Partner"("slug");

-- 3. Create Blueprint
CREATE TABLE IF NOT EXISTS "Blueprint" (
    "id" TEXT NOT NULL,
    "key" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "version" INTEGER NOT NULL DEFAULT 1,
    "definition" JSONB NOT NULL,
    "status" "BlueprintStatus" NOT NULL DEFAULT 'DRAFT',
    "publishedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Blueprint_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX IF NOT EXISTS "Blueprint_key_version_key" ON "Blueprint"("key", "version");

-- 4. Create new Instance table (the challenge engine run)
CREATE TABLE IF NOT EXISTS "Instance" (
    "id" TEXT NOT NULL,
    "partnerId" TEXT NOT NULL,
    "blueprintId" TEXT,
    "blueprintVersion" INTEGER,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "description" TEXT,
    "definition" JSONB NOT NULL,
    "rulesHash" TEXT NOT NULL,
    "status" "InstanceLifecycleStatus" NOT NULL DEFAULT 'DRAFT',
    "opensAt" TIMESTAMP(3),
    "closesAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Instance_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX IF NOT EXISTS "Instance_slug_key" ON "Instance"("slug");
CREATE INDEX IF NOT EXISTS "Instance_partnerId_idx" ON "Instance"("partnerId");
CREATE INDEX IF NOT EXISTS "Instance_status_idx" ON "Instance"("status");

-- 5. Seed default CEDA Partner and default Instance for migration
INSERT INTO "Partner" ("id", "name", "slug", "primaryColor", "secondaryColor", "status", "createdAt", "updatedAt")
VALUES ('ceda-partner-main', 'Citizen Entrepreneurial Development Agency', 'ceda', '#3a2a24', '#d94914', 'ACTIVE', NOW(), NOW())
ON CONFLICT ("slug") DO NOTHING;

INSERT INTO "Instance" ("id", "partnerId", "name", "slug", "description", "definition", "rulesHash", "status", "opensAt", "closesAt", "createdAt", "updatedAt")
VALUES (
  'ceda-ideas-call-2026',
  (SELECT "id" FROM "Partner" WHERE "slug" = 'ceda' LIMIT 1),
  'CEDA Youth Innovation Ideas Call 2026',
  'ceda-ideas-2026',
  'National idea submission, multi-level evaluation and seed funding call for citizen youth innovators.',
  '{"meta":{"name":"CEDA Youth Innovation Ideas Call 2026","organiser":"CEDA"}}'::jsonb,
  'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855',
  'LIVE',
  NOW() - interval '7 days',
  NOW() + interval '30 days',
  NOW(),
  NOW()
)
ON CONFLICT ("slug") DO NOTHING;

-- 6. Link Template to Instance
ALTER TABLE "Template" ADD COLUMN IF NOT EXISTS "instanceId" TEXT;
ALTER TABLE "Template" ALTER COLUMN "scale" DROP NOT NULL;
ALTER TABLE "Template" ALTER COLUMN "dataType" DROP NOT NULL;
UPDATE "Template" SET "instanceId" = 'ceda-ideas-call-2026' WHERE "instanceId" IS NULL;
CREATE INDEX IF NOT EXISTS "Template_instanceId_idx" ON "Template"("instanceId");

-- 7. Update User
ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "partnerId" TEXT;
CREATE INDEX IF NOT EXISTS "User_partnerId_idx" ON "User"("partnerId");

-- 8. Create Team and TeamMember
CREATE TABLE IF NOT EXISTS "Team" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "leadId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Team_pkey" PRIMARY KEY ("id")
);
CREATE INDEX IF NOT EXISTS "Team_leadId_idx" ON "Team"("leadId");

CREATE TABLE IF NOT EXISTS "TeamMember" (
    "id" TEXT NOT NULL,
    "teamId" TEXT NOT NULL,
    "userId" TEXT,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "phone" TEXT,
    "omang" TEXT,
    "roleInTeam" TEXT,
    "shareholding" DOUBLE PRECISION,
    "isLead" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "TeamMember_pkey" PRIMARY KEY ("id")
);
CREATE INDEX IF NOT EXISTS "TeamMember_teamId_idx" ON "TeamMember"("teamId");

-- 9. Update entries table
ALTER TABLE "entries" ADD COLUMN IF NOT EXISTS "instanceId" TEXT;
ALTER TABLE "entries" ADD COLUMN IF NOT EXISTS "teamId" TEXT;
ALTER TABLE "entries" ADD COLUMN IF NOT EXISTS "score" DOUBLE PRECISION;
ALTER TABLE "entries" ADD COLUMN IF NOT EXISTS "rank" INTEGER;
ALTER TABLE "entries" ADD COLUMN IF NOT EXISTS "awardedAt" TIMESTAMP(3);
ALTER TABLE "entries" ALTER COLUMN "templateId" DROP NOT NULL;
UPDATE "entries" SET "instanceId" = 'ceda-ideas-call-2026' WHERE "instanceId" IS NULL;
ALTER TABLE "entries" ALTER COLUMN "instanceId" SET NOT NULL;
CREATE INDEX IF NOT EXISTS "entries_instanceId_idx" ON "entries"("instanceId");
CREATE INDEX IF NOT EXISTS "entries_innovatorId_idx" ON "entries"("innovatorId");

-- 10. Update foreign key references on child tables: entry_files, entry_fields, Evaluation, Message, AuditLog
DO $$
BEGIN
  IF EXISTS (SELECT FROM information_schema.columns WHERE table_name = 'entry_files' AND column_name = 'instanceId') THEN
    ALTER TABLE "entry_files" RENAME COLUMN "instanceId" TO "entryId";
  END IF;
  IF EXISTS (SELECT FROM information_schema.columns WHERE table_name = 'entry_fields' AND column_name = 'instanceId') THEN
    ALTER TABLE "entry_fields" RENAME COLUMN "instanceId" TO "entryId";
  END IF;
  IF EXISTS (SELECT FROM information_schema.columns WHERE table_name = 'Evaluation' AND column_name = 'instanceId') THEN
    ALTER TABLE "Evaluation" RENAME COLUMN "instanceId" TO "entryId";
  END IF;
  IF EXISTS (SELECT FROM information_schema.columns WHERE table_name = 'Message' AND column_name = 'instanceId') THEN
    ALTER TABLE "Message" RENAME COLUMN "instanceId" TO "entryId";
  END IF;
  IF EXISTS (SELECT FROM information_schema.columns WHERE table_name = 'AuditLog' AND column_name = 'instanceId') THEN
    ALTER TABLE "AuditLog" RENAME COLUMN "instanceId" TO "entryId";
  END IF;
END $$;

ALTER TABLE "AuditLog" ADD COLUMN IF NOT EXISTS "prevHash" TEXT;
ALTER TABLE "AuditLog" ADD COLUMN IF NOT EXISTS "hash" TEXT;
CREATE INDEX IF NOT EXISTS "AuditLog_entryId_idx" ON "AuditLog"("entryId");

-- 11. Create check_results
CREATE TABLE IF NOT EXISTS "check_results" (
    "id" TEXT NOT NULL,
    "entryId" TEXT NOT NULL,
    "checkKey" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "status" "CheckStatus" NOT NULL,
    "detail" TEXT,
    "evidenceHash" TEXT,
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "check_results_pkey" PRIMARY KEY ("id")
);
CREATE INDEX IF NOT EXISTS "check_results_entryId_idx" ON "check_results"("entryId");
CREATE INDEX IF NOT EXISTS "check_results_status_idx" ON "check_results"("status");

-- 12. Create InstanceRole
CREATE TABLE IF NOT EXISTS "InstanceRole" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "instanceId" TEXT NOT NULL,
    "role" "InstanceRoleType" NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "InstanceRole_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX IF NOT EXISTS "InstanceRole_userId_instanceId_role_key" ON "InstanceRole"("userId", "instanceId", "role");
CREATE INDEX IF NOT EXISTS "InstanceRole_instanceId_idx" ON "InstanceRole"("instanceId");
CREATE INDEX IF NOT EXISTS "InstanceRole_userId_idx" ON "InstanceRole"("userId");

-- 13. Create InstanceVersion
CREATE TABLE IF NOT EXISTS "InstanceVersion" (
    "id" TEXT NOT NULL,
    "instanceId" TEXT NOT NULL,
    "version" INTEGER NOT NULL,
    "reason" TEXT NOT NULL,
    "diff" JSONB,
    "definition" JSONB NOT NULL,
    "rulesHash" TEXT NOT NULL,
    "createdById" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "InstanceVersion_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX IF NOT EXISTS "InstanceVersion_instanceId_version_key" ON "InstanceVersion"("instanceId", "version");
CREATE INDEX IF NOT EXISTS "InstanceVersion_instanceId_idx" ON "InstanceVersion"("instanceId");

-- 14. Create MatrixDimension and MatrixDimensionValue
CREATE TABLE IF NOT EXISTS "MatrixDimension" (
    "id" TEXT NOT NULL,
    "partnerId" TEXT,
    "instanceId" TEXT,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "MatrixDimension_pkey" PRIMARY KEY ("id")
);
CREATE INDEX IF NOT EXISTS "MatrixDimension_partnerId_idx" ON "MatrixDimension"("partnerId");
CREATE INDEX IF NOT EXISTS "MatrixDimension_instanceId_idx" ON "MatrixDimension"("instanceId");

CREATE TABLE IF NOT EXISTS "MatrixDimensionValue" (
    "id" TEXT NOT NULL,
    "dimensionId" TEXT NOT NULL,
    "label" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "MatrixDimensionValue_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX IF NOT EXISTS "MatrixDimensionValue_dimensionId_code_key" ON "MatrixDimensionValue"("dimensionId", "code");
CREATE INDEX IF NOT EXISTS "MatrixDimensionValue_dimensionId_idx" ON "MatrixDimensionValue"("dimensionId");

CREATE TABLE IF NOT EXISTS "TemplateMatrixTag" (
    "templateId" TEXT NOT NULL,
    "matrixDimensionValueId" TEXT NOT NULL,

    CONSTRAINT "TemplateMatrixTag_pkey" PRIMARY KEY ("templateId","matrixDimensionValueId")
);

-- 15. Create ApiKey
CREATE TABLE IF NOT EXISTS "ApiKey" (
    "id" TEXT NOT NULL,
    "partnerId" TEXT,
    "name" TEXT NOT NULL,
    "keyPrefix" TEXT NOT NULL,
    "keyHash" TEXT NOT NULL,
    "createdById" TEXT NOT NULL,
    "lastUsedAt" TIMESTAMP(3),
    "revokedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ApiKey_pkey" PRIMARY KEY ("id")
);
CREATE INDEX IF NOT EXISTS "ApiKey_partnerId_idx" ON "ApiKey"("partnerId");
CREATE INDEX IF NOT EXISTS "ApiKey_keyPrefix_idx" ON "ApiKey"("keyPrefix");

-- 16. Foreign Keys
DO $$ BEGIN
  ALTER TABLE "Instance" ADD CONSTRAINT "Instance_partnerId_fkey" FOREIGN KEY ("partnerId") REFERENCES "Partner"("id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  ALTER TABLE "Instance" ADD CONSTRAINT "Instance_blueprintId_fkey" FOREIGN KEY ("blueprintId") REFERENCES "Blueprint"("id") ON DELETE SET NULL ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  ALTER TABLE "Template" ADD CONSTRAINT "Template_instanceId_fkey" FOREIGN KEY ("instanceId") REFERENCES "Instance"("id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  ALTER TABLE "entries" ADD CONSTRAINT "entries_instanceId_fkey" FOREIGN KEY ("instanceId") REFERENCES "Instance"("id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  ALTER TABLE "entries" ADD CONSTRAINT "entries_templateId_fkey" FOREIGN KEY ("templateId") REFERENCES "Template"("id") ON DELETE SET NULL ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  ALTER TABLE "entries" ADD CONSTRAINT "entries_teamId_fkey" FOREIGN KEY ("teamId") REFERENCES "Team"("id") ON DELETE SET NULL ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  ALTER TABLE "check_results" ADD CONSTRAINT "check_results_entryId_fkey" FOREIGN KEY ("entryId") REFERENCES "entries"("id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  ALTER TABLE "entry_files" ADD CONSTRAINT "entry_files_entryId_fkey" FOREIGN KEY ("entryId") REFERENCES "entries"("id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  ALTER TABLE "entry_fields" ADD CONSTRAINT "entry_fields_entryId_fkey" FOREIGN KEY ("entryId") REFERENCES "entries"("id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  ALTER TABLE "InstanceRole" ADD CONSTRAINT "InstanceRole_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  ALTER TABLE "InstanceRole" ADD CONSTRAINT "InstanceRole_instanceId_fkey" FOREIGN KEY ("instanceId") REFERENCES "Instance"("id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  ALTER TABLE "InstanceVersion" ADD CONSTRAINT "InstanceVersion_instanceId_fkey" FOREIGN KEY ("instanceId") REFERENCES "Instance"("id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  ALTER TABLE "InstanceVersion" ADD CONSTRAINT "InstanceVersion_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  ALTER TABLE "MatrixDimension" ADD CONSTRAINT "MatrixDimension_partnerId_fkey" FOREIGN KEY ("partnerId") REFERENCES "Partner"("id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  ALTER TABLE "MatrixDimension" ADD CONSTRAINT "MatrixDimension_instanceId_fkey" FOREIGN KEY ("instanceId") REFERENCES "Instance"("id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  ALTER TABLE "MatrixDimensionValue" ADD CONSTRAINT "MatrixDimensionValue_dimensionId_fkey" FOREIGN KEY ("dimensionId") REFERENCES "MatrixDimension"("id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  ALTER TABLE "TemplateMatrixTag" ADD CONSTRAINT "TemplateMatrixTag_templateId_fkey" FOREIGN KEY ("templateId") REFERENCES "Template"("id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  ALTER TABLE "TemplateMatrixTag" ADD CONSTRAINT "TemplateMatrixTag_matrixDimensionValueId_fkey" FOREIGN KEY ("matrixDimensionValueId") REFERENCES "MatrixDimensionValue"("id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  ALTER TABLE "ApiKey" ADD CONSTRAINT "ApiKey_partnerId_fkey" FOREIGN KEY ("partnerId") REFERENCES "Partner"("id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  ALTER TABLE "ApiKey" ADD CONSTRAINT "ApiKey_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL; END $$;
