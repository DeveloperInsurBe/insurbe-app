import { submitDakApplication } from "@/app/providers/dak/submit";
import { ensureApplicationUserAccount } from "../ensureApplicationUserAccount";
import { prisma } from "../prisma";
import { resolveReferralAttribution } from "../referralAttribution";
import { checkDakReapply, dakReapplyRulesEnabled } from "./reapply";

/**
 * Everything a DAK submission does, shared by the public DAK form
 * (/api/dak/submit) and partner-prepared drafts (bulk upload), so both
 * create exactly the same application, review case, PDF, emails and
 * commission row. `body` carries personal / selectPlan (JSON), partnerRef and
 * the passport / contract / photo files.
 */
export async function runDakSubmission(body: FormData): Promise<{ status: number; json: Record<string, unknown> }> {
  const personal = JSON.parse(body.get("personal") as string);
  const selectPlan = JSON.parse(body.get("selectPlan") as string);

  if (!personal) {
    return { status: 400, json: { success: false, error: "Invalid form data" } };
  }

  // Who may apply again (DAK only).
  if (dakReapplyRulesEnabled()) {
    const blocked = await checkDakReapply(personal, selectPlan ?? {});
    if (blocked) {
      return {
        status: 409,
        json: { success: false, code: "DAK_REAPPLY_BLOCKED", reason: blocked.reason, error: blocked.message },
      };
    }
  }

  const referralAttribution = await resolveReferralAttribution((body.get("partnerRef") as string) || null);

  const result = await submitDakApplication(body, referralAttribution);

  // Partner / agent conversion (one per customer email and product).
  if (result?.success) {
    const existingApplication = await prisma.application.findFirst({
      where: { userId: personal.email, product: "Public Health Insurance" },
    });

    if (!existingApplication) {
      await prisma.application.create({
        data: {
          firstName: personal.firstName || "",
          lastName: personal.lastName || "",
          userId: personal.email || "",
          partnerId: referralAttribution.partnerId,
          product: "Public Health Insurance",
          commission: referralAttribution.commission,
          commissionStatus: referralAttribution.isAttributed ? "Pending" : "Not Eligible",
          source: referralAttribution.source,
          status: "Submitted",
          pdfBase64: "",
          orderId: result.applicationId || `IB-DAK-${Date.now()}`,
        },
      });
    }

    await ensureApplicationUserAccount({
      email: personal.email,
      firstName: personal.firstName,
      lastName: personal.lastName,
    });
  }

  return { status: 200, json: result as Record<string, unknown> };
}
