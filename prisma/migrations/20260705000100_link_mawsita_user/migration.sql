-- Add nullable owner relation for Mawista records
ALTER TABLE "MawsitaRecord"
ADD COLUMN "userId" TEXT;

-- Backfill email to lowercase for stable matching
UPDATE "MawsitaRecord"
SET "email" = LOWER("email")
WHERE "email" <> LOWER("email");

-- Link existing Mawista records with users by normalized email
UPDATE "MawsitaRecord" AS m
SET "userId" = u."id"
FROM "User" AS u
WHERE m."userId" IS NULL
  AND LOWER(m."email") = LOWER(u."email");

CREATE INDEX "MawsitaRecord_userId_idx" ON "MawsitaRecord"("userId");

ALTER TABLE "MawsitaRecord"
ADD CONSTRAINT "MawsitaRecord_userId_fkey"
FOREIGN KEY ("userId") REFERENCES "User"("id")
ON DELETE SET NULL
ON UPDATE CASCADE;
