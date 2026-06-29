import { redirect } from "next/navigation";

export default function AgentLoginRedirectPage() {
  redirect("/partner-access/login?type=agent");
}

