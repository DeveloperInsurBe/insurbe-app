import type { TkFormData } from "./types";

/**
 * TK NEW MEMBERSHIP API (v3) - VALIDATION
 *
 * Mirrors the TK validation rules (api-docs-3-0-1 message codes, verified
 * against the staging endpoint) so users fix problems in the form instead
 * of getting a rejected request from TK. Runs on the client per step and
 * again on the server before anything is sent to TK.
 */

export type TkStepId = "plan" | "personal" | "insurance" | "details" | "review";

export const TK_STEPS: { id: TkStepId | "documents"; label: string }[] = [
  { id: "plan", label: "Plan" },
  { id: "personal", label: "Personal" },
  { id: "insurance", label: "Insurance history" },
  { id: "details", label: "Study / work" },
  { id: "documents", label: "Documents" },
  { id: "review", label: "Review" },
];

export type TkErrors = Partial<Record<keyof TkFormData | string, string>>;

/**
 * Countries with a social security agreement with Germany (EU/EEA,
 * Switzerland, UK and bilateral agreements). For these TK needs the
 * previous insurer name and type even when the person lived abroad.
 */
export const TK_AGREEMENT_COUNTRIES = new Set([
  "AT", "BE", "BG", "HR", "CY", "CZ", "DK", "EE", "FI", "FR", "GR", "HU",
  "IE", "IT", "LV", "LT", "LU", "MT", "NL", "PL", "PT", "RO", "SK", "SI",
  "ES", "SE", "IS", "LI", "NO", "CH", "GB", "BA", "ME", "MA", "MK", "RS",
  "TN", "TR", "XK",
]);

export const TK_FILE_RULES = {
  maxFileBytes: 10 * 1024 * 1024,
  maxExtraDocuments: 5,
  // Hosting request limit is ~4.5 MB (Vercel); keep room for the form data.
  maxTotalBytes: 4 * 1024 * 1024,
  photoMinWidth: 300,
  photoMinHeight: 400,
  photoTypes: ["image/jpeg", "image/png", "image/tiff"],
  documentTypes: [
    "application/pdf",
    "application/msword",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    "image/jpeg",
    "image/png",
    "image/bmp",
    "image/tiff",
    "text/plain",
  ],
};

/* -------------------------------------------------------------------------- */
/*                                  HELPERS                                   */
/* -------------------------------------------------------------------------- */

const NAME_RE = /^[A-Za-zÀ-ÖØ-öø-ÿĀ-žẞ' .-]+$/;
const TEXT_RE = /^[A-Za-z0-9À-ÖØ-öø-ÿĀ-žẞ' .,&()\/+-]+$/;
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const PHONE_RE = /^\+?[0-9 ()\/-]{5,20}$/;
// German postal codes: 5 digits, 01001-99998 (never start with 00).
const PLZ_DE_RE = /^(0[1-9]\d{3}|[1-9]\d{4})$/;
const HOUSE_NO_RE = /^\d{1,4}\s?[A-Za-z0-9\/-]{0,4}$/;
const ISO_RE = /^[A-Z]{2}$/;

const isBlank = (value: string) => !value || !value.trim();

const isYesNo = (value: unknown) => value === true || value === false;

/** Parses yyyy-mm-dd as a local calendar date (no timezone shift). */
export const parseIsoDate = (value: string): Date | null => {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value || "");
  if (!match) return null;
  const date = new Date(Number(match[1]), Number(match[2]) - 1, Number(match[3]));
  return Number.isNaN(date.getTime()) ? null : date;
};

/** yyyy-mm-dd -> DD.MM.YYYY (TK date format). */
export const toTkDate = (value: string) => {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value || "");
  return match ? `${match[3]}.${match[2]}.${match[1]}` : "";
};

const addMonths = (base: Date, months: number) => {
  const date = new Date(base);
  date.setMonth(date.getMonth() + months);
  return date;
};

const today = () => {
  const now = new Date();
  return new Date(now.getFullYear(), now.getMonth(), now.getDate());
};

/** Date must lie between `monthsBack` in the past and `monthsAhead` in the future. */
const inWindow = (value: string, monthsBack: number, monthsAhead: number) => {
  const date = parseIsoDate(value);
  if (!date) return false;
  return date >= addMonths(today(), -monthsBack) && date <= addMonths(today(), monthsAhead);
};

const isNumberInRange = (value: string, min: number, max: number) => {
  if (isBlank(value)) return false;
  const number = Number(String(value).replace(",", "."));
  return Number.isFinite(number) && number >= min && number <= max;
};

/** ISO 13616 mod-97 check. */
export const isValidIban = (raw: string) => {
  const iban = raw.replace(/\s+/g, "").toUpperCase();
  if (!/^[A-Z]{2}\d{2}[A-Z0-9]{11,30}$/.test(iban)) return false;
  const rearranged = iban.slice(4) + iban.slice(0, 4);
  let remainder = 0;
  for (const char of rearranged) {
    const digits = /[A-Z]/.test(char) ? String(char.charCodeAt(0) - 55) : char;
    for (const digit of digits) {
      remainder = (remainder * 10 + Number(digit)) % 97;
    }
  }
  return remainder === 1;
};

const BIC_RE = /^[A-Z]{4}[A-Z]{2}[A-Z0-9]{2}([A-Z0-9]{3})?$/;

export const isStudent = (data: TkFormData) => data.customerGroup === "STUDIERENDE";

export const isEmployment = (data: TkFormData) =>
  data.customerGroup === "BERUFSTAETIGE" || data.customerGroup === "SAISONBESCHAEFTIGTE";

export const isTrainee = (data: TkFormData) => data.customerGroup === "AUSZUBILDENDE";

/** True when TK needs previous insurer name + type (codes 10020 / 10030). */
export const needsPreviousInsurer = (data: TkFormData) =>
  !data.neverInsured &&
  (data.livedAbroad === false ||
    (data.livedAbroad === true && TK_AGREEMENT_COUNTRIES.has(data.lastInsuranceCountry)));

/**
 * Never-insured applicants from Germany or a social security agreement
 * country cannot be submitted via the API: TK insists on a previous insurer
 * (10020 / 10030), and we must not invent one. The form blocks these and
 * points the applicant to InsurBe support.
 */
export const requiresManualProcessing = (data: TkFormData) =>
  data.neverInsured &&
  (data.lastInsuranceCountry === "DE" || TK_AGREEMENT_COUNTRIES.has(data.lastInsuranceCountry));

/** Start of study / work / training, which the insurance start may not precede (30124). */
export const activityStart = (data: TkFormData) => {
  if (isStudent(data)) return data.studyStart;
  if (isTrainee(data)) return data.trainingStart;
  if (isEmployment(data)) return data.employmentStart;
  return "";
};

/* -------------------------------------------------------------------------- */
/*                               FIELD CHECKS                                 */
/* -------------------------------------------------------------------------- */

const checkName = (errors: TkErrors, key: string, value: string, label: string, min = 2, max = 27) => {
  const trimmed = value.trim();
  if (!trimmed) errors[key] = `${label} is required`;
  else if (trimmed.length < min || trimmed.length > max) errors[key] = `${label} must be ${min}–${max} characters`;
  else if (!NAME_RE.test(trimmed)) errors[key] = `${label} contains characters TK does not accept`;
};

const checkText = (errors: TkErrors, key: string, value: string, label: string, max: number, required = true) => {
  const trimmed = value.trim();
  if (!trimmed) {
    if (required) errors[key] = `${label} is required`;
    return;
  }
  if (trimmed.length > max) errors[key] = `${label} may be at most ${max} characters`;
  else if (!TEXT_RE.test(trimmed)) errors[key] = `${label} contains characters TK does not accept`;
};

const checkYesNo = (errors: TkErrors, key: string, value: unknown) => {
  if (!isYesNo(value)) errors[key] = "Please choose Yes or No";
};

const checkGermanAddress = (
  errors: TkErrors,
  prefix: "" | "employer" | "holder",
  street: string,
  houseNumber: string,
  postalCode: string,
  city: string,
  germanOnly = true,
) => {
  const key = (name: string) => (prefix ? `${prefix}${name[0].toUpperCase()}${name.slice(1)}` : name);

  const s = street.trim();
  if (!s) errors[key("street")] = "Street is required";
  else if (s.length < 2 || s.length > 23) errors[key("street")] = "Street must be 2–23 characters";
  else if (!TEXT_RE.test(s)) errors[key("street")] = "Street contains characters TK does not accept";

  const h = houseNumber.trim();
  if (!h) errors[key("houseNumber")] = "House number is required";
  else if (h.length > 8 || !HOUSE_NO_RE.test(h)) errors[key("houseNumber")] = "Use up to 4 digits plus an optional suffix, e.g. 12a";

  const p = postalCode.trim();
  if (!p) errors[key("postalCode")] = "Postal code is required";
  else if (germanOnly && !PLZ_DE_RE.test(p)) errors[key("postalCode")] = "Please enter a valid German postal code (5 digits)";
  else if (!germanOnly && (p.length < 2 || p.length > 10)) errors[key("postalCode")] = "Postal code must be 2–10 characters";
  else if (!germanOnly && !/^[A-Za-z0-9 -]+$/.test(p)) errors[key("postalCode")] = "Postal code may only contain letters, digits, spaces and hyphens";

  const c = city.trim();
  if (!c) errors[key("city")] = "City is required";
  else if (c.length < 2 || c.length > 35) errors[key("city")] = "City must be 2–35 characters";
  else if (!TEXT_RE.test(c)) errors[key("city")] = "City contains characters TK does not accept";
};

/* -------------------------------------------------------------------------- */
/*                                   STEPS                                    */
/* -------------------------------------------------------------------------- */

const validatePlan = (data: TkFormData, errors: TkErrors) => {
  if (!data.customerGroup) errors.customerGroup = "Please choose what applies to you";

  if (!data.insuranceStart) errors.insuranceStart = "Insurance start date is required";
  else if (!inWindow(data.insuranceStart, 12, 18))
    errors.insuranceStart = "Insurance start must be within the last 12 months or the next 18 months";

  if (data.language !== "EN" && data.language !== "DE") errors.language = "Please choose a language";
};

const validatePersonal = (data: TkFormData, errors: TkErrors) => {
  if (!data.gender) errors.gender = "Please choose a gender";

  if (data.title.trim()) checkName(errors, "title", data.title, "Title", 2, 15);
  checkName(errors, "firstName", data.firstName, "First name");
  checkName(errors, "lastName", data.lastName, "Last name");
  checkName(errors, "birthName", data.birthName, "Birth name", 2, 45);

  const dob = parseIsoDate(data.dateOfBirth);
  if (!dob) errors.dateOfBirth = "Date of birth is required";
  else if (dob >= today()) errors.dateOfBirth = "Date of birth must be in the past";
  else if (dob < addMonths(today(), -120 * 12)) errors.dateOfBirth = "Please check the date of birth";

  const pob = data.placeOfBirth.trim();
  if (!pob) errors.placeOfBirth = "Place of birth is required";
  else if (pob.length > 24) errors.placeOfBirth = "Place of birth may be at most 24 characters";
  else if (!/^[A-Za-zÀ-ÖØ-öø-ÿĀ-žẞ]/.test(pob)) errors.placeOfBirth = "Place of birth must start with a letter";
  else if (!TEXT_RE.test(pob)) errors.placeOfBirth = "Place of birth contains characters TK does not accept";

  if (!ISO_RE.test(data.countryOfBirth)) errors.countryOfBirth = "Country of birth is required";
  if (!ISO_RE.test(data.nationality)) errors.nationality = "Nationality is required";

  const email = data.email.trim();
  if (!email) errors.email = "Email is required";
  else if (email.length > 65) errors.email = "Email may be at most 65 characters";
  else if (!EMAIL_RE.test(email)) errors.email = "Please enter a valid email address";

  const phone = data.phone.trim();
  if (!phone) errors.phone = "Phone number is required";
  else if (!PHONE_RE.test(phone)) errors.phone = "Use digits only, e.g. +49 151 12345678 (max. 20 characters)";

  // TK accepts a home address abroad for new applications (verified on staging);
  // only address *changes* must be German.
  if (!ISO_RE.test(data.country)) errors.country = "Please choose a country";
  checkGermanAddress(errors, "", data.street, data.houseNumber, data.postalCode, data.city, data.country === "DE");
  if (data.addressExtra.trim()) checkText(errors, "addressExtra", data.addressExtra, "Address supplement", 35, false);

  checkYesNo(errors, "hasChildren", data.hasChildren);
  checkYesNo(errors, "receivesCivilServicePension", data.receivesCivilServicePension);
  checkYesNo(errors, "coInsureFamily", data.coInsureFamily);

  if (!isStudent(data)) {
    checkYesNo(errors, "receivesPension", data.receivesPension);
    checkYesNo(errors, "exemptFromKvPv", data.exemptFromKvPv);
  }
};

const validateInsurance = (data: TkFormData, errors: TkErrors) => {
  if (data.neverInsured) {
    if (!ISO_RE.test(data.lastInsuranceCountry))
      errors.lastInsuranceCountry = "Please choose the country you lived in";
    else if (requiresManualProcessing(data))
      errors.lastInsuranceCountry = "We can't submit this case online yet. Please contact InsurBe support.";
    return;
  }

  checkYesNo(errors, "livedAbroad", data.livedAbroad);

  if (data.livedAbroad === true && !ISO_RE.test(data.lastInsuranceCountry))
    errors.lastInsuranceCountry = "Please choose the country of your last insurance";

  if (needsPreviousInsurer(data)) {
    checkText(errors, "previousInsurerName", data.previousInsurerName, "Previous insurer", 45);
    if (data.previousInsuranceType !== "gesetzlich" && data.previousInsuranceType !== "privat")
      errors.previousInsuranceType = "Please choose public or private";
  }

  if (data.livedAbroad === false && data.previousInsuranceType === "gesetzlich") {
    checkYesNo(errors, "selfInsured", data.selfInsured);
    if (data.selfInsured === true) checkYesNo(errors, "compulsorilyInsured", data.compulsorilyInsured);
  }

  if (data.livedAbroad === false && data.insuranceNumber.trim() && !/^[A-Z]\d{9}$/.test(data.insuranceNumber.trim().toUpperCase()))
    errors.insuranceNumber = "Health insurance numbers look like A123456789";
};

const validateStudent = (data: TkFormData, errors: TkErrors) => {
  checkText(errors, "university", data.university, "University", 45);

  if (!data.studyStart) errors.studyStart = "Study start date is required";
  else if (!inWindow(data.studyStart, 20 * 12, 18))
    errors.studyStart = "Study start must be within the last 20 years or the next 18 months";

  checkYesNo(errors, "exemptFromKv", data.exemptFromKv);
  checkYesNo(errors, "unemploymentBenefits", data.unemploymentBenefits);
  checkYesNo(errors, "benefitsInKind", data.benefitsInKind);
  checkYesNo(errors, "studentEmployed", data.studentEmployed);
  checkYesNo(errors, "studentSelfEmployed", data.studentSelfEmployed);
  checkYesNo(errors, "pension", data.pension);

  const working = data.studentEmployed === true || data.studentSelfEmployed === true;

  if (working) {
    if (!isNumberInRange(data.studyHoursPerWeek, 0, 168)) errors.studyHoursPerWeek = "Enter hours per week (0–168)";
    checkYesNo(errors, "workDuringBreaks", data.workDuringBreaks);
  }

  if (data.studentEmployed === true) {
    if (!isNumberInRange(data.workHoursPerWeek, 0, 168)) errors.workHoursPerWeek = "Enter hours per week (0–168)";
    checkYesNo(errors, "internship", data.internship);
    if (!isNumberInRange(data.monthlyGrossSalary, 0, 99999.99)) errors.monthlyGrossSalary = "Enter the monthly gross salary in EUR";
  }

  if (data.studentSelfEmployed === true) {
    if (!isNumberInRange(data.studentSelfEmployedHours, 0, 168)) errors.studentSelfEmployedHours = "Enter hours per week (0–168)";
    if (!isNumberInRange(data.studentSelfEmployedIncome, 0, 99999.99)) errors.studentSelfEmployedIncome = "Enter the monthly income in EUR";
    checkYesNo(errors, "studentSelfEmployedHasEmployees", data.studentSelfEmployedHasEmployees);
    if (data.studentSelfEmployedHasEmployees === true)
      checkYesNo(errors, "studentSelfEmployedMinijobEmployees", data.studentSelfEmployedMinijobEmployees);
  }

  if (data.pension === true) {
    if (!data.pensionType) errors.pensionType = "Please choose the pension type";
    if (data.pensionType === "SONSTIGE") checkText(errors, "pensionName", data.pensionName, "Pension name", 50);
  }

  if (data.sepaEnabled) validateSepa(data, errors);
};

const validateSepa = (data: TkFormData, errors: TkErrors) => {
  const iban = data.iban.replace(/\s+/g, "").toUpperCase();
  if (!iban) errors.iban = "IBAN is required";
  else if (!isValidIban(iban)) errors.iban = "Please enter a valid IBAN";

  const bic = data.bic.replace(/\s+/g, "").toUpperCase();
  if (bic && !BIC_RE.test(bic)) errors.bic = "Please enter a valid BIC";
  else if (!bic && iban && !iban.startsWith("DE")) errors.bic = "BIC is required for non-German IBANs";
  else if (bic && iban && bic.slice(4, 6) !== iban.slice(0, 2)) errors.bic = "BIC country does not match the IBAN";

  if (!data.accountHolderIsApplicant) {
    if (!data.holderGender) errors.holderGender = "Please choose a gender";
    checkName(errors, "holderFirstName", data.holderFirstName, "First name");
    checkName(errors, "holderLastName", data.holderLastName, "Last name");
    checkGermanAddress(
      errors,
      "holder",
      data.holderStreet,
      data.holderHouseNumber,
      data.holderPostalCode,
      data.holderCity,
      data.holderCountry === "DE",
    );
    if (!ISO_RE.test(data.holderCountry)) errors.holderCountry = "Please choose a country";
  }

  if (!data.sepaConsent) errors.sepaConsent = "Please confirm the direct debit mandate";
};

const validateEmployerAddress = (data: TkFormData, errors: TkErrors, required: boolean) => {
  const anyGiven = [data.employerName, data.employerStreet, data.employerHouseNumber, data.employerPostalCode, data.employerCity].some(
    (value) => !isBlank(value),
  );
  if (!required && !anyGiven) return;

  checkText(errors, "employerName", data.employerName, "Employer", 45);
  checkGermanAddress(errors, "employer", data.employerStreet, data.employerHouseNumber, data.employerPostalCode, data.employerCity);
};

const validateEmployment = (data: TkFormData, errors: TkErrors) => {
  // Mandatory for seasonal workers (50030/50040), optional for employees.
  validateEmployerAddress(data, errors, data.customerGroup === "SAISONBESCHAEFTIGTE");

  if (!data.employmentStart) errors.employmentStart = "Employment start date is required";
  else if (!inWindow(data.employmentStart, 70 * 12, 18))
    errors.employmentStart = "Employment start may not be more than 18 months in the future";

  if (data.salaryClass !== "versicherungspflichtig" && data.salaryClass !== "ueber-jaeg")
    errors.salaryClass = "Please choose your salary class";

  if (!isNumberInRange(data.monthlySalary, 0, 999999.99)) errors.monthlySalary = "Enter your monthly gross salary in EUR";

  checkYesNo(errors, "firstEmployment", data.firstEmployment);
  checkYesNo(errors, "managingDirector", data.managingDirector);
  checkYesNo(errors, "employeeSelfEmployed", data.employeeSelfEmployed);

  if (data.employeeSelfEmployed === true) {
    checkYesNo(errors, "businessFounder", data.businessFounder);
    checkYesNo(errors, "employsMultipleMinijobbers", data.employsMultipleMinijobbers);
    checkYesNo(errors, "employsWorkers", data.employsWorkers);
    if (!isNumberInRange(data.selfEmployedHoursPerWeek, 0, 999.99)) errors.selfEmployedHoursPerWeek = "Enter hours per week";
    if (!isNumberInRange(data.selfEmployedMonthlyIncome, 0, 999999.99)) errors.selfEmployedMonthlyIncome = "Enter monthly income in EUR";
    if (!isNumberInRange(data.employeeHoursPerWeek, 0, 999.99)) errors.employeeHoursPerWeek = "Enter hours per week";
  }
};

const validateTrainee = (data: TkFormData, errors: TkErrors) => {
  validateEmployerAddress(data, errors, false);

  if (!data.trainingStart) errors.trainingStart = "Training start date is required";
  else if (!inWindow(data.trainingStart, 42, 18))
    errors.trainingStart = "Training start must be within the last 42 months or the next 18 months";

  checkYesNo(errors, "socialSecurityCardRequested", data.socialSecurityCardRequested);
};

const validateDetails = (data: TkFormData, errors: TkErrors) => {
  if (isStudent(data)) validateStudent(data, errors);
  else if (isEmployment(data)) validateEmployment(data, errors);
  else if (isTrainee(data)) validateTrainee(data, errors);

  // 20043 / 30124: insurance may not start before study / work / training.
  const start = parseIsoDate(activityStart(data));
  const insurance = parseIsoDate(data.insuranceStart);
  if (start && insurance && insurance < start) {
    const field = isStudent(data) ? "studyStart" : isTrainee(data) ? "trainingStart" : "employmentStart";
    if (!errors[field]) errors[field] = "Your insurance start (step 1) cannot be before this date";
  }
};

const validateReview = (data: TkFormData, errors: TkErrors) => {
  if (!data.brokerMandate) errors.brokerMandate = "TK requires the broker mandate to process your application";
  if (!data.legalNotice) errors.legalNotice = "Please confirm that your details are correct and complete";
  if (!data.dataConsent) errors.dataConsent = "Please accept the data processing consent";
};

const STEP_VALIDATORS: Record<TkStepId, (data: TkFormData, errors: TkErrors) => void> = {
  plan: validatePlan,
  personal: validatePersonal,
  insurance: validateInsurance,
  details: validateDetails,
  review: validateReview,
};

export const validateTkStep = (step: TkStepId, data: TkFormData): TkErrors => {
  const errors: TkErrors = {};
  STEP_VALIDATORS[step](data, errors);
  return errors;
};

export const validateTkApplication = (data: TkFormData): TkErrors => {
  const errors: TkErrors = {};
  for (const validate of Object.values(STEP_VALIDATORS)) validate(data, errors);
  return errors;
};

const PLAN_FIELDS = ["customerGroup", "insuranceStart", "language"];

const PERSONAL_FIELDS = [
  "gender", "title", "firstName", "lastName", "birthName", "dateOfBirth", "placeOfBirth",
  "countryOfBirth", "nationality", "email", "phone", "street", "houseNumber", "addressExtra",
  "postalCode", "city", "country", "hasChildren", "receivesCivilServicePension", "coInsureFamily",
  "receivesPension", "exemptFromKvPv",
];

const INSURANCE_FIELDS = [
  "neverInsured", "livedAbroad", "lastInsuranceCountry", "previousInsurerName", "previousInsuranceType",
  "selfInsured", "compulsorilyInsured", "insuranceNumber",
];

const DOCUMENT_FIELDS = ["photo", "passport", "proof", "extraDocuments"];

const REVIEW_FIELDS = ["brokerMandate", "legalNotice", "dataConsent", "tkWelcomeMail"];

/** Which step a field belongs to, so the form can jump back to it. */
export const stepForField = (field: string): TkStepId | "documents" => {
  if (PLAN_FIELDS.includes(field)) return "plan";
  if (PERSONAL_FIELDS.includes(field)) return "personal";
  if (INSURANCE_FIELDS.includes(field)) return "insurance";
  if (DOCUMENT_FIELDS.includes(field)) return "documents";
  if (REVIEW_FIELDS.includes(field)) return "review";
  return "details";
};
