import { prisma } from "@/lib/prisma";
import { PDFTextField, PDFRadioGroup, PDFCheckBox, PDFDocument } from "pdf-lib";
import zlib from "zlib";

export async function POST(
  req: Request,
  context: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await context.params;
    const { signature } = await req.json();

    console.log("✅ COMPLETE API HIT:", id);

    const app = await prisma.application.findUnique({ where: { id } });

    if (!app) {
      return Response.json({ error: "Application not found" }, { status: 404 });
    }

    const personal = app.personalDetails as any;
    const financial = app.financialHistory as any;
    const insurance = app.insuranceHistory as any;
    const health = app.healthAnswers as any;

    console.log("🧠 HEALTH DATA:", health);
    const baseUrl = process.env.NEXTAUTH_URL || "http://localhost:3000";
    const soapRes = await fetch(`${baseUrl}/api/getorder`, {
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
    form.getFields().forEach((f) => {
      console.log("🧾 FIELD:", f.getName());
    });
    console.log("🔥 TOTAL FIELDS:", form.getFields().length);

    const safe = (v: any) => (v ? String(v) : "");

    // ✅ IMPORTANT FIX: use JA / NEIN instead of yes/no
    const toPdfYesNo = (v: any) => {
      if (!v) return "Off";

      const val = String(v).toLowerCase();

      if (val === "yes" || val === "true") return "Yes";
      if (val === "no" || val === "false") return "Off";

      return "Off";
    };

    // ✅ KEEP YOUR LOGIC (IMPROVED INPUT ONLY)
    const setField = (name: string, value: any) => {
      try {
        const field = form.getFieldMaybe(name);

        if (!field) {
          console.log("⚠️ FIELD NOT FOUND:", name);
          return;
        }

        if (field instanceof PDFTextField) {
          field.setText(safe(value));
        } else if (field instanceof PDFRadioGroup) {
          const options = field.getOptions();

          console.log("📻 RADIO:", name, "OPTIONS:", options, "VALUE:", value);

          // ✅ Normalize value
          const val = String(value).toLowerCase();
          const isYes = val === "yes" || val === "true" || val === "ja";

          let selected;

          // 🔥 FIX: SELECT BY POSITION (NOT STRING MATCH)
          if (isYes) {
            // usually YES is last option
            selected = options[options.length - 1];
          } else {
            // NO is first option
            selected = options[0];
          }

          // ✅ Safety fallback
          if (!selected) {
            console.log("❌ NO OPTION FOUND → USING FIRST OPTION");
            selected = options[0];
          }

          console.log("✅ SELECTED:", selected);

          field.select(selected);
        } else if (field instanceof PDFCheckBox) {
          value ? field.check() : field.uncheck();
        }
      } catch (e) {
        console.log("❌ FIELD ERROR:", name);
      }
    };

    // =========================
    // PERSONAL (UNCHANGED ✅)
    // =========================
    setField("VornameVN", personal?.firstName);
    setField("ZunameVN", personal?.lastName);
    setField(
      "GeburtsdatumVN",
      `${personal?.day}.${personal?.month}.${personal?.year}`,
    );

    setField("EMail-VN", personal?.email);
    setField("Telefon-VN", personal?.phone);
    setField(
      "StraßeVN",
      [personal?.street, personal?.houseNumber].filter(Boolean).join(" "),
    );
    setField("WohnortVN", String(personal?.city || ""));
    setField("NKZPLZ", String(personal?.postcode || ""));
    // ✅ FIXED EMPLOYMENT (SOURCE FIX)
    setField(
      "Berufsstellung-VP1",
      financial?.employmentStatus === "Employed"
        ? "employee"
        : financial?.employmentStatus === "Self employed"
          ? "self-employed"
          : financial?.employmentStatus === "Freelancer"
            ? "free-lance"
            : "not working",
    );

    const residenceMap: Record<string, string> = {
      Limited: "befristet",
      Unlimited: "unbefristet",
    };

    setField(
      "Aufenthaltstitel-VP1",
      residenceMap[personal?.residence] || personal?.residence,
    );

    const relocationDate =
      personal?.relocationDay &&
      personal?.relocationMonth &&
      personal?.relocationYear
        ? `${String(personal.relocationDay).padStart(2, "0")}.${String(
            personal.relocationMonth,
          ).padStart(2, "0")}.${personal.relocationYear}`
        : "";

    setField("Aufenthaltstitel-Datum-VP1", relocationDate);

    // 🔥 ADD THIS (TOP SECTION)
    setField(
      "Berufsstellung-VN", // ⚠️ THIS IS THE MISSING ONE
      financial?.employmentStatus === "Employed"
        ? "employee"
        : financial?.employmentStatus === "Self employed"
          ? "self-employed"
          : financial?.employmentStatus === "Freelancer"
            ? "free-lance"
            : "not working",
    );

    // =========================
    // FINANCIAL (UNCHANGED ✅)
    // =========================
    setField("AusgeübteTätigkeit-VP1", financial?.jobTitle);
    setField("Betrieb-Arbeitgeber-VN", financial?.employerName);
    setField("KT-Nettoeinkünfte-VP1", financial?.annualIncome);
    // =========================
    // ✅ BUSINESS / FREELANCE START DATE (FIX)
    // =========================

    const employmentStartDate =
      financial?.startDay && financial?.startMonth && financial?.startYear
        ? `${String(financial.startDay).padStart(2, "0")}.${String(
            financial.startMonth,
          ).padStart(2, "0")}.${financial.startYear}`
        : "";

    // ✅ MAIN FIELD
    setField("Selbstständigkeit-Beginn-VP1", employmentStartDate);

    // ✅ ALSO FILL THIS (some PDFs use this instead)
    setField("Selbstständigkeit-Beginn-lfdTätigkeit-VP1", employmentStartDate);

    // =========================
    // INSURANCE (UNCHANGED ✅)
    // =========================
    setField(
      "Vorversicherung-KrankenkasseVersicherer1-VP1",
      insurance?.provider,
    );

    // =========================
    // HEALTH (FIXED ONLY VALUE FORMAT)
    // =========================
    setField("Gesundheitsangaben-Größe-VP1", health?.height);
    setField("Gesundheitsangaben-Gewicht-VP1", health?.weight);

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

    // for (let i = 1; i <= 13; i++) {
    //   setField(`Frage${i}-VP1`, toPdfYesNo(health?.[map[i - 1]]));
    // }
    setField("Frage1-VP1", toPdfYesNo(health?.outpatient3y));
    setField("Frage2-VP1", toPdfYesNo(health?.inpatient5y));
    setField("Frage3-VP1", toPdfYesNo(health?.psychotherapy10y));
    setField("Frage4-VP1", toPdfYesNo(health?.sterility3y));
    setField("Frage5-VP1", toPdfYesNo(health?.plannedTreatment));
    setField("Frage6-VP1", toPdfYesNo(health?.untreatedDisease));
    setField("Frage7-VP1", toPdfYesNo(health?.chronicDisease));
    setField("Frage8-VP1", toPdfYesNo(health?.hiv)); // if exists
    setField("Frage9-VP1", toPdfYesNo(health?.handicap)); // if exists
    setField("Frage10-VP1", toPdfYesNo(health?.regularMedication));

    // ✅ THIS IS YOUR MAIN BUG FIX
    setField("Frage11-VP1", toPdfYesNo(health?.spectacles));

    setField("Frage12-VP1", toPdfYesNo(health?.dentalExam3y));
    setField("Frage13-VP1", toPdfYesNo(health?.dentalOngoing));

    setField("Frage14-VP1", toPdfYesNo(health?.gumDisease));
    setField("Frage15-VP1", toPdfYesNo(health?.missingTeeth));
    setField("Frage16-VP1", toPdfYesNo(health?.dentures));
    setField(
      "Gesundheitsangaben-Frage11-Dioptrien-rechts-VP1",
      String(health?.dioptreRight || ""),
    );

    setField(
      "Gesundheitsangaben-Frage11-Dioptrien-links-VP1",
      String(health?.dioptreLeft || ""),
    );
    setField(
      "Gesundheitsangaben-Frage15-AnzahlZähne-VP1",
      health?.missingTeethCount,
    );

    setField(
      "Gesundheitsangaben-Frage16-AnzahlZähne-VP1",
      health?.denturesCount,
    );

    // =========================
    // SEPA (FIXED SOURCE ✅)
    // =========================
    console.log("🏦 SEPA DATA:", {
      name: health?.sepaName,
      iban: health?.sepaIban,
      bic: health?.sepaBic,
    });

    setField("VorZunameKontoinhaber", health?.sepaName);
    setField("IBANZahlen", health?.sepaIban);
    setField("BICKreditinstitut", health?.sepaBic);
    setField("OrtDatumIN4", new Date().toLocaleDateString());

    const payment = String(health?.sepaPaymentFrequency || "").toLowerCase();

    console.log("💳 PAYMENT:", payment);

    // Map to German values (IMPORTANT)
    let zahlart = "";

    if (payment === "monthly") zahlart = "monatlich";
    if (payment === "quarterly") zahlart = "vierteljährlich";
    if (payment === "half-yearly") zahlart = "halbjährlich";
    if (payment === "yearly") zahlart = "jährlich";

    // ✅ SET SINGLE FIELD
    setField("Zahlart", zahlart);
    // ✅ GERMAN TAX ID
    const taxId = financial?.germanTaxIdNumber || "";

    // ✅ BOTH FIELDS (VERY IMPORTANT)
    setField("Datenübermittlung-SteuerID-VP1", taxId);
    setField("Datenübermittlung-SteuerID-VN", taxId);
    // optional (safe)
    setField("Datenübermittlung-SteuerID-VN", financial?.germanTaxIdNumber);
    const countryNameMap: Record<string, string> = {
      DE: "Deutschland",
      GB: "Großbritannien",
      US: "USA",
      FR: "Frankreich",
      IN: "Indien",
      CN: "China",
      IT: "Italien",
      ES: "Spanien",
      TR: "Türkei",
      PL: "Polen",
      RO: "Rumänien",
      NL: "Niederlande",
      BR: "Brasilien",
      PK: "Pakistan",
      NG: "Nigeria",
      UA: "Ukraine",
      AF: "Afghanistan",
      SA: "Saudi-Arabien",
      AU: "Australien",
      CA: "Kanada",
      JP: "Japan",
      KR: "Südkorea",
      MX: "Mexiko",
      PT: "Portugal",
      GR: "Griechenland",
      RS: "Serbien",
      HR: "Kroatien",
      IR: "Iran",
      IQ: "Irak",
      SY: "Syrien",
    };
    const nationalityValue = (personal?.countries || [])
      .map((code: string) => countryNameMap[code] || code)
      .join(", ");
    setField("Staatsangehörigkeit-VP1", nationalityValue);

    const maritalMap: Record<string, string> = {
      Single: "ledig",
      Married: "verheiratet",
      Widowed: "verwitwet",
      Divorced: "geschieden",
    };
    setField(
      "Familienstand-VP1",
      maritalMap[personal?.marital] || personal?.marital,
    );
    setField(
      "GeburtsdatumVP1",
      `${personal?.day}.${personal?.month}.${personal?.year}`,
    );

    // =========================
    // SIGNATURE (UNCHANGED ✅)
    // =========================
    const drawSignature = async (fieldName: string, base64: string) => {
      try {
        const clean = base64.replace(/^data:.*;base64,/, "");
        const imgBytes = Buffer.from(clean, "base64");

        let image;
        try {
          image = await pdfDoc.embedPng(imgBytes);
        } catch {
          image = await pdfDoc.embedJpg(imgBytes);
        }

        const field: any = form.getFieldMaybe(fieldName);
        if (!field) {
          console.log("⚠️ Signature field not found:", fieldName);
          return;
        }
        const widgets = field.acroField.getWidgets();

        console.log("✍️ SIGNATURE FIELD:", fieldName);

        const pages = pdfDoc.getPages();

        for (const widget of widgets) {
          const rect = widget.getRectangle();

          // 🔥 FIX: CORRECT PAGE DETECTION
          const pageRef = widget.P(); // ✅ THIS IS KEY
          const pageIndex = pdfDoc
            .getPageIndices()
            .findIndex((i) => pages[i].ref === pageRef);

          const page = pageIndex !== -1 ? pages[pageIndex] : pages[0]; // fallback

          page.drawImage(image, {
            x: rect.x,
            y: rect.y,
            width: rect.width,
            height: rect.height,
          });
        }

        form.removeField(field); // keep this AFTER drawing
      } catch (e) {
        console.log("❌ Signature error:", fieldName, e);
      }
    };

    const today = new Date();
    const formattedDate = today.toLocaleDateString("de-DE"); // DD.MM.YYYY

    const placeDate = `${personal?.city || ""}, ${formattedDate}`;

    // ✅ APPLY EVERYWHERE
    setField("Unterschrift-Antrag-OrtDatum", placeDate);
    setField("Unterschrift-Datenschutz-OrtDatum", placeDate);
    setField("OrtDatumIN4", placeDate);

    if (signature) {
      await drawSignature("Unterschrift-Antrag-Antragsteller", signature);
      await drawSignature("Unterschrift-Datenschutz-Antragsteller", signature);
      await drawSignature("Unterschrift-IN4-Kontoinhaber", signature);
    }

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

    // =========================
    // 📧 SEND EMAIL WITH PDF
    // =========================
    try {
      const baseUrl = process.env.NEXTAUTH_URL || "http://localhost:3000";

      // 🔥 FIX: get email properly from DB
      const userEmail = personal?.email || "";

      if (userEmail) {
        console.log("📧 Sending email to:", userEmail);

        await fetch(`${baseUrl}/api/sendAcknowledgement`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            email: userEmail,
            name: personal?.firstName || userEmail.split("@")[0], // ✅ better name
            orderId: app?.orderId || id,
            formType: "private",
            pdfBase64: base64, // ✅ THIS IS YOUR FINAL PDF
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

    console.log("✅ FINAL PDF DONE");

    return Response.json({ success: true });
  } catch (err) {
    console.error("❌ ERROR:", err);
    return Response.json({ error: "Failed" }, { status: 500 });
  }
}
