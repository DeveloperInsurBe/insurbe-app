// Shared (client + server safe) helpers for partner payout / bank details.

export type PayoutMethod = "iban" | "account_ifsc";

export const CURRENCIES = ["EUR", "USD", "GBP", "INR", "CHF", "JPY", "AUD", "CAD"];

// Fields owned by each payout method. The other method's fields are cleared on save.
export const IBAN_FIELDS = ["iban", "bicSwift"] as const;
export const ACCOUNT_FIELDS = ["accountNumber", "ifscCode"] as const;

export type BankField =
  | "iban"
  | "bicSwift"
  | "accountNumber"
  | "ifscCode"
  | "bankName";

// ─── Country-driven defaults ──────────────────────────────────────────────────

const EURO_COUNTRIES = new Set([
  "AT", "BE", "BG", "HR", "CY", "EE", "FI", "FR", "DE", "GR",
  "IE", "IT", "LV", "LT", "LU", "MT", "NL", "PT", "SK", "SI", "ES",
]);

const CURRENCY_BY_COUNTRY: Record<string, string> = {
  IN: "INR",
  US: "USD",
  GB: "GBP",
  CH: "CHF",
  JP: "JPY",
  AU: "AUD",
  CA: "CAD",
};

export function suggestCurrency(countryCode: string): string | null {
  const code = countryCode.toUpperCase();
  if (EURO_COUNTRIES.has(code)) return "EUR";
  return CURRENCY_BY_COUNTRY[code] ?? null;
}

/**
 * The payout format is decided by the recipient country alone:
 * India -> Account Number + IFSC, everywhere else -> IBAN + BIC/SWIFT.
 */
export function payoutMethodForCountry(countryName: unknown): PayoutMethod {
  return String(countryName ?? "").trim().toLowerCase() === "india"
    ? "account_ifsc"
    : "iban";
}

// ─── Normalisation ────────────────────────────────────────────────────────────

export function normalizeIban(value: string): string {
  return value.replace(/\s+/g, "").toUpperCase();
}

export function normalizeCode(value: string): string {
  return value.replace(/\s+/g, "").toUpperCase();
}

export function normalizeAccountNumber(value: string): string {
  return value.replace(/[\s-]+/g, "");
}

// ─── Validation ───────────────────────────────────────────────────────────────

// Official IBAN lengths by country (ISO 3166 alpha-2).
const IBAN_LENGTHS: Record<string, number> = {
  AD: 24, AE: 23, AL: 28, AT: 20, AZ: 28, BA: 20, BE: 16, BG: 22, BH: 22,
  BR: 29, BY: 28, CH: 21, CR: 22, CY: 28, CZ: 24, DE: 22, DK: 18, DO: 28,
  EE: 20, EG: 29, ES: 24, FI: 18, FO: 18, FR: 27, GB: 22, GE: 22, GI: 23,
  GL: 18, GR: 27, GT: 28, HR: 21, HU: 28, IE: 22, IL: 23, IQ: 23, IS: 26,
  IT: 27, JO: 30, KW: 30, KZ: 20, LB: 28, LC: 32, LI: 21, LT: 20, LU: 20,
  LV: 21, LY: 25, MC: 27, MD: 24, ME: 22, MK: 19, MR: 27, MT: 31, MU: 30,
  NL: 18, NO: 15, PK: 24, PL: 28, PS: 29, PT: 25, QA: 29, RO: 24, RS: 22,
  SA: 24, SC: 31, SE: 24, SI: 19, SK: 24, SM: 27, ST: 25, SV: 28, TL: 23,
  TN: 24, TR: 26, UA: 29, VA: 22, VG: 24, XK: 20,
};

function ibanChecksumOk(iban: string): boolean {
  const rearranged = iban.slice(4) + iban.slice(0, 4);
  let remainder = 0;
  for (const ch of rearranged) {
    const digits = /[A-Z]/.test(ch) ? String(ch.charCodeAt(0) - 55) : ch;
    for (const d of digits) {
      remainder = (remainder * 10 + Number(d)) % 97;
    }
  }
  return remainder === 1;
}

const BIC_RE = /^[A-Z]{4}[A-Z]{2}[A-Z0-9]{2}([A-Z0-9]{3})?$/;
const IFSC_RE = /^[A-Z]{4}0[A-Z0-9]{6}$/;
const INDIAN_ACCOUNT_RE = /^[0-9]{9,18}$/;

export function validateIban(raw: string): string {
  const iban = normalizeIban(raw);
  if (!iban) return "";
  if (!/^[A-Z]{2}[0-9]{2}[A-Z0-9]+$/.test(iban)) return "Please enter a valid IBAN.";
  const expected = IBAN_LENGTHS[iban.slice(0, 2)];
  if (expected && iban.length !== expected) {
    return `An IBAN for ${iban.slice(0, 2)} must be ${expected} characters long.`;
  }
  if (!expected && (iban.length < 15 || iban.length > 34)) {
    return "Please enter a valid IBAN.";
  }
  if (!ibanChecksumOk(iban)) return "This IBAN is not valid (checksum failed).";
  return "";
}

export function validateBic(raw: string): string {
  const bic = normalizeCode(raw);
  if (!bic) return "";
  return BIC_RE.test(bic) ? "" : "Please enter a valid BIC/SWIFT code (8 or 11 characters).";
}

export function validateIfsc(raw: string): string {
  const ifsc = normalizeCode(raw);
  if (!ifsc) return "";
  return IFSC_RE.test(ifsc)
    ? ""
    : "Please enter a valid IFSC code (e.g. HDFC0001234).";
}

export function validateAccountNumber(raw: string): string {
  const account = normalizeAccountNumber(raw);
  if (!account) return "";
  return INDIAN_ACCOUNT_RE.test(account)
    ? ""
    : "Account number should be 9–18 digits.";
}

export function validateBankField(field: BankField, value: string): string {
  switch (field) {
    case "iban":
      return validateIban(value);
    case "bicSwift":
      return validateBic(value);
    case "ifscCode":
      return validateIfsc(value);
    case "accountNumber":
      return validateAccountNumber(value);
    default:
      return "";
  }
}

type BankInput = Partial<Record<BankField, unknown>>;

/** The bank fields that apply to a payout method. */
export function fieldsForMethod(method: PayoutMethod): BankField[] {
  return method === "account_ifsc"
    ? [...ACCOUNT_FIELDS]
    : [...IBAN_FIELDS];
}

/** Validates only the fields that apply to the chosen method. */
export function validateBankDetails(
  method: PayoutMethod,
  input: BankInput,
): Partial<Record<BankField, string>> {
  const errors: Partial<Record<BankField, string>> = {};
  for (const field of fieldsForMethod(method)) {
    const err = validateBankField(field, String(input[field] ?? ""));
    if (err) errors[field] = err;
  }
  return errors;
}

/**
 * Returns the normalised bank fields to persist. Fields that belong to the
 * other payout method are cleared so stale values never linger.
 */
export function normalizeBankDetails(
  method: PayoutMethod,
  input: BankInput,
): Record<BankField, string> {
  const str = (v: unknown) => (typeof v === "string" ? v : "");

  if (method === "account_ifsc") {
    return {
      iban: "",
      bicSwift: "",
      accountNumber: normalizeAccountNumber(str(input.accountNumber)),
      ifscCode: normalizeCode(str(input.ifscCode)),
      bankName: str(input.bankName).trim(),
    };
  }

  return {
    iban: normalizeIban(str(input.iban)),
    bicSwift: normalizeCode(str(input.bicSwift)),
    accountNumber: "",
    ifscCode: "",
    bankName: str(input.bankName).trim(),
  };
}
