import { prisma } from "@/lib/prisma";
import { NextRequest } from "next/server";

export async function GET(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;
    const application = await prisma.application.findUnique({
      where: { id},
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