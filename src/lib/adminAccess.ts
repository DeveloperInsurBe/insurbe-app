import { cache } from "react";
import { getServerSession } from "next-auth";

import { authOptions } from "./authOptions";

export const getCurrentAdminSession = cache(async () => {
  const session = await getServerSession(authOptions);

  if (!session?.user?.email) {
    return null;
  }

  if (session.user.role !== "admin") {
    return null;
  }

  return session;
});
