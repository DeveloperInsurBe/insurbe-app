import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(req: Request) {
  try {
    const { email, name, password } = await req.json();

    const data = await resend.emails.send({
      from: "InsurBe <noreply@insurbe.com>",
      to: email,
      subject: "Welcome to InsurBe 🎉",

      html: `
        <div style="font-family:Arial,sans-serif;line-height:1.6">
          <h2 style="color:#820ad1;">Hi ${name},</h2>

          <p>Welcome to <b>InsurBe</b> 🎉</p>

          <p>Your account has been created successfully.</p>

          <h3>Your Login Credentials:</h3>

          <p><b>Email:</b> ${email}</p>
          <p><b>Password:</b> ${password}</p>

          <p style="color:#666;font-size:14px">
            You can change your password after logging in.
          </p>

          <br/>

          <p>Best regards,<br/>
          <b>InsurBe Team</b></p>
        </div>
      `,
    });

    if (data.error) {
      return Response.json({ success: false });
    }

    return Response.json({ success: true });
  } catch (err) {
    console.error(err);
    return Response.json({ success: false });
  }
}