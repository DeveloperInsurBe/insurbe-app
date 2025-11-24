// sampleCall.js
import axios from 'axios';
import { parseStringPromise } from 'xml2js';

const endpoint = 'https://www.kv-rechner0.de/HallescheVVG_Net/GC_KrankenService.svc';

const xml = `<?xml version="1.0" encoding="utf-8"?>
<soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/"
                  xmlns:vvg="GEWA.COMP.VVGService">
  <soapenv:Header/>
  <soapenv:Body>
    <vvg:getOffer>
      <vvg:request xmlns:q="http://www.bipro.net/namespace/tarifierung">
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

        <q:Dokumentanforderung>
          <q:ArtID>AVB</q:ArtID>
          <q:ArtID>Prospekt</q:ArtID>
          <q:ArtID>PiBVI</q:ArtID>
        </q:Dokumentanforderung>
      </vvg:request>
    </vvg:getOffer>
  </soapenv:Body>
</soapenv:Envelope>`;

(async () => {
  try {
    const resp = await axios.post(endpoint, xml, {
      headers: {
        'Content-Type': 'text/xml; charset=utf-8',
        // SOAPAction sometimes required — try 'getOffer' (simple) or empty string if needed
        'SOAPAction': 'getOffer',
        Accept: 'text/xml',
      },
      timeout: 20000,
    });

    console.log('HTTP', resp.status);
    // Parse response to extract premium and documents
    const parsed = await parseStringPromise(resp.data, { explicitArray: false, ignoreAttrs: false });
    // Inspect the parsed object to find angebotField / Beitrag / dateiField
    console.dir(parsed, { depth: 5 });
  } catch (err) {
    if (err.response) {
      console.error('Status:', err.response.status);
      console.error('Server response:\n', err.response.data);
    } else {
      console.error('Error:', err.message || err);
    }
  }
})();
