import { randomUUID } from "crypto";

import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";

import { authOptions } from "@/lib/authOptions";
import {
  getMawsitaBucketName,
  getSupabaseStorageAdmin,
} from "@/lib/supabaseStorageAdmin";

const MAX_FILE_SIZE = 10 * 1024 * 1024;
const ALLOWED_TYPES = new Set([
  "application/pdf",
  "image/jpeg",
  "image/png",
  "image/webp",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
]);

function sanitizeName(name: string) {
  return name.replace(/[^a-zA-Z0-9._-]/g, "_");
}

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.email || session.user.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const form = await req.formData();
    const files = form
      .getAll("files")
      .filter((item): item is File => item instanceof File);

    if (!files.length) {
      return NextResponse.json({ error: "No files uploaded" }, { status: 400 });
    }

    const now = new Date();
    const yyyy = String(now.getUTCFullYear());
    const mm = String(now.getUTCMonth() + 1).padStart(2, "0");
    const bucket = getMawsitaBucketName();
    const supabase = getSupabaseStorageAdmin();

    const uploaded = [];
    for (const file of files) {
      if (!ALLOWED_TYPES.has(file.type)) {
        return NextResponse.json(
          { error: `${file.name} has unsupported file type` },
          { status: 400 },
        );
      }
      if (file.size > MAX_FILE_SIZE) {
        return NextResponse.json(
          { error: `${file.name} exceeds 10 MB limit` },
          { status: 400 },
        );
      }

      const safeName = sanitizeName(file.name);
      const storagePath = `mawsita/${yyyy}/${mm}/${randomUUID()}-${safeName}`;
      const bytes = new Uint8Array(await file.arrayBuffer());

      const { error } = await supabase.storage
        .from(bucket)
        .upload(storagePath, bytes, {
          contentType: file.type,
          upsert: false,
        });

      if (error) {
        throw error;
      }

      uploaded.push({
        name: file.name,
        type: file.type,
        size: file.size,
        uploadedAt: new Date().toISOString(),
        source: "supabase",
        bucket,
        storagePath,
      });
    }

    return NextResponse.json({ uploaded });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Failed to upload documents" },
      { status: 500 },
    );
  }
}
