# Mawista User-Link Rollout Checklist

This checklist rolls out Mawista user ownership safely without changing DAK/TK/Hallesche flows.

## 1) Preconditions

- Ensure code is deployed with these changes:
  - `MawsitaRecord.userId` schema relation
  - Admin Mawista auto-linking by email
  - User Mawista APIs:
    - `GET /api/mawsita/user`
    - `POST /api/mawsita/document-url`
  - Dashboard read-only Mawista rendering
- Ensure environment has stable DB direct connectivity for Prisma migration.

## 2) Apply DB Migration

Run:

```bash
npx prisma migrate deploy
```

Expected: migration `20260705000100_link_mawsita_user` applies successfully.

## 3) Backfill Existing Mawista Records

Run:

```bash
npm run mawsita:backfill-users
```

Expected output JSON:

- `scanned`: number of `MawsitaRecord` rows with `userId = null`
- `updated`: rows linked to users by email
- `skipped`: rows with no matching user

## 4) Functional Verification

## Admin checks

1. Create a Mawista record in admin with email of an existing user.
2. Edit same record and keep/update email.
3. Confirm record still appears in admin list.

## User dashboard checks

1. Login as that user.
2. Open `/dashboard`.
3. Confirm read-only "Mawista Policies" section is visible.
4. Confirm no edit/continue actions appear for Mawista records.
5. Open a Mawista document from "Documents" tab.

## Ownership checks

1. Login as a different user.
2. Confirm that first user's Mawista policy/documents are not visible.
3. Confirm Mawista document URL API does not return signed URLs for non-owned records.

## 5) Regression Checks (Must Stay Unchanged)

- DAK/TK/Hallesche application list on dashboard still loads from `/api/application/user`.
- Existing download/edit/resume actions for non-Mawista applications still work.
- Admin Mawista CRUD still works.

## 6) Rollback Safety

If migration is delayed/unavailable:

- App still works due to API-level fallback logic (email-based path when `userId` column is unavailable).
- Once migration is restored, rerun:

```bash
npx prisma migrate deploy
npm run mawsita:backfill-users
```

