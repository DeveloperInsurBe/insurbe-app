// callGetOffer.js
import axios from 'axios';
import { parseStringPromise } from 'xml2js';
import fs from 'fs';
import path from 'path';

const endpoint = 'https://www.kv-rechner0.de/HallescheVVG_Net/GC_KrankenService.svc';
// THE working action you discovered
const SOAP_ACTION = 'GEWA.COMP.VVGService/IGC_KrankenService_WCF/getOffer';

const xmlEnvelope = `<?xml version="1.0" encoding="utf-8"?>
<soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/"
                  xmlns:vvg="GEWA.COMP.VVGService"
                  xmlns:wsa="http://www.w3.org/2005/08/addressing">
  <soapenv:Header>
    <wsa:Action>${SOAP_ACTION}</wsa:Action>
    <wsa:To>${endpoint}</wsa:To>
  </soapenv:Header>
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

async function callGetOffer() {
  try {
    const resp = await axios.post(endpoint, xmlEnvelope, {
      headers: {
        'Content-Type': 'text/xml; charset=utf-8',
        // SOAPAction must be quoted for this service
        'SOAPAction': `"${SOAP_ACTION}"`,
        Accept: 'text/xml',
      },
      timeout: 20000,
    });

    console.log('HTTP status', resp.status);

    // Parse XML response to JS object
    const parsed = await parseStringPromise(resp.data, { explicitArray: false, ignoreAttrs: false });
    // console.dir(parsed, { depth: 5 });

    // Navigate to the typical path. WSDL wrappers may vary, so check what you actually get.
    // Common path: Envelope -> Body -> getOfferResponse -> getOfferResult -> angebotField
    const body = parsed['s:Envelope'] || parsed['soapenv:Envelope'] || parsed.Envelope || parsed['soap:Envelope'];
    const bodyContent = body?.['s:Body'] || body?.['soapenv:Body'] || body?.Body;
    if (!bodyContent) {
      console.error('Could not find SOAP Body in response');
      console.log(resp.data);
      return;
    }

    // find getOfferResponse node (namespaces may vary). Try multiple keys:
    const respNode =
      bodyContent.getOfferResponse ||
      bodyContent['getOfferResponse'] ||
      bodyContent['vvg:getOfferResponse'] ||
      bodyContent['IGC_KrankenService_WCF_getOffer_ResponseMessage'] ||
      Object.values(bodyContent)[0]; // fallback to first child

    // drill to result/angebotField
    const result =
      respNode?.getOfferResult ||
      respNode?.getOfferResponse ||
      respNode?.getOfferResult ||
      respNode;
    const angebot = result?.angebotField || result?.angebot || result;

    // Extract Beitrag (premium) if present
    let beitrag;
    if (angebot) {
      // Contribution might be at angebot.Beitrag or angebotField.Beitrag._ or .$ etc
      if (angebot.Beitrag) {
        // if it's an object with _ text or direct string
        beitrag = typeof angebot.Beitrag === 'object' ? (angebot.Beitrag._ || angebot.Beitrag) : angebot.Beitrag;
      } else if (angebot.beitrag) {
        beitrag = angebot.beitrag;
      }
    }

    console.log('Beitrag (premium) found:', beitrag);

    // Extract documents: dateiField -> Datei (array or single)
    // Path variations exist; inspect result for exact keys
    const dateiField = result?.dateiField || result?.datei || result?.angebotField?.dateiField || null;

    if (dateiField) {
      // dateiField could contain Datei elements or directly the Datei list
      const datei = dateiField.Datei || dateiField.datei || dateiField;
      // Normalize to array
      const files = Array.isArray(datei) ? datei : [datei];

      let saved = 0;
      for (const fileNode of files) {
        if (!fileNode) continue;
        // fileNode might be object with _: base64 content, and $ with attributes
        const base64 = fileNode._ || fileNode['#text'] || fileNode;
        const attrs = fileNode.$ || fileNode['@'] || {};
        const artId = (attrs.ArtID || attrs.ArtId || attrs.artId || 'document').replace(/[^a-zA-Z0-9_-]/g, '');

        if (!base64 || typeof base64 !== 'string') continue;
        const buffer = Buffer.from(base64, 'base64');
        const filename = path.resolve(process.cwd(), `hallesche_${artId || 'doc'}_${Date.now()}.pdf`);
        fs.writeFileSync(filename, buffer);
        console.log('Saved document to', filename);
        saved++;
      }
      if (!saved) console.log('No base64 files extracted from dateiField.');
    } else {
      console.log('No dateiField returned.');
    }
  } catch (err) {
    if (err.response) {
      console.error('Status:', err.response.status);
      console.error('Server response:\n', err.response.data);
    } else {
      console.error('Error:', err.message || err);
    }
  }
}

callGetOffer();
