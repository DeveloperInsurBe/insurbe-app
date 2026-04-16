import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(req: Request) {
  try {
    const { email, name, formType, pdfBase64, filename, orderId } =
      await req.json();

    if (!email) {
      return Response.json({ success: false, message: "Email required" });
    }

    const subjectMap: Record<string, string> = {
      public: "Public Health Insurance Application Received",
      private: "Private Health Insurance Application Received",
      expat: "Expat Health Insurance Application Received",
    };

    const subject = subjectMap[formType] || "Insurance Application Received";

    // 🔥 CLEAN BASE64 (VERY IMPORTANT)
    const cleanBase64 = pdfBase64
      ? pdfBase64.replace(/^data:.*;base64,/, "")
      : null;

    const data = await resend.emails.send({
      from: "InsurBe <noreply@insurbe.com>",
      to: email,
      subject: `${subject} (${orderId || ""})`,

      html: `
    <div style="font-family:Arial,sans-serif;line-height:1.6;background:#f9fafb;padding:30px">
      
      <div style="max-width:600px;margin:auto;background:#ffffff;border-radius:12px;padding:30px;border:1px solid #eee">
        
        <h2 style="color:#820ad1;margin-bottom:10px;">
          Hi ${name || "there"},
        </h2>

        <p style="font-size:16px;color:#333;margin-top:0;">
          <b>You’re All Set! Your InsurBe Submission Is Complete</b>
        </p>

        <p style="color:#555;">
          Thank you for choosing <b>InsurBe</b>.
        </p>

        <p style="color:#555;">
          Your insurance application has been successfully submitted, and a completed copy is attached to this email for your reference.
        </p>

        <div style="margin:25px 0;padding:20px;background:#f4f0ff;border-radius:10px;border:1px solid #e6dbff">
          <p style="margin:0;color:#5b21b6;font-weight:600;">
            📄 Your application PDF is attached to this email
          </p>
        </div>

        <p style="color:#555;">
          If you’d like help reviewing your options or making a decision, you can 
          <a href="https://insurbe.com/book-appointment" target="_blank" 
             style="color:#820ad1;text-decoration:underline;font-weight:500;">
             book a consultation
          </a> 
          with one of our insurance experts.
        </p>

        <p style="color:#555;">
          We’re here to make this process simple and clear for you.
        </p>

        <br/>

        <p style="color:#333;">
          Warm regards,<br/>
          <b>Team InsurBe</b>
        </p>

      </div>

    </div>
  `,

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
