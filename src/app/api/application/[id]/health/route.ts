import { prisma } from "@/lib/prisma";

export async function POST(
  req: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;
    const body = await req.json();

    await prisma.application.update({
      where: { id },
      data: {
        healthAnswers: body,
        status: "incomplete",
      },
    });

    return Response.json({ success: true });
  } catch (error) {
    console.error("❌ Health API error:", error);
    return Response.json({ error: "Failed" }, { status: 500 });
  }
}