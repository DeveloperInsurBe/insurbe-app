import { NextResponse } from "next/server";

import { fetchQuotes, hmrQuotesEnabled, QuoteError, validateQuoteInput } from "@/lib/hmr/quotes";

export const maxDuration = 30;

// Simple per-visitor limit, so the page can't be used to flood HanseMerkur.
const WINDOW_MS = 60_000;
const MAX_PER_WINDOW = 20;
const hits = new Map<string, number[]>();
function tooMany(ip: string) {
  const now = Date.now();
  const recent = (hits.get(ip) ?? []).filter((time) => now - time < WINDOW_MS);
  recent.push(now);
  hits.set(ip, recent);
  if (hits.size > 5000) hits.clear();
  return recent.length > MAX_PER_WINDOW;
}

/** Live HanseMerkur prices for the incoming travel health insurance page. Nothing is stored. */
export async function POST(req: Request) {
  if (!hmrQuotesEnabled()) return NextResponse.json({ error: "Not available" }, { status: 404 });

  const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "local";
  if (tooMany(ip)) {
    return NextResponse.json({ error: "Too many requests. Please wait a minute and try again." }, { status: 429 });
  }

  try {
    const input = validateQuoteInput((await req.json().catch(() => ({}))) ?? {});
    const products = await fetchQuotes(input);
    return NextResponse.json({ products });
  } catch (error) {
    if (error instanceof QuoteError) return NextResponse.json({ error: error.message }, { status: error.status });
    console.error("HMR QUOTES ROUTE ERROR:", error);
    return NextResponse.json({ error: "Prices are not available right now. Please try again in a moment." }, { status: 500 });
  }
}
