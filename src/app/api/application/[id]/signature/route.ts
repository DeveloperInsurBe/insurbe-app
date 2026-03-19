import { prisma } from "@/lib/prisma";
import { PDFDocument } from "pdf-lib";

export async function POST(
  req: Request,
  context: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await context.params;
    const { signature } = await req.json();

    // 1️⃣ Get application
    const app = await prisma.application.findUnique({
      where: { id },
    });

    if (!app) {
      return Response.json({ error: "Not found" }, { status: 404 });
    }

    // 2️⃣ Load base PDF
    const pdfBytes = Buffer.from(app.pdfBase64, "base64");

    const pdfDoc = await PDFDocument.load(pdfBytes);

    const signatureImage = await pdfDoc.embedPng(signature);

    const pages = pdfDoc.getPages();
    const lastPage = pages[pages.length - 1];

    lastPage.drawImage(signatureImage, {
      x: 200,
      y: 100,
      width: 150,
      height: 50,
    });

    // 4️⃣ Save new PDF
    const finalPdf = await pdfDoc.save();

    const finalBase64 = Buffer.from(finalPdf).toString("base64");

    // 5️⃣ Save in DB
    await prisma.application.update({
      where: { id },
      data: {
        signature,
        pdfBase64: finalBase64,
        status: "completed",
      },
    });

    return Response.json({ success: true });
  } catch (err) {
    console.error("❌ Complete error:", err);
    return Response.json({ error: "Failed" }, { status: 500 });
  }
}
