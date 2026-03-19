import { prisma } from "@/lib/prisma";
import { PDFDocument } from "pdf-lib";

type PersonalDetails = {
  address?: string;
  city?: string;
  postalCode?: string;
  phone?: string;
};

type HealthAnswers = {
  seriousIllness?: string;
};
export async function POST(
  req: Request,
  context: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await context.params;
    const { signature } = await req.json();

    console.log("✅ COMPLETE API HIT:", id);

    // =========================
    // 1️⃣ Get application
    // =========================
    const app = await prisma.application.findUnique({
      where: { id },
    });

    if (!app) {
      return Response.json({ error: "Application not found" }, { status: 404 });
    }

    // =========================
    // 2️⃣ Load PDF (FIX BASE64)
    // =========================
    const cleanBase64 = app.pdfBase64.replace(/^data:.*;base64,/, "");
    const pdfBytes = Buffer.from(cleanBase64, "base64");

    const pdfDoc = await PDFDocument.load(pdfBytes);

    console.log("📄 PDF LOADED SUCCESS");

    // =========================
    // 3️⃣ GET FORM
    // =========================
    const form = pdfDoc.getForm();

    const setText = (name: string, value: any) => {
      try {
        const field = form.getTextField(name);
        field.setText(value ? String(value) : "");
      } catch (e) {
        console.log("⚠️ Missing field:", name);
      }
    };

    const personal = app.personalDetails as PersonalDetails;
    const health = app.healthAnswers as HealthAnswers;

    // =========================
    // 5️⃣ FILL PERSONAL DATA
    // =========================
    setText("StraßeVN", personal?.address);
    setText("WohnortVN", personal?.city);
    setText("NKZPLZ", personal?.postalCode);
    setText("Telefon-VN", personal?.phone);

    // =========================
    // 6️⃣ FILL HEALTH
    // =========================
    setText("Frage1-VP1", health?.seriousIllness === "yes" ? "Ja" : "Nein");

    // =========================
    // 6️⃣ ADD SIGNATURE
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
    // 7️⃣ LOCK PDF
    // =========================
    form.flatten();

    // =========================
    // 8️⃣ SAVE FINAL PDF
    // =========================
    const finalPdf = await pdfDoc.save();
    const finalBase64 = Buffer.from(finalPdf).toString("base64");

    // =========================
    // 9️⃣ GET USER
    // =========================
    const user = await prisma.user.findUnique({
      where: { id: app.userId || "" },
    });

    // =========================
    // 🔟 SAVE TO DB
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
    // =========================
    // 📧 SEND EMAIL WITH PDF
    // =========================
    try {
      const baseUrl = process.env.NEXTAUTH_URL || "http://localhost:3000";

      if (user?.email) {
        console.log("📧 Sending email to:", user.email);

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

        console.log("📧 Email with PDF sent");
      } else {
        console.log("⚠️ No user email found");
      }
    } catch (emailError) {
      console.error("⚠️ Email sending failed:", emailError);
    }

    return Response.json({ success: true });
  } catch (err) {
    console.error("❌ COMPLETE ERROR:", err);
    return Response.json({ error: "Failed" }, { status: 500 });
  }
}
