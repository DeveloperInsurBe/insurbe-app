-- DAK portal shows the same number the customer already has (IB-DAK-040)
-- instead of a separate DAK-2026-000025 number.

-- Counter for IB-DAK numbers. Replaces "count of applications + 1", which
-- could hand out the same number twice.
CREATE SEQUENCE IF NOT EXISTS "DakApplicationNumber_seq";

SELECT setval(
  '"DakApplicationNumber_seq"',
  GREATEST(
    COALESCE(
      (SELECT max(substring("applicationNumber" from 8)::int)
       FROM "InsuranceApplication"
       WHERE "applicationNumber" ~ '^IB-DAK-[0-9]+$'),
      0
    ),
    1
  )
);

-- Older DAK applications without a number get the next free ones.
UPDATE "InsuranceApplication" ia
SET "applicationNumber" = 'IB-DAK-' || lpad(nextval('"DakApplicationNumber_seq"')::text, 3, '0')
FROM (
  SELECT "id"
  FROM "InsuranceApplication"
  WHERE "provider" = 'DAK' AND "applicationNumber" IS NULL
  ORDER BY "createdAt" ASC NULLS FIRST
) missing
WHERE ia."id" = missing."id";

-- Portal case number = IB-DAK number.
UPDATE "DakCase" c
SET "caseNumber" = ia."applicationNumber"
FROM "InsuranceApplication" ia
WHERE ia."id" = c."insuranceApplicationId"
  AND ia."applicationNumber" IS NOT NULL
  AND c."caseNumber" <> ia."applicationNumber";

DROP SEQUENCE IF EXISTS "DakCase_number_seq";
