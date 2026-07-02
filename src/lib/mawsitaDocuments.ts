export type MawsitaDocument = {
  name: string;
  type: string;
  size: number | null;
  uploadedAt: string;
  source: "external-link" | "supabase";
  url?: string;
  bucket?: string;
  storagePath?: string;
};

type DocumentInput = {
  name?: unknown;
  url?: unknown;
  type?: unknown;
  size?: unknown;
  uploadedAt?: unknown;
  source?: unknown;
  bucket?: unknown;
  storagePath?: unknown;
};

export function normalizeMawsitaDocuments(input: unknown): MawsitaDocument[] {
  const docs = Array.isArray(input) ? input : [];

  return docs
    .map((doc) => {
      const candidate = (doc || {}) as DocumentInput;
      const name = String(candidate.name || "").trim();
      const url = String(candidate.url || "").trim();
      const type = String(candidate.type || "").trim();
      const uploadedAt = String(candidate.uploadedAt || "").trim();
      const bucket = String(candidate.bucket || "").trim();
      const storagePath = String(candidate.storagePath || "").trim();
      const sourceRaw = String(candidate.source || "").trim();
      const sizeRaw = candidate.size;
      const size =
        typeof sizeRaw === "number"
          ? sizeRaw
          : Number.parseInt(String(sizeRaw || ""), 10);

      if (!name) return null;

      if (bucket && storagePath) {
        return {
          name,
          type: type || "application/octet-stream",
          size: Number.isFinite(size) && size > 0 ? size : null,
          uploadedAt: uploadedAt || new Date().toISOString(),
          source: "supabase" as const,
          bucket,
          storagePath,
        };
      }

      if (!url || !/^https?:\/\//i.test(url)) return null;

      return {
        name,
        type: type || "external-link",
        size: Number.isFinite(size) && size > 0 ? size : null,
        uploadedAt: uploadedAt || new Date().toISOString(),
        source:
          sourceRaw === "supabase" ? ("supabase" as const) : ("external-link" as const),
        url,
      };
    })
    .filter(Boolean) as MawsitaDocument[];
}

export function extractSupabaseRefs(input: unknown) {
  const docs = normalizeMawsitaDocuments(input);
  return docs
    .filter((doc) => doc.source === "supabase" && doc.bucket && doc.storagePath)
    .map((doc) => ({
      bucket: doc.bucket as string,
      storagePath: doc.storagePath as string,
    }));
}
