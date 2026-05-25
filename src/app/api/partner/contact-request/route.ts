export const runtime = "nodejs";

import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { Resend } from "resend";

import { authOptions } from "@/lib/authOptions";
import { prisma } from "@/lib/prisma";

const resend = new Resend(process.env.RESEND_API_KEY);

const ALLOWED_CATEGORIES = new Set([
  "General Questions",
  "Request for a Webinar",
  "Request for a Landing Page",
]);

const MAX_FILE_SIZE_BYTES = 5 * 1024 * 1024;
const ALLOWED_FILE_TYPES = new Set([
  "application/pdf",
  "image/jpeg",
  "image/png",
  "image/webp",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
]);

function escapeHtml(input: string) {
  return input
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.email || session.user.role !== "partner") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const form = await req.formData();

    const category = String(form.get("category") || "").trim();
    const email = String(form.get("email") || "").trim();
    const subject = String(form.get("subject") || "").trim();
    const description = String(form.get("description") || "").trim();
    const consent = String(form.get("consent") || "").trim() === "true";

    if (!ALLOWED_CATEGORIES.has(category)) {
      return NextResponse.json({ error: "Invalid category selected." }, { status: 400 });
    }

    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return NextResponse.json({ error: "Valid email is required." }, { status: 400 });
    }

    if (!subject) {
      return NextResponse.json({ error: "Subject is required." }, { status: 400 });
    }

    if (!description || description.length < 10) {
      return NextResponse.json(
        { error: "Description must be at least 10 characters." },
        { status: 400 },
      );
    }

    if (!consent) {
      return NextResponse.json({ error: "Consent is required." }, { status: 400 });
    }

    const files = form.getAll("files").filter((item): item is File => item instanceof File);

    for (const file of files) {
      if (!ALLOWED_FILE_TYPES.has(file.type)) {
        return NextResponse.json({ error: `Unsupported file type: ${file.name}` }, { status: 400 });
      }

      if (file.size > MAX_FILE_SIZE_BYTES) {
        return NextResponse.json(
          { error: `File too large: ${file.name}. Max size is 5 MB.` },
          { status: 400 },
        );
      }
    }

    const partner = await prisma.user.findUnique({
      where: { email: session.user.email },
      include: { partnerProfile: true },
    });

    const partnerName =
      `${partner?.partnerProfile?.firstName || partner?.firstName || ""} ${
        partner?.partnerProfile?.lastName || partner?.lastName || ""
      }`.trim() || "Partner";

    const attachments = await Promise.all(
      files.map(async (file) => ({
        filename: file.name,
        content: Buffer.from(await file.arrayBuffer()),
      })),
    );

    await resend.emails.send({
      from: "InsurBe <noreply@insurbe.com>",
      to: "pradeep.k@insurbe.com",
      replyTo: email,
      subject: `Partner Contact Request - ${category}`,
      html: `
        <div style="font-family:Arial,sans-serif;line-height:1.6;padding:20px">
          <h2>New Partner Contact Request</h2>
          <table cellpadding="10" cellspacing="0" border="1" style="border-collapse:collapse;width:100%;margin-top:20px;">
            <tr>
              <td><b>Partner Name</b></td>
              <td>${escapeHtml(partnerName)}</td>
            </tr>
            <tr>
              <td><b>Partner Email (Account)</b></td>
              <td>${escapeHtml(session.user.email)}</td>
            </tr>
            <tr>
              <td><b>Partner ID</b></td>
              <td>${escapeHtml(partner?.partnerId || "-")}</td>
            </tr>
            <tr>
              <td><b>Category</b></td>
              <td>${escapeHtml(category)}</td>
            </tr>
            <tr>
              <td><b>Reply Email</b></td>
              <td>${escapeHtml(email)}</td>
            </tr>
            <tr>
              <td><b>Subject</b></td>
              <td>${escapeHtml(subject)}</td>
            </tr>
            <tr>
              <td><b>Description</b></td>
              <td>${escapeHtml(description).replaceAll("\n", "<br />")}</td>
            </tr>
            <tr>
              <td><b>Submitted At</b></td>
              <td>${new Date().toISOString()}</td>
            </tr>
          </table>
        </div>
      `,
      attachments,
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Partner contact request error:", error);
    return NextResponse.json({ error: "Failed to submit request." }, { status: 500 });
  }
}
