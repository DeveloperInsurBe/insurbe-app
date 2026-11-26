/**
 * Forgot / reset password rules shared by the customer website and the
 * partner / agent / Sales Leader logins.
 *
 * - The reset link carries a random token; only its SHA-256 hash is stored
 *   (User.resetToken), it expires after 15 minutes and works once.
 * - The answer to "send me a link" never says whether the email exists.
 * - At most one email per account per minute (stops inbox flooding).
 */

export const RESET_TOKEN_MINUTES = 15;
export const RESET_EMAIL_COOLDOWN_MS = 60 * 1000;
export const MIN_PASSWORD_LENGTH = 8;

/** Where a reset was started; decides which accounts may use it and where to sign in afterwards. */
export type ResetPortal = "customer" | "partner" | "team";

type PortalRule = {
  loginUrl: string;
  /** Roles allowed to reset through this page; null = any account (customer website, unchanged). */
  roles: string[] | null;
};

export const RESET_PORTALS: Record<ResetPortal, PortalRule> = {
  customer: { loginUrl: "/login", roles: null },
  // Partners, agents and Sales Leaders share the partner login.
  partner: { loginUrl: "/partner-access/login", roles: ["partner", "agent", "team_admin"] },
  team: { loginUrl: "/team/login", roles: ["team_admin"] },
};

/** Only known values, so a link can never redirect anywhere else. */
export const toResetPortal = (value: unknown): ResetPortal =>
  value === "partner" || value === "team" ? value : "customer";

export const normalizeEmail = (value: unknown) => String(value ?? "").trim().toLowerCase();

export const passwordProblem = (password: unknown): string | null => {
  if (typeof password !== "string" || password.length < MIN_PASSWORD_LENGTH) {
    return `Your password must be at least ${MIN_PASSWORD_LENGTH} characters long.`;
  }
  if (password.length > 200) return "Your password is too long.";
  return null;
};

/** True when a reset email went out to this account less than a minute ago. */
export function resetEmailSentRecently(resetTokenExpiry: Date | null | undefined, now = Date.now()) {
  if (!resetTokenExpiry) return false;
  const issuedAt = resetTokenExpiry.getTime() - RESET_TOKEN_MINUTES * 60 * 1000;
  return now - issuedAt < RESET_EMAIL_COOLDOWN_MS;
}
