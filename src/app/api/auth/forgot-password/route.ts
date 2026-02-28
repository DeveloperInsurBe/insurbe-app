import { NextResponse } from "next/server";
import crypto from "crypto";
import { prisma } from "@/lib/prisma";
import { Resend } from "resend";

console.log("RESEND KEY:", process.env.RESEND_API_KEY);
const resend = new Resend(process.env.RESEND_API_KEY);
console.log("RESEND KEY:", process.env.RESEND_API_KEY);

console.log("FORGOT PASSWORD API HIT");
export async function POST(req: Request) {
  try {
    const { email } = await req.json();

    if (!email) {
      return NextResponse.json(
        { message: "Email is required" },
        { status: 400 },
      );
    }

    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      return NextResponse.json(
        { message: "If the email exists, reset link will be sent" },
        { status: 200 },
      );
    }

    const token = crypto.randomBytes(32).toString("hex");
    const hashedToken = crypto.createHash("sha256").update(token).digest("hex");

    await prisma.user.update({
      where: { email },
      data: {
        resetToken: hashedToken as any,
        resetTokenExpiry: new Date(Date.now() + 15 * 60 * 1000),
      } as any,
    });

    const resetLink = `${process.env.NEXTAUTH_URL}/reset-password?token=${token}`;

    // ✅ SEND EMAIL
   const result = await resend.emails.send({
  from: "no-reply@insurbe.com",
  to: email,
  subject: "Reset your password",
html: `
  <div style="font-family: Arial, sans-serif; background-color: #f4f6fb; padding: 40px 20px;">
    <div style="max-width: 520px; margin: auto; background: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 10px 30px rgba(0,0,0,0.08);">

      <!-- Header -->
      <div style="background: linear-gradient(90deg, #6D28D9, #9333EA); padding: 24px; text-align: center;">
      
        <h2 style="color: white; margin: 0; font-weight: 600;">Insurbe</h2>
      </div>

      <!-- Body -->
      <div style="padding: 32px 28px; color: #333;">
        <h3 style="margin-top: 0; font-size: 20px;">Reset Your Password</h3>

        <p style="font-size: 15px; line-height: 1.6;">
          We received a request to reset your password.
          Click the button below to create a new one.
        </p>

        <!-- Button -->
        <div style="text-align: center; margin: 30px 0;">
          <a href="${resetLink}" 
             style="background: linear-gradient(90deg, #6D28D9, #9333EA); 
                    color: #ffffff; 
                    padding: 14px 28px; 
                    text-decoration: none; 
                    border-radius: 10px; 
                    font-weight: 600; 
                    display: inline-block;">
            Reset Password
          </a>
        </div>

        <p style="font-size: 14px; color: #666;">
          This link will expire in <strong>15 minutes</strong> for security reasons.
        </p>

        <p style="font-size: 14px; color: #666;">
          If you didn’t request a password reset, you can safely ignore this email.
        </p>

      </div>

      <!-- Footer -->
      <div style="background: #f9fafb; padding: 20px; text-align: center; font-size: 12px; color: #888;">
        © ${new Date().getFullYear()} Insurbe. All rights reserved.
      </div>

    </div>
  </div>
`
});

console.log("RESEND RESULT:", result);

    return NextResponse.json(
      { message: "Reset link sent if email exists" },
      { status: 200 },
    );
  } catch (err) {
    console.error("FORGOT PASSWORD ERROR:", err);
    return NextResponse.json(
      { message: "Something went wrong" },
      { status: 500 },
    );
  }
}
