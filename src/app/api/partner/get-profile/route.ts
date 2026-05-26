import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";

import { prisma } from "@/lib/prisma";
import { authOptions } from "@/lib/authOptions";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
      return NextResponse.json(
        {
          error: "Unauthorized",
        },
        {
          status: 401,
        },
      );
    }

    const user = await prisma.user.findUnique({
      where: {
        email: session.user.email,
      },

      include: {
        partnerProfile: true,
      },
    });

    if (!user) {
      return NextResponse.json(
        {
          error: "User not found",
        },
        {
          status: 404,
        },
      );
    }

    const profile = {
      title: user.partnerProfile?.title ?? user.title ?? "",
      firstName: user.partnerProfile?.firstName ?? user.firstName ?? "",
      lastName: user.partnerProfile?.lastName ?? user.lastName ?? "",
      email: user.partnerProfile?.email ?? user.email ?? "",
      companyName: user.partnerProfile?.companyName ?? user.companyName ?? "",
      ...user.partnerProfile,
    };

    return NextResponse.json({
      profile,
    });
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      {
        error: "Something went wrong",
      },
      {
        status: 500,
      },
    );
  }
}
