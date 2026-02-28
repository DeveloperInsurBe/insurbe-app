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
    <p>You requested a password reset.</p>
    <p>
      <a href="${resetLink}">Click here to reset your password</a>
    </p>
    <p>This link will expire in 15 minutes.</p>
  `,
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
