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
    <div className="min-h-screen bg-[#f6f7fb] xl:flex">
      <AdminSidebar />

      <main className="flex-1 p-4 sm:p-6 xl:p-8">{children}</main>
    </div>
  );
}
