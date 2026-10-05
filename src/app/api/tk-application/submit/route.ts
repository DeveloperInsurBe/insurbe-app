import { NextResponse } from "next/server";
import { Prisma } from "@prisma/client";
import { Resend } from "resend";

import countriesData from "@/lib/countriesData.json";
import { prisma } from "@/lib/prisma";
import { ensureApplicationUserAccount } from "@/lib/ensureApplicationUserAccount";
import { resolveReferralAttribution } from "@/lib/referralAttribution";
import {
  getTkEnvironment,
  getTkVermittler,
  submitTkMembership,
  TkApiError,
  type TkAttachment,
} from "@/app/providers/tkApi/client";
import { mapTkMessages } from "@/app/providers/tkApi/messages";
import { buildTkApiPayload } from "@/app/providers/tkApi/payload";
import { TK_FILE_RULES, validateTkApplication } from "@/app/providers/tkApi/rules";
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
 * TK is the only delivery channel - no application data is emailed.
 *
 * 1. validate form + documents
 * 2. production only: block duplicates (same email + date of birth, 30 days)
 * 3. reserve an application number (insuranceApplication row, PENDING)
 * 4. submit to TK (staging unless TK_API_ENV=production)
 *      accepted        -> SUBMITTED + antragId stored
 *      rejected (400)  -> row removed, errors returned to the form (422)
 *      not reached     -> FAILED, user may retry (503)
 *      no answer       -> stays PENDING (TK may have it), user must not retry (504)
 * 5. partner conversion, user account, acknowledgement email
 */

export const runtime = "nodejs";

// The TK client keeps its total budget at 45 s, well inside this limit.
export const maxDuration = 60;

const resend = new Resend(process.env.RESEND_API_KEY);

const PUBLIC_PRODUCT = "Public Health Insurance";

const DUPLICATE_WINDOW_MS = 30 * 24 * 60 * 60 * 1000;

const escapeHtml = (value: unknown) =>
  String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");

const countryName = (code: string) =>
  (countriesData as { name: { common: string }; cca2: string }[]).find((country) => country.cca2 === code)?.name
    .common || code;

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

  const total = [files.photo, files.passport, files.proof, ...files.extra].reduce(
    (sum, file) => sum + (file?.size ?? 0),
    0,
  );

  if (total > TK_FILE_RULES.maxTotalBytes && !errors.extraDocuments) {
    errors.extraDocuments = "All documents together must be 4 MB or smaller";
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

/**
 * A previous production submission of this API form for the same person
 * (email + date of birth) within the last 30 days. Legacy-flow rows have
 * no tkApi block and are ignored.
 */
const findRecentProductionApplication = async (email: string, dateOfBirth: string) =>
  prisma.insuranceApplication.findFirst({
    where: {
      provider: "TK",
      status: { in: ["SUBMITTED", "PENDING"] },
      createdAt: { gte: new Date(Date.now() - DUPLICATE_WINDOW_MS) },
      AND: [
        { payload: { path: ["personal", "email"], equals: email } },
        { payload: { path: ["selectPlan", "dob"], equals: dateOfBirth } },
        { payload: { path: ["tkApi", "environment"], equals: "production" } },
      ],
    },
    orderBy: { createdAt: "desc" },
    select: { applicationNumber: true, status: true },
  });

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
    country: countryName(data.country || "DE"),
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
  const email = data.email.trim().toLowerCase();

  try {
    /**
     * DUPLICATE GUARD (production only - staging is used for repeated tests)
     */
    if (environment === "production") {
      const previous = await findRecentProductionApplication(email, data.dateOfBirth);

      if (previous?.status === "SUBMITTED") {
        return NextResponse.json({
          success: true,
          applicationId: previous.applicationNumber,
          alreadySubmitted: true,
        });
      }

      if (previous) {
        return errorResponse(
          409,
          `We are still confirming your earlier application (${previous.applicationNumber}) with TK. Please don't submit it again – we will contact you.`,
          { applicationId: previous.applicationNumber },
        );
      }
    }

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
      payload: { ...storedPayload, tkApi: { environment } } as Prisma.InputJsonValue,
    });

    const applicationNumber = application.applicationNumber as string;

    const saveResult = (status: "SUBMITTED" | "PENDING" | "FAILED", tkApi: Record<string, unknown>) =>
      prisma.insuranceApplication.update({
        where: { id: application.id },
        data: {
          status,
          payload: {
            ...storedPayload,
            tkApi: { environment, submittedAt: new Date().toISOString(), ...tkApi },
          } as Prisma.InputJsonValue,
        },
      });

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

    let antragId: string;

    try {
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

      antragId = result.antragId;
    } catch (error) {
      const message = error instanceof Error ? error.message : "Unknown TK error";
      const outcomeUnknown = error instanceof TkApiError && error.outcomeUnknown;

      console.error("TK API FAILED:", applicationNumber, outcomeUnknown ? "(outcome unknown)" : "(not sent)", message);

      if (outcomeUnknown) {
        // TK may have stored it: keep PENDING and stop the user from resubmitting.
        await saveResult("PENDING", { accepted: null, antragId: null, error: message, outcomeUnknown: true });

        return errorResponse(
          504,
          `TK did not confirm your application in time. It may still have been received, so please don't submit it again – we will check and contact you. Your reference: ${applicationNumber}.`,
          { applicationId: applicationNumber },
        );
      }

      await saveResult("FAILED", { accepted: false, antragId: null, error: message, outcomeUnknown: false });

      return errorResponse(
        503,
        "TK can't be reached right now. Nothing was submitted – please try again in a few minutes.",
      );
    }

    await saveResult("SUBMITTED", { accepted: true, antragId, error: null });

    console.info(`TK API ACCEPTED: ${applicationNumber} -> TK antragId ${antragId} (${environment})`);

    /**
     * PARTNER CONVERSION (same rules as the legacy flow)
     */
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
     * USER ACKNOWLEDGEMENT (no application data / documents)
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
      // TK's own application number - present only when TK accepted it.
      tkReference: antragId,
      tkEnvironment: environment,
    });
  } catch (error) {
    console.error("TK APPLICATION ROUTE ERROR:", error);

    return errorResponse(500, "We couldn't submit your application right now. Please try again shortly.");
  }
}
