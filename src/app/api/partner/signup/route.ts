import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { Resend } from "resend";
import { prisma } from "@/lib/prisma";

const resend = new Resend(process.env.RESEND_API_KEY);

function generatePartnerId() {
  const random = Math.floor(100000 + Math.random() * 900000);
  return `PRT${random}`;
}

async function sendPartnerAcknowledgementEmail(params: {
  email: string;
  firstName: string;
  companyName: string;
  partnerId: string;
}) {
  const { email, firstName, companyName, partnerId } = params;

  const loginUrl = `${process.env.NEXTAUTH_URL || "https://insurbe.com"}/partner/login`;

  await resend.emails.send({
    from: "InsurBe <noreply@insurbe.com>",
    to: email,
    subject: "Welcome to the InsurBe Partner Program",
    html: `
      <div style="font-family:Arial,sans-serif;line-height:1.6;background:#f6f5fb;padding:28px;">
        <div style="max-width:640px;margin:auto;background:#ffffff;border-radius:14px;padding:30px;border:1px solid #ece7fa;">
          <div style="display:inline-block;padding:6px 12px;border-radius:999px;background:#f4efff;color:#6d28d9;font-weight:700;font-size:12px;letter-spacing:0.08em;text-transform:uppercase;">
            Partner Signup Successful
          </div>

          <h2 style="margin:16px 0 8px;color:#111827;font-size:28px;line-height:1.2;">
            Welcome to InsurBe, ${firstName}
          </h2>

          <p style="margin:0;color:#4b5563;font-size:15px;">
            Your partner account has been created successfully. We are excited to have <b>${companyName}</b> in our partner network.
          </p>

          <div style="margin:22px 0;padding:18px;border-radius:12px;background:#faf7ff;border:1px solid #e9ddff;">
            <p style="margin:0 0 8px;color:#6d28d9;font-weight:700;">Partner Account Details</p>
            <p style="margin:4px 0;color:#374151;"><b>Partner ID:</b> ${partnerId}</p>
            <p style="margin:4px 0;color:#374151;"><b>Registered Email:</b> ${email}</p>
          </div>

          <a href="${loginUrl}" style="display:inline-block;margin-top:4px;padding:12px 18px;border-radius:10px;background:linear-gradient(135deg,#7c3aed 0%,#a855f7 100%);color:#ffffff;text-decoration:none;font-weight:700;">
            Go to Partner Login
          </a>

          <p style="margin:20px 0 0;color:#4b5563;font-size:14px;">
            If you need help getting started, our team is here for you at
            <a href="mailto:info@insurbe.com" style="color:#7c3aed;text-decoration:none;font-weight:600;"> info@insurbe.com</a>.
          </p>

          <p style="margin:18px 0 0;color:#111827;font-size:14px;">
            Regards,<br /><b>Team InsurBe</b>
          </p>
        </div>
      </div>
    `,
  });
}

export async function POST(req: Request) {
  try {
    const body = await req.json();

    const {
      companyName,
      title,
      firstName,
      lastName,
      email,
      password,
      confirmPassword,
      partnerType,
    } = body;
    const normalizedEmail = String(email || "").trim().toLowerCase();

    // Validation
    if (
      !companyName ||
      !title ||
      !firstName ||
      !lastName ||
      !normalizedEmail ||
      !password ||
      !confirmPassword
    ) {
      return NextResponse.json(
        { message: "All fields are required" },
        { status: 400 },
      );
    }

    // Password Match
    if (password !== confirmPassword) {
      return NextResponse.json(
        { message: "Passwords do not match" },
        { status: 400 },
      );
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    // Existing User Check
    const existingUser = await prisma.user.findUnique({
      where: { email: normalizedEmail },
    });

    if (existingUser) {
      // Already Partner
      if (existingUser.role === "partner") {
        return NextResponse.json(
          { message: "Partner account already exists" },
          { status: 409 },
        );
      }

      // Upgrade existing user to partner
      const updatedUser = await prisma.user.update({
        where: {
          email: normalizedEmail,
        },
        data: {
          companyName,
          title,
          firstName,
          lastName,
          password: hashedPassword,

          role: "partner",

          partnerId: generatePartnerId(),
        },
      });

      if (partnerType) {
        await prisma.partnerProfile.upsert({
          where: { userId: updatedUser.id },
          update: { position: partnerType },
          create: { userId: updatedUser.id, position: partnerType },
        });
      }

      try {
        await sendPartnerAcknowledgementEmail({
          email: updatedUser.email,
          firstName: updatedUser.firstName || "Partner",
          companyName: updatedUser.companyName || "Your Company",
          partnerId: updatedUser.partnerId || "",
        });
      } catch (mailError) {
        console.error("PARTNER SIGNUP MAIL ERROR:", mailError);
      }

      return NextResponse.json(
        {
          message: "Partner account created successfully",
          partnerId: updatedUser.partnerId,
        },
        { status: 200 },
      );
    }

    // Create Partner
    const partner = await prisma.user.create({
      data: {
        companyName,
        title,
        firstName,
        lastName,
        email: normalizedEmail,
        password: hashedPassword,

        role: "partner",

        partnerId: generatePartnerId(),
      },
    });

    if (partnerType) {
      await prisma.partnerProfile.upsert({
        where: { userId: partner.id },
        update: { position: partnerType },
        create: { userId: partner.id, position: partnerType },
      });
    }

    try {
      await sendPartnerAcknowledgementEmail({
        email: partner.email,
        firstName: partner.firstName || "Partner",
        companyName: partner.companyName || "Your Company",
        partnerId: partner.partnerId || "",
      });
    } catch (mailError) {
      console.error("PARTNER SIGNUP MAIL ERROR:", mailError);
    }

    return NextResponse.json(
      {
        message: "Partner account created successfully",
        partnerId: partner.partnerId,
      },
      { status: 201 },
    );
  } catch (error) {
    console.error("PARTNER SIGNUP ERROR:", error);

    return NextResponse.json(
      { message: "Something went wrong" },
      { status: 500 },
    );
  }
}
