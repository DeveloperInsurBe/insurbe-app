"use client"

import { div } from 'framer-motion/client';
// components/HallescheQuote.jsx
import React, { useState } from 'react';

function base64ToBlob(base64, mime = '') {
  const byteChars = atob(base64);
  const byteNumbers = new Array(byteChars.length);
  for (let i = 0; i < byteChars.length; i++) {
    byteNumbers[i] = byteChars.charCodeAt(i);
  }
  const byteArray = new Uint8Array(byteNumbers);
  return new Blob([byteArray], { type: mime || '' });
}

export default function HallescheQuote() {
  const [loading, setLoading] = useState(false);
  const [premium, setPremium] = useState(null);
  const [docs, setDocs] = useState([]);
  const [error, setError] = useState(null);

  async function handleGetOffer() {
    setLoading(true);
    setError(null);
    setPremium(null);
    setDocs([]);

    // example payload (map from your UI fields)
    // take input form user in real app
    const payload = {
      tarifId: '34572',
      vorname: 'Max',
      name: 'Mustermann',
      geburtsdatum: '1988-02-03',
      beginn: '2025-09-01',
    };

    try {
      const r = await fetch('/api/getOfferEinzel', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (!r.ok) {
        const txt = await r.text();
        throw new Error(`server ${r.status}: ${txt}`);
      }
      const json = await r.json();
      setPremium(json.premium || null);
      // documents: array { kurz, base64 }
      setDocs(json.documents || []);
    } catch (e) {
      setError(e.message || 'Failed');
    } finally {
      setLoading(false);
    }
  }

  function downloadDoc(base64, suggestedName = 'hallesche_doc') {
    // guess mime by header of base64
    let mime = '';
    const header = base64.slice(0, 8);
    if (header.startsWith('JVBER')) mime = 'application/pdf';
    else if (header.slice(0,4) === 'UEsD') mime = 'application/zip';
    else mime = 'application/octet-stream';

    const blob = base64ToBlob(base64, mime);
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = suggestedName + (mime === 'application/pdf' ? '.pdf' : mime === 'application/zip' ? '.zip' : '.bin');
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  }

  return (
    <div className='w-full flex justify-center'>


    <div className='p-5 flex flex-col '>
      <button onClick={handleGetOffer} className='p-2 bg-black text-white hover:shadow-lg border border-gray-300 rounded-md w-[220px]' disabled={loading}>
        {loading ? 'Loading…' : 'Get Quote'}
      </button>

      {error && <div style={{color:'red'}}>{error}</div>}

      {premium !== null && (
        <div>
          <h3>Premium: {premium} </h3>
        </div>
      )}

      {docs.length > 0 && (
        <div>
          <h4 className='text-2xl text-center'>Documents</h4>
          <ul>
            {docs.map((d, i) => (
              <li key={i}>
                <div>{d.kurz || `Document ${i+1}`}</div>
                <button className='p-2 bg-black text-white hover:shadow-lg border border-gray-300 rounded-md w-[220px]' onClick={() => downloadDoc(d.base64, (d.kurz||`doc_${i+1}`).replace(/\s+/g,'_'))}>
                  Download
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
    </div>
  );
}
