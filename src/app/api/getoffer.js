// pages/api/getOffer.js
import axios from 'axios';
import { parseStringPromise } from 'xml2js';

const HALLESCHE_URL = 'https://www.kv-rechner0.de/HallescheVVG_Net/GC_KrankenService.svc';
const SOAP_ACTION = 'GEWA.COMP.VVGService/IGC_KrankenService_WCF/getOffer';

function buildGetOfferEnvelope({ tarifId, vorname, name, geburtsdatum, beginn }) {
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
                <tar:CT_Produkt>
                  <tar:Elementarprodukt>
                    <tar:CT_Elementarprodukt xsi:type="kt:CT_Tarif">
                      <kt:TarifID>${escapeXml(tarifId)}</kt:TarifID>
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

function escapeXml(str = '') {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

async function callHallesche(xml) {
  return axios.post(HALLESCHE_URL, xml, {
    headers: {
      'Content-Type': 'text/xml; charset=utf-8',
      'SOAPAction': `"${SOAP_ACTION}"`,
    },
    timeout: 20000,
  });
}

function extractPremium(parsed) {
  // try to reach Beitrag -> Betrag
  // path variant: Envelope -> Body -> getOfferResponse -> getOfferResult -> a:Angebot -> ... -> Beitrag -> CT_Beitrag -> Betrag
  // We'll search recursively for key named 'Betrag'
  const found = [];
  (function rec(obj) {
    if (!obj || typeof obj !== 'object') return;
    for (const k of Object.keys(obj)) {
      const local = k.includes(':') ? k.split(':').pop() : k;
      const v = obj[k];
      if (local === 'Betrag') {
        if (typeof v === 'string') found.push(v);
        else if (v && v._) found.push(v._);
      }
      if (Array.isArray(v)) v.forEach(rec);
      else if (typeof v === 'object') rec(v);
    }
  })(parsed);
  return found[0] || null;
}

function collectDocs(parsed) {
  const docs = [];
  (function rec(obj) {
    if (!obj || typeof obj !== 'object') return;
    for (const k of Object.keys(obj)) {
      const local = k.includes(':') ? k.split(':').pop() : k;
      const v = obj[k];
      if (local === 'CT_Datei' || local === 'Datei') {
        // add this node for inspection
        docs.push(v);
      }
      if (Array.isArray(v)) v.forEach(rec);
      else if (typeof v === 'object') rec(v);
    }
  })(parsed);

  // Normalize CT_Datei entries to array of objects that may contain Daten -> Value
  const out = [];
  function normalize(node) {
    if (!node) return;
    if (Array.isArray(node)) {
      node.forEach(normalize);
      return;
    }
    // node may contain Daten -> Value (namespaced)
    // try common shapes
    const doc = {};
    // find Kurzbeschreibung if present
    doc.kurz = node.Kurzbeschreibung || (node['Kurzbeschreibung'] && node['Kurzbeschreibung']['_']) || null;
    // find Daten.Value or Daten['b:Value']
    let daten = node.Daten || node['Daten'] || null;
    if (daten && typeof daten === 'object') {
      // value may be under 'b:Value', 'Value', or '#text' etc.
      const valCandidates = ['b:Value','Value','_','_text','#text'];
      for (const key of Object.keys(daten)) {
        const kLocal = key.includes(':') ? key.split(':').pop() : key;
        if (/Value$/i.test(kLocal) || kLocal === '_') {
          const v = daten[key];
          if (typeof v === 'string') {
            doc.base64 = v.replace(/\s/g,'');
            break;
          } else if (v && v._) {
            doc.base64 = v._.replace(/\s/g,'');
            break;
          }
        }
      }
    }
    // also allow node.Datei -> CT_Datei shape (if someone passed outer)
    out.push(doc);
  }

  // nodes in docs may be nested arrays/objects -> flatten CT_Datei objects
  const flat = [];
  (function flatten(n) {
    if (!n) return;
    if (Array.isArray(n)) return n.forEach(flatten);
    if (typeof n === 'object') {
      // if object contains 'CT_Datei' descend
      if (n.CT_Datei) flatten(n.CT_Datei);
      else {
        flat.push(n);
        for (const k of Object.keys(n)) {
          flatten(n[k]);
        }
      }
    }
  })(docs);

  flat.forEach(normalize);
  // keep only items with base64
  return out.filter(d => d.base64);
}

module.exports = async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Only POST' });

  try {
    const { tarifId, vorname, name, geburtsdatum, beginn } = req.body || {};
    if (!tarifId || !vorname || !name || !geburtsdatum || !beginn) {
      return res.status(400).json({ error: 'missing fields' });
    }

    const xml = buildGetOfferEnvelope({ tarifId, vorname, name, geburtsdatum, beginn });
    const call = await callHallesche(xml);

    // parse SOAP XML to JS
    const parsed = await parseStringPromise(call.data, { explicitArray: false, ignoreAttrs: false, trim: true });
    const premium = extractPremium(parsed);
    const docs = collectDocs(parsed);

    // return premium and base64 docs (small list). In production, you might store them or
    // return a download endpoint instead to stream binary.
    return res.status(200).json({ premium, documents: docs });
  } catch (err) {
    console.error('API error', err?.response?.data || err.message || err);
    const serverBody = err?.response?.data ? String(err.response.data).slice(0, 2000) : undefined;
    return res.status(500).json({ error: err.message, detail: serverBody });
  }
};
