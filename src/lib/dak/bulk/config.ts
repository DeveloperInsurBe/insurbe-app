/**
 * DAK bulk upload: partners upload a spreadsheet, InsurBe creates one DAK
 * draft per row, the customer completes and submits it themselves.
 * Shared by server and client code, so keep it free of server-only imports.
 */

/** Off unless DAK_BULK_UPLOAD=true (server) / NEXT_PUBLIC_DAK_BULK_UPLOAD=true (menu). */
export const dakBulkUploadEnabled = () => process.env.DAK_BULK_UPLOAD === "true";

export const BULK_MAX_ROWS = 200;
export const BULK_MAX_FILE_BYTES = 2 * 1024 * 1024;
export const INVITE_VALID_DAYS = 14;
/** Personal data of drafts that were never submitted is deleted after this. */
export const DRAFT_RETENTION_DAYS = 60;

/** Shown next to the checkbox and stored with every upload. Change the version when the text changes. */
export const BULK_CONSENT_VERSION = "2026-11-27";
export const BULK_CONSENT_TEXT =
  "I confirm that every person in this file has asked us to start a DAK health insurance application for them " +
  "and has agreed that we share their details with InsurBe for this purpose. I am allowed to share this data, " +
  "and it is accurate to the best of my knowledge.";

export type BulkColumnType = "text" | "email" | "date" | "phone" | "category";

export type BulkColumn = {
  /** Header in the template and the key stored in the draft */
  key: string;
  label: string;
  required?: boolean;
  type: BulkColumnType;
  example: string;
};

/** DAK applicant categories (same values as the DAK portal). */
export const BULK_CATEGORIES = ["Student", "Employee", "Intern/Trainee", "Voluntary Member", "Family Insurance"] as const;

/**
 * The only columns that are read. Anything else in the file is ignored.
 * Minimum: first name, last name, email. The rest is optional prefill that the
 * customer checks and corrects.
 */
export const BULK_COLUMNS: BulkColumn[] = [
  { key: "first_name", label: "First name", required: true, type: "text", example: "Anna" },
  { key: "last_name", label: "Last name", required: true, type: "text", example: "Müller" },
  { key: "email", label: "Email", required: true, type: "email", example: "anna.mueller@example.com" },
  { key: "partner_reference", label: "Your reference", type: "text", example: "STU-2026-014" },
  { key: "date_of_birth", label: "Date of birth (YYYY-MM-DD)", type: "date", example: "2003-04-17" },
  { key: "phone", label: "Phone", type: "phone", example: "+49 151 23456789" },
  { key: "preferred_language", label: "Preferred language", type: "text", example: "English" },
  { key: "country", label: "Country", type: "text", example: "Germany" },
  { key: "street", label: "Street", type: "text", example: "Hauptstraße" },
  { key: "house_number", label: "House number", type: "text", example: "12a" },
  { key: "postal_code", label: "Postal code", type: "text", example: "10115" },
  { key: "city", label: "City", type: "text", example: "Berlin" },
  { key: "applicant_category", label: "Category", type: "category", example: "Student" },
  { key: "insurance_start_date", label: "Insurance start (YYYY-MM-DD)", type: "date", example: "2026-10-01" },
  { key: "institution", label: "University / school", type: "text", example: "TU Berlin" },
  { key: "study_start_date", label: "Study start (YYYY-MM-DD)", type: "date", example: "2026-10-01" },
  { key: "employer", label: "Employer", type: "text", example: "" },
  { key: "employment_start_date", label: "Employment start (YYYY-MM-DD)", type: "date", example: "" },
  { key: "arrival_date", label: "Arrival in Germany (YYYY-MM-DD)", type: "date", example: "2026-09-20" },
];

export const BULK_COLUMN_KEYS = BULK_COLUMNS.map((column) => column.key);

/** Progress of a draft, as partners and admins see it. */
export const DRAFT_STATUS_LABELS: Record<string, string> = {
  imported: "Imported",
  sending: "Sending invitation",
  invitation_sent: "Invitation sent",
  email_failed: "Email failed",
  started: "Customer started",
  documents_pending: "Documents pending",
  ready: "Ready to submit",
  submitting: "Submitting",
  submitted: "Submitted to DAK",
  expired: "Invitation expired",
  deleted: "Data deleted",
};
