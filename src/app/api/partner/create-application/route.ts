import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";

import { authOptions } from "@/lib/authOptions";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);

    // NOT LOGGED IN
    if (!session?.user?.email) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    // FIND PARTNER
    const partner = await prisma.user.findUnique({
      where: {
        email: session.user.email,
      },
    });

    if (!partner || !partner.partnerId) {
      return NextResponse.json(
        { error: "Partner not found" },
        { status: 404 }
      );
    }

    const body = await req.json();

    const {
      product,
      firstName,
      lastName,
    } = body;

    // CREATE APPLICATION
    const application = await prisma.application.create({
      data: {
        orderId: `ORD-${Date.now()}`,

        userId: null,

        partnerId: partner.partnerId,

        source: "partner",

        firstName: firstName || "",

        lastName: lastName || "",

        product,

        commission: 0,

        commissionStatus: "Pending",

        pdfBase64: "",

        status: "incomplete",
      },
    });

    return NextResponse.json({
      success: true,
      application,
    });

  } catch (error) {
    console.error(error);

    return NextResponse.json(
      { error: "Something went wrong" },
      { status: 500 }
    );
  }
}