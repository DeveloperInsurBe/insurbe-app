import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    console.log("📧 Session:", session?.user?.email);

    if (!session?.user?.email) {
      console.log("❌ No email in session");
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

    console.log("👤 User ID:", user?.id);

    /**
     * HALLESCHE APPLICATIONS
     */
    const applications =
      await prisma.application.findMany({
        where: {
          OR: [
            { userId: session.user.email },
            user ? { userId: user.id } : { userId: null },
          ],
        },

        orderBy: {
          createdAt: "desc",
        },
      });

    console.log("📋 Applications found:", applications.length);

    /**
     * DAK APPLICATIONS
     */
const insuranceApplications =
  await prisma.insuranceApplication.findMany({
    where: {
      provider: {
        in: ["DAK", "TK"],
      },
    },

    orderBy: {
      createdAt: "desc",
    },
  });

const filteredInsuranceApplications =
  insuranceApplications.filter(
    (app: any) =>
      (app.payload as any)?.personal
        ?.email === session?.user?.email,
  );

console.log(
  "🏥 Insurance applications found:",
  filteredInsuranceApplications.length,
);

/**
 * FORMAT INSURANCE APPS
 */
const formattedInsuranceApps =
  filteredInsuranceApplications.map(
    (app) => ({
      id: app.id,

      orderId: app.id,

      provider: app.provider,

      status:
        app.status?.toLowerCase() ||
        "submitted",

      createdAt: app.createdAt,

      isDak:
        app.provider === "DAK",
    }),
  );

    /**
     * MERGE BOTH
     */
const mergedApplications = [
  ...applications,
  ...formattedInsuranceApps,
].sort(
  (a: any, b: any) =>
    new Date(b.createdAt).getTime() -
    new Date(a.createdAt).getTime()
);

console.log("✅ Total merged applications:", mergedApplications.length);

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
