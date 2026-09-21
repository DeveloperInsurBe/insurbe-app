-- Additive, nullable columns for country-based payout details
-- (India: account number + IFSC; elsewhere: IBAN + BIC, which already exist).
-- IF NOT EXISTS keeps this safe to re-run: the PartnerProfile table itself was
-- created outside of prisma/migrations (db push), so do NOT use `migrate dev`.
ALTER TABLE "PartnerProfile" ADD COLUMN IF NOT EXISTS "accountNumber" TEXT;
ALTER TABLE "PartnerProfile" ADD COLUMN IF NOT EXISTS "ifscCode" TEXT;
ALTER TABLE "PartnerProfile" ADD COLUMN IF NOT EXISTS "bankName" TEXT;
