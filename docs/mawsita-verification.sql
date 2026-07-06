-- 1) Confirm new column exists
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_schema = 'public'
  AND table_name = 'MawsitaRecord'
  AND column_name IN ('userId', 'email', 'createdAt');

-- 2) Count linked vs unlinked records
SELECT
  COUNT(*) AS total_records,
  COUNT(*) FILTER (WHERE "userId" IS NOT NULL) AS linked_records,
  COUNT(*) FILTER (WHERE "userId" IS NULL) AS unlinked_records
FROM "MawsitaRecord";

-- 3) Check records linked to non-existent users (should be 0)
SELECT COUNT(*) AS broken_links
FROM "MawsitaRecord" m
LEFT JOIN "User" u ON u."id" = m."userId"
WHERE m."userId" IS NOT NULL
  AND u."id" IS NULL;

-- 4) Spot potential mismatches where linked user email differs from record email
SELECT
  m."id",
  m."email" AS mawsita_email,
  u."email" AS user_email,
  m."userId"
FROM "MawsitaRecord" m
JOIN "User" u ON u."id" = m."userId"
WHERE LOWER(COALESCE(m."email", '')) <> LOWER(COALESCE(u."email", ''))
ORDER BY m."createdAt" DESC
LIMIT 50;

-- 5) List latest 20 unlinked records to manually resolve
SELECT
  m."id",
  m."customerName",
  m."email",
  m."status",
  m."createdAt"
FROM "MawsitaRecord" m
WHERE m."userId" IS NULL
ORDER BY m."createdAt" DESC
LIMIT 20;
