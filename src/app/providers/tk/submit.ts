import { buildTkPayload } from "./mapper";
import { prisma } from "@/lib/prisma";
import { Resend } from "resend";

const resend = new Resend(
  process.env.RESEND_API_KEY,
);

const TOKEN_URL =
  "https://www.tk.de/service/rest/public/neuaufnahmeantrag/getApiAccessToken";

const SUBMIT_URL =
  "https://www.tk.de/service/rest/public/staging/neuaufnahmeantrag/v3/einreichen";

export const submitTkApplication = async (
  formData: any,
) => {
  try {
    /**
     * SAVE APPLICATION IN DB
     */
    const application =
      await prisma.insuranceApplication.create(
        {
          data: {
            provider: "TK",

            payload: formData,

            status: "PENDING",
          },
        },
      );

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
      },
    );

    /**
     * TOKEN ERROR
     */
    if (!tokenResponse.ok) {
      const tokenError =
        await tokenResponse.text();

      /**
       * UPDATE DB STATUS
       */
      await prisma.insuranceApplication.update(
        {
          where: {
            id: application.id,
          },

          data: {
            status: "FAILED",
          },
        },
      );

      throw new Error(
        `TK TOKEN ERROR: ${tokenError}`,
      );
    }

    /**
     * TOKEN
     */
    const token =
      await tokenResponse.text();

    /**
     * GET NSJ COOKIE
     */
    const setCookie =
      tokenResponse.headers.get(
        "set-cookie",
      ) || "";

    const nsjMatch =
      setCookie.match(
        /nsj=([^;]+)/,
      );

    const nsjCookie =
      nsjMatch?.[1];

    if (!nsjCookie) {
      /**
       * UPDATE DB STATUS
       */
      await prisma.insuranceApplication.update(
        {
          where: {
            id: application.id,
          },

          data: {
            status: "FAILED",
          },
        },
      );

      throw new Error(
        "NSJ cookie not found",
      );
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
      });

    /**
     * SUBMIT ERROR
     */
    if (!submitResponse.ok) {
      const errorText =
        await submitResponse.text();

      /**
       * UPDATE DB STATUS
       */
      await prisma.insuranceApplication.update(
        {
          where: {
            id: application.id,
          },

          data: {
            status: "FAILED",
          },
        },
      );

      throw new Error(
        `TK SUBMIT ERROR: ${errorText}`,
      );
    }

    /**
     * SAFE RESPONSE
     */
    const responseText =
      await submitResponse.text();

    let result: any;

    try {
      result =
        JSON.parse(responseText);
    } catch {
      result = {
        raw: responseText,
      };
    }

    console.log(
      "TK RESULT:",
      result,
    );

    /**
     * UPDATE DB SUCCESS
     */
    await prisma.insuranceApplication.update(
      {
        where: {
          id: application.id,
        },

        data: {
          status: "SUBMITTED",
        },
      },
    );

    /**
     * USER ACKNOWLEDGEMENT EMAIL
     */
    try {
      await resend.emails.send({
        from:
          "InsurBe <noreply@insurbe.com>",

        to:
          formData.personal.email,

        subject:
          "Your TK Application Was Received",

        html: `
          <div style="font-family:Arial,sans-serif;line-height:1.6;background:#f9fafb;padding:30px">
            
            <div style="max-width:600px;margin:auto;background:#ffffff;border-radius:12px;padding:30px;border:1px solid #eee">
              
              <h2 style="color:#0f766e;margin-bottom:10px;">
                Hi ${formData.personal.firstName},
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
        application.id,

      data: result,
    };
  } catch (error: any) {
    console.error(
      "TK SUBMIT ERROR:",
      error,
    );

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