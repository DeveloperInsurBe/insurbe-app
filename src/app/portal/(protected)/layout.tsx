import { redirect } from "next/navigation";

import { getCurrentPortalAccess } from "@/lib/portalAccess";

import PortalSidebar from "./PortalSidebar";

export default async function PortalLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { session, role } = await getCurrentPortalAccess();

  if (!session) {
    redirect("/partner-access/login");
  }

  if (role !== "partner" && role !== "agent") {
    redirect("/");
  }

  return (
    <div className="min-h-screen bg-[#f5f7fb] flex flex-col">
      <div className="flex flex-1 flex-col xl:flex-row">
        <PortalSidebar role={role} user={session.user} />
        <main className="flex-1 overflow-y-auto p-3 sm:p-4 md:p-6 xl:p-10">
          {children}
        </main>
      </div>
    </div>
  );
}
