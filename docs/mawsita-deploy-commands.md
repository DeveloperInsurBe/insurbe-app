# Mawista Deploy Commands (Copy-Paste)

Use this once code is merged and you are ready to roll out.

## 1) Set DIRECT_URL (PowerShell)

Set a direct (non-pooler) Supabase DB URL in your current shell:

```powershell
$env:DIRECT_URL="postgresql://<USER>:<PASSWORD>@db.<PROJECT_REF>.supabase.co:5432/postgres?sslmode=require"
```

Note: keep your existing `DATABASE_URL` as-is for app runtime if you use the pooler.

## 2) Apply migration + backfill

From repo root:

```powershell
npm run mawsita:rollout
```

This runs:

- `npx prisma migrate deploy`
- `npm run mawsita:backfill-users`

## 3) Verify DB state (SQL)

Run SQL in your DB console from:

- `docs/mawsita-verification.sql`

Expected:

- `userId` column exists
- `broken_links = 0`
- linked/unlinked counts look reasonable

## 4) Runtime smoke test (manual)

## Admin flow

1. Login admin, open `/admin/mawsita`.
2. Create a Mawista record with an existing user email.
3. Edit and save the record once.

Expected: no errors; admin list still works.

## User flow

1. Login as that user, open `/dashboard`.
2. Confirm a read-only **Mawista Policies** section appears.
3. Confirm Mawista docs appear in **Documents** tab.
4. Open a Mawista doc.

Expected: opens successfully; no edit actions for Mawista.

## Ownership/security check

1. Login as another user.
2. Confirm first user’s Mawista data/docs are not visible.

Expected: strict per-user visibility.

## 5) Quick API checks (while logged in as user)

In browser devtools console:

```js
await fetch("/api/mawsita/user").then(r => r.json())
```

Expected: `{ rows: [...] }` with only current user data.

For one supabase doc row:

```js
await fetch("/api/mawsita/document-url", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({
    recordId: "<ROW_ID>",
    bucket: "<BUCKET>",
    storagePath: "<STORAGE_PATH>"
  })
}).then(r => r.json())
```

Expected: `{ signedUrl: "..." }` for owned rows only.
