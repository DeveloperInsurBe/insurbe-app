import { randomBytes } from "crypto";
import { cache } from "react";
import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";

import { authOptions } from "../authOptions";
import { prisma } from "../prisma";
import { TEAM_ADMIN_ROLE } from "./roles";

export { TEAM_ADMIN_DISABLED_ROLE, TEAM_ADMIN_ROLE } from "./roles";

export type TeamAdmin = {
  id: string;
  email: string;
  name: string;
  commissionLimit: number;
  inviteCode: string | null;
};

export const teamAdminName = (user: { firstName?: string | null; lastName?: string | null; email?: string | null }) =>
  [user.firstName, user.lastName].filter(Boolean).join(" ").trim() || user.email || "Team admin";

/** New invite code for a team admin's agent signup link. */
export const generateInviteCode = () => randomBytes(9).toString("base64url");

/** Random password shown to the superadmin once; only the hash is stored. */
export const generateTeamAdminPassword = () => randomBytes(12).toString("base64url");

/** The signed-in team admin. The role is re-checked in the database on every request. */
export const getCurrentTeamAdmin = cache(async (): Promise<TeamAdmin | null> => {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id || session.user.role !== TEAM_ADMIN_ROLE) return null;

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { id: true, email: true, role: true, firstName: true, lastName: true, commissionLimit: true, inviteCode: true },
  });
  if (!user || user.role !== TEAM_ADMIN_ROLE) return null;

  return {
    id: user.id,
    email: user.email,
    name: teamAdminName(user),
    commissionLimit: user.commissionLimit ?? 0,
    inviteCode: user.inviteCode,
  };
});

/** For API routes: the signed-in team admin, or a 401 response to return. */
export async function requireTeamAdmin(): Promise<
  { teamAdmin: TeamAdmin; response?: never } | { teamAdmin?: never; response: NextResponse }
> {
  const teamAdmin = await getCurrentTeamAdmin();
  if (!teamAdmin) return { response: NextResponse.json({ error: "Unauthorized" }, { status: 401 }) };
  return { teamAdmin };
}
