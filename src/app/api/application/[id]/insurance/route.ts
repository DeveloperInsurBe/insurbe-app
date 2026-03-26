import { prisma } from "@/lib/prisma";

export async function PUT(
  req: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;
    const body = await req.json();

    const updated = await prisma.application.update({
      where: { id },
      data: {
        insuranceHistory: body,
        status: "incomplete",
      },
    });

    return Response.json(updated); // ✅ IMPORTANT
  } catch (error) {
    console.error("❌ insuranceHistory API error:", error);
    return Response.json({ error: "Failed" }, { status: 500 });
  }
}