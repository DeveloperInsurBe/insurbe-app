import { prisma } from "@/lib/prisma";
import { PDFDocument } from "pdf-lib";

export async function POST(
  req: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;
    const { signature } = await req.json();

    console.log("✅ COMPLETE API HIT:", id);

    // =========================
    // 1️⃣ GET APPLICATION
    // =========================
    const app = await prisma.application.findUnique({
      where: { id },
    });

    if (!app) {
      return Response.json({ error: "Application not found" }, { status: 404 });
    }

    // =========================
    // 2️⃣ LOAD EXISTING PDF (VERY IMPORTANT)
    // =========================
    const cleanBase64 = app.pdfBase64.replace(/^data:.*;base64,/, "");
    const pdfBytes = Buffer.from(cleanBase64, "base64");

    const pdfDoc = await PDFDocument.load(pdfBytes);
    const form = pdfDoc.getForm();

    console.log("📄 PDF loaded");

    // =========================
    // SAFE FIELD SETTER (DO NOT OVERWRITE EXISTING)
    // =========================
    const setTextSafe = (name: string, value: any) => {
      try {
        const field = form.getTextField(name);

        // 👉 get existing value from SOAP-filled PDF
        const existing = field.getText();

        // 👉 ONLY set if empty
        if (!existing && value) {
          field.setText(String(value));
        }
      } catch {
        // ignore missing fields
      }
    };

    // =========================
    // 3️⃣ EXTRACT DATA
    // =========================
    const personal = app.personalDetails as any;
    const financial = app.financialHistory as any;
    const insurance = app.insuranceHistory as any;
    const health = app.healthAnswers as any;

    // =========================
    // 4️⃣ PERSONAL (USE SAME SOAP FIELDS)
    // =========================
    setTextSafe("VornameVP1", personal?.firstName);
    setTextSafe("ZunameVP1", personal?.lastName);
    setTextSafe(
      "GeburtsdatumVP1",
      personal?.dob ||
        `${personal?.day || ""}.${personal?.month || ""}.${personal?.year || ""}`
    );

    setTextSafe("EMail-VP1", personal?.email);
    setTextSafe("Telefon-VP1", personal?.phone);

    setTextSafe(
      "StraßeVP1",
      `${personal?.street || ""} ${personal?.houseNumber || ""}`
    );
    setTextSafe("WohnortVP1", personal?.city);
    setTextSafe("PLZVP1", personal?.postcode);

    // =========================
    // 5️⃣ FINANCIAL
    // =========================
    setTextSafe("BerufVP1", financial?.jobTitle);
    setTextSafe("ArbeitgeberVP1", financial?.employerName);
    setTextSafe(
      "EinkommenVP1",
      financial?.annualIncome ? String(financial.annualIncome) : ""
    );

    // =========================
    // 6️⃣ INSURANCE
    // =========================
    setTextSafe("VorversicherungVP1", insurance?.provider);

    // =========================
    // 7️⃣ HEALTH
    // =========================
    setTextSafe("GesundheitsgrößeVP1", health?.height);
    setTextSafe("GesundheitsgewichtVP1", health?.weight);
    setTextSafe("GesundheitsdetailsVP1", health?.details);

    // =========================
    // 8️⃣ SIGNATURE (ONLY ONCE)
    // =========================
    if (signature) {
      const cleanSignature = signature.replace(/^data:.*;base64,/, "");

      const signatureImage = await pdfDoc.embedPng(
        Buffer.from(cleanSignature, "base64")
      );

      const pages = pdfDoc.getPages();
      const lastPage = pages[pages.length - 1];

      const { width } = lastPage.getSize();

      lastPage.drawImage(signatureImage, {
        x: width / 2 - 100,
        y: 60,
        width: 200,
        height: 80,
      });
    }

    // =========================
    // 9️⃣ FLATTEN (AFTER SETTING VALUES)
    // =========================
    form.flatten();

    // =========================
    // 🔟 SAVE PDF
    // =========================
    const finalPdf = await pdfDoc.save();
    const finalBase64 = Buffer.from(finalPdf).toString("base64");

    // =========================
    // 11️⃣ SAVE TO DB
    // =========================
    await prisma.application.update({
      where: { id },
      data: {
        pdfBase64: finalBase64,
        signature: signature || null,
        status: "completed",
      },
    });

    console.log("✅ PDF FINALIZED");

    return Response.json({ success: true });
  } catch (err) {
    console.error("❌ COMPLETE ERROR:", err);
    return Response.json({ error: "Failed" }, { status: 500 });
  }
}