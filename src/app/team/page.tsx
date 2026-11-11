import { redirect } from "next/navigation";

import { getCurrentTeamAdmin } from "@/lib/team/access";

export const dynamic = "force-dynamic";

export default async function TeamIndex() {
  redirect((await getCurrentTeamAdmin()) ? "/team/dashboard" : "/team/login");
}
