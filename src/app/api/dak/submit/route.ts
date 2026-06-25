import { submitDakApplication } from "@/app/providers/dak/submit";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { ensureApplicationUserAccount } from "@/lib/ensureApplicationUserAccount";
import { resolveReferralAttribution } from "@/lib/referralAttribution";

export async function POST(req: Request) {
  try {
    /**
     * GET FORMDATA
     */
    const body = await req.formData();

    /**
     * PARSE JSON DATA
     */
    const personal = JSON.parse(
      body.get("personal") as string,
    );

    const selectPlan = JSON.parse(
      body.get("selectPlan") as string,
    );

    /**
     * VALIDATE
     */
    if (!personal) {
      return NextResponse.json(
        {
          success: false,
          error: "Invalid form data",
        },
        {
          status: 400,
        },
      );
    }

    /**
     * PARTNER REF
     */
    const referralAttribution = await resolveReferralAttribution(
      (body.get("partnerRef") as string) || null,
    );

    /**
     * SUBMIT TO DAK
     */
    const result =
      await submitDakApplication(body);

    /**
     * SAVE PARTNER CONVERSION
     */
    if (result?.success) {
      /**
       * PREVENT DUPLICATE
       */
      const existingApplication =
        await prisma.application.findFirst({
          where: {
            userId: personal.email,

            product:
              "Public Health Insurance",
          },
        });

      if (!existingApplication) {
        await prisma.application.create({
          data: {
            firstName:
              personal.firstName || "",

            lastName:
              personal.lastName || "",

            userId:
              personal.email || "",

            partnerId:
              referralAttribution.partnerId,

            product:
              "Public Health Insurance",

            commission: referralAttribution.isAttributed ? 5 : 0,

            commissionStatus:
              referralAttribution.isAttributed ? "Pending" : "Not Eligible",

            source: referralAttribution.source,

            status: "Submitted",

            pdfBase64: "",

            orderId:
              result.applicationId ||
              `IB-DAK-${Date.now()}`,
          },
        });
      }

      await ensureApplicationUserAccount({
        email: personal.email,
        firstName: personal.firstName,
        lastName: personal.lastName,
      });
    }

    return NextResponse.json(result);
  } catch (error: any) {
    console.error(
      "DAK API ERROR:",
      error,
    );

    return NextResponse.json(
      {
        success: false,

        error:
          error?.message ||
          String(error),
      },
      {
        status: 500,
      },
    );
  }
}
