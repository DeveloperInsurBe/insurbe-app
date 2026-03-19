import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(req: Request) {
  try {
    const {
      email,
      name,
      formType,
      pdfBase64,
      filename,
      orderId,
    } = await req.json();

    if (!email) {
      return Response.json({ success: false, message: "Email required" });
    }

    const subjectMap: Record<string, string> = {
      public: "Public Health Insurance Application Received",
      private: "Private Health Insurance Application Received",
      expat: "Expat Health Insurance Application Received",
    };

    const subject =
      subjectMap[formType] || "Insurance Application Received";

    // 🔥 CLEAN BASE64 (VERY IMPORTANT)
    const cleanBase64 = pdfBase64
      ? pdfBase64.replace(/^data:.*;base64,/, "")
      : null;

    const data = await resend.emails.send({
      from: "InsurBe <noreply@insurbe.com>",
      to: email,
      subject: `${subject} (${orderId || ""})`,

      html: `
        <div style="font-family:Arial,sans-serif;line-height:1.6">
          <h2 style="color:#820ad1;">Hi ${name || "there"},</h2>

          <p>Thank you for submitting your <b>InsurBe insurance</b> application.</p>

          <p>Please find your completed application attached as a PDF.</p>

          <br/>
          <p style="color:#666;font-size:14px">
            If you have any questions, feel free to reply to this email.
          </p>

          <br/>

          <p>Best regards,<br/>
          <b>InsurBe Team</b></p>
        </div>
      `,

      // 🔥 ATTACHMENT (THIS WAS MISSING)
      attachments: cleanBase64
        ? [
            {
              filename: filename || "Application.pdf",
              content: cleanBase64,
            },
          ]
        : [],
    });

    if (data.error) {
      console.error("❌ Email error:", data.error);
      return Response.json({ success: false });
    }

    console.log("📧 Email sent with PDF");

    return Response.json({ success: true });

  } catch (error) {
    console.error("❌ Email API error:", error);
    return Response.json({ success: false });
  }
}