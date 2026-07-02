import { createClient } from "@supabase/supabase-js";

function required(name: string, value: string | undefined) {
  if (!value) {
    throw new Error(`${name} is not configured`);
  }
  return value;
}

export function getSupabaseStorageAdmin() {
  const url = required("SUPABASE_URL", process.env.SUPABASE_URL);
  const serviceRoleKey = required(
    "SUPABASE_SERVICE_ROLE_KEY",
    process.env.SUPABASE_SERVICE_ROLE_KEY,
  );

  return createClient(url, serviceRoleKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}

export function getMawsitaBucketName() {
  return process.env.SUPABASE_STORAGE_BUCKET || "admin-docs";
}
