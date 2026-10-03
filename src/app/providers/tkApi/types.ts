/**
 * TK NEW MEMBERSHIP API (v3) - FORM TYPES
 *
 * Shared by the /tk-application form (client) and the
 * /api/tk-application/submit route (server).
 */

export type TkCustomerGroup =
  | "STUDIERENDE"
  | "BERUFSTAETIGE"
  | "SAISONBESCHAEFTIGTE"
  | "AUSZUBILDENDE";

export type TkGender = "MAENNLICH" | "WEIBLICH" | "DIVERS" | "UNBESTIMMT";

export type TkPensionType =
  | "WAISENRENTE"
  | "HINTERBLIEBENENRENTE"
  | "ERWERBSMINDERUNGSRENTE"
  | "SONSTIGE";

/** Yes/No questions start unanswered (null) so we can force an answer. */
export type YesNo = boolean | null;

export type TkFormData = {
  /* PLAN */
  customerGroup: TkCustomerGroup | "";
  insuranceStart: string; // yyyy-mm-dd
  language: "EN" | "DE";

  /* PERSONAL */
  gender: TkGender | "";
  title: string;
  firstName: string;
  lastName: string;
  birthName: string;
  dateOfBirth: string; // yyyy-mm-dd
  placeOfBirth: string;
  countryOfBirth: string; // ISO-3166-1 alpha-2
  nationality: string; // ISO-3166-1 alpha-2
  email: string;
  phone: string;

  /* ADDRESS (must be in Germany) */
  street: string;
  houseNumber: string;
  addressExtra: string;
  postalCode: string;
  city: string;

  /* PERSONAL CIRCUMSTANCES */
  hasChildren: YesNo; // kinder
  receivesCivilServicePension: YesNo; // versorgungsbezuege
  coInsureFamily: YesNo; // mitversicherungVonAngehoerigen
  receivesPension: YesNo; // rentenbezuege (not students)
  exemptFromKvPv: YesNo; // kvPvBefreit (not students)

  /* PREVIOUS INSURANCE */
  neverInsured: boolean; // no health insurance anywhere so far
  livedAbroad: YesNo; // imAuslandGelebt
  lastInsuranceCountry: string; // ISO (country lived in when neverInsured)
  previousInsurerName: string;
  previousInsuranceType: "gesetzlich" | "privat" | "";
  selfInsured: YesNo; // selbstVersichert
  compulsorilyInsured: YesNo; // pflichtversichert
  insuranceNumber: string; // versichertennummer (optional)

  /* STUDENTS */
  university: string;
  studyStart: string; // yyyy-mm-dd
  exemptFromKv: YesNo; // befreitKv
  unemploymentBenefits: YesNo; // leistungenAgenturFuerArbeit
  benefitsInKind: YesNo; // anspruchSachleistungen
  studentEmployed: YesNo; // beschaeftigt
  studyHoursPerWeek: string;
  workHoursPerWeek: string;
  workDuringBreaks: YesNo;
  internship: YesNo;
  monthlyGrossSalary: string;
  studentSelfEmployed: YesNo;
  studentSelfEmployedHours: string;
  studentSelfEmployedIncome: string;
  studentSelfEmployedHasEmployees: YesNo;
  studentSelfEmployedMinijobEmployees: YesNo;
  pension: YesNo; // rente
  pensionType: TkPensionType | "";
  pensionName: string;

  /* EMPLOYEES / SEASONAL / TRAINEES */
  employerName: string;
  employerStreet: string;
  employerHouseNumber: string;
  employerPostalCode: string;
  employerCity: string;
  employmentStart: string; // yyyy-mm-dd
  salaryClass: "versicherungspflichtig" | "ueber-jaeg" | "";
  monthlySalary: string;
  firstEmployment: YesNo;
  managingDirector: YesNo;
  employeeSelfEmployed: YesNo;
  businessFounder: YesNo;
  employsMultipleMinijobbers: YesNo;
  employsWorkers: YesNo;
  selfEmployedHoursPerWeek: string;
  selfEmployedMonthlyIncome: string;
  employeeHoursPerWeek: string;
  trainingStart: string; // yyyy-mm-dd
  socialSecurityCardRequested: YesNo; // sozAusweisBeantr

  /* SEPA (students only, optional) */
  sepaEnabled: boolean;
  iban: string;
  bic: string;
  accountHolderIsApplicant: boolean;
  holderGender: TkGender | "";
  holderFirstName: string;
  holderLastName: string;
  holderStreet: string;
  holderHouseNumber: string;
  holderPostalCode: string;
  holderCity: string;
  holderCountry: string;
  sepaConsent: boolean;

  /* CONSENTS */
  brokerMandate: boolean;
  legalNotice: boolean; // rechtsbelehrung
  dataConsent: boolean;
  tkWelcomeMail: boolean; // kommunikationMailEn
};

export type TkDocumentKey = "photo" | "passport" | "proof";

export const EMPTY_TK_FORM: TkFormData = {
  customerGroup: "",
  insuranceStart: "",
  language: "EN",
  gender: "",
  title: "",
  firstName: "",
  lastName: "",
  birthName: "",
  dateOfBirth: "",
  placeOfBirth: "",
  countryOfBirth: "",
  nationality: "",
  email: "",
  phone: "",
  street: "",
  houseNumber: "",
  addressExtra: "",
  postalCode: "",
  city: "",
  hasChildren: null,
  receivesCivilServicePension: null,
  coInsureFamily: null,
  receivesPension: null,
  exemptFromKvPv: null,
  neverInsured: false,
  livedAbroad: null,
  lastInsuranceCountry: "",
  previousInsurerName: "",
  previousInsuranceType: "",
  selfInsured: null,
  compulsorilyInsured: null,
  insuranceNumber: "",
  university: "",
  studyStart: "",
  exemptFromKv: null,
  unemploymentBenefits: null,
  benefitsInKind: null,
  studentEmployed: null,
  studyHoursPerWeek: "",
  workHoursPerWeek: "",
  workDuringBreaks: null,
  internship: null,
  monthlyGrossSalary: "",
  studentSelfEmployed: null,
  studentSelfEmployedHours: "",
  studentSelfEmployedIncome: "",
  studentSelfEmployedHasEmployees: null,
  studentSelfEmployedMinijobEmployees: null,
  pension: null,
  pensionType: "",
  pensionName: "",
  employerName: "",
  employerStreet: "",
  employerHouseNumber: "",
  employerPostalCode: "",
  employerCity: "",
  employmentStart: "",
  salaryClass: "",
  monthlySalary: "",
  firstEmployment: null,
  managingDirector: null,
  employeeSelfEmployed: null,
  businessFounder: null,
  employsMultipleMinijobbers: null,
  employsWorkers: null,
  selfEmployedHoursPerWeek: "",
  selfEmployedMonthlyIncome: "",
  employeeHoursPerWeek: "",
  trainingStart: "",
  socialSecurityCardRequested: null,
  sepaEnabled: false,
  iban: "",
  bic: "",
  accountHolderIsApplicant: true,
  holderGender: "",
  holderFirstName: "",
  holderLastName: "",
  holderStreet: "",
  holderHouseNumber: "",
  holderPostalCode: "",
  holderCity: "",
  holderCountry: "DE",
  sepaConsent: false,
  brokerMandate: false,
  legalNotice: false,
  dataConsent: false,
  tkWelcomeMail: false,
};

export const CUSTOMER_GROUP_LABELS: Record<TkCustomerGroup, string> = {
  STUDIERENDE: "Student",
  BERUFSTAETIGE: "Employee",
  SAISONBESCHAEFTIGTE: "Seasonal worker",
  AUSZUBILDENDE: "Trainee / apprentice",
};

export const GENDER_LABELS: Record<TkGender, string> = {
  MAENNLICH: "Male",
  WEIBLICH: "Female",
  DIVERS: "Diverse",
  UNBESTIMMT: "Not specified",
};

export const PENSION_TYPE_LABELS: Record<TkPensionType, string> = {
  WAISENRENTE: "Orphan's pension",
  HINTERBLIEBENENRENTE: "Survivor's pension",
  ERWERBSMINDERUNGSRENTE: "Reduced earning capacity pension",
  SONSTIGE: "Other",
};
