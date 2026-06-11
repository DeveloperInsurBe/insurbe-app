import bcrypt from "bcryptjs";
import { Prisma } from "@prisma/client";
import { Resend } from "resend";

import { prisma } from "@/lib/prisma";

const resend = new Resend(process.env.RESEND_API_KEY);

function generatePassword() {
  const upper = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
  const lower = "abcdefghijklmnopqrstuvwxyz";
  const numbers = "0123456789";
  const special = "!@#$%^&*";
  const all = upper + lower + numbers + special;

  let password =
    upper[Math.floor(Math.random() * upper.length)] +
    lower[Math.floor(Math.random() * lower.length)] +
    numbers[Math.floor(Math.random() * numbers.length)] +
    special[Math.floor(Math.random() * special.length)];

  for (let i = 4; i < 10; i++) {
    password += all[Math.floor(Math.random() * all.length)];
  }

  return password
    .split("")
    .sort(() => Math.random() - 0.5)
    .join("");
}

type EnsureUserAccountInput = {
  email?: string | null;
  firstName?: string | null;
  lastName?: string | null;
};

export async function ensureApplicationUserAccount({
  email,
  firstName,
  lastName,
}: EnsureUserAccountInput) {
  const normalizedEmail = email?.trim().toLowerCase();

  if (!normalizedEmail) return;

  const existingUser = await prisma.user.findUnique({
    where: { email: normalizedEmail },
  });

  if (existingUser) return;

  const plainPassword = generatePassword();
  const hashedPassword = await bcrypt.hash(plainPassword, 10);

  try {
    await prisma.user.create({
      data: {
        email: normalizedEmail,
        password: hashedPassword,
        firstName: firstName || undefined,
        lastName: lastName || undefined,
      },
    });
  } catch (error) {
    // If another request created the same user concurrently, treat as success.
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === "P2002"
    ) {
      return;
    }
    throw error;
  }

  try {
    await resend.emails.send({
      from: "InsurBe <noreply@insurbe.com>",
      to: normalizedEmail,
      subject: "Welcome to InsurBe",
      html: `
        <div style="font-family:Arial,sans-serif;line-height:1.6;background:#f9fafb;padding:30px">
          <div style="max-width:600px;margin:auto;background:#ffffff;border-radius:12px;padding:30px;border:1px solid #eee">
            <h2 style="color:#820ad1;margin-bottom:10px;">Hi ${firstName || "there"},</h2>
            <p style="font-size:16px;color:#333;margin-top:0;">Welcome to <b>InsurBe</b>.</p>
            <p style="color:#555;">Your account has been created successfully.</p>
            <div style="margin:25px 0;padding:20px;background:#f4f0ff;border-radius:10px;border:1px solid #e6dbff">
              <h3 style="margin-top:0;color:#5b21b6;">Your Login Credentials</h3>
              <p style="margin:6px 0;"><b>Email:</b> ${normalizedEmail}</p>
              <p style="margin:6px 0;"><b>Password:</b> ${plainPassword}</p>
            </div>
            <p style="color:#555;">For security, please update your password after first login.</p>
            <p style="color:#333;"><b>Team InsurBe</b></p>
          </div>
        </div>
      `,
    });
  } catch (emailError) {
    // Do not fail the main submission flow if email sending fails.
    console.error("Failed to send credentials email:", emailError);
  }
}
