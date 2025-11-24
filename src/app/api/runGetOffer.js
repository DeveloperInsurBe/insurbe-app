import axios from "axios";
import { parseStringPromise } from "xml2js";

const ENDPOINT = "https://www.kv-rechner0.de/HallescheVVG_Net/GC_KrankenService.svc";

// IMPORTANT: This action works (you discovered earlier)
const SOAP_ACTION = "GEWA.COMP.VVGService/IGC_KrankenService_WCF/getOffer";

// ----------- PASTE YOUR EXACT XML -----------------
const xml = `
<soap-env:Envelope xmlns:soap-env="http://schemas.xmlsoap.org/soap/envelope/">
  <soap-env:Header/>
  <soap-env:Body>
    <ns0:getOffer xmlns:ns0="GEWA.COMP.VVGService">
      <ns0:request>
        <ns1:Angebot xmlns:ns1="http://www.bipro.net/namespace/tarifierung">
          <ns2:Dokumentanforderung xmlns:ns2="http://www.bipro.net/namespace/allgemein">
            <ns2:CT_Dokumentanforderung>
              <ns2:ArtID>
                <ns3:ST_DokumentartID xmlns:ns3="http://www.bipro.net/namespace/datentypen">AVB</ns3:ST_DokumentartID>
                <ns4:ST_DokumentartID xmlns:ns4="http://www.bipro.net/namespace/datentypen">Prospekt</ns4:ST_DokumentartID>
                <ns5:ST_DokumentartID xmlns:ns5="http://www.bipro.net/namespace/datentypen">PiBVI</ns5:ST_DokumentartID>
                <ns6:ST_DokumentartID xmlns:ns6="http://www.bipro.net/namespace/datentypen">EmpfangsbestaetigungVVGDokumente</ns6:ST_DokumentartID>
              </ns2:ArtID>
            </ns2:CT_Dokumentanforderung>
          </ns2:Dokumentanforderung>
          <ns1:Partner>
            <ns7:CT_Partner xmlns:ns7="http://www.bipro.net/namespace/partner" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xsi:type="ns7:CT_Person">
              <ns7:Anrede>Item1</ns7:Anrede>
              <ns7:Name>Mustermann</ns7:Name>
              <ns7:GeschlechtSpecified>true</ns7:GeschlechtSpecified>
              <ns7:Vorname>Max</ns7:Vorname>
              <ns7:Geburtsdatum>1988-02-03</ns7:Geburtsdatum>
              <ns7:Geschlecht>Item1</ns7:Geschlecht>
            </ns7:CT_Partner>
          </ns1:Partner>
          <ns1:Verkaufsprodukt>
            <ns1:CT_Verkaufsprodukt>
              <ns1:Beginn>01.09.2025</ns1:Beginn>
              <ns1:Produkt>
                <ns1:CT_Produkt>
                  <ns1:Elementarprodukt>
                    <ns1:CT_Elementarprodukt xmlns:ns9="http://www.bipro.net/namespace/kranken" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xsi:type="ns9:CT_Tarif">
                      <ns8:TarifID xmlns:ns8="http://www.bipro.net/namespace/kranken">34572</ns8:TarifID>
                    </ns1:CT_Elementarprodukt>
                  </ns1:Elementarprodukt>
                </ns1:CT_Produkt>
              </ns1:Produkt>
            </ns1:CT_Verkaufsprodukt>
          </ns1:Verkaufsprodukt>
        </ns1:Angebot>
      </ns0:request>
    </ns0:getOffer>
  </soap-env:Body>
</soap-env:Envelope>
`;
// ---------------------------------------------------

async function run() {
  try {
    const response = await axios.post(ENDPOINT, xml, {
      headers: {
        "Content-Type": "text/xml; charset=utf-8",
        "SOAPAction": `"${SOAP_ACTION}"`,
      }
    });

    console.log("STATUS:", response.status);

    const parsed = await parseStringPromise(response.data, { explicitArray: false });

    console.log("\n--- RAW RESPONSE ---\n");
    console.log(response.data);

    console.log("\n--- PARSED KEYS ---\n");
    console.log(Object.keys(parsed));

  } catch (err) {
    console.error("\nERROR:", err.response?.data || err.message);
  }
}

run();
