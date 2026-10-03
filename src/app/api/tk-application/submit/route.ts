import { NextResponse } from "next/server";
import { Prisma } from "@prisma/client";
import { Resend } from "resend";

import { prisma } from "@/lib/prisma";
import { ensureApplicationUserAccount } from "@/lib/ensureApplicationUserAccount";
import { resolveReferralAttribution } from "@/lib/referralAttribution";
import {
  APPLICATIONS_TEAM_EMAIL,
  generateApplicationPDF,
} from "@/app/providers/applicationPdf";
import {
  getTkEnvironment,
  getTkVermittler,
  submitTkMembership,
  TkApiError,
  type TkAttachment,
} from "@/app/providers/tkApi/client";
import { mapTkMessages } from "@/app/providers/tkApi/messages";
import { buildTkApiPayload } from "@/app/providers/tkApi/payload";
import {
  requiresManualProcessing,
  TK_FILE_RULES,
  validateTkApplication,
} from "@/app/providers/tkApi/rules";
import {
  CUSTOMER_GROUP_LABELS,
  EMPTY_TK_FORM,
  GENDER_LABELS,
  type TkFormData,
} from "@/app/providers/tkApi/types";

/**
 * TK NEW MEMBERSHIP API SUBMISSION
 *
 * Used by /tk-application. Independent from the legacy /api/tk/submit flow.
 *
 * 1. validate form + documents
 * 2. reserve an application number (insuranceApplication row, PENDING)
 * 3. submit to TK (staging unless TK_API_ENV=production)
 *      accepted   -> SUBMITTED + antragId stored
 *      rejected   -> row removed, errors returned to the form (422)
 *      unreachable-> stays PENDING, team processes it manually
 *      never insured in DE / agreement country -> not sent, team processes it
 * 4. team email (PDF + documents) - delivery channel while not on production
 * 5. partner conversion, user account, acknowledgement email
 */

export const runtime = "nodejs";

export const maxDuration = 60;

const resend = new Resend(process.env.RESEND_API_KEY);

const PUBLIC_PRODUCT = "Public Health Insurance";

const escapeHtml = (value: unknown) =>
  String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");

const yesNo = (value: boolean | null) => (value === true ? "Yes" : value === false ? "No" : "-");

const maskIban = (iban: string) => {
  const compact = iban.replace(/\s+/g, "");
  return compact ? `${compact.slice(0, 4)}…${compact.slice(-4)}` : "";
};

const errorResponse = (
  status: number,
  message: string,
  extra: Record<string, unknown> = {},
) => NextResponse.json({ success: false, message, ...extra }, { status });

/* -------------------------------------------------------------------------- */
/*                                  FILES                                     */
/* -------------------------------------------------------------------------- */

type UploadedFiles = {
  photo: File | null;
  passport: File | null;
  proof: File | null;
  extra: File[];
};

const readFiles = (formData: FormData): UploadedFiles => {
  const single = (key: string) => {
    const value = formData.get(key);
    return value instanceof File && value.size > 0 ? value : null;
  };

  return {
    photo: single("photo"),
    passport: single("passport"),
    proof: single("proof"),
    extra: formData
      .getAll("extraDocuments")
      .filter((value): value is File => value instanceof File && value.size > 0),
  };
};

const validateFiles = (files: UploadedFiles) => {
  const errors: Record<string, string> = {};

  const check = (key: string, file: File | null, label: string, types: string[]) => {
    if (!file) errors[key] = `${label} is required`;
    else if (file.size > TK_FILE_RULES.maxFileBytes) errors[key] = `${label} must be 10 MB or smaller`;
    else if (!types.includes(file.type)) errors[key] = `${label} has an unsupported file type`;
  };

  check("photo", files.photo, "Passport photo", TK_FILE_RULES.photoTypes);
  check("passport", files.passport, "Passport copy", TK_FILE_RULES.documentTypes);
  check("proof", files.proof, "Proof document", TK_FILE_RULES.documentTypes);

  if (files.extra.length > TK_FILE_RULES.maxExtraDocuments) {
    errors.extraDocuments = `You can add up to ${TK_FILE_RULES.maxExtraDocuments} additional documents`;
  } else if (
    files.extra.some(
      (file) =>
        file.size > TK_FILE_RULES.maxFileBytes || !TK_FILE_RULES.documentTypes.includes(file.type),
    )
  ) {
    errors.extraDocuments = "Additional documents must be PDF, Word, image or text files of 10 MB or less";
  }

  return errors;
};

const toAttachment = async (kind: TkAttachment["kind"], file: File): Promise<TkAttachment> => ({
  kind,
  filename: file.name || "document",
  contentType: file.type || "application/octet-stream",
  data: Buffer.from(await file.arrayBuffer()),
});

/* -------------------------------------------------------------------------- */
/*                              APPLICATION NO.                               */
/* -------------------------------------------------------------------------- */

const reserveApplication = async (
  data: Prisma.InsuranceApplicationCreateInput,
) => {
  const count = await prisma.insuranceApplication.count();

  for (let attempt = 1; attempt <= 5; attempt += 1) {
    const applicationNumber = `IB-TK-${String(count + attempt).padStart(3, "0")}`;

    try {
      return await prisma.insuranceApplication.create({
        data: { ...data, applicationNumber },
      });
    } catch (error) {
      const duplicate =
        error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002";
      if (!duplicate) throw error;
    }
  }

  throw new Error("Could not reserve an application number");
};

/* -------------------------------------------------------------------------- */
/*                                STORED DATA                                 */
/* -------------------------------------------------------------------------- */

/**
 * Admin / partner views read payload.personal and payload.selectPlan
 * (same shape as the legacy TK flow), so we keep those keys.
 */
const buildStoredPayload = (data: TkFormData) => ({
  personal: {
    gender: data.gender ? GENDER_LABELS[data.gender] : "",
    firstName: data.firstName.trim(),
    lastName: data.lastName.trim(),
    email: data.email.trim().toLowerCase(),
    countryCode: "",
    phoneNumber: data.phone.trim(),
    nationality: data.nationality,
    countryOfBirth: data.countryOfBirth,
    placeOfBirth: data.placeOfBirth.trim(),
    streetNo: `${data.street.trim()} ${data.houseNumber.trim()}`.trim(),
    postalCode: data.postalCode.trim(),
    city: data.city.trim(),
    country: "Germany",
  },
  selectPlan: {
    provider: "TK",
    reason: data.customerGroup ? CUSTOMER_GROUP_LABELS[data.customerGroup] : "",
    dob: data.dateOfBirth,
    insuranceStart: data.insuranceStart,
    institutionName:
      data.customerGroup === "STUDIERENDE" ? data.university.trim() : data.employerName.trim(),
  },
  // Full form for reference; bank details are masked at rest.
  tkForm: {
    ...data,
    iban: maskIban(data.iban),
    bic: data.bic ? "***" : "",
  },
});

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
    ["Country of birth:", data.countryOfBirth],
    ["Nationality:", data.nationality],
    ["Email:", data.email],
    ["Phone:", data.phone],
    ["Address:", `${data.street} ${data.houseNumber}`],
    ["Address suppl.:", data.addressExtra],
    ["Postal code / city:", `${data.postalCode} ${data.city}`],
    ["Children:", yesNo(data.hasChildren)],
    ["Civil serv. pension:", yesNo(data.receivesCivilServicePension)],
    ["Co-insure family:", yesNo(data.coInsureFamily)],
    ["Never insured:", data.neverInsured ? "Yes" : "No"],
    ["Lived abroad:", data.neverInsured ? "-" : yesNo(data.livedAbroad)],
    [data.neverInsured ? "Country lived in:" : "Last ins. country:", data.lastInsuranceCountry],
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

/* -------------------------------------------------------------------------- */
/*                                   ROUTE                                    */
/* -------------------------------------------------------------------------- */

export async function POST(req: Request) {
  let formData: FormData;

  try {
    formData = await req.formData();
  } catch {
    return errorResponse(400, "Invalid request");
  }

  /**
   * PARSE + VALIDATE
   */
  let data: TkFormData;

  try {
    const raw = JSON.parse(String(formData.get("data") || "null"));
    if (!raw || typeof raw !== "object") throw new Error("missing");
    // Only accept known keys.
    data = Object.fromEntries(
      Object.keys(EMPTY_TK_FORM).map((key) => [key, raw[key] ?? EMPTY_TK_FORM[key as keyof TkFormData]]),
    ) as TkFormData;
  } catch {
    return errorResponse(400, "Invalid form data");
  }

  const files = readFiles(formData);

  const fieldErrors = { ...validateTkApplication(data), ...validateFiles(files) };

  if (Object.keys(fieldErrors).length) {
    return errorResponse(400, "Please correct the highlighted fields.", { fieldErrors });
  }

  const environment = getTkEnvironment();

  try {
    const referral = await resolveReferralAttribution(
      (formData.get("partnerRef") as string) || null,
    );

    /**
     * RESERVE APPLICATION NUMBER
     */
    const storedPayload = buildStoredPayload(data);

    const application = await reserveApplication({
      provider: "TK",
      status: "PENDING",
      partnerId: referral.partnerId,
      source: referral.source,
      payload: storedPayload as Prisma.InputJsonValue,
    });

    const applicationNumber = application.applicationNumber as string;

    /**
     * SUBMIT TO TK
     */
    const attachments: TkAttachment[] = [
      await toAttachment("PASSBILD", files.photo as File),
      await toAttachment("DOKUMENT", files.passport as File),
      await toAttachment("DOKUMENT", files.proof as File),
      ...(await Promise.all(files.extra.map((file) => toAttachment("DOKUMENT", file)))),
    ];

    const tkPayload = buildTkApiPayload(data, {
      vermittler: getTkVermittler(),
      vorgangsId: applicationNumber,
    });

    let tkResult: { accepted: boolean; antragId: string | null; error: string | null };

    const manualOnly = requiresManualProcessing(data);

    try {
      if (manualOnly) {
        throw new Error(
          `Never insured, lived in ${data.lastInsuranceCountry}: TK requires a previous insurer for this country, so it was not sent via the API`,
        );
      }

      const result = await submitTkMembership(tkPayload, attachments);

      if (!result.ok) {
        console.warn("TK API REJECTED:", applicationNumber, JSON.stringify(result.messages));

        await prisma.insuranceApplication.delete({ where: { id: application.id } }).catch(() => {});

        const mapped = mapTkMessages(result.messages);

        return errorResponse(422, "TK could not accept some of your details. Please correct them and submit again.", {
          fieldErrors: mapped.fieldErrors,
          generalErrors: mapped.generalErrors,
        });
      }

      tkResult = { accepted: true, antragId: result.antragId, error: null };
    } catch (error) {
      const message = error instanceof TkApiError || error instanceof Error ? error.message : "Unknown TK error";
      if (manualOnly) console.warn("TK MANUAL PROCESSING:", applicationNumber, message);
      else console.error("TK API UNAVAILABLE:", applicationNumber, message);
      tkResult = { accepted: false, antragId: null, error: message };
    }

    // On staging TK never processes the application: the team must forward it.
    const deliveredToTk = tkResult.accepted && environment === "production";

    const tkApiInfo = {
      environment,
      accepted: tkResult.accepted,
      antragId: tkResult.antragId,
      error: tkResult.error,
      manualProcessing: manualOnly,
      submittedAt: new Date().toISOString(),
    };

    await prisma.insuranceApplication.update({
      where: { id: application.id },
      data: {
        status: tkResult.accepted ? "SUBMITTED" : "PENDING",
        payload: { ...storedPayload, tkApi: tkApiInfo } as Prisma.InputJsonValue,
      },
    });

    /**
     * TEAM EMAIL
     */
    const tkLine = tkResult.accepted
      ? `Accepted (${environment}) - TK ref ${tkResult.antragId}`
      : `NOT SUBMITTED (${environment}) - ${tkResult.error}`;

    const action = deliveredToTk
      ? `Submitted to TK production. TK reference: <b>${escapeHtml(tkResult.antragId)}</b>. No action needed.`
      : manualOnly
        ? `Applicant has <b>never had health insurance</b> and lived in <b>${escapeHtml(data.lastInsuranceCountry)}</b>. TK's API requires a previous insurer for this country, so it was <b>not sent</b> - please process this application with TK manually.`
        : environment === "staging"
        ? "TK API is in <b>staging</b> mode - TK will NOT process this. Please forward this application to TK."
        : "TK API was unavailable - <b>manual processing required</b>. Please forward this application to TK.";

    const pdfBuffer = await generateApplicationPDF(
      "InsurBe TK Application (API form)",
      pdfRows(data, applicationNumber, tkLine),
    );

    const { error: teamMailError } = await resend.emails.send({
      from: "InsurBe <noreply@insurbe.com>",
      to: APPLICATIONS_TEAM_EMAIL,
      subject: `${deliveredToTk ? "" : "[ACTION] "}New TK Application - ${data.firstName} ${data.lastName} (${applicationNumber})`,
      html: `
        <div style="font-family:Arial,sans-serif;line-height:1.6;padding:20px">
          <h2>New TK Insurance Application</h2>
          <p>${action}</p>
          <table cellpadding="10" cellspacing="0" border="1" style="border-collapse:collapse;width:100%;margin-top:20px;">
            <tr><td><b>Application ID</b></td><td>${escapeHtml(applicationNumber)}</td></tr>
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
          filename: `${index === 0 ? "photo" : index === 1 ? "passport" : index === 2 ? "proof" : `document-${index - 2}`}-${file.filename}`,
          content: file.data,
        })),
      ],
    });

    if (teamMailError) {
      console.error("TK TEAM EMAIL FAILED:", applicationNumber, teamMailError.message);

      if (!deliveredToTk) {
        // Neither TK nor the team has the application: let the user retry.
        await prisma.insuranceApplication
          .update({ where: { id: application.id }, data: { status: "FAILED" } })
          .catch(() => {});

        return errorResponse(502, "We couldn't submit your application right now. Please try again shortly.");
      }
    }

    /**
     * PARTNER CONVERSION (same rules as the legacy flow)
     */
    const email = data.email.trim().toLowerCase();

    const existingApplication = await prisma.application.findFirst({
      where: { userId: email, product: PUBLIC_PRODUCT },
      select: { id: true },
    });

    if (!existingApplication) {
      await prisma.application.create({
        data: {
          firstName: data.firstName.trim(),
          lastName: data.lastName.trim(),
          userId: email,
          partnerId: referral.partnerId,
          product: PUBLIC_PRODUCT,
          commission: referral.commission,
          commissionStatus: referral.isAttributed ? "Pending" : "Not Eligible",
          source: referral.source,
          status: "Submitted",
          pdfBase64: "",
          orderId: applicationNumber,
        },
      });
    }

    await ensureApplicationUserAccount({
      email,
      firstName: data.firstName.trim(),
      lastName: data.lastName.trim(),
    }).catch((error) => console.error("TK USER ACCOUNT FAILED:", error));

    /**
     * USER ACKNOWLEDGEMENT
     */
    try {
      await resend.emails.send({
        from: "InsurBe <noreply@insurbe.com>",
        to: email,
        subject: "Your TK Application Was Received",
        html: `
          <div style="font-family:Arial,sans-serif;line-height:1.6;background:#f9fafb;padding:30px">
            <div style="max-width:600px;margin:auto;background:#ffffff;border-radius:12px;padding:30px;border:1px solid #eee">
              <h2 style="color:#0f766e;margin-bottom:10px;">Hi ${escapeHtml(data.firstName)},</h2>
              <p style="font-size:16px;color:#333;">Your TK health insurance application has been successfully submitted.</p>
              <p style="color:#555;">TK will review your application and contact you by email. Please keep an eye on your inbox (and spam folder).</p>
              <div style="margin:25px 0;padding:20px;background:#ecfeff;border-radius:10px;border:1px solid #cffafe">
                <p style="margin:0;color:#115e59;font-weight:600;">✅ Application ID: ${escapeHtml(applicationNumber)}</p>
              </div>
              <p style="color:#555;">Thank you for choosing InsurBe.</p>
              <br/>
              <p style="color:#333;">Warm regards,<br/><b>Team InsurBe</b></p>
            </div>
          </div>
        `,
      });
    } catch (mailError) {
      console.error("TK ACKNOWLEDGEMENT EMAIL FAILED:", mailError);
    }

    return NextResponse.json({
      success: true,
      applicationId: applicationNumber,
      tkReference: deliveredToTk ? tkResult.antragId : null,
    });
  } catch (error) {
    console.error("TK APPLICATION ROUTE ERROR:", error);

    return errorResponse(500, "We couldn't submit your application right now. Please try again shortly.");
  }
}
