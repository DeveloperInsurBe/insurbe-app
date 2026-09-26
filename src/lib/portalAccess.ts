import { cache } from "react";
import { getCurrentSession } from "./applicationAccess";

type PortalRole = "partner" | "agent";

export const getCurrentPortalAccess = cache(async () => {
  // Shared per-request session read (same as getCurrentPartnerAccess uses).
  const session = await getCurrentSession();

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
