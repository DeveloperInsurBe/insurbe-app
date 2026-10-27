/**
 * DAK provider portal workflow. Shared by the API routes and the portal UI,
 * so keep this file free of server-only imports.
 *
 * Submitted -> In Review -> (Information Required <-> Customer Responded)
 *   -> Approved -> Active. Cancelled / Not Eligible end the case.
 * Active, Cancelled and Not Eligible are final: nothing can change afterwards.
 */

export const DAK_STATUSES = [
  "Submitted",
  "In Review",
  "Information Required",
  "Customer Responded",
  "Approved",
  "Active",
  "Not Eligible",
  "Cancelled",
] as const;

export type DakStatus = (typeof DAK_STATUSES)[number];

export const DAK_FINAL_STATUSES: DakStatus[] = ["Active", "Not Eligible", "Cancelled"];

export const isDakStatus = (value: unknown): value is DakStatus =>
  typeof value === "string" && (DAK_STATUSES as readonly string[]).includes(value);

export const isDakFinal = (status: DakStatus) => DAK_FINAL_STATUSES.includes(status);

export type DakAction = "start_review" | "request_info" | "approve" | "allocate" | "not_eligible" | "cancel";

export const DAK_ACTIONS: Record<DakAction, { from: DakStatus[]; to: DakStatus; event: string }> = {
  start_review: { from: ["Submitted"], to: "In Review", event: "Review started" },
  request_info: {
    from: ["In Review", "Information Required", "Customer Responded"],
    to: "Information Required",
    event: "Information requested",
  },
  approve: { from: ["In Review", "Customer Responded"], to: "Approved", event: "Application approved" },
  allocate: { from: ["Approved"], to: "Active", event: "Insurance allocation confirmed" },
  not_eligible: {
    from: ["In Review", "Information Required", "Customer Responded", "Approved"],
    to: "Not Eligible",
    event: "Marked not eligible",
  },
  cancel: {
    from: ["Submitted", "In Review", "Information Required", "Customer Responded", "Approved"],
    to: "Cancelled",
    event: "Application cancelled",
  },
};

export const canDak = (action: DakAction, status: DakStatus) => DAK_ACTIONS[action].from.includes(status);

export const DAK_CATEGORIES = ["Student", "Employee", "Intern/Trainee", "Voluntary Member", "Family Insurance"] as const;

export type DakCategory = (typeof DAK_CATEGORIES)[number];

/** The DAK form asks for the reason of stay; map it to the portal category. */
export function dakCategoryFromReason(reason: unknown): DakCategory | null {
  switch (String(reason ?? "").trim().toLowerCase()) {
    case "student":
      return "Student";
    case "employee":
      return "Employee";
    case "trainee":
    case "intern/trainee":
      return "Intern/Trainee";
    case "voluntary member":
      return "Voluntary Member";
    case "family insurance":
      return "Family Insurance";
    default:
      return null;
  }
}

export const DAK_REQUEST_CATEGORIES = [
  "Replacement document",
  "Missing document",
  "Additional information",
  "Clarification",
  "Other",
] as const;

export const DAK_REQUEST_PRIORITIES = ["Normal", "High", "Urgent"] as const;

/** Membership confirmation letter and other DAK uploads. */
export const DAK_MAX_UPLOAD_BYTES = 10 * 1024 * 1024;

/** An open request is "due soon" this many days before its due date. */
export const DAK_DUE_SOON_DAYS = 3;
