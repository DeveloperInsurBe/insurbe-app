import { redirect } from "next/navigation";

import AgentDashboardPage from "@/app/agent/(protected)/dashboard/page";
import PartnerDashboardPage from "@/app/partner/(protected)/dashboard/page";
import { getCurrentPortalAccess } from "@/lib/portalAccess";

export default async function PortalDashboardPage() {
  const { session, role } = await getCurrentPortalAccess();

  if (!session) {
    redirect("/partner-access/login");
  }

  if (role === "partner") {
    return <PartnerDashboardPage />;
  }

  if (role === "agent") {
    return <AgentDashboardPage />;
  }

  redirect("/");
}

