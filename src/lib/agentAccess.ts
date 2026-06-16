import { cache } from "react";
import { getServerSession } from "next-auth";

import { authOptions } from "./authOptions";
import { getAgentByEmail } from "./agent";

export const getCurrentAgentSession = cache(async () => {
  return getServerSession(authOptions);
});

export const getCurrentAgentAccess = cache(async () => {
  const session = await getCurrentAgentSession();

  if (!session?.user?.email) {
    return { session: null, agent: null };
  }

  const agent = await getAgentByEmail(session.user.email);

  if (!agent || agent.role !== "agent") {
    return { session, agent: null };
  }

  return { session, agent };
});

