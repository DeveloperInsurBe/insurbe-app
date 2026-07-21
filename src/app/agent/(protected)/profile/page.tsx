import { redirect } from "next/navigation";

import AgentProfileDataClient from "./AgentProfileDataClient";
import { getCurrentAgentAccess } from "@/lib/agentAccess";

export default async function AgentProfilePage() {
  const { session, agent } = await getCurrentAgentAccess();

  if (!session?.user?.email) {
    redirect("/");
  }

  if (!agent) {
    redirect("/");
  }

  return (
    <AgentProfileDataClient
      initialProfile={agent.partnerProfile}
      initialCountries={[]}
      agentEmail={agent.email || ""}
      agentFirstName={agent.firstName || ""}
      agentLastName={agent.lastName || ""}
      agentCompanyName={agent.companyName || ""}
      agentTitle={agent.title || ""}
    />
  );
}
