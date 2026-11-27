/**
 * The DAK draft form: the same fields, options and rules as the public DAK
 * form (/insuranceSignupFlow), so a draft submits exactly the same payload
 * ({ personal, selectPlan }). Shared by the browser and the server.
 */

export const REASONS = ["Student", "Employee", "Trainee"] as const;
export const GENDERS = ["Male", "Female", "Other"] as const;
export const MARITAL_STATUSES = ["Single", "Married", "Divorced", "Widowed"] as const;
export const INSURED_BEFORE = ["Abroad", "Germany"] as const;
export const PREVIOUS_INSURANCE_TYPES = ["Travel Insurance", "Public Insurance", "Private Insurance"] as const;
export const YES_NO = ["Yes", "No"] as const;
export const GERMAN_STATES = [
  "Bavaria", "Berlin", "Brandenburg", "Bremen", "Hamburg", "Hesse", "Lower Saxony", "Mecklenburg-Vorpommern",
  "North Rhine-Westphalia", "Rhineland-Palatinate", "Saarland", "Saxony", "Saxony-Anhalt", "Schleswig-Holstein", "Thuringia",
] as const;

export type DraftPersonal = {
  gender: string;
  firstName: string;
  lastName: string;
  nationality: string;
  countryOfBirth: string;
  placeOfBirth: string;
  birthState: string;
  passportNumber: string;
  countryCode: string;
  phoneNumber: string;
  email: string;
  country: string;
  city: string;
  postalCode: string;
  streetNo: string;
  additionalInfo: string;
  maritalStatus: string;
  includeFamilyMembers: string;
  /** Requested insurance start (from the partner upload; optional) */
  startDate: string;
};

export type DraftPlan = {
  reason: string;
  dob: string;
  institutionName: string;
  insuredBefore: string;
  previousInsuranceType: string;
  previousProviderName: string;
};

export type DraftForm = { personal: DraftPersonal; selectPlan: DraftPlan };

export const DOCUMENT_KINDS = [
  { key: "passport", label: "Passport" },
  { key: "contract", label: "Admission letter / employment contract" },
  { key: "photo", label: "Portrait photo" },
] as const;
export type DocumentKind = (typeof DOCUMENT_KINDS)[number]["key"];
export const isDocumentKind = (value: unknown): value is DocumentKind =>
  DOCUMENT_KINDS.some((kind) => kind.key === value);

export const DOCUMENT_MAX_BYTES = 10 * 1024 * 1024;
export const DOCUMENT_TYPES = ["application/pdf", "image/jpeg", "image/png"] as const;

export type DraftDocument = { storagePath: string; name: string; size: number; mimeType: string; uploadedAt: string };

/** Declarations the customer gives personally on submit. Change the version when a text changes. */
export const DECLARATIONS_VERSION = "2026-11-27";
export const DECLARATIONS = [
  { key: "accuracy", text: "I confirm that all information in this application is complete and correct." },
  {
    key: "privacy",
    text: "I have read the InsurBe privacy policy and agree that InsurBe processes my data to prepare and manage this DAK application.",
  },
  {
    key: "transmission",
    text: "I authorise InsurBe to send this application and my documents to DAK-Gesundheit and to receive DAK's answers for me.",
  },
] as const;
export type DeclarationKey = (typeof DECLARATIONS)[number]["key"];

const text = (value: unknown) => (typeof value === "string" ? value.trim() : "");

export function emptyDraftForm(email: string): DraftForm {
  return {
    personal: {
      gender: "", firstName: "", lastName: "", nationality: "", countryOfBirth: "", placeOfBirth: "", birthState: "",
      passportNumber: "", countryCode: "+49", phoneNumber: "", email, country: "Germany", city: "", postalCode: "",
      streetNo: "", additionalInfo: "", maritalStatus: "", includeFamilyMembers: "", startDate: "",
    },
    selectPlan: { reason: "", dob: "", institutionName: "", insuredBefore: "", previousInsuranceType: "", previousProviderName: "" },
  };
}

/** The form as first shown: the partner's upload values mapped onto the DAK fields. */
export function formFromPrefill(prefill: Record<string, unknown>, email: string, names: { firstName: string; lastName: string }): DraftForm {
  const form = emptyDraftForm(email);
  form.personal.firstName = names.firstName;
  form.personal.lastName = names.lastName;

  const phone = text(prefill.phone);
  const phoneMatch = phone.match(/^(\+\d{1,4})\s*(.*)$/);
  if (phoneMatch) {
    form.personal.countryCode = phoneMatch[1];
    form.personal.phoneNumber = phoneMatch[2].replace(/[^\d\s-]/g, "").trim();
  } else if (phone) {
    form.personal.phoneNumber = phone.replace(/[^\d\s-]/g, "").trim();
  }

  if (text(prefill.country)) form.personal.country = text(prefill.country);
  form.personal.city = text(prefill.city);
  form.personal.postalCode = text(prefill.postal_code);
  form.personal.streetNo = [text(prefill.street), text(prefill.house_number)].filter(Boolean).join(" ");
  form.personal.startDate = text(prefill.insurance_start_date);

  form.selectPlan.dob = text(prefill.date_of_birth);
  const category = text(prefill.applicant_category);
  form.selectPlan.reason = category === "Intern/Trainee" ? "Trainee" : (REASONS as readonly string[]).includes(category) ? category : "";
  form.selectPlan.institutionName = text(prefill.institution) || text(prefill.employer);
  return form;
}

/** Keeps only known fields as strings (never trust a saved or posted object). */
export function cleanDraftForm(input: unknown, email: string): DraftForm {
  const base = emptyDraftForm(email);
  const source = (input ?? {}) as { personal?: Record<string, unknown>; selectPlan?: Record<string, unknown> };
  for (const key of Object.keys(base.personal) as (keyof DraftPersonal)[]) {
    if (source.personal && key in source.personal) base.personal[key] = text(source.personal[key]).slice(0, 200);
  }
  for (const key of Object.keys(base.selectPlan) as (keyof DraftPlan)[]) {
    if (source.selectPlan && key in source.selectPlan) base.selectPlan[key] = text(source.selectPlan[key]).slice(0, 200);
  }
  // The email is the invited address and can't be changed here.
  base.personal.email = email;
  return base;
}

const NAME = /^[a-zA-ZàáâäãåąčćęèéêëėįìíîïłńòóôöõøùúûüųūÿýżźñçčšžÀÁÂÄÃÅĄĆČĖĘÈÉÊËÌÍÎÏĮŁŃÒÓÔÖÕØÙÚÛÜŲŪŸÝŻŹÑßÇŒÆČŠŽ∂ð ,.'-]+$/u;

/** Field errors, same rules as the public DAK form. Empty object = complete. */
export function validateDraftForm({ personal, selectPlan }: DraftForm): Record<string, string> {
  const errors: Record<string, string> = {};
  const need = (key: string, value: string, message = "This field is required") => {
    if (!value) errors[key] = message;
    return Boolean(value);
  };
  const oneOf = (key: string, value: string, options: readonly string[]) => {
    if (need(key, value) && !options.includes(value)) errors[key] = "Please choose an option";
  };

  oneOf("selectPlan.reason", selectPlan.reason, REASONS);
  if (need("selectPlan.dob", selectPlan.dob) && (!/^\d{4}-\d{2}-\d{2}$/.test(selectPlan.dob) || selectPlan.dob >= new Date().toISOString().slice(0, 10))) {
    errors["selectPlan.dob"] = "Please enter a valid date of birth";
  }
  need("selectPlan.institutionName", selectPlan.institutionName);
  if (selectPlan.insuredBefore) {
    oneOf("selectPlan.insuredBefore", selectPlan.insuredBefore, INSURED_BEFORE);
    oneOf("selectPlan.previousInsuranceType", selectPlan.previousInsuranceType, PREVIOUS_INSURANCE_TYPES);
    need("selectPlan.previousProviderName", selectPlan.previousProviderName);
  }

  for (const key of ["firstName", "lastName"] as const) {
    const value = personal[key];
    if (need(`personal.${key}`, value)) {
      if (value.length < 2) errors[`personal.${key}`] = "Must be at least 2 characters";
      else if (!NAME.test(value)) errors[`personal.${key}`] = "Only letters allowed";
    }
  }
  oneOf("personal.gender", personal.gender, GENDERS);
  need("personal.nationality", personal.nationality);
  need("personal.countryOfBirth", personal.countryOfBirth);
  need("personal.placeOfBirth", personal.placeOfBirth);
  if (personal.countryOfBirth === "Germany") oneOf("personal.birthState", personal.birthState, GERMAN_STATES);
  if (need("personal.passportNumber", personal.passportNumber, "Passport number is required") && !/^[A-Z0-9]{6,12}$/i.test(personal.passportNumber)) {
    errors["personal.passportNumber"] = "Invalid passport number format";
  }
  if (need("personal.countryCode", personal.countryCode) && !/^\+?\d{1,4}$/.test(personal.countryCode)) {
    errors["personal.countryCode"] = "Invalid country code";
  }
  if (need("personal.phoneNumber", personal.phoneNumber, "Phone number is required") && !/^[\d-]{7,15}$/.test(personal.phoneNumber.replace(/\s/g, ""))) {
    errors["personal.phoneNumber"] = "Invalid phone number (7-15 digits)";
  }
  need("personal.country", personal.country);
  if (need("personal.city", personal.city, "City is required") && personal.city.length < 2) errors["personal.city"] = "City name too short";
  if (need("personal.postalCode", personal.postalCode, "Postal code is required")) {
    if (personal.country === "Germany" && !/^\d{5}$/.test(personal.postalCode)) errors["personal.postalCode"] = "German postal code must be 5 digits";
    else if (!/^[A-Z0-9\s-]{3,10}$/i.test(personal.postalCode)) errors["personal.postalCode"] = "Invalid postal code format";
  }
  need("personal.streetNo", personal.streetNo, "Street address is required");
  oneOf("personal.maritalStatus", personal.maritalStatus, MARITAL_STATUSES);
  oneOf("personal.includeFamilyMembers", personal.includeFamilyMembers, YES_NO);
  return errors;
}

/** The exact payload the public DAK form submits. */
export function toSubmissionPayload({ personal, selectPlan }: DraftForm) {
  return {
    personal: {
      ...personal,
      confirmEmail: personal.email,
      confirmPassportNumber: personal.passportNumber,
    },
    selectPlan: { ...selectPlan, provider: "DAK" },
  };
}
