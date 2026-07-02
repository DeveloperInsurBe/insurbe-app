-- CreateTable
CREATE TABLE "MawsitaRecord" (
    "id" TEXT NOT NULL,
    "customerName" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "phone" TEXT,
    "planName" TEXT NOT NULL,
    "planType" TEXT,
    "startDate" TEXT,
    "endDate" TEXT,
    "premiumAmount" DOUBLE PRECISION,
    "status" TEXT NOT NULL DEFAULT 'Purchased',
    "notes" TEXT,
    "documents" JSONB,
    "createdByAdminId" TEXT,
    "createdByEmail" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "MawsitaRecord_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "MawsitaRecord_createdAt_idx" ON "MawsitaRecord"("createdAt");

-- CreateIndex
CREATE INDEX "MawsitaRecord_status_idx" ON "MawsitaRecord"("status");

-- CreateIndex
CREATE INDEX "MawsitaRecord_email_idx" ON "MawsitaRecord"("email");
