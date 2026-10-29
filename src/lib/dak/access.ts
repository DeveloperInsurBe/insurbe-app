import { cache } from "react";
import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";

import { authOptions } from "../authOptions";
import { prisma } from "../prisma";
import { DAK_REVIEWER_ROLE } from "./roles";

export { DAK_REVIEWER_DISABLED_ROLE, DAK_REVIEWER_ROLE } from "./roles";

export type DakReviewer = {
  id: string;
  email: string;
  name: string;
  firstName: string;
  lastName: string;
};

export const reviewerDisplayName = (user: { firstName?: string | null; lastName?: string | null }) =>
  [user.firstName, user.lastName].filter(Boolean).join(" ").trim() || "DAK Reviewer";

export const getCurrentDakReviewer = cache(async (): Promise<DakReviewer | null> => {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id || session.user.role !== DAK_REVIEWER_ROLE) return null;

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { id: true, email: true, role: true, firstName: true, lastName: true },
  });
  if (!user || user.role !== DAK_REVIEWER_ROLE) return null;

  return {
    id: user.id,
    email: user.email,
    name: reviewerDisplayName(user),
    firstName: user.firstName ?? "",
    lastName: user.lastName ?? "",
  };
});

/** For API routes: the signed-in reviewer, or a 401 response to return. */
export async function requireDakReviewer(): Promise<
  { reviewer: DakReviewer; response?: never } | { reviewer?: never; response: NextResponse }
> {
  const reviewer = await getCurrentDakReviewer();
  if (!reviewer) {
    return { response: NextResponse.json({ error: "Unauthorized" }, { status: 401 }) };
  }
  return { reviewer };
}
