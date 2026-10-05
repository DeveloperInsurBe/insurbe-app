import type { TkFormData } from "./types";

/**
 * TK validation message codes (api-docs-3-0-1) -> form field + English text.
 *
 * TK's own message text is German (and deprecated), so we translate the codes
 * a user can fix. Unknown codes fall back to TK's text plus the code.
 */

type Mapping = { field: keyof TkFormData | "photo" | "general"; message: string };

const CODE_MAP: Record<string, Mapping> = {
  "10010": { field: "lastInsuranceCountry", message: "Country of last insurance is required" },
  "10012": { field: "lastInsuranceCountry", message: "Country of last insurance is invalid" },
  "10020": { field: "previousInsurerName", message: "Previous insurer name is required" },
  "10022": { field: "previousInsurerName", message: "Previous insurer name may be at most 45 characters" },
  "10023": { field: "previousInsurerName", message: "Previous insurer name contains invalid characters" },
  "10030": { field: "previousInsuranceType", message: "Previous insurance type is required" },
  "10031": { field: "previousInsuranceType", message: "Previous insurance type must be public or private" },
  "10040": { field: "selfInsured", message: "Please tell us whether you were insured in your own name" },
  "10050": { field: "compulsorilyInsured", message: "Please tell us whether you were compulsorily insured" },
  "20010": { field: "university", message: "University is required" },
  "20011": { field: "university", message: "University may be at most 45 characters" },
  "20012": { field: "university", message: "University name contains invalid characters" },
  "20040": { field: "studyStart", message: "Study start date is required" },
  "20042": { field: "studyStart", message: "Study start must be within the last 20 years or next 18 months" },
  "20043": { field: "insuranceStart", message: "Insurance start must be on or after your study start" },
  "20081": { field: "studyHoursPerWeek", message: "Study hours must be between 0 and 168" },
  "20091": { field: "workHoursPerWeek", message: "Working hours must be between 0 and 168" },
  "20121": { field: "monthlyGrossSalary", message: "Monthly salary must be between 0 and 99,999.99" },
  "20140": { field: "pensionType", message: "Pension type is required" },
  "20150": { field: "pensionName", message: "Pension name is required" },
  "20151": { field: "pensionName", message: "Pension name may be at most 50 characters" },
  "20152": { field: "pensionName", message: "Pension name contains invalid characters" },
  "21011": { field: "trainingStart", message: "Training start must be within the last 42 months or next 18 months" },
  "21021": { field: "employerName", message: "Employer name may be at most 45 characters" },
  "21022": { field: "employerName", message: "Employer name contains invalid characters" },
  "30020": { field: "email", message: "Email address is invalid" },
  "30021": { field: "email", message: "Email address is too long" },
  "30030": { field: "phone", message: "Phone number format is invalid, e.g. +49 151 12345678" },
  "30031": { field: "phone", message: "Phone number may be at most 20 characters" },
  "30041": { field: "dateOfBirth", message: "Date of birth must be in the past" },
  "30043": { field: "dateOfBirth", message: "Please check the date of birth" },
  "30045": { field: "dateOfBirth", message: "Seasonal workers from abroad must be under 55 at insurance start" },
  "30050": { field: "insuranceNumber", message: "Health insurance number is invalid" },
  "30060": { field: "birthName", message: "Birth name is required" },
  "30061": { field: "birthName", message: "Birth name may be at most 45 characters" },
  "30062": { field: "birthName", message: "Birth name contains invalid characters" },
  "30070": { field: "placeOfBirth", message: "Place of birth is required" },
  "30071": { field: "placeOfBirth", message: "Place of birth may be at most 24 characters" },
  "30072": { field: "placeOfBirth", message: "Place of birth contains invalid characters" },
  "30073": { field: "placeOfBirth", message: "Place of birth must start with a letter" },
  "30076": { field: "countryOfBirth", message: "Country of birth is required" },
  "30077": { field: "countryOfBirth", message: "Country of birth is invalid" },
  "30081": { field: "nationality", message: "Nationality is invalid" },
  "30123": { field: "insuranceStart", message: "Insurance start must be within the last 12 months or next 18 months" },
  "30124": { field: "insuranceStart", message: "Insurance start must be on or after your study / work / training start" },
  "50001": { field: "salaryClass", message: "Salary class is invalid" },
  "50021": { field: "legalNotice", message: "Please confirm the legal notice" },
  "50030": { field: "employerName", message: "Employer name is required" },
  "50031": { field: "employerName", message: "Employer name may be at most 45 characters" },
  "50032": { field: "employerName", message: "Employer name contains invalid characters" },
  "50040": { field: "employerStreet", message: "Employer address is required" },
  "50062": { field: "employmentStart", message: "Employment start date is out of range" },
  "90011": { field: "firstName", message: "First name must be 2–27 characters" },
  "90012": { field: "firstName", message: "First name contains invalid characters" },
  "90021": { field: "lastName", message: "Last name must be 2–27 characters" },
  "90022": { field: "lastName", message: "Last name contains invalid characters" },
  "90030": { field: "title", message: "Title must be 2–15 characters" },
  "90031": { field: "title", message: "Title contains invalid characters" },
  "91001": { field: "street", message: "Street must be 2–23 characters" },
  "91002": { field: "street", message: "Street contains invalid characters" },
  "91011": { field: "postalCode", message: "Postal code must be 2–10 characters" },
  "91012": { field: "postalCode", message: "Postal code contains invalid characters" },
  "91013": { field: "postalCode", message: "German postal codes have 5 digits" },
  "91021": { field: "city", message: "City must be 2–35 characters" },
  "91022": { field: "city", message: "City contains invalid characters" },
  "91040": { field: "houseNumber", message: "House number may be at most 8 characters" },
  "91041": { field: "houseNumber", message: "House number contains invalid characters" },
  "91042": { field: "houseNumber", message: "Use up to 4 digits plus a 4 character suffix" },
  "91051": { field: "addressExtra", message: "Address supplement contains invalid characters" },
  "92000": { field: "iban", message: "IBAN is invalid" },
  "92010": { field: "bic", message: "BIC is required for non-German IBANs" },
  "92011": { field: "bic", message: "BIC is invalid" },
  "92012": { field: "bic", message: "BIC country does not match the IBAN" },
  "99064": { field: "general", message: "One of the documents is larger than 10 MB" },
  "99065": { field: "general", message: "Too many documents attached (max. 10)" },
  "99066": { field: "photo", message: "The photo must be at least 300 × 400 pixels" },
};

export type MappedTkErrors = {
  fieldErrors: Partial<Record<keyof TkFormData | "photo", string>>;
  generalErrors: string[];
};

export const mapTkMessages = (messages: { code: string; message: string }[]): MappedTkErrors => {
  const fieldErrors: MappedTkErrors["fieldErrors"] = {};
  const generalErrors: string[] = [];

  for (const { code, message } of messages) {
    const mapping = CODE_MAP[code];

    if (mapping && mapping.field !== "general") {
      fieldErrors[mapping.field] ??= mapping.message;
    } else {
      generalErrors.push(mapping ? mapping.message : `${message || "TK rejected the application"} (TK code ${code})`);
    }
  }

  return { fieldErrors, generalErrors };
};
