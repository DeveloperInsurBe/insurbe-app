-- Track which partner/agent referred each TK/DAK submission so the admin
-- portal can count public insurance applications per partner and provider.
-- Additive and re-runnable (IF NOT EXISTS / only fills NULL rows).
ALTER TABLE "InsuranceApplication" ADD COLUMN IF NOT EXISTS "partnerId" TEXT;
ALTER TABLE "InsuranceApplication" ADD COLUMN IF NOT EXISTS "source" TEXT;

CREATE INDEX IF NOT EXISTS "InsuranceApplication_partnerId_provider_createdAt_idx"
ON "InsuranceApplication" ("partnerId", "provider", "createdAt");

-- Backfill 1: the Application row created on successful submit stores the
-- DAK application number (IB-DAK-...) or the TK InsuranceApplication id /
-- application number as its orderId.
UPDATE "InsuranceApplication" ia
SET "partnerId" = a."partnerId",
    "source" = a."source"
FROM "Application" a
WHERE ia."partnerId" IS NULL
  AND a."partnerId" IS NOT NULL
  AND a."product" = 'Public Health Insurance'
  AND (a."orderId" = ia."applicationNumber" OR a."orderId" = ia."id");

-- Backfill 2: repeat or failed submissions never got their own Application
-- row (duplicate check by email), so fall back to the customer's email.
UPDATE "InsuranceApplication" ia
SET "partnerId" = a."partnerId",
    "source" = a."source"
FROM "Application" a
WHERE ia."partnerId" IS NULL
  AND a."partnerId" IS NOT NULL
  AND a."product" = 'Public Health Insurance'
  AND lower(a."userId") = lower(ia."payload"->'personal'->>'email');
