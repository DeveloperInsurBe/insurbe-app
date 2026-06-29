import { redirect } from "next/navigation";

export default function AgentSignupRedirectPage() {
  redirect("/partner-access/signup?type=agent");
}

