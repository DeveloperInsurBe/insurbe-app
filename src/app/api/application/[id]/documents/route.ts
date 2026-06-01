import { prisma } from "@/lib/prisma";

export async function POST(
  req: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;
    const body = await req.json();
    const files = Array.isArray(body?.files) ? body.files : [];
    const nowIso = new Date().toISOString();

    const normalizedFiles = files.map((file: any) => ({
      ...file,
      uploadedAt: file?.uploadedAt || nowIso,
    }));

    await prisma.application.update({
      where: { id },
      data: {
        uploadedDocs: normalizedFiles,
        status: "application_updated",
      },
    });

    return Response.json({ success: true });
  } catch (error) {
    console.error("❌ Documents API error:", error);
    return Response.json({ error: "Failed" }, { status: 500 });
  }
}
