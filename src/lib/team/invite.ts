import { prisma } from "../prisma";
import { TEAM_ADMIN_ROLE } from "./roles";

export const INVALID_INVITE_MESSAGE = "This invite link is no longer valid. Please ask for a new one.";

/**
 * The Sales Leader (team admin) behind an invite code from a signup link.
 * undefined = no invite given, null = invalid or disabled Sales Leader.
 */
export async function resolveTeamInvite(invite: unknown): Promise<string | null | undefined> {
  const code = String(invite ?? "").trim();
  if (!code) return undefined;

  const teamAdmin = await prisma.user.findFirst({
    where: { role: TEAM_ADMIN_ROLE, inviteCode: code },
    select: { id: true },
  });
  return teamAdmin?.id ?? null;
}
