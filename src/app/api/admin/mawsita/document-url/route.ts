import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";

import { authOptions } from "@/lib/authOptions";
import { getSupabaseStorageAdmin } from "@/lib/supabaseStorageAdmin";

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.email || session.user.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = (await req.json()) as Record<string, unknown>;
    const bucket = String(body.bucket || "").trim();
    const storagePath = String(body.storagePath || "").trim();

    if (!bucket || !storagePath) {
      return NextResponse.json(
        { error: "Missing document path" },
        { status: 400 },
      );
    }

    const supabase = getSupabaseStorageAdmin();
    const { data, error } = await supabase.storage
      .from(bucket)
      .createSignedUrl(storagePath, 60);

    if (error || !data?.signedUrl) {
      return NextResponse.json(
        { error: "Could not create signed URL" },
        { status: 500 },
      );
    }

    return NextResponse.json({ signedUrl: data.signedUrl });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Failed to generate document URL" },
      { status: 500 },
    );
  }
}
