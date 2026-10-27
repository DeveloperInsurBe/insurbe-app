import { NextResponse } from "next/server";

import { requireDakReviewer } from "@/lib/dak/access";
import { sendDakSupportTicketEmail } from "@/lib/dak/emails";
import { prisma } from "@/lib/prisma";

/** The reviewer's own support messages. */
export async function GET() {
  const { reviewer, response } = await requireDakReviewer();
  if (response) return response;

  const tickets = await prisma.dakSupportTicket.findMany({
    where: { reviewerId: reviewer.id },
    orderBy: { createdAt: "desc" },
    take: 50,
  });
  return NextResponse.json({
    tickets: tickets.map((ticket) => ({
      id: ticket.id,
      subject: ticket.subject,
      message: ticket.message,
      status: ticket.status,
      createdAt: ticket.createdAt.toISOString(),
    })),
  });
}

/** Sends a message to InsurBe support. */
export async function POST(req: Request) {
  const { reviewer, response } = await requireDakReviewer();
  if (response) return response;

  const body = await req.json().catch(() => ({}));
  const subject = String(body?.subject || "").trim().slice(0, 200);
  const message = String(body?.message || "").trim().slice(0, 5000);
  if (!subject || !message) {
    return NextResponse.json({ error: "Please enter a subject and a message." }, { status: 400 });
  }

  const ticket = await prisma.dakSupportTicket.create({
    data: { reviewerId: reviewer.id, reviewerEmail: reviewer.email, subject, message },
  });

  let emailSent = false;
  try {
    await sendDakSupportTicketEmail({ reviewerName: reviewer.name, reviewerEmail: reviewer.email, subject, message });
    emailSent = true;
  } catch (error) {
    console.error("DAK PORTAL SUPPORT EMAIL FAILED:", ticket.id, error);
  }

  return NextResponse.json({ id: ticket.id, emailSent });
}
