import { submitDakApplication } from "@/app/providers/dak/submit";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

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
    const partnerRef =
      (body.get("partnerRef") as string) || null;

    const isPartnerAttributed = Boolean(partnerRef);

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
              partnerRef || null,

            product:
              "Public Health Insurance",

            commission: isPartnerAttributed ? 5 : 0,

            commissionStatus:
              isPartnerAttributed ? "Pending" : "Not Eligible",

            source: isPartnerAttributed ? "partner" : "user",

            status: "Submitted",

            pdfBase64: "",

            orderId:
              result.applicationId ||
              `IB-DAK-${Date.now()}`,
          },
        });
      }
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
