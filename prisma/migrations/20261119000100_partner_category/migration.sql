-- Partner category (Agent / Referral Partner / Institutional Partner).
-- Additive: one nullable column, then existing accounts get their category.
ALTER TABLE "User" ADD COLUMN "partnerCategory" TEXT;

UPDATE "User" SET "partnerCategory" = 'agent' WHERE "role" = 'agent' AND "partnerCategory" IS NULL;
UPDATE "User" SET "partnerCategory" = 'referral' WHERE "role" = 'partner' AND "partnerCategory" IS NULL;
