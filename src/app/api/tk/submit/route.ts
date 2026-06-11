import { NextResponse } from "next/server";

import { submitTkApplication } from "@/app/providers/tk/submit";
import { prisma } from "@/lib/prisma";
import { ensureApplicationUserAccount } from "@/lib/ensureApplicationUserAccount";

export const runtime = "nodejs";

export async function POST(req: Request) {
  try {
    /**
     * GET BODY
     */
    const body = await req.json();

    /**
     * EXTRACT PARTNER REF
     */
    const partnerRef = body.partnerRef || null;
    const isPartnerAttributed = Boolean(partnerRef);

    /**
     * CALL PROVIDER FUNCTION
     */
    const result =
      await submitTkApplication(body);

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

            partnerId: partnerRef || null,

            product: "Public Health Insurance",

            commission: isPartnerAttributed ? 5 : 0,

            commissionStatus: isPartnerAttributed ? "Pending" : "Not Eligible",

            source: isPartnerAttributed ? "partner" : "user",

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
