import { buildGetOrderXML } from "@/app/utils/buildGetOrderXML";

const HALLESCHE_URL_FAMILY =
  process.env.HALLESCHE_URL_FAMILY ||
  "https://www.hallesche.de/appserver/KrankenService_2/GC_KrankenServiceFamily.svc";

export async function POST(req: Request) {

  const body = await req.json();

  const soapXML = buildGetOrderXML(body);

  const soapRes = await fetch(
    HALLESCHE_URL_FAMILY,
    {
      method: "POST",
      headers: {
        "Content-Type": "text/xml; charset=utf-8",
        SOAPAction:
          '"GEWA.COMP.VVGService/IGC_KrankenServiceFamily/getOrder"',
      },
      body: soapXML,
    }
  );

  const text = await soapRes.text();
  console.log("SOAP RESPONSE (SHORT):", text.slice(0, 2000));
  // console.log("SOAP RESPONSE:", text);

  return new Response(text, {
    headers: { "Content-Type": "application/xml" },
  });
}
