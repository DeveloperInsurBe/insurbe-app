// getOfferTest.js (ESM)
// Requirements: axios and xml2js installed. package.json should have "type": "module"
import axios from 'axios';
import { parseStringPromise } from 'xml2js';

const ENDPOINT = 'https://www.kv-rechner0.de/HallescheVVG_Net/GC_KrankenService.svc';
const SOAP_ACTION = 'GEWA.COMP.VVGService/IGC_KrankenService_WCF/getOffer';

// Local test file path (you provided this path earlier)
// The SOAP server usually needs a reachable URL — include this only for local server-to-server test
const LOCAL_TEST_FILE = '/mnt/data/5485818b-4596-4bbc-aad8-4134cd98a70a.png';

// getOffer envelope including Dokumentanforderung to request AVB/Prospekt/PiBVI/SonstigesDokument
const xml = `<?xml version="1.0" encoding="utf-8"?>
<soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/"
                  xmlns:vvg="GEWA.COMP.VVGService"
                  xmlns:q="http://www.bipro.net/namespace/tarifierung"
                  xmlns:wsa="http://www.w3.org/2005/08/addressing">
  <soapenv:Header>
    <wsa:Action>${SOAP_ACTION}</wsa:Action>
    <wsa:To>${ENDPOINT}</wsa:To>
  </soapenv:Header>
  <soapenv:Body>
    <vvg:getOffer>
      <vvg:request>

        <!-- Dokumentanforderung: request specific documents -->
        <q:Dokumentanforderung>
          <q:AVB>true</q:AVB>
          <q:Prospekt>true</q:Prospekt>
          <q:PiBVI>true</q:PiBVI>
          <q:SonstigesDokument>true</q:SonstigesDokument>
          <!-- Local test file reference (if the service accepts file paths or urls) -->
          <q:SonstigesDokumentUrl>${LOCAL_TEST_FILE}</q:SonstigesDokumentUrl>
        </q:Dokumentanforderung>

        <q:Partner>
          <q:Anrede>Mr</q:Anrede>
          <q:Vorname>Max</q:Vorname>
          <q:Name>Mustermann</q:Name>
          <q:Geschlecht>male</q:Geschlecht>
          <q:Geburtsdatum>1988-02-03</q:Geburtsdatum>
        </q:Partner>

        <q:Verkaufsprodukt>
          <q:Beginn>2025-09-01</q:Beginn>
          <q:TarifID>34572</q:TarifID>
        </q:Verkaufsprodukt>
      </vvg:request>
    </vvg:getOffer>
  </soapenv:Body>
</soapenv:Envelope>`;

function safeGet(obj, pathArr) {
  return pathArr.reduce((acc, k) => (acc && acc[k] != null ? acc[k] : undefined), obj);
}

async function run() {
  try {
    const resp = await axios.post(ENDPOINT, xml, {
      headers: {
        'Content-Type': 'text/xml; charset=utf-8',
        'SOAPAction': `"${SOAP_ACTION}"`,
        Accept: 'text/xml',
      },
      timeout: 20000,
    });

    console.log('HTTP status:', resp.status);
    console.log('Response ', resp);

    
    const parsed = await parseStringPromise(resp.data, { explicitArray: false, ignoreAttrs: false });

    // find the result node robustly
    const body =
      parsed['s:Envelope']?.['s:Body'] ||
      parsed['soapenv:Envelope']?.['soapenv:Body'] ||
      parsed.Envelope?.Body ||
      parsed['soap:Envelope']?.['soap:Body'] ||
      parsed;

    const getOfferResponse = body?.getOfferResponse || body?.['getOfferResponse'];
    const getOfferResult = getOfferResponse?.getOfferResult || getOfferResponse?.['getOfferResult'] || getOfferResponse;

    // 1) Try to extract premium (Beitrag)
    const beitrag =
      safeGet(getOfferResult, ['angebotField', 'Beitrag']) ||
      safeGet(getOfferResult, ['Beitrag']) ||
      safeGet(getOfferResult, ['angebot', 'Beitrag']) ||
      undefined;

    if (beitrag) {
      const printed =
        typeof beitrag === 'object' ? (beitrag._ || JSON.stringify(beitrag)) : beitrag;
      console.log('Premium (Beitrag):', printed);
    } else {
      console.log('No "Beitrag" (premium) found in the response.');
    }

    // 2) Extract any Status.Meldung.Text (server diagnostic)
    const status = safeGet(getOfferResult, ['Status']) || safeGet(getOfferResult, ['status']) || null;
    let statusMessage;
    if (status) {
      const meldung = status.Meldung?.CT_Meldung || status.Meldung || status.meldung;
      statusMessage = meldung?.Text || (meldung && (meldung._ || meldung['#text'])) || null;
    }
    if (statusMessage) {
      console.log('Server status message:', statusMessage);
    } else {
      console.log('No server status message (Status.Meldung.Text) found.');
    }

    // 3) Try to find dateiField (documents) - print presence and basic structure info
    const dateiField =
      safeGet(getOfferResult, ['dateiField']) ||
      safeGet(getOfferResult, ['angebotField', 'dateiField']) ||
      safeGet(getOfferResult, ['datei']) ||
      safeGet(getOfferResult, ['angebot', 'dateiField']);

    if (dateiField) {
      // Provide some helpful logging about returned document structure
      if (Array.isArray(dateiField.datei)) {
        console.log(`Documents returned: ${dateiField.datei.length} file(s).`);
        dateiField.datei.forEach((d, i) => {
          const name = d.name || d.Name || `file-${i}`;
          const contentType = d.contentType || d.ContentType || 'unknown';
          const hasData = !!(d.data || d.Data || d.base64);
          console.log(`  [${i}] name: ${name}, contentType: ${contentType}, embeddedData: ${hasData}`);
        });
      } else if (dateiField.datei) {
        const d = dateiField.datei;
        const name = d.name || d.Name || 'file-0';
        const contentType = d.contentType || d.ContentType || 'unknown';
        const hasData = !!(d.data || d.Data || d.base64);
        console.log(`1 document returned: name: ${name}, contentType: ${contentType}, embeddedData: ${hasData}`);
      } else {
        // If dateiField isn't shaped as expected, dump top-level keys
        console.log('dateiField present. Structure keys:', Object.keys(dateiField));
      }

      console.log('Documents present. Inspect the parsed response for detailed payloads.');
    } else {
      console.log('No dateiField (documents) returned by the service.');
    }

    // For debugging: uncomment to inspect the parsed structure (careful, can be large)
    // console.dir(parsed, { depth: 5 });

  } catch (err) {
    if (err.response) {
      console.error('HTTP error status:', err.response.status);
      console.error('Server response preview (first 2000 chars):\n', String(err.response.data).slice(0, 2000));
    } else {
      console.error('Error:', err.message || err);
    }
  }
}

run();
