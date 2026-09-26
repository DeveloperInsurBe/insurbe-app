import { redirect } from "next/navigation";

import { getCurrentAdminSession } from "@/lib/adminAccess";
import AdminSidebar from "./AdminSidebar";

export default async function AdminProtectedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getCurrentAdminSession();

  if (!session) {
    redirect("/admin/login");
  }

  return (
    <div className="flex min-h-screen flex-col bg-[#f6f7fb] xl:flex-row">
      <AdminSidebar email={session.user?.email ?? ""} />

      <main className="min-w-0 flex-1 overflow-x-hidden p-3 sm:p-5 lg:p-6 xl:p-8">
        {children}
      </main>
    </div>
  );
}
