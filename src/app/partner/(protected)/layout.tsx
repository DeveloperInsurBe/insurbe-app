import { redirect } from "next/navigation";

import { getCurrentPartnerAccess } from "@/lib/applicationAccess";

import PartnerSidebar from "./PartnerSidebar";

export default async function PartnerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { session, partner } = await getCurrentPartnerAccess();

  // Not logged in
  if (!session) {
    redirect("/partner/login");
  }

  // Not partner
  if (session.user.role !== "partner") {
    redirect("/");
  }

  if (!partner) {
    redirect("/");
  }

  return (
    <div className="min-h-screen bg-[#f5f7fb] flex flex-col">
      <div className="flex flex-1 flex-col xl:flex-row">
        {/* SIDEBAR */}
        <PartnerSidebar partner={partner} />

        {/* PAGE CONTENT */}
        <main className="flex-1 overflow-y-auto p-3 sm:p-4 md:p-6 xl:p-10">
          {children}
        </main>
      </div>
    </div>
  );
}
