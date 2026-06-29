import { cache } from "react";
import { getServerSession } from "next-auth";

import { authOptions } from "./authOptions";

type PortalRole = "partner" | "agent";

export const getCurrentPortalAccess = cache(async () => {
  const session = await getServerSession(authOptions);

  if (!session?.user?.email) {
    return { session: null, role: null as PortalRole | null };
  }

  if (session.user.role === "partner") {
    return { session, role: "partner" as const };
  }

  if (session.user.role === "agent") {
    return { session, role: "agent" as const };
  }

  return { session, role: null as PortalRole | null };
});
