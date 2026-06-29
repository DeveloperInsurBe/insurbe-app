import { redirect } from "next/navigation";

import AgentProfileDataClient from "./AgentProfileDataClient";
import { getCurrentAgentAccess } from "@/lib/agentAccess";
import { getCountriesCollection } from "@/lib/countries";

type Country = {
  name: string;
  code: string;
  dialCode: string;
  flag: string;
};

async function getCountries(): Promise<Country[]> {
  try {
    const data = await getCountriesCollection();

    return data
      .map((c: any) => ({
        name: c?.name?.common || "",
        code: c?.cca2 || "",
        dialCode:
          c?.idd?.root && c?.idd?.suffixes?.length === 1
            ? c.idd.root + c.idd.suffixes[0]
            : c?.idd?.root || "",
        flag: c?.flag || "",
      }))
      .filter((c: Country) => c.name && c.dialCode)
      .sort((a: Country, b: Country) => a.name.localeCompare(b.name));
  } catch {
    return [];
  }
}

export default async function AgentProfilePage() {
  const { session, agent } = await getCurrentAgentAccess();

  if (!session?.user?.email) {
    redirect("/");
  }

  if (!agent) {
    redirect("/");
  }

  const countries = await getCountries();

  return (
    <AgentProfileDataClient
      initialProfile={agent.partnerProfile}
      initialCountries={countries}
      agentEmail={agent.email || ""}
      agentFirstName={agent.firstName || ""}
      agentLastName={agent.lastName || ""}
      agentCompanyName={agent.companyName || ""}
      agentTitle={agent.title || ""}
    />
  );
}

