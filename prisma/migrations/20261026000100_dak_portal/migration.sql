-- DAK provider portal: review cases, audit trail, information requests,
-- documents and support tickets. Additive only.
-- AlterTable
ALTER TABLE "User" ADD COLUMN     "dakNotificationsSeenAt" TIMESTAMP(3);

-- CreateTable
CREATE TABLE "DakCase" (
    "id" TEXT NOT NULL,
    "insuranceApplicationId" TEXT NOT NULL,
    "caseNumber" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'Submitted',
    "submittedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "closedReason" TEXT,
    "membershipNumber" TEXT,
    "kvnr" TEXT,
    "svnr" TEXT,
    "confirmedStartDate" TEXT,
    "contributionCategory" TEXT,

    CONSTRAINT "DakCase_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DakEvent" (
    "id" TEXT NOT NULL,
    "caseId" TEXT NOT NULL,
    "event" TEXT NOT NULL,
    "fromStatus" TEXT,
    "toStatus" TEXT,
    "note" TEXT,
    "actorType" TEXT NOT NULL,
    "actorName" TEXT NOT NULL,
    "actorId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "DakEvent_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DakInfoRequest" (
    "id" TEXT NOT NULL,
    "caseId" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "relatedField" TEXT,
    "message" TEXT NOT NULL,
    "internalNote" TEXT,
    "dueDate" TIMESTAMP(3),
    "priority" TEXT NOT NULL DEFAULT 'Normal',
    "status" TEXT NOT NULL DEFAULT 'open',
    "response" TEXT,
    "respondedAt" TIMESTAMP(3),
    "createdById" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "DakInfoRequest_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DakDocument" (
    "id" TEXT NOT NULL,
    "caseId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "mimeType" TEXT NOT NULL,
    "size" INTEGER NOT NULL,
    "source" TEXT NOT NULL,
    "bucket" TEXT NOT NULL,
    "storagePath" TEXT NOT NULL,
    "reviewStatus" TEXT NOT NULL DEFAULT 'pending',
    "reviewedBy" TEXT,
    "reviewedAt" TIMESTAMP(3),
    "uploadedBy" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "DakDocument_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DakSupportTicket" (
    "id" TEXT NOT NULL,
    "reviewerId" TEXT NOT NULL,
    "reviewerEmail" TEXT NOT NULL,
    "subject" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'open',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "DakSupportTicket_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "DakCase_insuranceApplicationId_key" ON "DakCase"("insuranceApplicationId");

-- CreateIndex
CREATE UNIQUE INDEX "DakCase_caseNumber_key" ON "DakCase"("caseNumber");

-- CreateIndex
CREATE INDEX "DakCase_status_submittedAt_idx" ON "DakCase"("status", "submittedAt");

-- CreateIndex
CREATE INDEX "DakEvent_caseId_createdAt_idx" ON "DakEvent"("caseId", "createdAt");

-- CreateIndex
CREATE INDEX "DakEvent_createdAt_idx" ON "DakEvent"("createdAt");

-- CreateIndex
CREATE INDEX "DakInfoRequest_caseId_createdAt_idx" ON "DakInfoRequest"("caseId", "createdAt");

-- CreateIndex
CREATE INDEX "DakInfoRequest_status_dueDate_idx" ON "DakInfoRequest"("status", "dueDate");

-- CreateIndex
CREATE INDEX "DakDocument_caseId_createdAt_idx" ON "DakDocument"("caseId", "createdAt");

-- CreateIndex
CREATE INDEX "DakDocument_reviewStatus_idx" ON "DakDocument"("reviewStatus");

-- CreateIndex
CREATE INDEX "DakSupportTicket_reviewerId_createdAt_idx" ON "DakSupportTicket"("reviewerId", "createdAt");

-- AddForeignKey
ALTER TABLE "DakCase" ADD CONSTRAINT "DakCase_insuranceApplicationId_fkey" FOREIGN KEY ("insuranceApplicationId") REFERENCES "InsuranceApplication"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DakEvent" ADD CONSTRAINT "DakEvent_caseId_fkey" FOREIGN KEY ("caseId") REFERENCES "DakCase"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DakInfoRequest" ADD CONSTRAINT "DakInfoRequest_caseId_fkey" FOREIGN KEY ("caseId") REFERENCES "DakCase"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DakDocument" ADD CONSTRAINT "DakDocument_caseId_fkey" FOREIGN KEY ("caseId") REFERENCES "DakCase"("id") ON DELETE CASCADE ON UPDATE CASCADE;


-- Running number for case numbers (DAK-<year>-<000001>).
CREATE SEQUENCE IF NOT EXISTS "DakCase_number_seq";

-- Backfill: every DAK application submitted so far starts as "Submitted".
INSERT INTO "DakCase" ("id", "insuranceApplicationId", "caseNumber", "status", "submittedAt", "updatedAt")
SELECT
  gen_random_uuid()::text,
  ia."id",
  'DAK-' || to_char(COALESCE(ia."createdAt", now()), 'YYYY') || '-' || lpad(nextval('"DakCase_number_seq"')::text, 6, '0'),
  'Submitted',
  COALESCE(ia."createdAt", now()),
  now()
FROM (
  SELECT "id", "createdAt"
  FROM "InsuranceApplication"
  WHERE "provider" = 'DAK'
  ORDER BY "createdAt" ASC NULLS FIRST
) ia
WHERE NOT EXISTS (SELECT 1 FROM "DakCase" c WHERE c."insuranceApplicationId" = ia."id");

INSERT INTO "DakEvent" ("id", "caseId", "event", "toStatus", "actorType", "actorName", "createdAt")
SELECT
  gen_random_uuid()::text,
  c."id",
  'Application submitted',
  'Submitted',
  'customer',
  COALESCE(NULLIF(TRIM(CONCAT(ia."payload"->'personal'->>'firstName', ' ', ia."payload"->'personal'->>'lastName')), ''), 'Customer'),
  c."submittedAt"
FROM "DakCase" c
JOIN "InsuranceApplication" ia ON ia."id" = c."insuranceApplicationId"
WHERE NOT EXISTS (SELECT 1 FROM "DakEvent" e WHERE e."caseId" = c."id");
