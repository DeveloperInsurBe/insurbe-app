import { cache } from "react";
import { getServerSession } from "next-auth";

import { authOptions } from "./authOptions";
import { getPartnerByEmail } from "./partner";

export const getCurrentSession = cache(async () => {
  return getServerSession(authOptions);
});

export const getCurrentPartnerAccess = cache(async () => {
  const session = await getCurrentSession();

  if (!session?.user?.email) {
    return { session: null, partner: null };
  }

  const partner = await getPartnerByEmail(session.user.email);

  return { session, partner };
});
