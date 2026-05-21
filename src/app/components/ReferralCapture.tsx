"use client";

import { useEffect } from "react";

export default function ReferralCapture() {
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);

    const ref = params.get("ref");

    if (ref) {
      localStorage.setItem("partner_ref", ref);
    }
  }, []);

  return null;
}