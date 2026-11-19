/**
 * Partner categories (TL access model, Nov 2026). Every partner picks one at
 * signup; no approval needed. Internally an "Agent" is still a user with role
 * "agent" (customers linked by user id), the other two are role "partner"
 * (customers linked by partner code), so commissions and payouts stay as they are.
 */
export const PARTNER_CATEGORIES = ["agent", "referral", "institutional"] as const;

export type PartnerCategory = (typeof PARTNER_CATEGORIES)[number];

export const PARTNER_CATEGORY_LABELS: Record<PartnerCategory, string> = {
  agent: "Agent",
  referral: "Referral Partner",
  institutional: "Institutional Partner",
};

export const isPartnerCategory = (value: unknown): value is PartnerCategory =>
  typeof value === "string" && (PARTNER_CATEGORIES as readonly string[]).includes(value);

/** Category of a user; accounts from before categories existed fall back by role. */
export function partnerCategoryOf(user: { role?: string | null; partnerCategory?: string | null }): PartnerCategory {
  if (isPartnerCategory(user.partnerCategory)) return user.partnerCategory;
  return user.role === "agent" ? "agent" : "referral";
}

export const partnerCategoryLabel = (user: { role?: string | null; partnerCategory?: string | null }) =>
  PARTNER_CATEGORY_LABELS[partnerCategoryOf(user)];
