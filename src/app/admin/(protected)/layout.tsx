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
    <div className="min-h-screen bg-[#f6f7fb] flex flex-col xl:flex-row">
      <AdminSidebar />

      <main className="min-w-0 flex-1 overflow-x-hidden p-3 sm:p-5 lg:p-6 xl:p-8">
        {children}
      </main>
    </div>
  );
}
