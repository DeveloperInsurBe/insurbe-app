// debugGetOfferParse.js
import axios from 'axios';
import { parseStringPromise } from 'xml2js';
import fs from 'fs';
import path from 'path';

const endpoint = 'https://www.kv-rechner0.de/HallescheVVG_Net/GC_KrankenService.svc';
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

function findNodesByName(obj, targetName) {
  const results = [];
  const nameLower = targetName.toLowerCase();
  function recurse(node, path = '') {
    if (node == null) return;
    if (typeof node !== 'object') return;
    for (const key of Object.keys(node)) {
      const val = node[key];
      const keyLower = key.toLowerCase();
      const currentPath = path ? `${path}.${key}` : key;
      if (keyLower === nameLower) {
        results.push({ path: currentPath, node: val });
      }
      // arrays and objects
      if (Array.isArray(val)) {
        for (let i = 0; i < val.length; i++) {
          recurse(val[i], `${currentPath}[${i}]`);
        }
      } else if (typeof val === 'object') {
        recurse(val, currentPath);
      }
    }
  }
  recurse(obj);
  return results;
}

function extractText(node) {
  // node can be string, object with "_" or "#text", or nested
  if (node == null) return null;
  if (typeof node === 'string') return node;
  if (typeof node === 'number') return String(node);
  if (Array.isArray(node)) {
    return node.map(extractText).filter(Boolean).join(' ');
  }
  if (typeof node === 'object') {
    if ('_' in node) return node._;
    if ('#text' in node) return node['#text'];
    // try to find first primitive child
    for (const k of Object.keys(node)) {
      const v = node[k];
      const text = extractText(v);
      if (text) return text;
    }
  }
  return null;
}

async function run() {
  try {
    const resp = await axios.post(endpoint, xmlEnvelope, {
      headers: {
        'Content-Type': 'text/xml; charset=utf-8',
        'SOAPAction': `"${SOAP_ACTION}"`,
        Accept: 'text/xml',
      },
      timeout: 20000,
    });

    console.log('HTTP status', resp.status);
    console.log('--- RAW XML response (first 2000 chars) ---\n');
    console.log(String(resp.data).slice(0, 2000));
    console.log('\n--- end snippet ---\n\nParsing XML...');

    const parsed = await parseStringPromise(resp.data, { explicitArray: false, ignoreAttrs: false });
    // show top-level keys to quickly understand structure
    console.log('Top-level keys:', Object.keys(parsed).slice(0, 20));
    // Search for Beitrag (case-insensitive)
    const beitragNodes = findNodesByName(parsed, 'Beitrag');
    if (beitragNodes.length) {
      console.log('\nFound Beitrag nodes:');
      beitragNodes.forEach((it) => {
        console.log('path:', it.path, '=>', extractText(it.node));
      });
    } else {
      console.log('\nNo Beitrag nodes found.');
    }

    // Search for datei / Datei / dateiField
    const docCandidates = [
      ...findNodesByName(parsed, 'dateiField'),
      ...findNodesByName(parsed, 'datei'),
      ...findNodesByName(parsed, 'Datei'),
      ...findNodesByName(parsed, 'anhang'),
      ...findNodesByName(parsed, 'file'),
    ];

    if (docCandidates.length) {
      console.log('\nFound document candidate nodes:');
      for (const it of docCandidates) {
        console.log('path:', it.path, 'node sample:', JSON.stringify(it.node).slice(0, 400));
      }
    } else {
      console.log('\nNo obvious document nodes found (dateiField/Datei/datei).');
    }

    // As fallback, print deeper structure of Body children to inspect keys
    const soapBody =
      parsed['s:Envelope']?.['s:Body'] ||
      parsed['soapenv:Envelope']?.['soapenv:Body'] ||
      parsed['Envelope']?.['Body'] ||
      parsed['soap:Envelope']?.['soap:Body'] ||
      parsed;
    const bodyChildKeys = [];
    if (soapBody && typeof soapBody === 'object') {
      for (const k of Object.keys(soapBody)) bodyChildKeys.push(k);
    }
    console.log('\nBody child keys (top level):', bodyChildKeys);

    // If you want, save full parsed tree to a file for manual inspection
    fs.writeFileSync(path.resolve(process.cwd(), 'hallesche_parsed.json'), JSON.stringify(parsed, null, 2));
    console.log('Wrote parsed response to hallesche_parsed.json (inspect this file).');
  } catch (err) {
    if (err.response) {
      console.error('Status:', err.response.status);
      console.error('Server response (first 2000 chars):\n', String(err.response.data).slice(0, 2000));
    } else {
      console.error('Error:', err.message || err);
    }
  }
}

run();
