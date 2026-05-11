export const buildTkPayload = (formData: any) => {
  const { personal, selectPlan } = formData;

  /**
   * FORMAT DATE → DD.MM.YYYY
   */
  const formatDate = (date: string) => {
    if (!date) return "";

    const [year, month, day] = date.split("-");

    return `${day}.${month}.${year}`;
  };

  /**
   * CUSTOMER GROUP MAP
   */
  const kundengruppeMap: Record<string, string> = {
    Student: "STUDIERENDE",
    Employee: "BERUFSTAETIGE",
    Trainee: "AUSZUBILDENDE",
  };

  const kundengruppe =
    kundengruppeMap[selectPlan.reason] || "STUDIERENDE";

  /**
   * COUNTRY ISO MAP
   */
  const countryCodeMap: Record<string, string> = {
    India: "IN",
    Germany: "DE",
    France: "FR",
    "United Kingdom": "GB",
    "United States": "US",
    Pakistan: "PK",
    Bangladesh: "BD",
    China: "CN",
    Nepal: "NP",
    "Sri Lanka": "LK",
    Turkey: "TR",
    Italy: "IT",
    Spain: "ES",
    Poland: "PL",
    Romania: "RO",
    Afghanistan: "AF",
    Iran: "IR",
    Iraq: "IQ",
    Syria: "SY",
    Nigeria: "NG",
  };

  const geburtsland =
    countryCodeMap[personal.countryOfBirth] || "IN";

  const staatsangehoerigkeit =
    countryCodeMap[personal.nationality] || "IN";

  /**
   * INSURANCE TYPE MAP
   */
  const versicherungsartMap: Record<string, string> = {
    "Travel Insurance": "PRIVAT",
    "Private Insurance": "PRIVAT",
    "Public Insurance": "GESETZLICH",
  };

  const payload: any = {
    /**
     * LANGUAGE
     */
    sprache: "EN",

    /**
     * BROKER AUTHORIZATION
     */
    maklervollmacht: true,

    /**
     * META DATA
     */
    metaDaten: {
      vorgangsId: `INSURBE-${Date.now()}`,

      vermittler: "INSURBE",
    },

    /**
     * EXISTING INSURANCE
     */
    bestehendeVersicherung: {
      selbstVersichert: false,

      pflichtversichert: false,

      imAuslandGelebt:
        selectPlan.insuredBefore === "Abroad",

      landLetzteVersicherung: "IN",

      krankenversicherungName:
        selectPlan.previousProviderName || "TK",

      versicherungsart:
        versicherungsartMap[
          selectPlan.previousInsuranceType
        ] || "GESETZLICH",
    },

    /**
     * PERSONAL DATA
     */
    persDaten: {
      name: {
        anrede:
  personal.gender === "Male"
    ? "Herr"
    : "Frau",

        vorname: personal.firstName || "",

        nachname: personal.lastName || "",
      },

      geburtsdatum: formatDate(
        selectPlan.dob || "",
      ),

      geburtsname:
        personal.lastName || "",

      geburtsort:
        personal.placeOfBirth || "",

      geburtsland,

      staatsangehoerigkeit,

      email: personal.email || "",

      telefon: `${
        personal.countryCode || ""
      }${personal.phoneNumber || ""}`,

      adresse: {
        strasse: personal.streetNo || "",

        hausnummer:
          personal.houseNumber || "1",

        plz: String(
          personal.postalCode || "",
        ).slice(0, 5),

        ort: personal.city || "",

        land: "DE",
      },

      mitversicherungVonAngehoerigen:
        personal.includeFamilyMembers === "Yes",

      versorgungsbezuege: false,

      kinder: false,

      versicherungsbeginn: "01.06.2026",
    },

    /**
     * SEPA MANDATE
     */
  sepaMandat: {
  iban: "DE89370400440532013000",

  bic: "COBADEFFXXX",

 kontoinhaber: {
    value: "VERSICHERTER",
  },
  einwilligungBankeinzug: true,
},

    /**
     * CUSTOMER GROUP
     */
    kundengruppe,
  };

  /**
   * STUDENTS
   */
  if (kundengruppe === "STUDIERENDE") {
    payload.studierende = {
      hochschule:
        selectPlan.institutionName || "",

      studienbeginn: "01.10.2024",

      beschaeftigt: false,

      beschaeftigtSelbstaendigDurchschnittlicheStudienzeit: 10,

      beschaeftigtDurchschnittlicheArbeitszeit: 0,

      beschaeftigtSelbstaendigVorlesungsfreieZeit: false,

      beschaeftigtPraktikum: false,

      beschaeftigtMonatlichesBruttogehalt: 0,

      /**
       * REQUIRED FLAGS
       */
      befreitKv: false,

      leistungenAgenturFuerArbeit: false,

      anspruchSachleistungen: false,

      selbststaendig: false,

      /**
       * PENSION
       */
      rente: false,

      renteArt: null,

      renteName: null,
    };
  }

  /**
   * EMPLOYEES
   */
  if (kundengruppe === "BERUFSTAETIGE") {
    payload.beschaeftigte = {
      arbeitgeber:
        selectPlan.institutionName || "",

      arbeitgeberAdresse: {
        strasse: personal.streetNo || "",

        hausnummer: "1",

        plz: String(
          personal.postalCode || "",
        ).slice(0, 5),

        ort: personal.city || "",

        land: "DE",
      },

      beschaeftigtSeitAb: formatDate(
        selectPlan.dob || "",
      ),

      entgeltklasse:
        "versicherungspflichtig",

      entgeltArbeitnehmer: 0,

      selbststaendig: false,

      rechtsbelehrung: true,
    };
  }

  /**
   * TRAINEES
   */
  if (kundengruppe === "AUSZUBILDENDE") {
    payload.auszubildende = {
      arbeitgeber:
        selectPlan.institutionName || "",

      arbeitgeberAdresse: {
        strasse: personal.streetNo || "",

        hausnummer: "1",

        plz: String(
          personal.postalCode || "",
        ).slice(0, 5),

        ort: personal.city || "",

        land: "DE",
      },

      ausbildungsbeginn: formatDate(
        selectPlan.dob || "",
      ),

      entgeltklasse:
        "versicherungspflichtig",

      rechtsbelehrung: true,
    };
  }

  return payload;
};