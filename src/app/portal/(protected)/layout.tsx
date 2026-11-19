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
    // Same frame as the Sales Leader and admin portals: sidebar on the left
    // (drawer on small screens), content on the right.
    <div className="flex min-h-screen flex-col bg-[#f5f7fb] xl:flex-row">
      <PortalSidebar role={role} user={session.user} />
      <main className="min-w-0 flex-1 overflow-x-hidden p-3 sm:p-5 lg:p-6 xl:p-8">{children}</main>
    </div>
  );
}
