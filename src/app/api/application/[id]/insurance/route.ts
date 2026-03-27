import { prisma } from "@/lib/prisma";

export async function PUT(
  req: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;
    const body = await req.json();

    // ✅ get existing data
    const existing = await prisma.application.findUnique({
      where: { id },
    });

    if (!existing) {
      return Response.json({ error: "Application not found" }, { status: 404 });
    }

    // ✅ merge (VERY IMPORTANT)
    const updated = await prisma.application.update({
      where: { id },
      data: {
        insuranceHistory: {
          ...(existing.insuranceHistory as any || {}),
          ...(body || {}),
        },
        status: "incomplete",
      },
    });

    console.log("✅ Insurance saved:", updated.insuranceHistory);

    return Response.json(updated);
  } catch (error) {
    console.error("❌ insuranceHistory API error:", error);
    return Response.json({ error: "Failed to update insurance" }, { status: 500 });
  }
}