import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const session = await getServerSession();

    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    /**
     * USER
     */
    const user = await prisma.user.findUnique({
      where: {
        email: session.user.email,
      },
    });

    /**
     * HALLESCHE APPLICATIONS
     */
    const applications = user
      ? await prisma.application.findMany({
          where: {
            userId: user.id,
          },

          orderBy: {
            createdAt: "desc",
          },
        })
      : [];

    /**
     * DAK APPLICATIONS
     */
    const allDakApplications = await prisma.insuranceApplication.findMany({
      where: {
        provider: "DAK",
      },

      orderBy: {
        createdAt: "desc",
      },
    });

    const dakApplications = allDakApplications.filter(
      (app: any) =>
        (app.payload as any)?.personal?.email === session?.user?.email,
    );

    /**
     * FORMAT DAK APPS
     */
    const formattedDakApps = dakApplications.map((app) => ({
      id: app.id,

      orderId: app.id,

      provider: "DAK",

      status: "submitted",

      createdAt: app.createdAt,

      isDak: true,
    }));

    /**
     * MERGE BOTH
     */
const mergedApplications = [
  ...applications,
  ...formattedDakApps,
].sort(
  (a: any, b: any) =>
    new Date(b.createdAt).getTime() -
    new Date(a.createdAt).getTime()
);
    return NextResponse.json(mergedApplications);
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      {
        error: "Failed to fetch applications",
      },
      {
        status: 500,
      },
    );
  }
}
