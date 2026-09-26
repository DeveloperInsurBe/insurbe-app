-- Admin-managed commission rates (whole EUR per application).
-- A partner/agent uses their own "commissionRate" when set, otherwise the
-- role default below. Additive and re-runnable.
ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "commissionRate" INTEGER;

CREATE TABLE IF NOT EXISTS "CommissionDefault" (
    "role" TEXT NOT NULL,
    "rate" INTEGER NOT NULL,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedBy" TEXT,

    CONSTRAINT "CommissionDefault_pkey" PRIMARY KEY ("role")
);

-- Current behaviour: partners EUR 5, agents EUR 30.
INSERT INTO "CommissionDefault" ("role", "rate")
VALUES ('partner', 5), ('agent', 30)
ON CONFLICT ("role") DO NOTHING;

CREATE TABLE IF NOT EXISTS "CommissionRateChange" (
    "id" TEXT NOT NULL,
    "role" TEXT NOT NULL,
    "userId" TEXT,
    "oldRate" INTEGER,
    "newRate" INTEGER,
    "pendingUpdated" INTEGER NOT NULL DEFAULT 0,
    "changedBy" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "CommissionRateChange_pkey" PRIMARY KEY ("id")
);

CREATE INDEX IF NOT EXISTS "CommissionRateChange_userId_createdAt_idx"
ON "CommissionRateChange" ("userId", "createdAt");

CREATE INDEX IF NOT EXISTS "CommissionRateChange_role_createdAt_idx"
ON "CommissionRateChange" ("role", "createdAt");
