import { NextResponse } from "next/server";
import axios from "axios";
import { XMLParser } from "fast-xml-parser";

const HALLESCHE_URL =
  process.env.HALLESCHE_URL || "https://www.kv-rechner0.de/HallescheVVG_Net/GC_KrankenService.svc";

const SOAP_ACTION = "GEWA.COMP.VVGService/IGC_KrankenService_WCF/getOffer";

// Fast HTTP + Compression
const axiosClient = axios.create({
  timeout: 15000,
  maxContentLength: 100 * 1024 * 1024,
  decompress: true,
});

/* --------------------- FAST XML BUILDER -------------------- */
function buildEnvelope({ tarifId, vorname, name, geburtsdatum, beginn }:any) {
  return `<?xml version="1.0"?>
<soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/"
 xmlns:vvg="GEWA.COMP.VVGService"
 xmlns:allg="http://www.bipro.net/namespace/allgemein"
 xmlns:tar="http://www.bipro.net/namespace/tarifierung"
 xmlns:partner="http://www.bipro.net/namespace/partner"
 xmlns:kt="http://www.bipro.net/namespace/kranken"
 xmlns:dt="http://www.bipro.net/namespace/datentypen">
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
          <partner:CT_Partner>
            <partner:Anrede>Item1</partner:Anrede>
            <partner:Name>${name}</partner:Name>
            <partner:Vorname>${vorname}</partner:Vorname>
            <partner:Geburtsdatum>${geburtsdatum}</partner:Geburtsdatum>
            <partner:GeschlechtSpecified>true</partner:GeschlechtSpecified>
            <partner:Geschlecht>Item1</partner:Geschlecht>
          </partner:CT_Partner>
        </tar:Partner>

        <tar:Verkaufsprodukt>
          <tar:CT_Verkaufsprodukt>
            <tar:Beginn>${beginn}</tar:Beginn>
            <tar:Produkt>
              <tar:CT_Produkt>
                <tar:Elementarprodukt>
                  <tar:CT_Elementarprodukt>
                    <kt:TarifID>${tarifId}</kt:TarifID>
                  </tar:CT_Elementarprodukt>
                </tar:Elementarprodukt>
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

/* ------------------- FAST PARSER INSTANCE ------------------ */
const parser = new XMLParser({
  ignoreAttributes: false,
  removeNSPrefix: true,
  trimValues: true,
});

/* ------------- SUPER FAST PREMIUM FINDER ---------------- */
function extractPremium(obj: any): string | null {
  try {
    const offer =
      obj.Envelope?.Body?.getOfferResponse?.getOfferResult?.Angebot;

    if (!offer) return null;

    // premium path: Angebot -> Verkaufsprodukt -> CT_Verkaufsprodukt -> Beitrag -> CT_Beitrag -> Betrag
    const betrag =
      offer.Verkaufsprodukt?.CT_Verkaufsprodukt?.Beitrag?.CT_Beitrag?.Betrag;

    return betrag ? String(betrag) : null;
  } catch {
    return null;
  }
}

/* ------------- SUPER FAST DOCUMENT FINDER ---------------- */
function extractDocs(obj: any) {
  const offer =
    obj.Envelope?.Body?.getOfferResponse?.getOfferResult?.Angebot;

  if (!offer?.Datei) return [];

  // Datei may be array or object
  const dateiList = Array.isArray(offer.Datei.CT_Datei)
    ? offer.Datei.CT_Datei
    : [offer.Datei.CT_Datei];

  return dateiList.map((d: any, index: number) => ({
    index,
    kurz: d.Kurzbeschreibung || null,
    createdAt: d.Erstelldatum || null,
    // Instead of sending base64 (slow), send only length
    sizeBytes: d.Daten?.Value
      ? Math.floor((String(d.Daten.Value).length * 3) / 4)
      : 0,
  }));
}

/* -------------------------- ROUTE -------------------------- */
export async function POST(req: Request) {
  try {
    const body = await req.json();

    const { tarifId, vorname, name, geburtsdatum, beginn } = body;

    console.log("Building request for Hallesche with data", { tarifId, vorname, name, geburtsdatum, beginn });
    const xml = buildEnvelope({ tarifId, vorname, name, geburtsdatum, beginn });

    const { data } = await axiosClient.post(HALLESCHE_URL, xml, {
      headers: {
        "Content-Type": "text/xml",
        SOAPAction: `"${SOAP_ACTION}"`,
      },
    });

    console.log("Received response from Hallesche" , data.slice(0, 500));
    // Fast parse (~3–5ms)
    const parsed = parser.parse(data);

    console.log("Parsed XML response" , parsed.slice(0, 500));
    const premium = extractPremium(parsed);
    const documents = extractDocs(parsed);

    return NextResponse.json({ premium, documents });
  } catch (err: any) {
    return NextResponse.json(
      { error: err.message, detail: err.response?.data?.slice?.(0, 3000) },
      { status: 500 }
    );
  }
}
