"use client";

import { useEffect } from "react";

const REF_TTL_DAYS = 90;

export default function ReferralCapture() {
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);

    const ref = params.get("ref")?.trim();

    if (ref) {
      const expiresAt = Date.now() + REF_TTL_DAYS * 24 * 60 * 60 * 1000;
      const payload = JSON.stringify({ value: ref, expiresAt });

      // Canonical key
      localStorage.setItem("partner_ref", ref);
      // Backward compatibility with existing flow
      localStorage.setItem("partnerRef", ref);
      localStorage.setItem("partner_ref_meta", payload);

      const expiresDate = new Date(expiresAt).toUTCString();
      document.cookie = `partner_ref=${encodeURIComponent(ref)}; path=/; expires=${expiresDate}; SameSite=Lax`;
      document.cookie = `partner_ref_expires=${String(expiresAt)}; path=/; expires=${expiresDate}; SameSite=Lax`;
    }
  }, []);

  return null;
}
