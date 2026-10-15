/**
 * DAK Provider Portal - static UI data (taken from the design screenshots).
 * Replace with real API data when the portal becomes dynamic.
 */

export type DakStatus =
  | "Submitted"
  | "In Review"
  | "Information Required"
  | "Customer Responded"
  | "Approved"
  | "Insurance Confirmed"
  | "Active"
  | "Not Eligible"
  | "Cancelled"
  | "Withdrawn";

export type DakCategory = "Student" | "Employee" | "Intern/Trainee" | "Voluntary Member" | "Family Insurance";

export const DAK_STATUSES: DakStatus[] = [
  "Submitted",
  "In Review",
  "Information Required",
  "Customer Responded",
  "Approved",
  "Insurance Confirmed",
  "Active",
  "Not Eligible",
  "Cancelled",
  "Withdrawn",
];

export const DAK_CATEGORIES: DakCategory[] = [
  "Student",
  "Employee",
  "Intern/Trainee",
  "Voluntary Member",
  "Family Insurance",
];

export type DakApplication = {
  id: string;
  name: string;
  birthDate: string;
  category: DakCategory | null;
  submitted: string; // display format
  submittedSort: string; // ISO for sorting
  startDate: string;
  startSort: string;
  status: DakStatus;
  openRequests: number;
  ageDays: number | null;
};

export const DAK_REVIEWER = {
  name: "DAK Reviewer",
  email: "reviewer@dak-gesundheit.de",
  lastLogin: "01. Sept. 2026, 13:20 CEST",
};

export const DAK_APPLICATIONS: DakApplication[] = [
  {
    id: "DAK-2026-001286",
    name: "Johannes Weber",
    birthDate: "05. Nov. 2003",
    category: "Intern/Trainee",
    submitted: "20. Aug. 2026",
    submittedSort: "2026-08-20",
    startDate: "01. Sept. 2026",
    startSort: "2026-09-01",
    status: "Information Required",
    openRequests: 1,
    ageDays: 11,
  },
  {
    id: "DAK-2026-001288",
    name: "Lukas Müller",
    birthDate: "17. Feb. 2000",
    category: "Student",
    submitted: "10. Aug. 2026",
    submittedSort: "2026-08-10",
    startDate: "01. Sept. 2026",
    startSort: "2026-09-01",
    status: "Approved",
    openRequests: 0,
    ageDays: 6,
  },
  {
    id: "DAK-2026-001284",
    name: "Otsubo Hasuno",
    birthDate: "21. Juli 2006",
    category: "Student",
    submitted: "26. Aug. 2026",
    submittedSort: "2026-08-26",
    startDate: "01. Okt. 2026",
    startSort: "2026-10-01",
    status: "In Review",
    openRequests: 0,
    ageDays: 5,
  },
  {
    id: "DAK-2026-001285",
    name: "Maria Schneider",
    birthDate: "14. März 1991",
    category: "Employee",
    submitted: "27. Aug. 2026",
    submittedSort: "2026-08-27",
    startDate: "01. Sept. 2026",
    startSort: "2026-09-01",
    status: "Submitted",
    openRequests: 0,
    ageDays: 4,
  },
  {
    id: "DAK-2026-001293",
    name: "Emma Wagner",
    birthDate: "09. Apr. 2004",
    category: "Intern/Trainee",
    submitted: "28. Aug. 2026",
    submittedSort: "2026-08-28",
    startDate: "15. Sept. 2026",
    startSort: "2026-09-15",
    status: "Information Required",
    openRequests: 2,
    ageDays: 3,
  },
  {
    id: "DAK-2026-001287",
    name: "Priya Sharma",
    birthDate: "28. Juni 1985",
    category: "Voluntary Member",
    submitted: "18. Aug. 2026",
    submittedSort: "2026-08-18",
    startDate: "15. Sept. 2026",
    startSort: "2026-09-15",
    status: "Customer Responded",
    openRequests: 1,
    ageDays: 2,
  },
  {
    id: "DAK-2026-001289",
    name: "Ana Costa",
    birthDate: "30. Sept. 1988",
    category: "Employee",
    submitted: "05. Aug. 2026",
    submittedSort: "2026-08-05",
    startDate: "15. Aug. 2026",
    startSort: "2026-08-15",
    status: "Insurance Confirmed",
    openRequests: 0,
    ageDays: null,
  },
  // Rows below were not visible in the screenshots; known only from the
  // activity log, so unknown fields are left empty.
  {
    id: "DAK-2026-001290",
    name: "David Fischer",
    birthDate: "—",
    category: null,
    submitted: "—",
    submittedSort: "",
    startDate: "—",
    startSort: "",
    status: "Not Eligible",
    openRequests: 0,
    ageDays: null,
  },
  {
    id: "DAK-2026-001291",
    name: "Sophie Klein",
    birthDate: "—",
    category: null,
    submitted: "—",
    submittedSort: "",
    startDate: "—",
    startSort: "",
    status: "Cancelled",
    openRequests: 0,
    ageDays: null,
  },
];

export const DAK_DASHBOARD_STATS = [
  { key: "new", label: "New Submissions", value: 1, tone: "blue" },
  { key: "review", label: "In Review", value: 1, tone: "violet" },
  { key: "info", label: "Info Required", value: 2, tone: "amber" },
  { key: "responded", label: "Customer Responded", value: 1, tone: "sky" },
  { key: "allocation", label: "Pending Allocation", value: 1, tone: "emerald" },
] as const;

export const DAK_ACTION_QUEUE = [
  { name: "Priya Sharma", category: "Voluntary Member", id: "DAK-2026-001287", status: "Customer Responded" as DakStatus, startDate: "15. Sept. 2026", age: "2d" },
  { name: "Maria Schneider", category: "Employee", id: "DAK-2026-001285", status: "Submitted" as DakStatus, startDate: "01. Sept. 2026", age: "4d" },
];

export const DAK_OVERDUE_REQUESTS = [
  { name: "Johannes Weber", id: "DAK-2026-001286", open: 1 },
  { name: "Emma Wagner", id: "DAK-2026-001293", open: 2 },
];

export const DAK_RECENT_ACTIVITY = [
  { name: "Priya Sharma", event: "Customer Responded", ago: "46d ago" },
  { name: "Emma Wagner", event: "Information Required", ago: "46d ago" },
  { name: "Emma Wagner", event: "In Review", ago: "46d ago" },
  { name: "Emma Wagner", event: "Submitted", ago: "47d ago" },
  { name: "Sophie Klein", event: "Cancelled", ago: "47d ago" },
  { name: "Maria Schneider", event: "Submitted", ago: "48d ago" },
  { name: "Otsubo Hasuno", event: "In Review", ago: "48d ago" },
];

export type DakDocument = {
  name: string;
  size: string;
  applicant: string;
  applicationId: string;
  source: "InsurBe Generated" | "Customer";
  uploaded: string;
  scan: "Clean";
  review: "Reviewed" | "Pending" | "Auto";
};

export const DAK_DOCUMENTS: DakDocument[] = [
  { name: "Application.pdf", size: "284 KB", applicant: "Otsubo Hasuno", applicationId: "DAK-2026-001284", source: "InsurBe Generated", uploaded: "26. Aug. 2026", scan: "Clean", review: "Reviewed" },
  { name: "Enrolment Certificate.pdf", size: "156 KB", applicant: "Otsubo Hasuno", applicationId: "DAK-2026-001284", source: "Customer", uploaded: "26. Aug. 2026", scan: "Clean", review: "Reviewed" },
  { name: "Power of Attorney - Public Health Insurance.pdf", size: "98 KB", applicant: "Otsubo Hasuno", applicationId: "DAK-2026-001284", source: "Customer", uploaded: "26. Aug. 2026", scan: "Clean", review: "Pending" },
  { name: "Application.pdf", size: "302 KB", applicant: "Maria Schneider", applicationId: "DAK-2026-001285", source: "InsurBe Generated", uploaded: "27. Aug. 2026", scan: "Clean", review: "Auto" },
  { name: "Employment Contract.pdf", size: "420 KB", applicant: "Maria Schneider", applicationId: "DAK-2026-001285", source: "Customer", uploaded: "27. Aug. 2026", scan: "Clean", review: "Pending" },
  { name: "Application.pdf", size: "289 KB", applicant: "Johannes Weber", applicationId: "DAK-2026-001286", source: "InsurBe Generated", uploaded: "20. Aug. 2026", scan: "Clean", review: "Reviewed" },
  { name: "Internship Contract.pdf", size: "215 KB", applicant: "Johannes Weber", applicationId: "DAK-2026-001286", source: "Customer", uploaded: "20. Aug. 2026", scan: "Clean", review: "Reviewed" },
  { name: "Application.pdf", size: "311 KB", applicant: "Priya Sharma", applicationId: "DAK-2026-001287", source: "InsurBe Generated", uploaded: "18. Aug. 2026", scan: "Clean", review: "Reviewed" },
  { name: "Passport_clear.pdf", size: "1.2 MB", applicant: "Priya Sharma", applicationId: "DAK-2026-001287", source: "Customer", uploaded: "29. Aug. 2026", scan: "Clean", review: "Pending" },
];

export type DakActivity = {
  timestamp: string;
  actor: string;
  applicant: string;
  applicationId: string;
  event: string;
  from: DakStatus | null;
  to: DakStatus;
};

export const DAK_ACTIVITY_LOG: DakActivity[] = [
  { timestamp: "01. Sept. 2026, 14:00 CEST", actor: "DAK Reviewer", applicant: "Emma Wagner", applicationId: "DAK-2026-001293", event: "Information requested (2 items)", from: "In Review", to: "Information Required" },
  { timestamp: "29. Aug. 2026, 22:00 CEST", actor: "Priya Sharma", applicant: "Priya Sharma", applicationId: "DAK-2026-001287", event: "Customer responded to information request", from: "Information Required", to: "Customer Responded" },
  { timestamp: "28. Aug. 2026, 17:30 CEST", actor: "DAK Reviewer", applicant: "Sophie Klein", applicationId: "DAK-2026-001291", event: "Application cancelled", from: "Submitted", to: "Cancelled" },
  { timestamp: "27. Aug. 2026, 19:15 CEST", actor: "Maria Schneider", applicant: "Maria Schneider", applicationId: "DAK-2026-001285", event: "Application submitted", from: null, to: "Submitted" },
  { timestamp: "27. Aug. 2026, 14:45 CEST", actor: "DAK Reviewer", applicant: "Otsubo Hasuno", applicationId: "DAK-2026-001284", event: "Review started", from: "Submitted", to: "In Review" },
  { timestamp: "26. Aug. 2026, 16:15 CEST", actor: "DAK Reviewer", applicant: "David Fischer", applicationId: "DAK-2026-001290", event: "Marked not eligible — income threshold", from: "In Review", to: "Not Eligible" },
  { timestamp: "26. Aug. 2026, 13:50 CEST", actor: "Otsubo Hasuno", applicant: "Otsubo Hasuno", applicationId: "DAK-2026-001284", event: "Application submitted", from: null, to: "Submitted" },
  { timestamp: "25. Aug. 2026, 17:00 CEST", actor: "DAK Reviewer", applicant: "Lukas Müller", applicationId: "DAK-2026-001288", event: "Application approved", from: "In Review", to: "Approved" },
  { timestamp: "23. Aug. 2026, 14:30 CEST", actor: "DAK Reviewer", applicant: "Priya Sharma", applicationId: "DAK-2026-001287", event: "Information requested — proof of income", from: "In Review", to: "Information Required" },
];

/** Sidebar badge counts (as shown in the screenshots). */
export const DAK_NAV_BADGES = { dashboard: 4, applications: 2, help: 4 };
