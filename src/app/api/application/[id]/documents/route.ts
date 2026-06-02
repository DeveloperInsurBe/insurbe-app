import { prisma } from "@/lib/prisma";

export async function POST(
  req: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;
    const body = await req.json();
    const files = Array.isArray(body?.files) ? body.files : [];
    const shouldAppend = body?.append === true;
    const nowIso = new Date().toISOString();

    const existing = await prisma.application.findUnique({
      where: { id },
      select: { uploadedDocs: true },
    });

    const existingDocs = Array.isArray(existing?.uploadedDocs)
      ? (existing.uploadedDocs as any[])
      : [];

    const normalizedFiles = files.map((file: any, index: number) => ({
      id:
        file?.id ||
        `${Date.now()}-${index}-${Math.random().toString(36).slice(2, 8)}`,
      ...file,
      type: file?.type || file?.mimeType || "",
      uploadedAt: file?.uploadedAt || nowIso,
    }));

    const allDocs = shouldAppend ? [...existingDocs, ...normalizedFiles] : normalizedFiles;

    await prisma.application.update({
      where: { id },
      data: {
        uploadedDocs: allDocs,
        status: "application_updated",
      },
    });

    const toReference = (file: any) => ({
      id: file?.id,
      name: file?.name,
      size: file?.size,
      type: file?.type || file?.mimeType || "",
      uploadedAt: file?.uploadedAt,
    });

    return Response.json({
      success: true,
      uploadedRefs: normalizedFiles.map(toReference),
      allRefs: allDocs.map(toReference),
    });
  } catch (error) {
    console.error("Documents API error:", error);
    return Response.json({ error: "Failed" }, { status: 500 });
  }
}
