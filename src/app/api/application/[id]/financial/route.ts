import { prisma } from "@/lib/prisma";

export async function PUT(
  req: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;
    const body = await req.json();

    // ✅ Fetch existing data first
    const existing = await prisma.application.findUnique({
      where: { id },
    });

    if (!existing) {
      return Response.json({ error: "Application not found" }, { status: 404 });
    }

    // ✅ Merge old + new financial data
    const updated = await prisma.application.update({
      where: { id },
      data: {
        financialHistory: {
          ...(existing.financialHistory as any || {}), // keep old data
          ...(body || {}), // merge new data
        },
        status: "incomplete",
      },
    });

    console.log("✅ Financial saved:", updated.financialHistory);

    return Response.json(updated);
  } catch (error) {
    console.error("❌ financialdetails API error:", error);
    return Response.json({ error: "Failed to update financial details" }, { status: 500 });
  }
}