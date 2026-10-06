import { Resend } from "resend";

import countriesData from "@/lib/countriesData.json";
import { APPLICATIONS_TEAM_EMAIL, generateApplicationPDF } from "@/app/providers/applicationPdf";

import type { TkAttachment, TkEnvironment } from "./client";
import { CUSTOMER_GROUP_LABELS, GENDER_LABELS, type TkFormData } from "./types";

/**
 * Copy of every TK API application for the applications team
 * (PDF summary + uploaded documents).
 *
 * Informational only: TK is the delivery channel. Never throws, so an email
 * problem can't change the outcome of a submission.
 */

const resend = new Resend(process.env.RESEND_API_KEY);

const escapeHtml = (value: unknown) =>
  String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");

const yesNo = (value: boolean | null) => (value === true ? "Yes" : value === false ? "No" : "-");

const countryName = (code: string) =>
  (countriesData as { name: { common: string }; cca2: string }[]).find((country) => country.cca2 === code)?.name
    .common || code;

const pdfRows = (data: TkFormData, applicationNumber: string, tkLine: string) => {
  const rows: [string, string | null | undefined][] = [
    ["Application ID:", applicationNumber],
    ["TK API:", tkLine],
    ["Customer group:", data.customerGroup ? CUSTOMER_GROUP_LABELS[data.customerGroup] : ""],
    ["Insurance start:", data.insuranceStart],
    ["Language:", data.language],
    ["Gender:", data.gender ? GENDER_LABELS[data.gender] : ""],
    ["Title:", data.title],
    ["First name:", data.firstName],
    ["Last name:", data.lastName],
    ["Birth name:", data.birthName],
    ["Date of birth:", data.dateOfBirth],
    ["Place of birth:", data.placeOfBirth],
    ["Country of birth:", countryName(data.countryOfBirth)],
    ["Nationality:", countryName(data.nationality)],
    ["Email:", data.email],
    ["Phone:", data.phone],
    ["Address:", `${data.street} ${data.houseNumber}`],
    ["Address suppl.:", data.addressExtra],
    ["Postal code / city:", `${data.postalCode} ${data.city}`],
    ["Country:", countryName(data.country || "DE")],
    ["Children:", yesNo(data.hasChildren)],
    ["Civil serv. pension:", yesNo(data.receivesCivilServicePension)],
    ["Co-insure family:", yesNo(data.coInsureFamily)],
    ["Never insured:", data.neverInsured ? "Yes" : "No"],
    ["Lived abroad:", data.neverInsured ? "-" : yesNo(data.livedAbroad)],
    [
      data.neverInsured ? "Country lived in:" : "Last ins. country:",
      data.lastInsuranceCountry ? countryName(data.lastInsuranceCountry) : "",
    ],
    ["Previous insurer:", data.previousInsurerName],
    ["Previous ins. type:", data.previousInsuranceType],
    ["Self insured:", yesNo(data.selfInsured)],
    ["Compulsorily ins.:", yesNo(data.compulsorilyInsured)],
    ["Insurance number:", data.insuranceNumber],
  ];

  if (data.customerGroup === "STUDIERENDE") {
    rows.push(
      ["University:", data.university],
      ["Study start:", data.studyStart],
      ["Exempt from KV:", yesNo(data.exemptFromKv)],
      ["Unemployment ben.:", yesNo(data.unemploymentBenefits)],
      ["Benefits in kind:", yesNo(data.benefitsInKind)],
      ["Employed:", yesNo(data.studentEmployed)],
      ["Study hours/week:", data.studyHoursPerWeek],
      ["Work hours/week:", data.workHoursPerWeek],
      ["Work in breaks:", yesNo(data.workDuringBreaks)],
      ["Internship:", yesNo(data.internship)],
      ["Gross salary/month:", data.monthlyGrossSalary],
      ["Self-employed:", yesNo(data.studentSelfEmployed)],
      ["Self-empl. hours:", data.studentSelfEmployedHours],
      ["Self-empl. income:", data.studentSelfEmployedIncome],
      ["Has employees:", yesNo(data.studentSelfEmployedHasEmployees)],
      ["Minijob employees:", yesNo(data.studentSelfEmployedMinijobEmployees)],
      ["Pension:", yesNo(data.pension)],
      ["Pension type:", data.pensionType],
      ["Pension name:", data.pensionName],
      ["SEPA mandate:", data.sepaEnabled ? "Yes" : "No"],
    );

    if (data.sepaEnabled) {
      rows.push(
        ["IBAN:", data.iban.replace(/\s+/g, "").toUpperCase()],
        ["BIC:", data.bic],
        [
          "Account holder:",
          data.accountHolderIsApplicant
            ? "Applicant"
            : `${data.holderFirstName} ${data.holderLastName}, ${data.holderStreet} ${data.holderHouseNumber}, ${data.holderPostalCode} ${data.holderCity}, ${data.holderCountry}`,
        ],
      );
    }
  } else {
    rows.push(
      ["Receives pension:", yesNo(data.receivesPension)],
      ["KV/PV exempt:", yesNo(data.exemptFromKvPv)],
      ["Employer:", data.employerName],
      [
        "Employer address:",
        data.employerName
          ? `${data.employerStreet} ${data.employerHouseNumber}, ${data.employerPostalCode} ${data.employerCity}`
          : "",
      ],
    );

    if (data.customerGroup === "AUSZUBILDENDE") {
      rows.push(
        ["Training start:", data.trainingStart],
        ["Soc. sec. card req.:", yesNo(data.socialSecurityCardRequested)],
      );
    } else {
      rows.push(
        ["Employment start:", data.employmentStart],
        ["Salary class:", data.salaryClass],
        ["Gross salary/month:", data.monthlySalary],
        ["First employment:", yesNo(data.firstEmployment)],
        ["Managing director:", yesNo(data.managingDirector)],
        ["Also self-employed:", yesNo(data.employeeSelfEmployed)],
      );

      if (data.employeeSelfEmployed) {
        rows.push(
          ["Business founder:", yesNo(data.businessFounder)],
          ["Several minijobbers:", yesNo(data.employsMultipleMinijobbers)],
          ["Employs workers:", yesNo(data.employsWorkers)],
          ["Self-empl. h/week:", data.selfEmployedHoursPerWeek],
          ["Self-empl. income:", data.selfEmployedMonthlyIncome],
          ["Employee h/week:", data.employeeHoursPerWeek],
        );
      }
    }
  }

  rows.push(
    ["Broker mandate:", data.brokerMandate ? "Granted (ERWEITERT)" : "No"],
    ["Legal notice:", data.legalNotice ? "Confirmed" : "No"],
    ["TK welcome mails:", data.tkWelcomeMail ? "Yes" : "No"],
  );

  return rows;
};

export type TkTeamEmailInput = {
  data: TkFormData;
  applicationNumber: string;
  environment: TkEnvironment;
  /** accepted = TK returned an antragId; unknown = TK did not answer in time. */
  outcome: "accepted" | "unknown";
  antragId: string | null;
  error?: string | null;
  referral: { source: string; partnerId: string | null };
  attachments: TkAttachment[];
};

export async function sendTkTeamEmail(input: TkTeamEmailInput): Promise<void> {
  const { data, applicationNumber, environment, outcome, antragId, error, referral, attachments } = input;

  const system = environment === "production" ? "TK production" : "TK test system (staging)";

  const tkLine =
    outcome === "accepted"
      ? `Accepted by ${system} - TK reference ${antragId}`
      : `No answer from ${system} - ${error || "timeout"}`;

  const status =
    outcome === "unknown"
      ? `<b>TK did not confirm this application in time.</b> It may or may not have reached TK – please check with TK before taking any action.`
      : environment === "production"
        ? `Submitted to TK via the API. TK reference: <b>${escapeHtml(antragId)}</b>.`
        : `Submitted to the <b>TK test system (staging)</b>. TK reference: <b>${escapeHtml(antragId)}</b>. TK does not process staging applications.`;

  try {
    const pdfBuffer = await generateApplicationPDF(
      "InsurBe TK Application",
      pdfRows(data, applicationNumber, tkLine),
    );

    const { error: mailError } = await resend.emails.send({
      from: "InsurBe <noreply@insurbe.com>",
      to: APPLICATIONS_TEAM_EMAIL,
      subject: `${outcome === "unknown" ? "[CHECK] " : ""}New TK Application - ${data.firstName} ${data.lastName} (${applicationNumber})`,
      html: `
        <div style="font-family:Arial,sans-serif;line-height:1.6;padding:20px">
          <h2>New TK Insurance Application</h2>
          <p>${status}</p>
          <p>Full details are in the attached PDF, together with the uploaded documents.</p>
          <table cellpadding="10" cellspacing="0" border="1" style="border-collapse:collapse;width:100%;margin-top:20px;">
            <tr><td><b>Application ID</b></td><td>${escapeHtml(applicationNumber)}</td></tr>
            <tr><td><b>TK reference</b></td><td>${escapeHtml(antragId || "-")}</td></tr>
            <tr><td><b>Name</b></td><td>${escapeHtml(data.firstName)} ${escapeHtml(data.lastName)}</td></tr>
            <tr><td><b>Email</b></td><td>${escapeHtml(data.email)}</td></tr>
            <tr><td><b>Phone</b></td><td>${escapeHtml(data.phone)}</td></tr>
            <tr><td><b>Customer group</b></td><td>${escapeHtml(data.customerGroup ? CUSTOMER_GROUP_LABELS[data.customerGroup] : "")}</td></tr>
            <tr><td><b>Insurance start</b></td><td>${escapeHtml(data.insuranceStart)}</td></tr>
            <tr><td><b>Source</b></td><td>${escapeHtml(referral.source)}${referral.partnerId ? ` (${escapeHtml(referral.partnerId)})` : ""}</td></tr>
            <tr><td><b>TK API</b></td><td>${escapeHtml(tkLine.slice(0, 500))}</td></tr>
          </table>
        </div>
      `,
      attachments: [
        { filename: `${applicationNumber}.pdf`, content: pdfBuffer },
        ...attachments.map((file, index) => ({
          filename: `${
            index === 0 ? "photo" : index === 1 ? "passport" : index === 2 ? "proof" : `document-${index - 2}`
          }-${file.filename}`,
          content: file.data,
        })),
      ],
    });

    if (mailError) {
      console.error("TK TEAM EMAIL FAILED:", applicationNumber, mailError.message);
    }
  } catch (mailError) {
    console.error("TK TEAM EMAIL FAILED:", applicationNumber, mailError);
  }
}
