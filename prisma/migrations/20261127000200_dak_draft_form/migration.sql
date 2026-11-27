-- DAK bulk upload, phase C: what the customer fills in on their draft.
-- Additive only (nullable columns on the new DakDraft table).
ALTER TABLE "DakDraft" ADD COLUMN "form" JSONB,
ADD COLUMN "documents" JSONB,
ADD COLUMN "declarations" JSONB,
ADD COLUMN "submitError" TEXT;
