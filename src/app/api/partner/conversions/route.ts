import { NextRequest, NextResponse } from "next/server";

import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);

    const partnerId = searchParams.get("partnerId");

    if (!partnerId) {
      return NextResponse.json(
        { error: "Partner ID missing" },
        { status: 400 }
      );
    }

    const applications = await prisma.application.findMany({
      where: {
        partnerId,
        source: "partner",
      },

      orderBy: {
        createdAt: "desc",
      },
    });

    return NextResponse.json(applications);

  } catch (error) {
    console.error(error);

    return NextResponse.json(
      { error: "Something went wrong" },
      { status: 500 }
    );
  }
}