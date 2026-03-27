import { prisma } from "@/lib/prisma";

export async function PUT(
  req: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;

    console.log("🔥 HEALTH API HIT:", id);

    const body = await req.json();

    const safeBody = JSON.parse(JSON.stringify(body));

    let updated;

    // =========================
    // DB SAVE WITH RETRY
    // =========================
    try {
      updated = await prisma.application.update({
        where: { id },
        data: {
          healthAnswers: safeBody,
          status: "incomplete",
        },
      });
    } catch (err) {
      console.log("🔁 DB retry...");

      await new Promise((r) => setTimeout(r, 1500));

      updated = await prisma.application.update({
        where: { id },
        data: {
          healthAnswers: safeBody,
          status: "incomplete",
        },
      });
    }

    console.log("✅ HEALTH SAVED");

    return Response.json(updated);
  } catch (error: any) {
    console.error("❌ HEALTH ERROR:", error.message);

    return Response.json(
      { error: error.message || "Failed" },
      { status: 500 }
    );
  }
}