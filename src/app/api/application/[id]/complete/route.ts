import { prisma } from "@/lib/prisma";
import { PDFDocument } from "pdf-lib";

// =========================
// TYPES (UPDATED)
// =========================
type PersonalDetails = any;
type FinancialHistory = any;
type InsuranceHistory = any;
type HealthAnswers = any;

export async function POST(
  req: Request,
  context: { params: Promise<{ id: string }> },
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
    // 2️⃣ LOAD PDF
    // =========================
    const cleanBase64 = app.pdfBase64.replace(/^data:.*;base64,/, "");
    const pdfBytes = Buffer.from(cleanBase64, "base64");

    const pdfDoc = await PDFDocument.load(pdfBytes);
    const form = pdfDoc.getForm();
    // 🔥 DEBUG: Print all PDF fields
    const fields = form.getFields();

    console.log("📄 ===== PDF FIELD NAMES =====");

    fields.forEach((field) => {
      console.log("➡️", field.getName());
    });

    console.log("📄 ===== END PDF FIELDS =====");

    console.log("📄 PDF LOADED SUCCESS");

    // =========================
    // SAFE FIELD SETTER
    // =========================
    const setText = (name: string, value: any) => {
      try {
        const field = form.getTextField(name);
        field.setText(value ? String(value) : "");
      } catch {
        console.log("⚠️ Missing field:", name);
      }
    };

    const setCheck = (name: string, checked: boolean) => {
      try {
        const field = form.getCheckBox(name);
        if (checked) field.check();
      } catch {
        console.log("⚠️ Missing checkbox:", name);
      }
    };

    // =========================
    // 3️⃣ EXTRACT DATA
    // =========================
    const personal = app.personalDetails as PersonalDetails;
    const financial = app.financialHistory as FinancialHistory;
    const insurance = app.insuranceHistory as InsuranceHistory;
    const health = app.healthAnswers as HealthAnswers;

    // =========================
    // 4️⃣ PERSONAL MAPPING
    // =========================

    setText("VornameVN", personal?.firstName);
    setText("ZunameVN", personal?.lastName);
    setText("EMail-VN", personal?.email);
    setText("Telefon-VN", personal?.phone || "");

    setText("StraßeVN", `${personal?.street} ${personal?.houseNumber}`);
    setText("WohnortVN", personal?.city);
    setText("NKZPLZ", personal?.postcode);

    setText(
      "GeburtsdatumVN",
      `${personal?.day}.${personal?.month}.${personal?.year}`,
    );

    setText("Familienstand-VP1", personal?.marital);
    setText("Staatsangehörigkeit-VP1", personal?.countries?.join(", "));
    // =========================
    // 5️⃣ FINANCIAL MAPPING
    // =========================
    setText("Berufsstatus", financial?.employmentStatus);
    setText("Beruf", financial?.jobTitle);
    setText("Arbeitgeber", financial?.employerName);

    setText(
      "Arbeitsbeginn",
      `${financial?.startDay}-${financial?.startMonth}-${financial?.startYear}`,
    );
    setText("Berufsstellung-VP1", financial?.employmentStatus);
    setText("AusgeübteTätigkeit-VP1", financial?.jobTitle);
    setText("KT-Nettoeinkünfte-VP1", financial?.annualIncome);
    setText("Einkommen", financial?.annualIncome);
    setText("AußerhalbDeutschland", financial?.employedOutsideGermany);
    setText("SteuerIDVorhanden", financial?.hasGermanTaxId);

    // =========================
    // 6️⃣ INSURANCE MAPPING
    // =========================
    setText(
      "Vorversicherung-KrankenkasseVersicherer1-VP1",
      insurance?.providerName,
    );

    setText("Vorversicherung-Ende1-VP1", insurance?.insuranceEndDate);

    setText("Vorversicherung-Bestehtseit1-VP1", insurance?.coverageStart);
    setText("ImmerVersichert", insurance?.alwaysInsured);
    setText("DeutschlandWohnsitz", insurance?.livingInGermany);
    setText("Versicherungsnummer", insurance?.policyNumber);

    // =========================
    // 7️⃣ HEALTH MAPPING
    // =========================
    setText("Gesundheitsangaben-Größe-VP1", health?.height);
    setText("Gesundheitsangaben-Gewicht-VP1", health?.weight);

    // YES/NO → Ja / Nein
    const yn = (val: string) => (val === "Yes" ? "Ja" : "Nein");

    setText("Frage1-VP1", yn(health?.hiv));
    setText("Frage2-VP1", yn(health?.outpatient3y));
    setText("Frage3-VP1", yn(health?.inpatient5y));
    setText("Frage4-VP1", yn(health?.psychotherapy10y));
    setText("Frage5-VP1", yn(health?.sterility3y));
    setText("Frage6-VP1", yn(health?.plannedTreatment));
    setText("Frage7-VP1", yn(health?.untreatedDisease));
    setText("Frage8-VP1", yn(health?.chronicDisease));
    setText("Frage9-VP1", yn(health?.handicap));
    setText("Frage10-VP1", yn(health?.regularMedication));
    setText("Frage11-VP1", yn(health?.spectacles));
    setText("Frage12-VP1", yn(health?.dentalExam3y));
    setText("Frage13-VP1", yn(health?.dentalOngoing));
    setText("Frage14-VP1", yn(health?.gumDisease));
    setText("Frage15-VP1", yn(health?.missingTeeth));
    setText("Frage16-VP1", yn(health?.dentures));
    if (health?.diseases?.length) {
      setText("Erkrankungen", health.diseases.join(", "));
    }
    if (health?.signature) {
      const image = await pdfDoc.embedPng(health.signature);
      const page = pdfDoc.getPages()[0];

      page.drawImage(image, {
        x: 400,
        y: 100,
        width: 120,
        height: 50,
      });
    }
    setText("GesundheitsDetails", health?.details);

    // =========================
    // 8️⃣ SIGNATURE
    // =========================
    if (signature) {
      const cleanSignature = signature.replace(/^data:.*;base64,/, "");
      const signatureImage = await pdfDoc.embedPng(
        Buffer.from(cleanSignature, "base64"),
      );

      const pages = pdfDoc.getPages();
      const lastPage = pages[pages.length - 1];

      lastPage.drawImage(signatureImage, {
        x: 200,
        y: 100,
        width: 150,
        height: 50,
      });
    }

    // =========================
    // 9️⃣ FLATTEN
    // =========================
    form.flatten();

    // =========================
    // 🔟 SAVE PDF
    // =========================
    const finalPdf = await pdfDoc.save();
    const finalBase64 = Buffer.from(finalPdf).toString("base64");

    // =========================
    // 11️⃣ GET USER
    // =========================
    const user = await prisma.user.findUnique({
      where: { id: app.userId || "" },
    });

    // =========================
    // 12️⃣ SAVE DB
    // =========================
    await prisma.application.update({
      where: { id },
      data: {
        pdfBase64: finalBase64,
        signature,
        status: "completed",
      },
    });

    console.log("✅ FINAL PDF GENERATED");

    // =========================
    // 📧 EMAIL
    // =========================
    try {
      const baseUrl = process.env.NEXTAUTH_URL || "http://localhost:3000";

      if (user?.email) {
        await fetch(`${baseUrl}/api/sendAcknowledgement`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            email: user.email,
            name: user.email.split("@")[0],
            orderId: app.orderId,
            formType: "private",
            pdfBase64: finalBase64,
            filename: "Final_Application.pdf",
          }),
        });
      }
    } catch (err) {
      console.error("⚠️ Email failed:", err);
    }
    console.log("🧠 PERSONAL:", personal);
    console.log("🧠 FINANCIAL:", financial);
    console.log("🧠 INSURANCE:", insurance);
    console.log("🧠 HEALTH:", health);
    return Response.json({ success: true });
  } catch (err) {
    console.error("❌ COMPLETE ERROR:", err);
    return Response.json({ error: "Failed" }, { status: 500 });
  }
}
