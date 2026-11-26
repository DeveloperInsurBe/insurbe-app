import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import crypto from "crypto";
import { Resend } from "resend";

import { passwordProblem, RESET_PORTALS, toResetPortal } from "@/lib/passwordReset";
import { prisma } from "@/lib/prisma";

const resend = new Resend(process.env.RESEND_API_KEY);

/** Tells the owner their password changed, so a reset they didn't make doesn't go unnoticed. */
async function sendPasswordChangedEmail(email: string, loginUrl: string) {
  try {
    await resend.emails.send({
      from: "no-reply@insurbe.com",
      to: email,
      subject: "Your InsurBe password was changed",
      html: `
  <div style="font-family: Arial, sans-serif; background-color: #f4f6fb; padding: 40px 20px;">
    <div style="max-width: 520px; margin: auto; background: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 10px 30px rgba(0,0,0,0.08);">
      <div style="background: linear-gradient(90deg, #6D28D9, #9333EA); padding: 24px; text-align: center;">
        <h2 style="color: white; margin: 0; font-weight: 600;">Insurbe</h2>
      </div>
      <div style="padding: 32px 28px; color: #333;">
        <h3 style="margin-top: 0; font-size: 20px;">Your password was changed</h3>
        <p style="font-size: 15px; line-height: 1.6;">The password of your InsurBe account was just changed. You can now sign in with your new password.</p>
        <p style="font-size: 15px; line-height: 1.6;"><a href="${loginUrl}" style="color: #6D28D9; font-weight: 600;">Go to login</a></p>
        <p style="font-size: 14px; color: #666;">If you did not do this, please contact us right away at <a href="mailto:support@insurbe.com" style="color: #6D28D9;">support@insurbe.com</a>.</p>
      </div>
    </div>
  </div>`,
    });
  } catch (mailError) {
    console.error("PASSWORD CHANGED EMAIL FAILED:", mailError);
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => ({}));
    const token = typeof body?.token === "string" ? body.token : "";
    const password = body?.password;
    const portal = toResetPortal(body?.portal);

    if (!token || !password) {
      return NextResponse.json(
        { message: "Invalid request" },
        { status: 400 }
      );
    }

    const problem = passwordProblem(password);
    if (problem) {
      return NextResponse.json({ message: problem }, { status: 400 });
    }

    const hashedToken = crypto
      .createHash("sha256")
      .update(token)
      .digest("hex");

    // 🔑 Find user by reset token
    const user = await prisma.user.findFirst({
      where: {
        resetToken: hashedToken,
        resetTokenExpiry: { gt: new Date() },
      },
      select: { id: true, email: true, role: true },
    });

    // A link from the partner / Sales Leader login only works for those accounts.
    const rule = RESET_PORTALS[portal];
    if (!user || (rule.roles && !rule.roles.includes(user.role ?? ""))) {
      return NextResponse.json(
        { message: "Token invalid or expired" },
        { status: 400 }
      );
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    // 🔑 Update password & clear reset fields
    await prisma.user.update({
      where: { id: user.id },
      data: {
        password: hashedPassword,
        resetToken: null,
        resetTokenExpiry: null,
      },
    });

    const loginUrl = `${process.env.NEXTAUTH_URL || "https://insurbe.com"}${rule.loginUrl}`;
    await sendPasswordChangedEmail(user.email, loginUrl);

    return NextResponse.json(
      { message: "Password reset successful", loginUrl: rule.loginUrl },
      { status: 200 }
    );
  } catch (err) {
    console.error("RESET PASSWORD ERROR:", err);
    return NextResponse.json(
      { message: "Something went wrong" },
      { status: 500 }
    );
  }
}
