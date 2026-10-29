import { prisma } from "../prisma";
import { DAK_REVIEWER_ROLE } from "./access";
import { sendDakReviewerAlert } from "./emails";

const siteUrl = () => (process.env.NEXTAUTH_URL || process.env.NEXT_PUBLIC_APP_URL || "https://insurbe.com").replace(/\/+$/, "");

/**
 * Emails every active DAK reviewer about a new application or a customer
 * reply. Never throws: an alert must not break the submission or the reply.
 * Local testing: APPLICATIONS_TEAM_EMAIL_OVERRIDE sends the alert only there.
 */
export async function notifyDakReviewers(alert: {
  kind: "new_application" | "customer_response";
  caseNumber: string;
  applicantName: string;
}) {
  try {
    const override = process.env.APPLICATIONS_TEAM_EMAIL_OVERRIDE?.trim();
    const recipients = override
      ? [override]
      : (
          await prisma.user.findMany({ where: { role: DAK_REVIEWER_ROLE }, select: { email: true } })
        ).map((user) => user.email);
    if (!recipients.length) return;

    const link = `${siteUrl()}/dak-portal/applications/${encodeURIComponent(alert.caseNumber)}`;
    // One email per reviewer, so reviewers don't see each other's addresses.
    const results = await Promise.allSettled(recipients.map((to) => sendDakReviewerAlert(to, { ...alert, link })));
    results.forEach((result, index) => {
      if (result.status === "rejected") {
        console.error("DAK REVIEWER ALERT FAILED:", alert.caseNumber, recipients[index], result.reason);
      }
    });
  } catch (error) {
    console.error("DAK REVIEWER ALERT FAILED:", alert.caseNumber, error);
  }
}
