
import { NextRequest } from "next/server";
import { XMLParser } from "fast-xml-parser";
import http from "node:http";
import https from "node:https";

const HALLESCHE_URL =
  process.env.HALLESCHE_URL_EINZEL ||
  "https://www.hallesche.de/appserver/KrankenService_2/GC_KrankenService.svc";

const SOAP_ACTION_ORDER =
  'GEWA.COMP.VVGService/IGC_KrankenService_WCF/getOrder';

// small helpers
function escapeXml(str = ""): string {
  return String(str)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

// ✅ UPDATED: Accept multiple tariff IDs
function buildGetOrderEnvelope({
  tariffIds,
  vorname,
  name,
  geburtsdatum,
  beginn,
  anrede = "Item1",
  geschlecht = "Item1",
}: {
  tariffIds: string[];  // ✅ Changed from tarifId to tariffIds (array)
  vorname: string;
  name: string;
  geburtsdatum: string;
  beginn: string;
  anrede?: string;
  geschlecht?: string;
}) {
  // ✅ Build multiple <ns1:Elementarprodukt> blocks
  const elementarprodukte = tariffIds
    .map(tarifId => `
                  <ns1:Elementarprodukt>
                    <ns1:CT_Elementarprodukt xmlns:ns9="http://www.bipro.net/namespace/kranken" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xsi:type="ns9:CT_Tarif">
                      <ns8:TarifID xmlns:ns8="http://www.bipro.net/namespace/kranken">${escapeXml(tarifId)}</ns8:TarifID>
                    </ns1:CT_Elementarprodukt>
                  </ns1:Elementarprodukt>`)
    .join('');

  return `<?xml version="1.0" encoding="utf-8"?>
<soap-env:Envelope xmlns:soap-env="http://schemas.xmlsoap.org/soap/envelope/">
  <soap-env:Header/>
  <soap-env:Body>
    <ns0:getOrder xmlns:ns0="GEWA.COMP.VVGService">
      <ns0:request>
        <ns1:Antrag xmlns:ns1="http://www.bipro.net/namespace/tarifierung">
          <ns2:Dokumentanforderung xmlns:ns2="http://www.bipro.net/namespace/allgemein">
            <ns2:CT_Dokumentanforderung>
              <ns2:ArtID>
                <ns3:ST_DokumentartID xmlns:ns3="http://www.bipro.net/namespace/datentypen">Antrag</ns3:ST_DokumentartID>
              </ns2:ArtID>
            </ns2:CT_Dokumentanforderung>
          </ns2:Dokumentanforderung>

          <ns1:Partner>
            <ns7:CT_Partner xmlns:ns7="http://www.bipro.net/namespace/partner" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xsi:type="ns7:CT_Person">
              <ns7:Anrede>${escapeXml(anrede)}</ns7:Anrede>
              <ns7:Name>${escapeXml(name)}</ns7:Name>
              <ns7:GeschlechtSpecified>true</ns7:GeschlechtSpecified>
              <ns7:Vorname>${escapeXml(vorname)}</ns7:Vorname>
              <ns7:Geburtsdatum>${escapeXml(geburtsdatum)}</ns7:Geburtsdatum>
              <ns7:Geschlecht>${escapeXml(geschlecht)}</ns7:Geschlecht>
            </ns7:CT_Partner>
          </ns1:Partner>

          <ns1:Verkaufsprodukt>
            <ns1:CT_Verkaufsprodukt>
              <ns1:Beginn>${escapeXml(beginn)}</ns1:Beginn>
              <ns1:Produkt>
                <ns1:CT_Produkt>${elementarprodukte}
                </ns1:CT_Produkt>
              </ns1:Produkt>
            </ns1:CT_Verkaufsprodukt>
          </ns1:Verkaufsprodukt>

        </ns1:Antrag>
      </ns0:request>
    </ns0:getOrder>
  </soap-env:Body>
</soap-env:Envelope>`;
}

// fast-xml-parser
const xmlParser = new XMLParser({
  ignoreAttributes: false,
  removeNSPrefix: true,
  trimValues: true,
  textNodeName: "_text",
});

interface Doc {
  kurz: string | null;
  base64: string;
  createdAt: string | null;
  raw: Record<string, unknown>;
}

// small walker: find CT_Datei / Datei nodes and extract base64
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
      else if (v && typeof v === "object") rec(v);
    }
  })(parsed);

  const out: Doc[] = [];
  
  (function normalize(node: unknown): void {
    if (!node || typeof node !== "object") return;
    if (Array.isArray(node)) return node.forEach(normalize);

    const obj = node as Record<string, unknown>;

    // try a few shapes to get base64 in Daten -> Value or node._text
    let base64: string | null = null;
    if (obj.Daten) {
      const daten = obj.Daten;
      if (typeof daten === "string") base64 = daten;
      else if (daten && typeof daten === "object") {
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
              const vObj = v as Record<string, unknown>;
              const textValue = vObj._ ?? vObj._text;
              if (typeof textValue === "string") { 
                base64 = textValue.replace(/\s/g, ""); 
                break; 
              }
            }
          }
        }
      }
    }
    
    if (!base64) {
      if (typeof obj._text === "string") base64 = obj._text.replace(/\s/g, "");
      else if (typeof obj["#text"] === "string") base64 = obj["#text"].replace(/\s/g, "");
    }

    const kurz = (() => {
      const kb = obj.Kurzbeschreibung;
      if (typeof kb === "string") return kb;
      if (kb && typeof kb === "object") {
        const kbObj = kb as Record<string, unknown>;
        const val = kbObj._;
        return typeof val === "string" ? val : null;
      }
      return null;
    })();

    const createdAt = (() => {
      const ed = obj.Erstelldatum;
      if (typeof ed === "string") return ed;
      if (ed && typeof ed === "object") {
        const edObj = ed as Record<string, unknown>;
        const val = edObj._;
        return typeof val === "string" ? val : null;
      }
      return null;
    })();

    if (base64) {
      out.push({ kurz, base64, createdAt, raw: obj });
    }
  })(docs);

  return out;
}

// find Status.Meldung if present (null-safe)
function extractStatusMeldung(parsed: Record<string, unknown>): string | null {
  const found: string[] = [];
  
  (function rec(o: unknown): void {
    if (!o || typeof o !== "object") return;
    const obj = o as Record<string, unknown>;
    for (const k of Object.keys(obj)) {
      const local = k.includes(":") ? k.split(":").pop() : k;
      if (!local) continue;
      const v = obj[k];
      
      // If this node looks like a "Status" container
      if (/^Status$/i.test(local) && v && typeof v === "object") {
        const statusObj = v as Record<string, unknown>;
        // common shapes: v.Meldung, v.meldung, v.MeldungField, or nested objects
        const meldKeys = ["Meldung", "meldung", "MeldungField", "MeldungText"];
        for (const mk of meldKeys) {
          if (mk in statusObj) {
            const meld = statusObj[mk];
            if (typeof meld === "string" && meld.trim()) {
              found.push(meld.trim());
              break;
            }
            if (meld && typeof meld === "object") {
              const meldObj = meld as Record<string, unknown>;
              // null-safe access to typical text properties
              const maybe = 
                typeof meldObj._ === "string" 
                  ? meldObj._ 
                  : typeof meldObj._text === "string" 
                    ? meldObj._text 
                    : typeof meldObj["#text"] === "string" 
                      ? meldObj["#text"] 
                      : null;
              if (typeof maybe === "string" && maybe.trim()) {
                found.push(maybe.trim());
                break;
              }
            }
          }
        }
      }

      // descend
      if (Array.isArray(v)) {
        for (const item of v) rec(item);
      } else if (v && typeof v === "object") {
        rec(v);
      }
    }
  })(parsed);
  
  return found.length ? found[0] : null;
}

// simple PDF sniff
function isBufferPdf(buf: Buffer) {
  return buf.length > 4 && buf.slice(0, 4).toString() === "%PDF";
}

const httpAgent = new http.Agent({ keepAlive: true, maxSockets: 10 });
const httpsAgent = new https.Agent({ keepAlive: true, maxSockets: 10 });

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // ✅ Support both tariffIds (array) and tarifId (single) for backward compatibility
    let tariffIds: string[];
    
    if (body.tariffIds && Array.isArray(body.tariffIds)) {
      // New format: array of tariff IDs
      tariffIds = body.tariffIds;
    } else if (body.tarifId && typeof body.tarifId === 'string') {
      // Old format: single tariff ID (backward compatibility)
      tariffIds = [body.tarifId];
      console.log('⚠️ Using deprecated single tarifId format. Please migrate to tariffIds array.');
    } else {
      return new Response(
        JSON.stringify({ status: { meldung: "Either 'tariffIds' (array) or 'tarifId' (string) is required" } }), 
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    const { vorname, name, geburtsdatum, beginn, anrede, geschlecht } = body || {};

    console.log("=== Get Order Request ===");
    console.log("Tariff IDs:", tariffIds);
    console.log("Count:", tariffIds.length);

    // Validation
    if (tariffIds.length === 0) {
      return new Response(
        JSON.stringify({ status: { meldung: "tariffIds array cannot be empty" } }), 
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    if (!vorname || !name || !geburtsdatum || !beginn) {
      return new Response(
        JSON.stringify({ status: { meldung: "missing required fields" } }), 
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    // ✅ Build envelope with multiple tariffs
    const xml = buildGetOrderEnvelope({ tariffIds, vorname, name, geburtsdatum, beginn, anrede, geschlecht });

    console.log("📤 Calling Hallesche API with", tariffIds.length, "tariff(s)");

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 20000);

    const isHttps = HALLESCHE_URL.startsWith("https:");
    const res = await fetch(HALLESCHE_URL, {
      method: "POST",
      body: xml,
      signal: controller.signal,
      headers: {
        "Content-Type": "text/xml; charset=utf-8",
        "SOAPAction": `"${SOAP_ACTION_ORDER}"`,
        "Accept": "application/xml, text/xml, */*",
      },
      // @ts-expect-error Node fetch types don't support `agent` in Next.js
      agent: isHttps ? httpsAgent : httpAgent,
    });

    clearTimeout(timeout);

    console.log("📥 Hallesche response status:", res.status);

    if (!res.ok) {
      await res.text().catch(() => "");
      return new Response(
        JSON.stringify({ status: { meldung: `upstream error ${res.status}` } }), 
        { status: 502, headers: { "Content-Type": "application/json" } }
      );
    }

    const rawText = await res.text();
    const parsed = xmlParser.parse(rawText);

    // check for Status.Meldung (error info)
    const statusMeldung = extractStatusMeldung(parsed);
    if (statusMeldung) {
      console.log("⚠️ Status message from API:", statusMeldung);
      return new Response(
        JSON.stringify({ status: { meldung: statusMeldung } }), 
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    // extract docs
    const docs = collectDocs(parsed);

    console.log("📄 Documents found:", docs.length);

    // if exactly one doc, return binary PDF directly (fast path)
    if (docs.length === 1) {
      const base64 = docs[0].base64;
      const buffer = Buffer.from(base64, "base64");
      const isPdf = isBufferPdf(buffer);
      const contentType = isPdf ? "application/pdf" : "application/octet-stream";
      const filename = (docs[0].kurz || "antrag").replace(/[^a-z0-9_\-\.]/gi, "_").slice(0, 200);

      console.log("✅ Returning single PDF document:", filename);

      return new Response(buffer, {
        status: 200,
        headers: {
          "Content-Type": contentType,
          "Content-Length": String(buffer.length),
          "Content-Disposition": `attachment; filename="${filename}.pdf"`,
        },
      });
    }

    // if multiple docs, return JSON with base64 for client to download
    if (docs.length > 1) {
      console.log("✅ Returning", docs.length, "documents as JSON");
      const out = { 
        documents: docs.map((d, idx) => ({ 
          id: idx, 
          fileName: d.kurz || `doc_${idx + 1}`, 
          base64: d.base64 
        })),
        meta: {
          tariffIds,
          tariffCount: tariffIds.length,
          documentCount: docs.length,
        }
      };
      return new Response(
        JSON.stringify(out), 
        { status: 200, headers: { "Content-Type": "application/json" } }
      );
    }

    // none found -> return friendly status.meldung
    console.warn("⚠️ No documents found in response");
    return new Response(
      JSON.stringify({ status: { meldung: "no documents found in response" } }), 
      { status: 400, headers: { "Content-Type": "application/json" } }
    );
    
  } catch (err: unknown) {
    console.error("❌ getOrderEinzel error:", err);
    
    const message = err instanceof Error && err.name === "AbortError" 
      ? "upstream timeout" 
      : err instanceof Error 
        ? err.message 
        : String(err);
    
    return new Response(
      JSON.stringify({ status: { meldung: message } }), 
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
}
