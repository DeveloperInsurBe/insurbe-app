import { redirect } from "next/navigation";

import { getCurrentAdminSession } from "@/lib/adminAccess";

export default async function AdminEntryPage() {
  const session = await getCurrentAdminSession();

  if (!session) {
    redirect("/admin/login");
  }

  redirect("/admin/dashboard");
}
