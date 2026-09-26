import { buildTkPayload } from "./mapper";
import { prisma } from "@/lib/prisma";
import { Resend } from "resend";
import {
  APPLICATIONS_TEAM_EMAIL,
  generateApplicationPDF,
} from "../applicationPdf";

const resend = new Resend(
  process.env.RESEND_API_KEY,
);

const TOKEN_URL =
  "https://www.tk.de/service/rest/public/neuaufnahmeantrag/getApiAccessToken";

const SUBMIT_URL =
  "https://www.tk.de/service/rest/public/staging/neuaufnahmeantrag/v3/einreichen";

const TK_API_TIMEOUT_MS = 20000;

type TkDocuments = {
  passport: File | null;
  contract: File | null;
  photo: File | null;
};

const escapeHtml = (value: unknown) =>
  String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");

/**
 * SEND TO TK API (STAGING)
 *
 * Best effort only: the team email is the real delivery
 * channel until TK production access is available.
 */
const sendToTkApi = async (
  formData: any,
): Promise<{ ok: boolean; message: string }> => {
  try {
    /**
     * GET TOKEN
     */
    const tokenResponse = await fetch(
      TOKEN_URL,
      {
        method: "POST",

        headers: {
          "Content-Type":
            "application/json",
        },

        body: JSON.stringify({
          userId:
            process.env.TK_USER_ID,

          password:
            process.env.TK_PASSWORD,
        }),

        signal: AbortSignal.timeout(TK_API_TIMEOUT_MS),
      },
    );

    if (!tokenResponse.ok) {
      return {
        ok: false,
        message: `TK TOKEN ERROR: ${await tokenResponse.text()}`,
      };
    }

    const token =
      await tokenResponse.text();

    /**
     * GET NSJ COOKIE
     */
    const setCookie =
      tokenResponse.headers.get(
        "set-cookie",
      ) || "";

    const nsjCookie =
      setCookie.match(
        /nsj=([^;]+)/,
      )?.[1];

    if (!nsjCookie) {
      return {
        ok: false,
        message: "NSJ cookie not found",
      };
    }

    /**
     * BUILD PAYLOAD
     */
    const payload =
      buildTkPayload(formData);

    console.log(
      "TK PAYLOAD:",
      JSON.stringify(
        payload,
        null,
        2,
      ),
    );

    /**
     * MULTIPART BODY
     */
    const boundary = `----WebKitFormBoundary${Date.now()}`;

    const multipartBody =
      `--${boundary}\r\n` +
      `Content-Type: application/json\r\n` +
      `Content-Disposition: form-data; name="antrag"\r\n\r\n` +
      `${JSON.stringify(payload)}\r\n` +
      `--${boundary}--`;

    /**
     * SUBMIT TO TK
     */
    const submitResponse =
      await fetch(SUBMIT_URL, {
        method: "POST",

        headers: {
          Authorization: `Bearer ${token}`,

          Cookie: `nsj=${nsjCookie}`,

          Accept:
            "application/json",

          "Content-Type": `multipart/mixed; boundary=${boundary}`,
        },

        body: multipartBody,

        signal: AbortSignal.timeout(TK_API_TIMEOUT_MS),
      });

    const responseText =
      await submitResponse.text();

    console.log(
      "TK RESULT:",
      submitResponse.status,
      responseText,
    );

    if (!submitResponse.ok) {
      return {
        ok: false,
        message: `TK SUBMIT ERROR (${submitResponse.status}): ${responseText}`,
      };
    }

    return {
      ok: true,
      message: responseText,
    };
  } catch (error: any) {
    console.error(
      "TK API ERROR:",
      error,
    );

    return {
      ok: false,
      message:
        error?.message ||
        "Unknown error",
    };
  }
};

export const submitTkApplication = async (
  formData: any,
  documents: TkDocuments,
) => {
  const { personal, selectPlan } = formData;

  let applicationId: string | null = null;

  try {
    /**
     * GENERATE APPLICATION NUMBER
     */
    const count =
      await prisma.insuranceApplication.count();

    const applicationNumber =
      `IB-TK-${String(count + 1).padStart(3, "0")}`;

    /**
     * SAVE APPLICATION IN DB
     */
    const application =
      await prisma.insuranceApplication.create(
        {
          data: {
            applicationNumber,

            provider: "TK",

            payload: {
              personal,
              selectPlan,
            },

            status: "PENDING",
          },
        },
      );

    applicationId = application.id;

    /**
     * TK API (STAGING) - DOES NOT BLOCK THE APPLICATION
     */
    const tkApi =
      await sendToTkApi(formData);

    /**
     * APPLICATION PDF
     */
    const pdfBuffer =
      await generateApplicationPDF(
        "InsurBe TK Application",
        [
          ["Application ID:", applicationNumber],
          ["Gender:", personal.gender],
          ["First Name:", personal.firstName],
          ["Last Name:", personal.lastName],
          ["Date of Birth:", selectPlan.dob],
          ["Email:", personal.email],
          ["Phone:", `${personal.countryCode} ${personal.phoneNumber}`],
          ["Nationality:", personal.nationality],
          ["Country of Birth:", personal.countryOfBirth],
          ["Place of Birth:", personal.placeOfBirth],
          ["Passport Number:", personal.passportNumber],
          ["Street:", personal.streetNo],
          ["Postal Code:", personal.postalCode],
          ["City:", personal.city],
          ["Country:", personal.country],
          ["Address Info:", personal.additionalInfo],
          ["Marital Status:", personal.maritalStatus],
          ["Family Members:", personal.includeFamilyMembers],
          ["Provider:", selectPlan.provider],
          ["Reason:", selectPlan.reason],
          ["Institution:", selectPlan.institutionName],
          ["Insured Before:", selectPlan.insuredBefore],
          ["Prev. Insurance Type:", selectPlan.previousInsuranceType],
          ["Prev. Provider:", selectPlan.previousProviderName],
        ],
      );

    const fileAttachment = async (
      file: File | null,
    ) =>
      file
        ? [
            {
              filename: file.name,

              content: Buffer.from(
                await file.arrayBuffer(),
              ),
            },
          ]
        : [];

    /**
     * TEAM MAIL
     */
    const { error: teamMailError } =
      await resend.emails.send({
        from:
          "InsurBe <noreply@insurbe.com>",

        to: APPLICATIONS_TEAM_EMAIL,

        subject: `New TK Application - ${personal.firstName} ${personal.lastName}`,

        html: `
          <div style="font-family:Arial,sans-serif;line-height:1.6;padding:20px">

            <h2>
              New TK Insurance Application
            </h2>

            <p>
              Please forward this application to TK. Full details are in the attached PDF.
            </p>

            <table cellpadding="10" cellspacing="0" border="1" style="border-collapse:collapse;width:100%;margin-top:20px;">

              <tr>
                <td><b>Application ID</b></td>
                <td>${escapeHtml(applicationNumber)}</td>
              </tr>

              <tr>
                <td><b>Name</b></td>
                <td>
                  ${escapeHtml(personal.firstName)}
                  ${escapeHtml(personal.lastName)}
                </td>
              </tr>

              <tr>
                <td><b>Email</b></td>
                <td>${escapeHtml(personal.email)}</td>
              </tr>

              <tr>
                <td><b>Phone</b></td>
                <td>
                  ${escapeHtml(personal.countryCode)}
                  ${escapeHtml(personal.phoneNumber)}
                </td>
              </tr>

              <tr>
                <td><b>Reason</b></td>
                <td>${escapeHtml(selectPlan.reason)}</td>
              </tr>

              <tr>
                <td><b>Institution</b></td>
                <td>${escapeHtml(selectPlan.institutionName)}</td>
              </tr>

              <tr>
                <td><b>TK API (staging)</b></td>
                <td>
                  ${tkApi.ok ? "Accepted" : "Failed"}:
                  ${escapeHtml(tkApi.message.slice(0, 500))}
                </td>
              </tr>

            </table>

          </div>
        `,

        attachments: [
          {
            filename: `${applicationNumber}.pdf`,

            content: pdfBuffer,
          },

          ...(await fileAttachment(documents.passport)),

          ...(await fileAttachment(documents.contract)),

          ...(await fileAttachment(documents.photo)),
        ],
      });

    if (teamMailError) {
      throw new Error(
        `TEAM EMAIL FAILED: ${teamMailError.message}`,
      );
    }

    /**
     * USER ACKNOWLEDGEMENT EMAIL
     */
    try {
      await resend.emails.send({
        from:
          "InsurBe <noreply@insurbe.com>",

        to:
          personal.email,

        subject:
          "Your TK Application Was Received",

        html: `
          <div style="font-family:Arial,sans-serif;line-height:1.6;background:#f9fafb;padding:30px">

            <div style="max-width:600px;margin:auto;background:#ffffff;border-radius:12px;padding:30px;border:1px solid #eee">

              <h2 style="color:#0f766e;margin-bottom:10px;">
                Hi ${escapeHtml(personal.firstName)},
              </h2>

              <p style="font-size:16px;color:#333;">
                Your TK insurance application has been successfully submitted.
              </p>

              <p style="color:#555;">
                TK will now review and verify your application details.
              </p>

              <p style="color:#555;">
                Our team will contact you shortly if any additional information is required.
              </p>

              <div style="margin:25px 0;padding:20px;background:#ecfeff;border-radius:10px;border:1px solid #cffafe">
                <p style="margin:0;color:#115e59;font-weight:600;">
                  ✅ Application ID:
                  ${escapeHtml(applicationNumber)}
                </p>
              </div>

              <p style="color:#555;">
                Thank you for choosing InsurBe.
              </p>

              <br/>

              <p style="color:#333;">
                Warm regards,<br/>
                <b>Team InsurBe</b>
              </p>

            </div>

          </div>
        `,
      });
    } catch (mailError) {
      console.error(
        "ACKNOWLEDGEMENT EMAIL FAILED:",
        mailError,
      );
    }

    /**
     * FINAL RESPONSE
     */
    return {
      success: true,

      message:
        "Your TK insurance application has been submitted successfully.",

      applicationId:
        applicationNumber,
    };
  } catch (error: any) {
    console.error(
      "TK SUBMIT ERROR:",
      error,
    );

    /**
     * UPDATE DB STATUS
     */
    if (applicationId) {
      await prisma.insuranceApplication
        .update({
          where: {
            id: applicationId,
          },

          data: {
            status: "FAILED",
          },
        })
        .catch(() => {});
    }

    return {
      success: false,

      message:
        "Failed to submit TK insurance application.",

      error:
        error?.message ||
        "Unknown error",
    };
  }
};
