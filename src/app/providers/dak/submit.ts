
import { prisma } from "@/lib/prisma";
import { Resend } from "resend";

const resend = new Resend(
  process.env.RESEND_API_KEY,
);

export const submitDakApplication = async (
  formData: any,
) => {
  /**
   * SAVE APPLICATION
   */
  const application =
    await prisma.insuranceApplication.create({
      data: {
        provider: "DAK",

        payload: formData,

        status: "PENDING",
      },
    });

  /**
   * USER ACKNOWLEDGEMENT MAIL
   */
  await resend.emails.send({
    from:
      "InsurBe <noreply@insurbe.com>",

    to: formData.personal.email,

    subject:
      "Your DAK Application Was Received",

    html: `
      <div style="font-family:Arial,sans-serif;line-height:1.6;background:#f9fafb;padding:30px">
        
        <div style="max-width:600px;margin:auto;background:#ffffff;border-radius:12px;padding:30px;border:1px solid #eee">
          
          <h2 style="color:#820ad1;margin-bottom:10px;">
            Hi ${formData.personal.firstName},
          </h2>

          <p style="font-size:16px;color:#333;">
            Your DAK insurance application has been successfully submitted.
          </p>

          <p style="color:#555;">
            DAK will now review and verify your application details.
          </p>

          <p style="color:#555;">
            Our team will contact you shortly if any additional information is required.
          </p>

          <div style="margin:25px 0;padding:20px;background:#f4f0ff;border-radius:10px;border:1px solid #e6dbff">
            <p style="margin:0;color:#5b21b6;font-weight:600;">
              ✅ Application ID:
              ${application.id}
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

    to: "pradeep.k@insurbe.com",

    subject: `New DAK Application - ${formData.personal.firstName} ${formData.personal.lastName}`,

    html: `
      <div style="font-family:Arial,sans-serif;line-height:1.6;padding:20px">
        
        <h2>
          New DAK Insurance Application
        </h2>

        <p>
          A new DAK application has been submitted.
        </p>

        <table cellpadding="10" cellspacing="0" border="1" style="border-collapse:collapse;width:100%;margin-top:20px;">
          
          <tr>
            <td><b>Application ID</b></td>
            <td>${application.id}</td>
          </tr>

          <tr>
            <td><b>Name</b></td>
            <td>
              ${formData.personal.firstName}
              ${formData.personal.lastName}
            </td>
          </tr>

          <tr>
            <td><b>Email</b></td>
            <td>${formData.personal.email}</td>
          </tr>

          <tr>
            <td><b>Phone</b></td>
            <td>
              ${formData.personal.countryCode}
              ${formData.personal.phoneNumber}
            </td>
          </tr>

          <tr>
            <td><b>Reason</b></td>
            <td>${formData.selectPlan.reason}</td>
          </tr>

          <tr>
            <td><b>Institution</b></td>
            <td>${formData.selectPlan.institutionName}</td>
          </tr>

        </table>

      </div>
    `,

    attachments: [
      {
        filename: `dak-application-${application.id}.json`,

        content: Buffer.from(
          JSON.stringify(
            formData,
            null,
            2,
          ),
        ).toString("base64"),
      },
    ],
  });

  return {
    success: true,

    applicationId:
      application.id,
  };
};