// src/app/api/getOfferEinzel/route.ts
import { NextResponse } from "next/server";
import axios from "axios";
import { XMLParser } from "fast-xml-parser";
import fs from "fs/promises";
import path from "path";
import os from "os";

const HALLESCHE_URL =
  process.env.HALLESCHE_URL ||
  "https://www.kv-rechner0.de/HallescheVVG_Net/GC_KrankenService.svc";
const SOAP_ACTION = "GEWA.COMP.VVGService/IGC_KrankenService_WCF/getOffer";

function escapeXml(str = ""): string {
  return String(str)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

function buildGetOfferEnvelope({
  tariffIds,
  vorname,
  name,
  geburtsdatum,
  beginn,
}: {
  tariffIds: string[];
  vorname: string;
  name: string;
  geburtsdatum: string;
  beginn: string;
}) {
  // Build multiple <tar:Elementarprodukt> blocks
  const elementarprodukte = tariffIds
    .map(
      (tarifId) => `
          <tar:Elementarprodukt>
            <tar:CT_Elementarprodukt xsi:type="kt:CT_Tarif">
              <kt:TarifID>${escapeXml(tarifId)}</kt:TarifID>
            </tar:CT_Elementarprodukt>
          </tar:Elementarprodukt>`,
    )
    .join("");

  return `<?xml version="1.0" encoding="utf-8"?>
<soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/"
                  xmlns:vvg="GEWA.COMP.VVGService"
                  xmlns:allg="http://www.bipro.net/namespace/allgemein"
                  xmlns:tar="http://www.bipro.net/namespace/tarifierung"
                  xmlns:partner="http://www.bipro.net/namespace/partner"
                  xmlns:kt="http://www.bipro.net/namespace/kranken"
                  xmlns:dt="http://www.bipro.net/namespace/datentypen"
                  xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance">
  <soapenv:Header/>
  <soapenv:Body>
    <vvg:getOffer>
      <vvg:request>
        <tar:Angebot>
          <allg:Dokumentanforderung>
            <allg:CT_Dokumentanforderung>
              <allg:ArtID>
                <dt:ST_DokumentartID>AVB</dt:ST_DokumentartID>
                <dt:ST_DokumentartID>Prospekt</dt:ST_DokumentartID>
                <dt:ST_DokumentartID>PiBVI</dt:ST_DokumentartID>
                <dt:ST_DokumentartID>EmpfangsbestaetigungVVGDokumente</dt:ST_DokumentartID>
              </allg:ArtID>
            </allg:CT_Dokumentanforderung>
          </allg:Dokumentanforderung>

          <tar:Partner>
            <partner:CT_Partner xsi:type="partner:CT_Person">
              <partner:Anrede>Item1</partner:Anrede>
              <partner:Name>${escapeXml(name)}</partner:Name>
              <partner:Vorname>${escapeXml(vorname)}</partner:Vorname>
              <partner:Geburtsdatum>${escapeXml(geburtsdatum)}</partner:Geburtsdatum>
              <partner:GeschlechtSpecified>true</partner:GeschlechtSpecified>
              <partner:Geschlecht>Item1</partner:Geschlecht>
            </partner:CT_Partner>
          </tar:Partner>

          <tar:Verkaufsprodukt>
            <tar:CT_Verkaufsprodukt>
              <tar:Beginn>${escapeXml(beginn)}</tar:Beginn>
              <tar:Produkt>
                <tar:CT_Produkt>${elementarprodukte}
                </tar:CT_Produkt>
              </tar:Produkt>
            </tar:CT_Verkaufsprodukt>
          </tar:Verkaufsprodukt>

        </tar:Angebot>
      </vvg:request>
    </vvg:getOffer>
  </soapenv:Body>
</soapenv:Envelope>`;
}

async function callHallesche(xml: string) {
  return axios.post(HALLESCHE_URL, xml, {
    headers: {
      "Content-Type": "text/xml; charset=utf-8",
      SOAPAction: `"${SOAP_ACTION}"`,
    },
    timeout: 20000,
  });
}

interface PremiumCandidate {
  value: unknown;
  path: string;
}

/** Robustly extract first numeric "Betrag" found in parsed XML object */
function extractPremium(parsed: Record<string, unknown>): string | null {
  const candidates: PremiumCandidate[] = [];

  function rec(obj: unknown, path: string): void {
    if (!obj || typeof obj !== "object") return;
    const record = obj as Record<string, unknown>;
    for (const key of Object.keys(record)) {
      const v = record[key];
      const local = key.includes(":") ? key.split(":").pop()! : key;

      // Candidate key found (Betrag)
      if (/Betrag$/i.test(local)) {
        candidates.push({ value: v, path: path + "/" + local });
      }

      // descend
      if (Array.isArray(v)) {
        v.forEach((item, idx) => rec(item, `${path}/${key}[${idx}]`));
      } else if (typeof v === "object") {
        rec(v, `${path}/${key}`);
      }
    }
  }

  rec(parsed, "");

  // Debug: log candidates (in dev only)
  if (candidates.length > 0 && process.env.NODE_ENV === "development") {
    console.log("Premium candidates found:", candidates.length);
    console.log("First 3 candidates:", candidates.slice(0, 3));
  }

  // Prefer real numbers, then numeric strings, then extracts from common wrappers
  for (const c of candidates) {
    const v = c.value;

    // If it's a primitive number
    if (typeof v === "number" && !Number.isNaN(v)) {
      return String(v);
    }

    // If it's a string like "60.89"
    if (
      typeof v === "string" &&
      v.trim() !== "" &&
      !Number.isNaN(Number(v.trim()))
    ) {
      return v.trim();
    }

    // If it's an object with common wrappers (fast-xml-parser or xml2js shapes)
    if (v && typeof v === "object") {
      const vRecord = v as Record<string, unknown>;
      const maybe =
        vRecord._ ??
        vRecord["#text"] ??
        vRecord["$"] ??
        vRecord["$text"] ??
        null;
      if (typeof maybe === "number" && !Number.isNaN(maybe))
        return String(maybe);
      if (
        typeof maybe === "string" &&
        maybe.trim() !== "" &&
        !Number.isNaN(Number(maybe.trim()))
      ) {
        return maybe.trim();
      }

      // sometimes parser returns nested object containing the text as first property
      for (const k of Object.keys(vRecord)) {
        const candidateVal = vRecord[k];
        if (
          typeof candidateVal === "string" &&
          candidateVal.trim() !== "" &&
          !Number.isNaN(Number(candidateVal.trim()))
        ) {
          return candidateVal.trim();
        }
        if (typeof candidateVal === "number" && !Number.isNaN(candidateVal)) {
          return String(candidateVal);
        }
      }
    }
  }

  // nothing found
  return null;
}

const parser = new XMLParser({
  ignoreAttributes: false,
  removeNSPrefix: true,
  trimValues: true,
});

interface Doc {
  kurz: string | null;
  base64: string | null;
  createdAt: string | null;
  raw: Record<string, unknown>;
}

/** Collect CT_Datei nodes and normalize documents with base64 if present */
function collectDocs(parsed: Record<string, unknown>): Doc[] {
  const docs: unknown[] = [];

  (function rec(o: unknown): void {
    if (!o || typeof o !== "object") return;
    const obj = o as Record<string, unknown>;
    for (const k of Object.keys(obj)) {
      const local = k.includes(":") ? k.split(":").pop() : k;
      const v = obj[k];
      if (local === "CT_Datei" || local === "Datei") {
        if (Array.isArray(v)) v.forEach((item) => docs.push(item));
        else docs.push(v);
      }
      if (Array.isArray(v)) v.forEach(rec);
      else if (typeof v === "object") rec(v);
    }
  })(parsed);

  // flatten and normalize
  const out: Doc[] = [];

  (function normalize(node: unknown): void {
    if (!node) return;
    if (Array.isArray(node)) return node.forEach(normalize);

    const nodeObj = node as Record<string, unknown>;

    const kurz = (() => {
      if (!nodeObj.Kurzbeschreibung) return null;
      const kb = nodeObj.Kurzbeschreibung;
      if (typeof kb === "string") return kb;
      if (kb && typeof kb === "object") {
        const kbRecord = kb as Record<string, unknown>;
        return typeof kbRecord._ === "string" ? kbRecord._ : null;
      }
      return null;
    })();

    const createdAt = (() => {
      if (!nodeObj.Erstelldatum) return null;
      const ed = nodeObj.Erstelldatum;
      if (typeof ed === "string") return ed;
      if (ed && typeof ed === "object") {
        const edRecord = ed as Record<string, unknown>;
        return typeof edRecord._ === "string" ? edRecord._ : null;
      }
      return null;
    })();

    // find Daten -> Value (namespace variations)
    let base64: string | null = null;
    if (nodeObj.Daten) {
      const daten = nodeObj.Daten;
      if (typeof daten === "string") base64 = daten;
      else if (typeof daten === "object") {
        const datenObj = daten as Record<string, unknown>;
        for (const key of Object.keys(datenObj)) {
          const kLocal = key.includes(":") ? key.split(":").pop() : key;
          if (!kLocal) continue;
          if (/Value$/i.test(kLocal) || kLocal === "_" || kLocal === "#text") {
            const v = datenObj[key];
            if (typeof v === "string") {
              base64 = v.replace(/\s/g, "");
              break;
            }
            if (v && typeof v === "object") {
              const vRecord = v as Record<string, unknown>;
              if (typeof vRecord._ === "string") {
                base64 = vRecord._.replace(/\s/g, "");
                break;
              }
            }
          }
        }
      }
    }

    // also check nested CT_Datei structures
    if (nodeObj.CT_Datei) normalize(nodeObj.CT_Datei);
    else out.push({ kurz, base64, createdAt, raw: nodeObj });
  })(docs);

  // filter to docs with base64
  return out.filter((d) => d.base64);
}

export async function POST(req: Request) {
  try {
    const body = await req.json();

    // Support both old (single tarifId) and new (tariffIds array) format
    let tariffIds: string[];

    if (body.tariffIds && Array.isArray(body.tariffIds)) {
      // New format: array of tariff IDs
      tariffIds = body.tariffIds;
    } else if (body.tarifId && typeof body.tarifId === "string") {
      // Old format: single tariff ID (backward compatibility)
      tariffIds = [body.tarifId];
      console.log(
        "⚠️ Using deprecated single tarifId format. Please migrate to tariffIds array.",
      );
    } else {
      return NextResponse.json(
        {
          error: "Either 'tariffIds' (array) or 'tarifId' (string) is required",
        },
        { status: 400 },
      );
    }

    const { vorname, name, geburtsdatum, beginn } = body;

    console.log("=== Get Offer Request ===");
    console.log("Tariff IDs:", tariffIds);
    console.log("Count:", tariffIds.length);
    console.log("Personal Info:", { vorname, name, geburtsdatum, beginn });

    // Validation
    if (tariffIds.length === 0) {
      return NextResponse.json(
        {
          error: "tariffIds array cannot be empty",
        },
        { status: 400 },
      );
    }

    if (!vorname || !name || !geburtsdatum || !beginn) {
      return NextResponse.json(
        {
          error: "Missing required fields: vorname, name, geburtsdatum, beginn",
        },
        { status: 400 },
      );
    }

    // Build SOAP envelope with multiple tariffs
    const xml = buildGetOfferEnvelope({
      tariffIds,
      vorname,
      name,
      geburtsdatum,
      beginn,
    });

    console.log("Calling Hallesche API...");
    const call = await callHallesche(xml);
    console.log("✅ Hallesche response status:", call.status);

    const parsed = parser.parse(call.data);

    // Save parsed response to file for debugging
    const timestamp = Date.now();
    const rnd = Math.floor(Math.random() * 90000 + 10000);
    const fileName = `hallesche_bundle_${tariffIds.length}tariffs_${timestamp}_${rnd}.json`;
    const dir = path.join(os.tmpdir(), "hallesche_parsed");

    if (process.env.NODE_ENV === "development") {
      try {
        await fs.mkdir(dir, { recursive: true });
        const filePath = path.join(dir, fileName);
        await fs.writeFile(filePath, JSON.stringify(parsed, null, 2), "utf8");
        console.log("📁 Saved parsed response to:", filePath);
      } catch (fileErr) {
        console.warn("Could not save debug file:", fileErr);
      }
    }

    // Extract premium (should be total for all tariffs)
    const premium = extractPremium(parsed);

    // Collect all documents
    const documents = collectDocs(parsed);
    const formattedDocuments = documents.map((doc, index) => ({
      name: doc.kurz
        ? `${doc.kurz.replace(/\s+/g, "_")}.pdf`
        : `document_${index + 1}.pdf`,
      base64: doc.base64,
      createdAt: doc.createdAt,
    }));
    console.log("=== Extraction Results ===");
    console.log("Premium:", premium);
    console.log("Documents:", documents.length);

    if (!premium) {
      console.warn("⚠️ No premium found in response. Check saved JSON file.");
    }

  return NextResponse.json({ 
  premium, 
  documents: formattedDocuments,
  meta: {
    tariffIds,
    tariffCount: tariffIds.length,
    documentCount: formattedDocuments.length,
    requestedAt: new Date().toISOString(),
  }
}, { status: 200 });
  } catch (err: unknown) {
    console.error("=== Get Offer Error ===");

    if (axios.isAxiosError(err)) {
      console.error("Axios error:", err.message);
      console.error("Response status:", err.response?.status);

      const serverBody = err.response?.data
        ? typeof err.response.data === "string"
          ? err.response.data.slice(0, 2000)
          : JSON.stringify(err.response.data).slice(0, 2000)
        : undefined;

      if (serverBody) {
        console.error("Server response (truncated):", serverBody);
      }

      return NextResponse.json(
        {
          error: "Failed to call Hallesche API",
          message: err.message,
          detail: serverBody,
          status: err.response?.status,
        },
        { status: 500 },
      );
    }

    const message = err instanceof Error ? err.message : String(err);
    console.error("Unexpected error:", message);

    return NextResponse.json(
      {
        error: "Internal server error",
        message,
      },
      { status: 500 },
    );
  }
}
