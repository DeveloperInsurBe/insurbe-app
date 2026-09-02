import { NextResponse } from "next/server";

import { getAgentByEmail } from "@/lib/agent";
import { getCurrentPortalAccess } from "@/lib/portalAccess";
import {
  getAgentDashboardSummary,
  getPartnerDashboardSummary,
} from "@/lib/portalDashboardSummary";
import { getPartnerByEmail } from "@/lib/partner";

export async function GET() {
  try {
    const { session, role } = await getCurrentPortalAccess();

    if (!session?.user?.email || !role) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (role === "partner") {
      const partner = await getPartnerByEmail(session.user.email);

      if (!partner?.partnerId) {
        return NextResponse.json({ error: "Partner not found" }, { status: 404 });
      }

      const summary = await getPartnerDashboardSummary(partner.partnerId);

      return NextResponse.json(
        {
          role,
          summary,
        },
        {
          headers: {
            "Cache-Control":
              "private, max-age=15, stale-while-revalidate=30",
          },
        },
      );
    }

    if (role === "agent") {
      const agent = await getAgentByEmail(session.user.email);

      if (!agent?.id) {
        return NextResponse.json({ error: "Agent not found" }, { status: 404 });
      }

      const summary = await getAgentDashboardSummary(agent.id);

      return NextResponse.json(
        {
          role,
          summary,
        },
        {
          headers: {
            "Cache-Control":
              "private, max-age=15, stale-while-revalidate=30",
          },
        },
      );
    }

    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  } catch (error) {
    console.error("PORTAL DASHBOARD SUMMARY ERROR:", error);
    return NextResponse.json({ error: "Failed to fetch summary" }, { status: 500 });
  }
}
