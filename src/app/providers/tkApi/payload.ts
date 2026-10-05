import type { TkFormData } from "./types";
import { isEmployment, isStudent, isTrainee, needsPreviousInsurer, toTkDate } from "./rules";

/**
 * TK NEW MEMBERSHIP API (v3) - /einreichen PAYLOAD
 *
 * Field names and placement follow the schema the live TK endpoint reports
 * (verified on staging), which differs from the v3.0.1 PDF in places:
 * - sepaMandat sits at the root, not inside "studierende"
 * - employees use "beschaeftigte" (plural)
 * - rentenbezuege / kvPvBefreit live in persDaten (non-students only)
 */

const num = (value: string) => {
  const parsed = Number(String(value).replace(",", "."));
  return Number.isFinite(parsed) ? Math.round(parsed * 100) / 100 : 0;
};

const clean = (value: string) => value.trim().replace(/\s+/g, " ");

const orNull = (value: string) => (clean(value) ? clean(value) : null);

const germanAddress = (
  street: string,
  houseNumber: string,
  postalCode: string,
  city: string,
  extra = "",
  land = "DE",
) => ({
  strasse: clean(street),
  hausnummer: clean(houseNumber),
  adresszusatz: orNull(extra),
  plz: clean(postalCode),
  ort: clean(city),
  land,
});

export type TkPayloadOptions = {
  /** TK partner id credited for the application (max. 10 chars). */
  vermittler: string;
  /** Our reference, echoed back by TK (max. 25 chars). */
  vorgangsId: string;
};

export const buildTkApiPayload = (data: TkFormData, options: TkPayloadOptions) => {
  const student = isStudent(data);

  const payload: Record<string, unknown> = {
    metaDaten: {
      vermittler: options.vermittler.slice(0, 10),
      vorgangsId: options.vorgangsId.slice(0, 25),
      vorlBescheinigung: false,
    },

    kundengruppe: data.customerGroup,

    sprache: data.language,

    // ERWEITERT also allows us to read the status via /status.
    maklervollmacht: "ERWEITERT",

    bestehendeVersicherung: buildExistingInsurance(data),

    persDaten: {
      name: {
        geschlecht: data.gender,
        titel: orNull(data.title),
        vorname: clean(data.firstName),
        nachname: clean(data.lastName),
        namenszusatz: null,
      },
      adresse: germanAddress(
        data.street,
        data.houseNumber,
        data.postalCode,
        data.city,
        data.addressExtra,
        data.country || "DE",
      ),
      email: clean(data.email),
      telefon: orNull(data.phone),
      geburtsdatum: toTkDate(data.dateOfBirth),
      geburtsname: clean(data.birthName),
      geburtsort: clean(data.placeOfBirth),
      geburtsland: data.countryOfBirth,
      staatsangehoerigkeit: data.nationality,
      versichertennummer:
        !data.neverInsured && data.livedAbroad === false && clean(data.insuranceNumber)
          ? clean(data.insuranceNumber).toUpperCase()
          : null,
      versorgungsbezuege: data.receivesCivilServicePension === true,
      kinder: data.hasChildren === true,
      mitversicherungVonAngehoerigen: data.coInsureFamily === true,
      versicherungsbeginn: toTkDate(data.insuranceStart),
      kommunikationMailEn: data.tkWelcomeMail,
      ...(student
        ? {}
        : {
            rentenbezuege: data.receivesPension === true,
            kvPvBefreit: data.exemptFromKvPv === true,
          }),
    },
  };

  if (student) {
    payload.studierende = buildStudent(data);
    if (data.sepaEnabled) payload.sepaMandat = buildSepa(data);
  } else if (isEmployment(data)) {
    payload.beschaeftigte = buildEmployment(data);
  } else if (isTrainee(data)) {
    payload.auszubildende = buildTrainee(data);
  }

  return payload;
};

const buildExistingInsurance = (data: TkFormData) => {
  // Never insured: TK only needs the country the applicant lived in.
  // (Germany / agreement countries never reach the API, see requiresManualProcessing.)
  if (data.neverInsured) {
    return {
      imAuslandGelebt: true,
      landLetzteVersicherung: data.lastInsuranceCountry,
      krankenversicherungName: null,
      versicherungsart: null,
      selbstVersichert: null,
      pflichtversichert: null,
    };
  }

  const livedAbroad = data.livedAbroad === true;
  const withInsurer = needsPreviousInsurer(data);
  const statutoryInGermany = !livedAbroad && data.previousInsuranceType === "gesetzlich";

  return {
    imAuslandGelebt: livedAbroad,
    landLetzteVersicherung: livedAbroad ? data.lastInsuranceCountry : null,
    krankenversicherungName: withInsurer ? clean(data.previousInsurerName) : null,
    versicherungsart: withInsurer ? data.previousInsuranceType : null,
    selbstVersichert: statutoryInGermany ? data.selfInsured === true : null,
    pflichtversichert: statutoryInGermany && data.selfInsured === true ? data.compulsorilyInsured === true : null,
  };
};

const buildStudent = (data: TkFormData) => {
  const employed = data.studentEmployed === true;
  const selfEmployed = data.studentSelfEmployed === true;
  const working = employed || selfEmployed;

  return {
    hochschule: clean(data.university),
    studienbeginn: toTkDate(data.studyStart),
    befreitKv: data.exemptFromKv === true,
    leistungenAgenturFuerArbeit: data.unemploymentBenefits === true,
    anspruchSachleistungen: data.benefitsInKind === true,

    beschaeftigt: employed,
    beschaeftigtSelbstaendigDurchschnittlicheStudienzeit: working ? num(data.studyHoursPerWeek) : null,
    beschaeftigtSelbstaendigVorlesungsfreieZeit: working ? data.workDuringBreaks === true : null,
    beschaeftigtDurchschnittlicheArbeitszeit: employed ? num(data.workHoursPerWeek) : null,
    beschaeftigtPraktikum: employed ? data.internship === true : null,
    beschaeftigtMonatlichesBruttogehalt: employed ? num(data.monthlyGrossSalary) : null,

    selbststaendig: selfEmployed,
    selbststaendigDurchschnittlicheArbeitszeit: selfEmployed ? num(data.studentSelfEmployedHours) : null,
    selbststaendigMonatlicheEinkuenfte: selfEmployed ? num(data.studentSelfEmployedIncome) : null,
    selbststaendigBeschaeftigteArbeitnehmer: selfEmployed ? data.studentSelfEmployedHasEmployees === true : null,
    selbststaendigBeschaeftigteArbeitnehmerAufMinijobBasis:
      selfEmployed && data.studentSelfEmployedHasEmployees === true
        ? data.studentSelfEmployedMinijobEmployees === true
        : null,

    rente: data.pension === true,
    renteArt: data.pension === true ? data.pensionType || null : null,
    renteName: data.pension === true && data.pensionType === "SONSTIGE" ? clean(data.pensionName) : null,
  };
};

const buildSepa = (data: TkFormData) => {
  const iban = data.iban.replace(/\s+/g, "").toUpperCase();
  const bic = data.bic.replace(/\s+/g, "").toUpperCase();

  if (data.accountHolderIsApplicant) {
    return {
      iban,
      bic: bic || null,
      kontoinhaber: "VERSICHERUNGSNEHMER",
      einwilligungBankeinzug: true,
    };
  }

  return {
    iban,
    bic: bic || null,
    kontoinhaber: "ABWEICHENDER",
    kontoinhaberName: {
      geschlecht: data.holderGender,
      titel: null,
      vorname: clean(data.holderFirstName),
      nachname: clean(data.holderLastName),
      namenszusatz: null,
    },
    kontoinhaberAdresse: {
      strasse: clean(data.holderStreet),
      hausnummer: clean(data.holderHouseNumber),
      adresszusatz: null,
      plz: clean(data.holderPostalCode),
      ort: clean(data.holderCity),
      land: data.holderCountry,
    },
    einwilligungBankeinzug: true,
  };
};

const employer = (data: TkFormData) =>
  clean(data.employerName)
    ? {
        arbeitgeber: clean(data.employerName),
        arbeitgeberAdresse: germanAddress(
          data.employerStreet,
          data.employerHouseNumber,
          data.employerPostalCode,
          data.employerCity,
        ),
      }
    : {};

const buildEmployment = (data: TkFormData) => {
  const selfEmployed = data.employeeSelfEmployed === true;

  return {
    ...employer(data),
    beschaeftigtSeitAb: toTkDate(data.employmentStart),
    entgeltklasse: data.salaryClass,
    entgeltArbeitnehmer: num(data.monthlySalary),
    ersteBeschaeftigung: data.firstEmployment === true,
    geschaeftsfuehrer: data.managingDirector === true,
    rechtsbelehrung: data.legalNotice,
    selbststaendig: selfEmployed,
    ...(selfEmployed
      ? {
          existenzgruender: data.businessFounder === true,
          beschaeftigtMehrereMinijobber: data.employsMultipleMinijobbers === true,
          beschaeftigtArbeitnehmer: data.employsWorkers === true,
          stundenSelbststaendigkeit: num(data.selfEmployedHoursPerWeek),
          einkommenSelbststaendigkeit: num(data.selfEmployedMonthlyIncome),
          stundenArbeitnehmer: num(data.employeeHoursPerWeek),
        }
      : {}),
  };
};

const buildTrainee = (data: TkFormData) => ({
  ...employer(data),
  ausbildungsbeginn: toTkDate(data.trainingStart),
  sozAusweisBeantr: data.socialSecurityCardRequested === true,
});
