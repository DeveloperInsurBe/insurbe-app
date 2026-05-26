import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";

import { authOptions } from "@/lib/authOptions";
import { getPartnerByEmail } from "@/lib/partner";

import PartnerSidebar from "./PartnerSidebar";

export default async function PartnerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getServerSession(authOptions);

  // Not logged in
  if (!session) {
    redirect("/partner/login");
  }

  // Not partner
  if (session.user.role !== "partner") {
    redirect("/");
  }

  // Fetch partner data
  const partner = await getPartnerByEmail(session.user.email!);

  return (
    <div className="min-h-screen bg-[#f5f7fb] flex flex-col">
      <div className="flex flex-1">
        {/* SIDEBAR */}
        <PartnerSidebar partner={partner} />

        {/* PAGE CONTENT */}
        <main className="flex-1 overflow-y-auto p-4 md:p-6 xl:p-10">
          {children}
        </main>
      </div>
    </div>
  );
}
