import { XMLParser } from "fast-xml-parser";

const HALLESCHE_URL =
  process.env.HALLESCHE_URL_EINZEL ||
  "https://www.hallesche.de/appserver/KrankenService_2/GC_KrankenService.svc";

const SOAP_ACTION =
  "GEWA.COMP.VVGService/IGC_KrankenService_WCF/getOfferEinzel";

export async function callHallescheSOAP(xml: string) {
  const res = await fetch(HALLESCHE_URL, {
    method: "POST",
    headers: {
      "Content-Type": "text/xml; charset=utf-8",
      SOAPAction: `"${SOAP_ACTION}"`,
    },
    body: xml,
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`SOAP error: ${text}`);
  }

  const rawText = await res.text();

  const parser = new XMLParser({
    ignoreAttributes: false,
    removeNSPrefix: true,
  });

  return parser.parse(rawText);
}
