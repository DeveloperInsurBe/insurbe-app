import type { Metadata } from "next";
import type { ReactNode } from "react";
import { redirect } from "next/navigation";

import { getCurrentTeamAdmin } from "@/lib/team/access";
import TeamSidebar from "./TeamSidebar";

export const metadata: Metadata = {
  title: "InsurBe Sales Leader Portal",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

export default async function TeamPortalLayout({ children }: { children: ReactNode }) {
  const teamAdmin = await getCurrentTeamAdmin();
  if (!teamAdmin) redirect("/team/login");

  return (
    // Same frame as the admin portal: sidebar on the left (drawer on small screens).
    <div className="flex min-h-screen flex-col bg-[#f6f7fb] xl:flex-row">
      <TeamSidebar name={teamAdmin.name} email={teamAdmin.email} />
      <main className="min-w-0 flex-1 overflow-x-hidden p-3 sm:p-5 lg:p-6 xl:p-8">{children}</main>
    </div>
  );
}
