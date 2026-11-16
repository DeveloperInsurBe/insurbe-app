/**
 * MAWISTA online application (broker) links for InsurBe, as sent by MAWISTA
 * in November 2026. They replace the old www2.elviab2b.de links, which MAWISTA
 * no longer processes. Open them in a new tab, not in an iframe.
 * Used until the MAWISTA API integration is live.
 */
const MAWISTA_BASE = "https://syncrob2c-eu.tatsh.cloud/quote-and-buy";
const MAWISTA_KEY = "cwMM3BuJAL2+L1Kxnhs41w==";
const MAWISTA_BROKER = "IB_G01";

// The KEY is used exactly as MAWISTA sent it (not URL-encoded).
const mawistaLink = (product: string) =>
  `${MAWISTA_BASE}?KEY=${MAWISTA_KEY}&BRK=${MAWISTA_BROKER}&LANG=en&PT=${product}&isPrivate=1`;

export const MAWISTA_LINKS = {
  student: mawistaLink("STU"),
  expatcare: mawistaLink("MAE"),
  reisecare: mawistaLink("MRC"),
  visumGroup: mawistaLink("VISGRP"),
} as const;
