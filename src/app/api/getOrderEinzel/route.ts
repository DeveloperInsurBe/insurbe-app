// app/api/getOrderEinzel/route.ts
import { NextRequest } from "next/server";
import { XMLParser } from "fast-xml-parser";
import http from "node:http";
import https from "node:https";

const HALLESCHE_URL =
  process.env.HALLESCHE_URL ||
  "https://www.kv-rechner0.de/HallescheVVG_Net/GC_KrankenService.svc";

const SOAP_ACTION_ORDER =
  'GEWA.COMP.VVGService/IGC_KrankenService_WCF/getOrder';

// small helpers
function escapeXml(str = "") {
  return String(str)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

function buildGetOrderEnvelope({
  tarifId,
  vorname,
  name,
  geburtsdatum,
  beginn,
  anrede = "Item1",
  geschlecht = "Item1",
}: {
  tarifId: string;
  vorname: string;
  name: string;
  geburtsdatum: string;
  beginn: string;
  anrede?: string;
  geschlecht?: string;
}) {
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
                <ns1:CT_Produkt>
                  <ns1:Elementarprodukt>
                    <ns1:CT_Elementarprodukt xmlns:ns9="http://www.bipro.net/namespace/kranken" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xsi:type="ns9:CT_Tarif">
                      <ns8:TarifID xmlns:ns8="http://www.bipro.net/namespace/kranken">${escapeXml(tarifId)}</ns8:TarifID>
                    </ns1:CT_Elementarprodukt>
                  </ns1:Elementarprodukt>
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

// small walker: find CT_Datei / Datei nodes and extract base64
function collectDocs(parsed: any) {
  const docs: any[] = [];
  (function rec(o: any) {
    if (!o || typeof o !== "object") return;
    for (const k of Object.keys(o)) {
      const local = k.includes(":") ? k.split(":").pop() : k;
      const v = o[k];
      if (local === "CT_Datei" || local === "Datei") {
        if (Array.isArray(v)) v.forEach((item) => docs.push(item));
        else docs.push(v);
      }
      if (Array.isArray(v)) v.forEach(rec);
      else if (v && typeof v === "object") rec(v);
    }
  })(parsed);

  const out: any[] = [];
  (function normalize(node: any) {
    if (!node || typeof node !== "object") return;
    if (Array.isArray(node)) return node.forEach(normalize);

    // try a few shapes to get base64 in Daten -> Value or node._text
    let base64: string | null = null;
    if (node.Daten) {
      const daten = node.Daten;
      if (typeof daten === "string") base64 = daten;
      else if (daten && typeof daten === "object") {
        for (const key of Object.keys(daten)) {
          const kLocal = key.includes(":") ? key.split(":").pop() : key;
          if (!kLocal) continue;
          if (/Value$/i.test(kLocal) || kLocal === "_" || kLocal === "#text") {
            const v = daten[key];
            if (typeof v === "string") { base64 = v.replace(/\s/g, ""); break; }
            if (v && typeof v === "object" && typeof (v._ ?? v._text) === "string") { base64 = (v._ ?? v._text).replace(/\s/g, ""); break; }
          }
        }
      }
    }
    if (!base64) {
      if (typeof node._text === "string") base64 = node._text.replace(/\s/g, "");
      else if (typeof node["#text"] === "string") base64 = node["#text"].replace(/\s/g, "");
    }

    const kurz = (node.Kurzbeschreibung && (typeof node.Kurzbeschreibung === "string" ? node.Kurzbeschreibung : (node.Kurzbeschreibung?._ ?? null))) || null;
    const createdAt = (node.Erstelldatum && (typeof node.Erstelldatum === "string" ? node.Erstelldatum : (node.Erstelldatum?._ ?? null))) || null;

    out.push({ kurz, base64, createdAt, raw: node });
  })(docs);

  return out.filter(d => d.base64);
}

// find Status.Meldung if present (null-safe)
function extractStatusMeldung(parsed: any): string | null {
  const found: string[] = [];
  (function rec(o: any) {
    if (!o || typeof o !== "object") return;
    for (const k of Object.keys(o)) {
      const local = k.includes(":") ? k.split(":").pop() : k;
      if (!local) continue;
      const v = o[k];
      // If this node looks like a "Status" container
      if (/^Status$/i.test(local) && v && typeof v === "object") {
        // common shapes: v.Meldung, v.meldung, v.MeldungField, or nested objects
        const meldKeys = ["Meldung", "meldung", "MeldungField", "MeldungText"];
        for (const mk of meldKeys) {
          if (mk in v) {
            const meld = v[mk];
            if (typeof meld === "string" && meld.trim()) {
              found.push(meld.trim());
              break;
            }
            if (meld && typeof meld === "object") {
              // null-safe access to typical text properties
              const maybe = (typeof meld._ === "string" ? meld._ : (typeof meld._text === "string" ? meld._text : (typeof meld["#text"] === "string" ? meld["#text"] : null)));
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
    const { tarifId, vorname, name, geburtsdatum, beginn, anrede, geschlecht } = body || {};

    if (!tarifId || !vorname || !name || !geburtsdatum || !beginn) {
      return new Response(JSON.stringify({ status: { meldung: "missing required fields" } }), { status: 400, headers: { "Content-Type": "application/json" } });
    }

    const xml = buildGetOrderEnvelope({ tarifId, vorname, name, geburtsdatum, beginn, anrede, geschlecht });

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
      // @ts-ignore
      agent: isHttps ? httpsAgent : httpAgent,
    });

    clearTimeout(timeout);

    if (!res.ok) {
      const txt = await res.text().catch(() => "");
      return new Response(JSON.stringify({ status: { meldung: `upstream error ${res.status}` } }), { status: 502, headers: { "Content-Type": "application/json" } });
    }

    const rawText = await res.text();
    const parsed = xmlParser.parse(rawText);

    // check for Status.Meldung (error info)
    const statusMeldung = extractStatusMeldung(parsed);
    if (statusMeldung) {
      return new Response(JSON.stringify({ status: { meldung: statusMeldung } }), { status: 400, headers: { "Content-Type": "application/json" } });
    }

    // extract docs
    const docs = collectDocs(parsed);

    // if exactly one doc, return binary PDF directly (fast path)
    if (docs.length === 1) {
      const base64 = docs[0].base64;
      const buffer = Buffer.from(base64, "base64");
      const isPdf = isBufferPdf(buffer);
      const contentType = isPdf ? "application/pdf" : "application/octet-stream";
      const filename = (docs[0].kurz || "antrag").replace(/[^a-z0-9_\-\.]/gi, "_").slice(0, 200);

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
      const out = { documents: docs.map((d, idx) => ({ id: idx, fileName: d.kurz || `doc_${idx + 1}`, base64: d.base64 })) };
      return new Response(JSON.stringify(out), { status: 200, headers: { "Content-Type": "application/json" } });
    }

    // none found -> return friendly status.meldung
    return new Response(JSON.stringify({ status: { meldung: "no documents found in response" } }), { status: 400, headers: { "Content-Type": "application/json" } });
  } catch (err: any) {
    console.error("getOrderEinzel error:", err);
    const message = err?.name === "AbortError" ? "upstream timeout" : (err?.message || String(err));
    return new Response(JSON.stringify({ status: { meldung: message } }), { status: 500, headers: { "Content-Type": "application/json" } });
  }
}
