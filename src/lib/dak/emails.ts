import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

const FROM = "InsurBe <noreply@insurbe.com>";
export const DAK_SUPPORT_EMAIL = "support@insurbe.com";

const escapeHtml = (value: string) =>
  value.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");

const paragraphs = (value: string) =>
  escapeHtml(value)
    .split(/\n{2,}/)
    .map((part) => `<p style="margin:0 0 12px">${part.replace(/\n/g, "<br>")}</p>`)
    .join("");

const formatDate = (value: Date | string) =>
  new Intl.DateTimeFormat("en-GB", { day: "2-digit", month: "long", year: "numeric", timeZone: "Europe/Berlin" }).format(
    typeof value === "string" ? new Date(value) : value,
  );

function layout(title: string, body: string) {
  return `
    <div style="font-family:Arial,sans-serif;line-height:1.6;background:#f9fafb;padding:30px">
      <div style="max-width:600px;margin:auto;background:#ffffff;border-radius:12px;padding:32px;color:#1f2937">
        <h2 style="margin:0 0 16px;color:#820ad1">${title}</h2>
        ${body}
        <p style="margin:24px 0 0;color:#6b7280;font-size:13px">
          Questions? Reply to this email or write to ${DAK_SUPPORT_EMAIL}.<br>Your InsurBe team
        </p>
      </div>
    </div>`;
}

async function send(options: Parameters<typeof resend.emails.send>[0]) {
  const { error } = await resend.emails.send(options);
  if (error) throw new Error(`Resend: ${error.message}`);
}

type Customer = { email: string; name: string; caseNumber: string };

export function sendDakInfoRequestEmail(
  customer: Customer,
  request: { message: string; relatedField?: string | null; dueDate?: Date | null },
) {
  return send({
    from: FROM,
    to: customer.email,
    replyTo: DAK_SUPPORT_EMAIL,
    subject: `Information needed for your DAK application ${customer.caseNumber}`,
    html: layout(
      "We need a little more information",
      `<p style="margin:0 0 12px">Dear ${escapeHtml(customer.name)},</p>
       <p style="margin:0 0 12px">DAK is reviewing your application <b>${customer.caseNumber}</b> and needs the following${
         request.relatedField ? ` regarding <b>${escapeHtml(request.relatedField)}</b>` : ""
       }:</p>
       <div style="background:#f5f3ff;border-radius:8px;padding:16px;margin:0 0 16px">${paragraphs(request.message)}</div>
       ${request.dueDate ? `<p style="margin:0 0 12px">Please send it by <b>${formatDate(request.dueDate)}</b>.</p>` : ""}
       <p style="margin:0">Reply to this email with the requested information or documents.</p>`,
    ),
  });
}

export function sendDakClosedEmail(customer: Customer, outcome: "Cancelled" | "Not Eligible", reason: string) {
  const cancelled = outcome === "Cancelled";
  return send({
    from: FROM,
    to: customer.email,
    replyTo: DAK_SUPPORT_EMAIL,
    subject: cancelled
      ? `Your DAK application ${customer.caseNumber} was cancelled`
      : `Update on your DAK application ${customer.caseNumber}`,
    html: layout(
      cancelled ? "Your application was cancelled" : "Your application could not be accepted",
      `<p style="margin:0 0 12px">Dear ${escapeHtml(customer.name)},</p>
       <p style="margin:0 0 12px">${
         cancelled
           ? `Your DAK application <b>${customer.caseNumber}</b> was cancelled.`
           : `After reviewing your application <b>${customer.caseNumber}</b>, DAK has decided that you are not eligible for membership.`
       }</p>
       <div style="background:#f5f3ff;border-radius:8px;padding:16px;margin:0 0 16px"><b>Reason</b>${paragraphs(reason)}</div>
       ${cancelled ? `<p style="margin:0">You are welcome to submit a new application at any time.</p>` : ""}`,
    ),
  });
}

export function sendDakActiveEmail(
  customer: Customer,
  allocation: { membershipNumber: string; kvnr?: string | null; startDate: string },
  letter?: { filename: string; content: Buffer },
) {
  return send({
    from: FROM,
    to: customer.email,
    replyTo: DAK_SUPPORT_EMAIL,
    subject: `Welcome to DAK – your membership is active (${customer.caseNumber})`,
    html: layout(
      "Your DAK membership is active",
      `<p style="margin:0 0 12px">Dear ${escapeHtml(customer.name)},</p>
       <p style="margin:0 0 12px">Good news: DAK has confirmed your health insurance.</p>
       <table style="border-collapse:collapse;margin:0 0 16px">
         <tr><td style="padding:4px 16px 4px 0;color:#6b7280">Membership number</td><td><b>${escapeHtml(allocation.membershipNumber)}</b></td></tr>
         ${allocation.kvnr ? `<tr><td style="padding:4px 16px 4px 0;color:#6b7280">Health insurance number (KVNR)</td><td><b>${escapeHtml(allocation.kvnr)}</b></td></tr>` : ""}
         <tr><td style="padding:4px 16px 4px 0;color:#6b7280">Insured from</td><td><b>${formatDate(allocation.startDate)}</b></td></tr>
       </table>
       ${letter ? `<p style="margin:0">Your membership confirmation letter is attached.</p>` : ""}`,
    ),
    attachments: letter ? [letter] : undefined,
  });
}

export function sendDakSupportTicketEmail(ticket: { reviewerName: string; reviewerEmail: string; subject: string; message: string }) {
  return send({
    from: FROM,
    to: DAK_SUPPORT_EMAIL,
    replyTo: ticket.reviewerEmail,
    subject: `[DAK Portal] ${ticket.subject}`,
    html: layout(
      "New message from the DAK portal",
      `<p style="margin:0 0 12px"><b>${escapeHtml(ticket.reviewerName)}</b> (${escapeHtml(ticket.reviewerEmail)}) wrote:</p>
       <div style="background:#f5f3ff;border-radius:8px;padding:16px">${paragraphs(ticket.message)}</div>`,
    ),
  });
}
