import { NextResponse } from "next/server";

import { submitTkApplication } from "@/app/providers/tk/submit";
import { prisma } from "@/lib/prisma";
import { ensureApplicationUserAccount } from "@/lib/ensureApplicationUserAccount";
import { resolveReferralAttribution } from "@/lib/referralAttribution";

export const runtime = "nodejs";

export async function POST(req: Request) {
  try {
    /**
     * GET BODY
     */
    const formData = await req.formData();

    const body = {
      personal: JSON.parse(
        (formData.get("personal") as string) || "null",
      ),

      selectPlan: JSON.parse(
        (formData.get("selectPlan") as string) || "null",
      ),

      partnerRef:
        (formData.get("partnerRef") as string) || null,
    };

    if (!body.personal || !body.selectPlan) {
      return NextResponse.json(
        {
          success: false,
          error: "Invalid form data",
        },
        { status: 400 },
      );
    }

    /**
     * EXTRACT PARTNER REF
     */
    const referralAttribution = await resolveReferralAttribution(
      body.partnerRef,
    );

    /**
     * CALL PROVIDER FUNCTION
     */
    const getFile = (key: string) => {
      const value = formData.get(key);

      return value instanceof File ? value : null;
    };

    const result =
      await submitTkApplication(body, {
        passport: getFile("passport"),
        contract: getFile("contract"),
        photo: getFile("photo"),
      });

    /**
     * SAVE PARTNER CONVERSION (if successful)
     */
    if (result?.success) {
      /**
       * PREVENT DUPLICATE
       */
      const existingApplication =
        await prisma.application.findFirst({
          where: {
            userId: body?.personal?.email,
            product: "Public Health Insurance",
          },
        });

      if (!existingApplication) {
        await prisma.application.create({
          data: {
            firstName:
              body?.personal?.firstName || "",

            lastName:
              body?.personal?.lastName || "",

            userId: body?.personal?.email || "",

            partnerId: referralAttribution.partnerId,

            product: "Public Health Insurance",

            commission: referralAttribution.isAttributed ? 5 : 0,

            commissionStatus: referralAttribution.isAttributed
              ? "Pending"
              : "Not Eligible",

            source: referralAttribution.source,

            status: "Submitted",

            pdfBase64: "",

            orderId:
              result.applicationId ||
              `IB-TK-${Date.now()}`,
          },
        });
      }

      await ensureApplicationUserAccount({
        email: body?.personal?.email,
        firstName: body?.personal?.firstName,
        lastName: body?.personal?.lastName,
      });
    }

    /**
     * RETURN RESPONSE
     */
    return NextResponse.json(result);
  } catch (error: any) {
    console.error(
      "TK ROUTE ERROR:",
      error,
    );

    return NextResponse.json(
      {
        success: false,

        message:
          "TK submission failed",

        error:
          error?.message ||
          "Unknown error",
      },
      { status: 500 },
    );
  }
}
