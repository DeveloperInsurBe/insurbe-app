import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { Resend } from "resend";

import { prisma } from "@/lib/prisma";
import { authOptions } from "@/lib/authOptions";
import {
  normalizeBankDetails,
  payoutMethodForCountry,
  validateBankDetails,
} from "@/lib/bankDetails";

const resend = new Resend(process.env.RESEND_API_KEY);

// Only these columns may be written from the client (never id / userId).
const EDITABLE_FIELDS = [
  "title",
  "position",
  "firstName",
  "lastName",
  "countryCode",
  "phone",
  "email",
  "companyName",
  "companyDescription",
  "addressType",
  "streetName",
  "streetNumber",
  "postalCode",
  "city",
  "careOfAddress",
  "country",
  "accountHolder",
  "recipientStreet",
  "recipientZip",
  "recipientCity",
  "recipientCountry",
  "iban",
  "bicSwift",
  "accountNumber",
  "ifscCode",
  "bankName",
  "currency",
  "additionalInfo",
] as const;

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
      return NextResponse.json(
        {
          error: "Your session has expired. Please log in again.",
        },
        {
          status: 401,
        },
      );
    }

    const body = await req.json().catch(() => null);

    if (!body || typeof body !== "object") {
      return NextResponse.json(
        {
          error:
            "We could not read your details. Please refresh the page and try again.",
        },
        {
          status: 400,
        },
      );
    }

    const user = await prisma.user.findUnique({
      where: {
        email: session.user.email,
      },
    });

    if (!user) {
      return NextResponse.json(
        {
          error: "We could not find your account. Please log in again.",
        },
        {
          status: 404,
        },
      );
    }

    const data: Record<string, string> = {};
    for (const field of EDITABLE_FIELDS) {
      if (typeof body?.[field] === "string") data[field] = body[field];
    }

    // The recipient country alone decides the payout format (never the client).
    const payoutMethod = payoutMethodForCountry(data.recipientCountry);

    const fieldErrors = validateBankDetails(payoutMethod, data);
    if (Object.keys(fieldErrors).length > 0) {
      return NextResponse.json(
        {
          error: Object.values(fieldErrors)[0] ?? "Please check your bank details and try again.",
          fieldErrors,
        },
        {
          status: 400,
        },
      );
    }

    Object.assign(data, normalizeBankDetails(payoutMethod, data));

    const profile = await prisma.partnerProfile.upsert({
      where: {
        userId: user.id,
      },

      update: data,

      create: {
        userId: user.id,
        ...data,
      },
    });

    let mailSent = false;

    try {
      const recipientEmail = profile.email || user.email;

      if (recipientEmail) {
        await resend.emails.send({
          from: "InsurBe <noreply@insurbe.com>",
          to: recipientEmail,
          subject: "Partner profile updated successfully",
          html: `
            <div style="font-family:Arial,sans-serif;line-height:1.6;background:#f6f5fb;padding:28px;">
              <div style="max-width:640px;margin:auto;background:#ffffff;border-radius:14px;padding:30px;border:1px solid #ece7fa;">
                <div style="display:inline-block;padding:6px 12px;border-radius:999px;background:#f4efff;color:#6d28d9;font-weight:700;font-size:12px;letter-spacing:0.08em;text-transform:uppercase;">
                  Profile Saved
                </div>

                <h2 style="margin:16px 0 8px;color:#111827;font-size:28px;line-height:1.2;">
                  Hello ${profile.firstName || user.firstName || "Partner"},
                </h2>

                <p style="margin:0;color:#4b5563;font-size:15px;">
                  Your partner data has been updated successfully in the InsurBe portal.
                </p>

                <div style="margin:22px 0;padding:18px;border-radius:12px;background:#faf7ff;border:1px solid #e9ddff;">
                  <p style="margin:0 0 8px;color:#6d28d9;font-weight:700;">Updated Profile Snapshot</p>
                  <p style="margin:4px 0;color:#374151;"><b>Partner ID:</b> ${user.partnerId || "-"}</p>
                  <p style="margin:4px 0;color:#374151;"><b>Name:</b> ${(profile.firstName || "").trim()} ${(profile.lastName || "").trim()}</p>
                  <p style="margin:4px 0;color:#374151;"><b>Company:</b> ${profile.companyName || user.companyName || "-"}</p>
                  <p style="margin:4px 0;color:#374151;"><b>Email:</b> ${profile.email || user.email}</p>
                  <p style="margin:4px 0;color:#374151;"><b>Phone:</b> ${(profile.countryCode || "") + " " + (profile.phone || "")}</p>
                </div>

                <p style="margin:20px 0 0;color:#4b5563;font-size:14px;">
                  If you did not make this change, please contact us at
                  <a href="mailto:info@insurbe.com" style="color:#7c3aed;text-decoration:none;font-weight:600;"> info@insurbe.com</a>.
                </p>

                <p style="margin:18px 0 0;color:#111827;font-size:14px;">
                  Regards,<br /><b>Team InsurBe</b>
                </p>
              </div>
            </div>
          `,
        });
        mailSent = true;
      }
    } catch (mailError) {
      console.error("PARTNER PROFILE ACK MAIL ERROR:", mailError);
    }

    return NextResponse.json({
      success: true,
      profile,
      mailSent,
    });
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      {
        error: "We could not save your details right now. Please try again in a moment.",
      },
      {
        status: 500,
      },
    );
  }
}
