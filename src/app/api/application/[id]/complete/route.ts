import { prisma } from "@/lib/prisma";
import { PDFTextField, PDFRadioGroup, PDFCheckBox, PDFDocument } from "pdf-lib";
import zlib from "zlib";

const getCityFromCoords = async (lat: number, lng: number) => {
  try {
    const res = await fetch(
      `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json`,
      {
        headers: {
          "User-Agent": "insurbe-app", // ✅ REQUIRED
        },
      },
    );

    const data = await res.json();

    return (
      data?.address?.city ||
      data?.address?.town ||
      data?.address?.village ||
      data?.address?.state ||
      ""
    );
  } catch (e) {
    console.log("❌ Reverse geocoding failed");
    return "";
  }
};

export async function POST(
  req: Request,
  context: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await context.params;
    const { signature, location } = await req.json();

    console.log("✅ COMPLETE API HIT:", id);

    const app = await prisma.application.findUnique({ where: { id } });

    if (!app) {
      return Response.json({ error: "Application not found" }, { status: 404 });
    }

    const personal = app.personalDetails as any;
    const financial = app.financialHistory as any;
    const insurance = app.insuranceHistory as any;
    const health = app.healthAnswers as any;
    console.log("👤 PERSONAL:", personal);
    console.log("💼 FINANCIAL:", financial);
    console.log("🧠 HEALTH DATA:", health);
    const baseUrl = process.env.NEXTAUTH_URL || "http://localhost:3000";
    const soapRes = await fetch(`${baseUrl}/api/getorder`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        tariffIds: ["35659", "24449", "24332", "1803"],
        ktgValue: String(insurance?.dailyBenefits || "150").replace(/\D/g, ""),
        vorname: personal?.firstName,
        name: personal?.lastName,
        geburtsdatum: `${personal?.year}-${personal?.month}-${personal?.day}`,
        anrede: "Item1",
        geschlecht:
          personal?.gender === "Female"
            ? "Item2"
            : personal?.gender === "Other"
              ? "Item3"
              : "Item1",
        beginn: new Date().toISOString().split("T")[0],
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
    } catch (e) {
      console.log("⚠️ PDF unzip failed, using original buffer");
    }

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
          // ✅ ADD THIS HERE
          if (name === "Berufsstellung-VP1") {
            console.log("🔥 EMPLOYMENT OPTIONS:", options);
          }
          const val = String(value).toLowerCase().trim();

          // ✅ FIRST: Try to match by exact value or case-insensitive match
          let selected = options.find(
            (opt: string) => opt.toLowerCase().trim() === val,
          );

          // ✅ SECOND: Try partial matching (contains)
          if (!selected) {
            selected = options.find((opt: string) =>
              opt.toLowerCase().includes(val),
            );
          }

          // ✅ THIRD: Fall back to yes/no position logic for health questions
          if (!selected) {
            const isYes = val === "yes" || val === "true" || val === "ja";
            if (isYes) {
              selected = options[options.length - 1]; // YES is last
            } else {
              selected = options[0]; // NO is first
            }
          }

          // ✅ Safety fallback
          if (!selected) {
            console.log("❌ NO MATCH FOUND → USING FIRST OPTION");
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

    // Static broker details requested
    const AGENT_NUMBER = "509941";
    const AGENT_NAME = "InsurBe";

    // =========================
    // PERSONAL (UNCHANGED ✅)
    // =========================
    // Agent/Broker fields (use exact internal PDF field names from runtime dump)
    setField("acFldVerm", AGENT_NAME);
    setField("Vermittler", AGENT_NUMBER);

    setField("acFldV1", AGENT_NUMBER);
    setField("fldVM_Firma", AGENT_NAME);
    setField("Neu-Änderungs-Antrag", "New Application");

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
    const employmentMap: any = {
      "self-employed": "Selbstständig",
      "free-lance": "Freiberuflich",
      employee: "Arbeitnehmer",
      "not working": "Nichtberufstätig",
    };

    // 🔥 handle old values also (important)
    const fallbackMap: any = {
      Employed: "Arbeitnehmer",
      "Self employed": "Selbstständig",
      Freelancer: "Freiberuflich",
      Other: "Nichtberufstätig",
    };

    const employmentValue =
      employmentMap[financial?.employmentStatus] ||
      fallbackMap[financial?.employmentStatus] ||
      "Arbeitnehmer";

    setField("Berufsstellung-VP1", employmentValue);
    setField("Berufsstellung-VN", employmentValue);

    const residenceMap: Record<string, string> = {
      Limited: "befristet",
      Unlimited: "unbefristet",
    };

    setField(
      "Aufenthaltstitel-VP1",
      residenceMap[personal?.residence] || personal?.residence,
    );

    // GENDER FIELD
    const genderMap: Record<string, string> = {
      Male: "maennlich",
      Female: "weiblich",
      Other: "divers",
    };
    setField("Geschlecht-VP1", genderMap[personal?.gender] || personal?.gender);
    const relocationDate =
      personal?.relocationDay &&
      personal?.relocationMonth &&
      personal?.relocationYear
        ? `${String(personal.relocationDay).padStart(2, "0")}.${String(
            personal.relocationMonth,
          ).padStart(2, "0")}.${personal.relocationYear}`
        : "";

    setField("Aufenthaltstitel-Datum-VP1", relocationDate);
    // =========================
    // FINANCIAL (UNCHANGED ✅)
    // =========================
    setField("AusgeübteTätigkeit-VP1", financial?.jobTitle);
    setField("Betrieb-Arbeitgeber-VN", financial?.employerName);

    // setField("KT-Nettoeinkünfte-VP1", financial?.annualIncome);
    const monthlyNetIncome = financial?.annualIncome
      ? Math.round((parseFloat(financial.annualIncome) / 12) * 0.6)
      : "";

    setField(
      "KT-Nettoeinkünfte-VP1",
      monthlyNetIncome ? String(monthlyNetIncome) : "",
    );
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
    // =========================
    // ✅ PREVIOUS INSURANCE FULL FIX
    // =========================

    // Name
    setField(
      "Vorversicherung-KrankenkasseVersicherer1-VP1",
      insurance?.initialProviderName || "",
    );

    // Type
    setField(
      "Vorversicherung-ArtUmfang1-VP1",
      insurance?.recentInsurance || "",
    );

    // Daily benefits (optional)
    setField(
      "Vorversicherung-Tagegeldhöhe1-VP1",
      insurance?.dailyBenefits || "",
    );

    // Exists since (START DATE)
    const prevStart =
      insurance?.startDay && insurance?.startMonth && insurance?.startYear
        ? `${String(insurance.startDay).padStart(2, "0")}.${String(
            insurance.startMonth,
          ).padStart(2, "0")}.${insurance.startYear}`
        : "";

    setField("Vorversicherung-Bestehtseit1-VP1", prevStart);

    // Ends
    const prevEnd =
      insurance?.endDay && insurance?.endMonth && insurance?.endYear
        ? `${String(insurance.endDay).padStart(2, "0")}.${String(
            insurance.endMonth,
          ).padStart(2, "0")}.${insurance.endYear}`
        : "";

    setField("Vorversicherung-Ende1-VP1", prevEnd);

    // Voluntary / compulsory / family
    setField(
      "Vorversicherung-beiGKV-VP1",
      insurance?.insuranceType === "voluntary"
        ? "freiwillig"
        : insurance?.insuranceType === "compulsory"
          ? "pflicht"
          : insurance?.insuranceType === "family"
            ? "familie"
            : "",
    );

    // Terminated by
    setField(
      "Vorversicherung-beendetdurch-VP1",
      insurance?.terminatedBy === "policy-holder"
        ? "Versicherungsnehmer"
        : insurance?.terminatedBy === "insurer"
          ? "Versicherer"
          : "",
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

    // =========================
    // SEPA MANDATE FIELDS (ADD THESE)
    // =========================

    // Date of birth of account holder
    setField(
      "GebDatumKontoinhaber",
      `${personal?.day}.${personal?.month}.${personal?.year}`,
    );

    // Street name and number
    setField(
      "StraßeKontoinhaber",
      [personal?.street, personal?.houseNumber].filter(Boolean).join(" "),
    );

    // Postal code and city (combined field)
    setField(
      "PLZOrtKontoinhaber",
      `${personal?.postcode || ""} ${personal?.city || ""}`.trim(),
    );

    // OR combined postal + city field (some PDFs combine them)
    setField(
      "PLZOrtIN4",
      `${personal?.postcode || ""} ${personal?.city || ""}`.trim(),
    );

    // VN details in SEPA section (bottom of mandate page)
    setField("VorZunameVNIN4", `${personal?.firstName} ${personal?.lastName}`);
    setField(
      "GebDatumVNIN4",
      `${personal?.day}.${personal?.month}.${personal?.year}`,
    );
    setField(
      "StraßePLZOrtVNIN4",
      `${[personal?.street, personal?.houseNumber].filter(Boolean).join(" ")}, ${personal?.postcode || ""} ${personal?.city || ""}`.trim(),
    );

    setField("VorZunameKontoinhaber", health?.sepaName);
    setField("IBANZahlen", health?.sepaIban);
    setField("BICKreditinstitut", health?.sepaBic);
    setField("OrtDatumIN4", new Date().toLocaleDateString());

    const payment = String(health?.sepaPaymentFrequency || "").toLowerCase();

    const paymentField = form.getFieldMaybe("Zahlart");

    if (paymentField instanceof PDFRadioGroup) {
      const options = paymentField.getOptions();

      const map: any = {
        monthly: 0,
        quarterly: 1,
        "half-yearly": 2,
        yearly: 3,
      };

      const index = map[payment] ?? 0;

      console.log("💳 PAYMENT:", payment, "→ INDEX:", index);

      paymentField.select(options[index]);
    }
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
    // Confirmation of Receipt (VG26) fields
    setField("acFldNachname", personal?.lastName);
    setField("acFldVorname", personal?.firstName);
    setField(
      "acFldGebDatum",
      `${personal?.day}.${personal?.month}.${personal?.year}`,
    );
    setField("DurchschlagK", false);

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

    // ✅ OPTIMIZED FALLBACK STRATEGY FOR LOCATION/CITY
    let place = "";

    // Step 1: Try geolocation first (if user allowed permission)
    if (location?.lat && location?.lng) {
      const cityFromCoords = await getCityFromCoords(
        location.lat,
        location.lng,
      );

      if (cityFromCoords) {
        place = cityFromCoords;
      } else {
        // Geolocation failed → use coordinates as fallback
        place = `${location.lat.toFixed(2)}, ${location.lng.toFixed(2)}`;
      }
    }

    // Step 2: If no geolocation or it failed, use personal address data
    if (!place && personal?.city) {
      place = personal.city;
    }

    // Step 3: Last resort - if personal?.city is empty, try to use any available address component
    if (!place) {
      // Build a fallback from available address parts
      const addressParts = [];
      if (personal?.street) addressParts.push(personal.street);
      if (personal?.houseNumber) addressParts.push(personal.houseNumber);
      if (personal?.postcode) addressParts.push(personal.postcode);

      if (addressParts.length > 0) {
        place = addressParts.join(", ");
      }
    }

    // Step 4: Final safety check - if still empty, use a generic location
    if (!place) {
      place = "Ort nicht verfügbar"; // "Location not available" in German
    }

    const placeDate = `${place}, ${formattedDate}`;

    // ✅ APPLY EVERYWHERE
    setField("Unterschrift-Antrag-OrtDatum", placeDate);
    setField("Unterschrift-Datenschutz-OrtDatum", placeDate);
    setField("OrtDatumIN4", placeDate);
    setField("OrtDatumVG26", placeDate);
    setField("DatumAntragAnmeldungVG26", formattedDate);

    if (signature) {
      await drawSignature("Unterschrift-Antrag-Antragsteller", signature);
      await drawSignature("Unterschrift-Datenschutz-Antragsteller", signature);
      await drawSignature("Unterschrift-IN4-Kontoinhaber", signature);
      await drawSignature("UnterschriftVG26", signature);
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

        commission: app?.partnerId ? 5 : 0,

        commissionStatus: app?.partnerId ? "Approved" : "Not Eligible",
      },
    });

    // =========================
    // =========================
    // 📧 SEND EMAIL WITH PDF (FIXED)
    // =========================
    try {
      // 🔥 Always use relative URL (IMPORTANT for production)
      const userEmail = personal?.email || "";

      if (!userEmail) {
        console.log("⚠️ No user email found");
      } else {
        console.log("📧 Sending email to:", userEmail);

        const baseUrl = process.env.NEXTAUTH_URL || "http://localhost:3000";
        const emailRes = await fetch(`${baseUrl}/api/sendAcknowledgement`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            email: userEmail,
            name: personal?.firstName || userEmail.split("@")[0],
            orderId: app?.orderId || id,
            formType: "private",
            pdfBase64: base64, // ✅ FINAL PDF
            filename: "Hallesche_Application.pdf",
          }),
        });

        // ✅ IMPORTANT: check response
        const emailData = await emailRes.json().catch(() => ({}));

        if (!emailRes.ok) {
          console.error("❌ EMAIL API FAILED:", emailData);
        } else {
          console.log("✅ Email sent successfully:", emailData);
        }
      }
    } catch (emailError) {
      console.error("❌ Email sending error:", emailError);
    }

    console.log("✅ FINAL PDF DONE");

    return Response.json({ success: true });
  } catch (err) {
    console.error("❌ ERROR:", err);
    return Response.json({ error: "Failed" }, { status: 500 });
  }
}
