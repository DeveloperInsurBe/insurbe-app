import { prisma } from "@/lib/prisma";
import { Resend } from "resend";
import { PDFDocument, StandardFonts, rgb } from "pdf-lib";
import { APPLICATIONS_TEAM_EMAIL } from "../applicationPdf";
import { createDakCase, nextDakApplicationNumber } from "@/lib/dak/cases";
import { saveDakDocument } from "@/lib/dak/documents";

const resend = new Resend(
  process.env.RESEND_API_KEY,
);

async function storeForDakPortal(
  application: { id: string; createdAt: Date | null; payload: unknown; applicationNumber: string | null },
  pdfBuffer: Buffer,
  files: (File | null)[],
) {
  try {
    const dakCase = await createDakCase(application);

    await saveDakDocument({
      caseId: dakCase.id,
      name: "Application.pdf",
      mimeType: "application/pdf",
      content: pdfBuffer,
      source: "insurbe",
    });

    for (const file of files) {
      if (!file || file.size === 0) continue;
      await saveDakDocument({
        caseId: dakCase.id,
        name: file.name,
        mimeType: file.type,
        content: Buffer.from(await file.arrayBuffer()),
        source: "customer",
      });
    }
  } catch (error) {
    console.error(
      "DAK PORTAL STORE FAILED:",
      application.applicationNumber || application.id,
      error,
    );
  }
}

async function generateApplicationPDF(
  applicationNumber: string,
  personal: any,
  selectPlan: any,
) {
  const pdfDoc = await PDFDocument.create();

  const page = pdfDoc.addPage([600, 800]);

  const font = await pdfDoc.embedFont(
    StandardFonts.Helvetica,
  );

  const boldFont = await pdfDoc.embedFont(
    StandardFonts.HelveticaBold,
  );

  let y = 760;

  const drawText = (
    label: string,
    value: string,
  ) => {
    page.drawText(label, {
      x: 50,
      y,
      size: 12,
      font: boldFont,
      color: rgb(0, 0, 0),
    });

    page.drawText(value || "-", {
      x: 220,
      y,
      size: 12,
      font,
      color: rgb(0.2, 0.2, 0.2),
    });

    y -= 28;
  };

  page.drawText("InsurBe DAK Application", {
    x: 50,
    y,
    size: 22,
    font: boldFont,
    color: rgb(0.45, 0.04, 0.82),
  });

  y -= 50;

  drawText(
    "Application ID:",
    applicationNumber,
  );

  drawText(
    "First Name:",
    personal.firstName,
  );

  drawText(
    "Last Name:",
    personal.lastName,
  );

  drawText(
    "Email:",
    personal.email,
  );

  drawText(
    "Phone:",
    `${personal.countryCode} ${personal.phoneNumber}`,
  );

  drawText(
    "Nationality:",
    personal.nationality,
  );

  drawText(
    "Provider:",
    selectPlan.provider,
  );

  drawText(
    "Reason:",
    selectPlan.reason,
  );

  drawText(
    "Institution:",
    selectPlan.institutionName,
  );

  drawText(
    "Insurance Type:",
    selectPlan.previousInsuranceType,
  );

  const pdfBytes = await pdfDoc.save();

  return Buffer.from(pdfBytes);
}

export const submitDakApplication = async (
  formData: FormData,
  referral: { partnerId: string | null; source: string },
) => {
  /**
   * GET FIELDS
   */
  const personal = JSON.parse(
    formData.get("personal") as string,
  );

  const selectPlan = JSON.parse(
    formData.get("selectPlan") as string,
  );

  /**
   * GET FILES
   */
  const passport =
    formData.get("passport") as File | null;

  const contract =
    formData.get("contract") as File | null;

  const photo =
    formData.get("photo") as File | null;

  /**
   * GENERATE APPLICATION NUMBER (database counter, never repeats)
   */
  const applicationNumber =
    await nextDakApplicationNumber();

  /**
   * SAVE APPLICATION
   */
  const application =
    await prisma.insuranceApplication.create({
      data: {
        applicationNumber,

        provider: "DAK",

        partnerId: referral.partnerId,

        source: referral.source,

        payload: {
          personal,
          selectPlan,
        },

        status: "PENDING",
      },
    });



  /**
   * USER ACKNOWLEDGEMENT MAIL
   */

  const pdfBuffer =
  await generateApplicationPDF(
    application.applicationNumber || application.id,
    personal,
    selectPlan,
  );

  /**
   * DAK PORTAL: open the review case and keep the files.
   * Never blocks the submission; a missing case is created later by the portal.
   */
  await storeForDakPortal(application, pdfBuffer, [passport, contract, photo]);

  await resend.emails.send({
    from:
      "InsurBe <noreply@insurbe.com>",

    to: personal.email,

    subject:
      "Your DAK Application Was Received",

    html: `
      <div style="font-family:Arial,sans-serif;line-height:1.6;background:#f9fafb;padding:30px">
        
        <div style="max-width:600px;margin:auto;background:#ffffff;border-radius:12px;padding:30px;border:1px solid #eee">
          
          <h2 style="color:#820ad1;margin-bottom:10px;">
            Hi ${personal.firstName},
          </h2>

          <p style="font-size:16px;color:#333;">
            Your DAK insurance application has been successfully submitted.
          </p>

          <p style="color:#555;">
            DAK will now review and verify your application details.
          </p>

          <div style="margin:25px 0;padding:20px;background:#f4f0ff;border-radius:10px;border:1px solid #e6dbff">
            <p style="margin:0;color:#5b21b6;font-weight:600;">
              ✅ Application ID:
              ${application.applicationNumber}
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

  /**
   * ADMIN MAIL
   */
  await resend.emails.send({
    from:
      "InsurBe <noreply@insurbe.com>",

    to: APPLICATIONS_TEAM_EMAIL,
      


    subject: `New DAK Application - ${personal.firstName} ${personal.lastName}`,

    html: `
      <div style="font-family:Arial,sans-serif;line-height:1.6;padding:20px">
        
        <h2>
          New DAK Insurance Application
        </h2>

        <table cellpadding="10" cellspacing="0" border="1" style="border-collapse:collapse;width:100%;margin-top:20px;">
          
          <tr>
            <td><b>Application ID</b></td>
            <td>${application.applicationNumber}</td>
          </tr>

          <tr>
            <td><b>Name</b></td>
            <td>
              ${personal.firstName}
              ${personal.lastName}
            </td>
          </tr>

          <tr>
            <td><b>Email</b></td>
            <td>${personal.email}</td>
          </tr>

          <tr>
            <td><b>Phone</b></td>
            <td>
              ${personal.countryCode}
              ${personal.phoneNumber}
            </td>
          </tr>

          <tr>
            <td><b>Reason</b></td>
            <td>${selectPlan.reason}</td>
          </tr>

          <tr>
            <td><b>Institution</b></td>
            <td>${selectPlan.institutionName}</td>
          </tr>

        </table>

      </div>
    `,

   attachments: [
  /**
   * JSON DATA
   */
 {
  filename: `${application.applicationNumber}.pdf`,

  content: pdfBuffer,
},

  /**
   * PASSPORT
   */
  ...(passport
    ? [
        {
          filename: passport.name,

          content: Buffer.from(
            await passport.arrayBuffer(),
          ),
        },
      ]
    : []),

  /**
   * CONTRACT
   */
  ...(contract
    ? [
        {
          filename: contract.name,

          content: Buffer.from(
            await contract.arrayBuffer(),
          ),
        },
      ]
    : []),

  /**
   * PHOTO
   */
  ...(photo
    ? [
        {
          filename: photo.name,

          content: Buffer.from(
            await photo.arrayBuffer(),
          ),
        },
      ]
    : []),
],
  });

  return {
    success: true,

    applicationId:
     application.applicationNumber || application.id,
  };
};

