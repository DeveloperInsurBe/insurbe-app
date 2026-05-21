import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";
import { prisma } from "@/lib/prisma";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const email = searchParams.get("email");

    if (!email) {
      return NextResponse.json(
        { error: "Email parameter required" },
        { status: 400 }
      );
    }

    // Find partner by email
    const partner = await prisma.user.findUnique({
      where: { email },
      select: {
        partnerId: true,
        companyName: true,
        firstName: true,
        lastName: true,
      },
    });

    if (!partner || !partner.partnerId) {
      return NextResponse.json(
        { error: "Partner not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      partnerId: partner.partnerId,
      companyName: partner.companyName,
      firstName: partner.firstName,
      lastName: partner.lastName,
    });
  } catch (error) {
    console.error("Get Partner ID Error:", error);
    return NextResponse.json(
      { error: "Failed to fetch partner ID" },
      { status: 500 }
    );
  }
}
