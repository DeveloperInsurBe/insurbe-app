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
    <div style="font-family:Arial,sans-serif;line-height:1.6;background:#f9fafb;padding:30px">
      
      <div style="max-width:600px;margin:auto;background:#ffffff;border-radius:12px;padding:30px;border:1px solid #eee">
        
        <h2 style="color:#820ad1;margin-bottom:10px;">
          Hi ${name},
        </h2>

        <p style="font-size:16px;color:#333;margin-top:0;">
          Welcome to <b>InsurBe</b> 🎉
        </p>

        <p style="color:#555;">
          We’re excited to have you on board.
        </p>

        <p style="color:#555;">
          Your account has been successfully created, and you’re now ready to explore everything InsurBe has to offer.
        </p>

        <div style="margin:25px 0;padding:20px;background:#f4f0ff;border-radius:10px;border:1px solid #e6dbff">
          <h3 style="margin-top:0;color:#5b21b6;">
            Your Login Credentials
          </h3>

          <p style="margin:6px 0;"><b>Email:</b> ${email}</p>
          <p style="margin:6px 0;"><b>Password:</b> ${password}</p>
        </div>

        <p style="color:#555;">
          For your security, we strongly recommend updating your password after your first login.
        </p>

        <p style="color:#555;">
          If you need any assistance, our team is always here to help.
        </p>

        <br/>

        <p style="color:#333;">
          Looking forward to supporting you,<br/>
          <b>Team InsurBe</b>
        </p>

      </div>

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
