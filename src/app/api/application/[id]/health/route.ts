import { prisma } from "@/lib/prisma";

export async function PUT(
  req: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params; // ✅ FIX

    const body = await req.json();
    const safeBody = JSON.parse(JSON.stringify(body));

    const updated = await prisma.application.update({
      where: { id },
      data: {
        healthAnswers: safeBody,
        status: "incomplete",
      },
    });

    return Response.json(updated);
  } catch (error) {
    console.error("❌ Health API error:", error);
    return Response.json({ error: "Failed" }, { status: 500 });
  }
}