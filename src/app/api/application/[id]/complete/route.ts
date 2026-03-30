import { prisma } from "@/lib/prisma";
import {
  PDFTextField,
  PDFRadioGroup,
  PDFCheckBox,
  PDFDocument,
} from "pdf-lib";
import zlib from "zlib";

export async function POST(
  req: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;
    const { signature } = await req.json();

    console.log("✅ COMPLETE API HIT:", id);

    // =========================
    // 1️⃣ GET DATA
    // =========================
    const app = await prisma.application.findUnique({ where: { id } });

    if (!app) {
      return Response.json({ error: "Application not found" }, { status: 404 });
    }

    const personal = app.personalDetails as any;
    const financial = app.financialHistory as any;
    const insurance = app.insuranceHistory as any;
    const health = app.healthAnswers as any;

    // =========================
    // 2️⃣ SOAP
    // =========================
    const soapRes = await fetch("http://localhost:3000/api/getorder", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        tariffIds: ["35653", "24449", "24332", "1803"],
        vorname: personal?.firstName,
        name: personal?.lastName,
        geburtsdatum: `${personal?.year}-${personal?.month}-${personal?.day}`,
        anrede: "Item1",
        geschlecht: "Item1",
        beginn: "2026-04-01",
      }),
    });

    const xml = await soapRes.text();
    const match = xml.match(/<a:valueField>(.*?)<\/a:valueField>/);

    if (!match) {
      return Response.json({ error: "No PDF" }, { status: 500 });
    }

    let pdfBytes = Buffer.from(match[1], "base64");

    try {
      pdfBytes = Buffer.from(zlib.unzipSync(pdfBytes));
    } catch {}

    const pdfDoc = await PDFDocument.load(pdfBytes);
    const form = pdfDoc.getForm();

    // =========================
    // HELPERS
    // =========================
    const safe = (v: any) => (v ? String(v) : "");

    const toJaNein = (v: any) =>
      v === true || v === "Yes" ? "Ja" : "Nein";

    const setField = (name: string, value: any) => {
      try {
        const field = form.getField(name);

        if (field instanceof PDFTextField) {
          field.setText(safe(value));
        } else if (field instanceof PDFRadioGroup) {
          field.select(value);
        } else if (field instanceof PDFCheckBox) {
          value ? field.check() : field.uncheck();
        }
      } catch {}
    };

    // =========================
    // PERSONAL
    // =========================
    setField("VornameVN", personal?.firstName);
    setField("ZunameVN", personal?.lastName);
    setField(
      "GeburtsdatumVN",
      `${personal?.day}.${personal?.month}.${personal?.year}`
    );

    setField("EMail-VN", personal?.email);
    setField("Telefon-VN", personal?.phone);
    setField("StraßeVN", personal?.street);
    setField("WohnortVN", personal?.city);
    setField("NKZPLZ", personal?.postcode);

    // EMPLOYMENT ✅
    setField(
      "Berufsstellung-VP1",
      personal?.employment === "self"
        ? "selbstständig"
        : personal?.employment === "freelance"
        ? "freiberuflich"
        : personal?.employment === "employee"
        ? "angestellt"
        : "nicht tätig"
    );

    // =========================
    // FINANCIAL
    // =========================
    setField("AusgeübteTätigkeit-VP1", financial?.jobTitle);
    setField("Betrieb-Arbeitgeber-VN", financial?.employerName);
    setField("KT-Nettoeinkünfte-VP1", financial?.annualIncome);

    // =========================
    // INSURANCE
    // =========================
    setField(
      "Vorversicherung-KrankenkasseVersicherer1-VP1",
      insurance?.provider
    );

    // =========================
    // HEALTH
    // =========================
    setField("Gesundheitsangaben-Größe-VP1", health?.height);
    setField("Gesundheitsangaben-Gewicht-VP1", health?.weight);

    for (let i = 1; i <= 13; i++) {
      const map: any = [
        "gumDisease",
        "spectacles",
        "inpatient5y",
        "sterility3y",
        "dentalExam3y",
        "missingTeeth",
        "outpatient3y",
        "dentalOngoing",
        "chronicDisease",
        "plannedTreatment",
        "psychotherapy10y",
        "untreatedDisease",
        "regularMedication",
      ];
      setField(`Frage${i}-VP1`, toJaNein(health?.[map[i - 1]]));
    }

    // 14–16 FIX ✅
    setField("Frage14-VP1", toJaNein(health?.gumDisease));
    setField("Frage15-VP1", toJaNein(health?.missingTeeth));
    setField("Frage16-VP1", toJaNein(health?.dentures));

    setField(
      "Gesundheitsangaben-Frage15-AnzahlZähne-VP1",
      health?.missingTeethCount
    );

    setField(
      "Gesundheitsangaben-Frage16-AnzahlZähne-VP1",
      health?.denturesCount
    );

    // =========================
    // SEPA ✅
    // =========================
    setField("VorZunameKontoinhaber", personal?.accountHolder);
    setField("IBANZahlen", personal?.iban);
    setField("BICKreditinstitut", personal?.bic);
    setField("OrtDatumIN4", new Date().toLocaleDateString());

    // =========================
    // SIGNATURE FIX (FINAL)
    // =========================
    const setSignature = async (fieldName: string, base64: string) => {
      try {
        const clean = base64.replace(/^data:.*;base64,/, "");
        const imgBytes = Buffer.from(clean, "base64");

        let image;
        try {
          image = await pdfDoc.embedPng(imgBytes);
        } catch {
          image = await pdfDoc.embedJpg(imgBytes);
        }

        const field: any = form.getField(fieldName);
        const widgets = field.acroField.getWidgets();

        const widget = widgets[0];
        const rect = widget.getRectangle();

        // ❗ FIX: always draw on LAST PAGE (works reliably)
        const page = pdfDoc.getPages().slice(-1)[0];

        page.drawImage(image, {
          x: rect.x,
          y: rect.y,
          width: rect.width,
          height: rect.height,
        });

      } catch (e) {
        console.log("❌ Signature error:", fieldName);
      }
    };

    if (signature) {
      await setSignature("Unterschrift-Antrag-Antragsteller", signature);
      await setSignature("Unterschrift-Datenschutz-Antragsteller", signature);
      await setSignature("Unterschrift-IN4-Kontoinhaber", signature);
    }

    // =========================
    // FINAL
    // =========================
    form.flatten();

    const finalPdf = await pdfDoc.save();
    const base64 = Buffer.from(finalPdf).toString("base64");

    await prisma.application.update({
      where: { id },
      data: {
        pdfBase64: base64,
        signature,
        status: "completed",
      },
    });

    console.log("✅ FINAL PDF DONE");

    return Response.json({ success: true });

  } catch (err) {
    console.error("❌ ERROR:", err);
    return Response.json({ error: "Failed" }, { status: 500 });
  }
}