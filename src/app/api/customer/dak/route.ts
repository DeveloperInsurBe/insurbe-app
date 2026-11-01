import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";

import { authOptions } from "@/lib/authOptions";
import { dakCustomerPortalEnabled, getCustomerDakApplications } from "@/lib/dak/customer";

/** The signed-in customer's DAK applications with their live review status. */
export async function GET() {
  if (!dakCustomerPortalEnabled()) return NextResponse.json({ enabled: false, applications: [] });

  const session = await getServerSession(authOptions);
  if (!session?.user?.email) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const applications = await getCustomerDakApplications(session.user.email);
    return NextResponse.json({ enabled: true, applications });
  } catch (error) {
    console.error("CUSTOMER DAK APPLICATIONS ERROR:", error);
    return NextResponse.json({ error: "Could not load your DAK applications" }, { status: 500 });
  }
}
