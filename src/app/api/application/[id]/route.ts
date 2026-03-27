import { prisma } from "@/lib/prisma";

export async function GET(
  req: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;

    const application = await prisma.application.findUnique({
      where: { id },
    });

    if (!application) {
      return Response.json({ error: "Not found" }, { status: 404 });
    }

    return Response.json(application);
  } catch (error) {
    console.error("❌ Fetch error:", error);
    return Response.json({ error: "Server error" }, { status: 500 });
  }
}

// 🔥 ADD THIS (VERY IMPORTANT)
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
        ...body,
      },
    });

    return Response.json(updated);
  } catch (error) {
    console.error("❌ Update error:", error);
    return Response.json({ error: "Server error" }, { status: 500 });
  }
}