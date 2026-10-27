// Safe for client components: no server-only imports.

export const COMMISSION_STATUSES = [
  "Pending",
  "Approved",
  "Paid",
  "Rejected",
  "Not Eligible",
] as const;

export type ApplicationRow = {
  id: string;
  orderId: string;
  createdAt: string;
  status: string;
  name: string;
  email: string;
  phone: string;
  location: string;
  product: string;
  kind: "TK" | "DAK" | "private";
  source: "direct" | "partner" | "agent";
  referrer: string;
  commission: number;
  commissionStatus: string;
  extra: [string, string][];
  /** DAK provider portal review state (DAK applications only). */
  dak: { caseNumber: string; status: string } | null;
};
