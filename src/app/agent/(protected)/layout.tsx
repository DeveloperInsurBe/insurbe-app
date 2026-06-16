import { redirect } from "next/navigation";

import { getCurrentAgentAccess } from "@/lib/agentAccess";

import AgentSidebar from "./AgentSidebar";

export default async function AgentLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { session, agent } = await getCurrentAgentAccess();

  if (!session) {
    redirect("/agent/login");
  }

  if (session.user.role !== "agent") {
    redirect("/");
  }

  if (!agent) {
    redirect("/");
  }

  return (
    <div className="min-h-screen bg-[#f5f7fb] flex flex-col">
      <div className="flex flex-1 flex-col xl:flex-row">
        <AgentSidebar agent={agent} />
        <main className="flex-1 overflow-y-auto p-3 sm:p-4 md:p-6 xl:p-10">
          {children}
        </main>
      </div>
    </div>
  );
}

