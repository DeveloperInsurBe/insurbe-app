import { prisma } from "@/lib/prisma";

export async function PUT(
  req: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;
    const body = await req.json();

    console.log("🔥 HEALTH API HIT:", id);

    const safeBody = JSON.parse(JSON.stringify(body));

    // ✅ GET EXISTING DATA (IMPORTANT FOR MERGE)
    const existing = await prisma.application.findUnique({
      where: { id },
    });

    if (!existing) {
      return Response.json({ error: "Application not found" }, { status: 404 });
    }

    let updated;

    try {
      // ✅ MERGE OLD + NEW DATA
      updated = await prisma.application.update({
        where: { id },
        data: {
          healthAnswers: {
            ...(existing.healthAnswers as any || {}),
            ...(safeBody || {}),
          },
          status: "incomplete",
        },
      });
    } catch (err) {
      console.log("🔁 DB retry...");
      await new Promise((r) => setTimeout(r, 1500));

      updated = await prisma.application.update({
        where: { id },
        data: {
          healthAnswers: {
            ...(existing.healthAnswers as any || {}),
            ...(safeBody || {}),
          },
          status: "incomplete",
        },
      });
    }

    console.log("✅ HEALTH SAVED:", updated.healthAnswers);

    return Response.json(updated);
  } catch (error: any) {
    console.error("❌ HEALTH ERROR:", error.message);

    return Response.json(
      { error: error.message || "Failed" },
      { status: 500 }
    );
  }
}