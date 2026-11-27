-- DAK bulk upload (partner spreadsheet -> customer drafts). Additive only:
-- three new tables and one counter; existing tables are not touched.

-- Draft reference numbers (IB-DAK-D-0001, ...), never reused.
CREATE SEQUENCE IF NOT EXISTS "DakDraftNumber_seq" START 1;

-- CreateTable
CREATE TABLE "DakImportBatch" (
    "id" TEXT NOT NULL,
    "partnerUserId" TEXT NOT NULL,
    "partnerRef" TEXT NOT NULL,
    "fileName" TEXT NOT NULL,
    "rowCount" INTEGER NOT NULL,
    "importedCount" INTEGER NOT NULL DEFAULT 0,
    "heldCount" INTEGER NOT NULL DEFAULT 0,
    "errorCount" INTEGER NOT NULL DEFAULT 0,
    "consentText" TEXT NOT NULL,
    "consentVersion" TEXT NOT NULL,
    "consentAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "DakImportBatch_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DakImportRow" (
    "id" TEXT NOT NULL,
    "batchId" TEXT NOT NULL,
    "rowNumber" INTEGER NOT NULL,
    "data" JSONB NOT NULL,
    "status" TEXT NOT NULL,
    "errors" JSONB,
    "draftId" TEXT,

    CONSTRAINT "DakImportRow_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DakDraft" (
    "id" TEXT NOT NULL,
    "reference" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "firstName" TEXT NOT NULL,
    "lastName" TEXT NOT NULL,
    "prefill" JSONB NOT NULL,
    "partnerUserId" TEXT NOT NULL,
    "partnerRef" TEXT NOT NULL,
    "source" TEXT NOT NULL DEFAULT 'partner',
    "batchId" TEXT NOT NULL,
    "rowId" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'imported',
    "customerUserId" TEXT,
    "inviteTokenHash" TEXT,
    "inviteExpiresAt" TIMESTAMP(3),
    "inviteSentAt" TIMESTAMP(3),
    "inviteError" TEXT,
    "acceptedAt" TIMESTAMP(3),
    "startedAt" TIMESTAMP(3),
    "submittedAt" TIMESTAMP(3),
    "applicationId" TEXT,
    "purgeAfter" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "DakDraft_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "DakImportBatch_partnerUserId_createdAt_idx" ON "DakImportBatch"("partnerUserId", "createdAt");

-- CreateIndex
CREATE INDEX "DakImportRow_batchId_rowNumber_idx" ON "DakImportRow"("batchId", "rowNumber");

-- CreateIndex
CREATE UNIQUE INDEX "DakDraft_reference_key" ON "DakDraft"("reference");

-- CreateIndex
CREATE UNIQUE INDEX "DakDraft_inviteTokenHash_key" ON "DakDraft"("inviteTokenHash");

-- CreateIndex
CREATE UNIQUE INDEX "DakDraft_applicationId_key" ON "DakDraft"("applicationId");

-- CreateIndex
CREATE INDEX "DakDraft_partnerRef_createdAt_idx" ON "DakDraft"("partnerRef", "createdAt");

-- CreateIndex
CREATE INDEX "DakDraft_email_idx" ON "DakDraft"("email");

-- CreateIndex
CREATE INDEX "DakDraft_status_purgeAfter_idx" ON "DakDraft"("status", "purgeAfter");

-- AddForeignKey
ALTER TABLE "DakImportRow" ADD CONSTRAINT "DakImportRow_batchId_fkey" FOREIGN KEY ("batchId") REFERENCES "DakImportBatch"("id") ON DELETE CASCADE ON UPDATE CASCADE;

