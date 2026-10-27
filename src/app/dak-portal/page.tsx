import { redirect } from "next/navigation";

import { getCurrentDakReviewer } from "@/lib/dak/access";

export const dynamic = "force-dynamic";

export default async function DakPortalIndex() {
  redirect((await getCurrentDakReviewer()) ? "/dak-portal/dashboard" : "/dak-portal/login");
}
