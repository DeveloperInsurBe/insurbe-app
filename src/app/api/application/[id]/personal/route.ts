import { prisma } from "@/lib/prisma";

// ✅ GET APPLICATION
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

// ✅ UPDATE (FIXED MERGE)
export async function PUT(
  req: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;
    const body = await req.json();
console.log("BODY:", body);
    const existing = await prisma.application.findUnique({
      where: { id },
    });

    if (!existing) {
      return Response.json({ error: "Not found" }, { status: 404 });
    }

    const updated = await prisma.application.update({
      where: { id },
      data: {
        personalDetails: {
          ...(existing.personalDetails as any),
          ...(body.personalDetails || {}), // ✅ IMPORTANT
        },
      },
    });

    return Response.json(updated);
  } catch (error) {
    console.error("❌ Update error:", error);
    return Response.json({ error: "Server error" }, { status: 500 });
  }
}