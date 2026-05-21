import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);

    const partnerId = searchParams.get("partnerId");

    if (!partnerId) {
      return NextResponse.json([]);
    }

    /**
     * GET CONVERSIONS
     */
    const applications = await prisma.application.findMany({
      where: {
        partnerId,
      },

      orderBy: {
        createdAt: "desc",
      },
    });

    return NextResponse.json(applications);
  } catch (error) {
    console.error(error);

    return NextResponse.json([], {
      status: 500,
    });
  }
}
