import { NextResponse } from "next/server";

import { getCountriesCollection } from "@/lib/countries";

export async function GET() {
  const countries = await getCountriesCollection();

  return NextResponse.json(countries, {
    headers: {
      "Cache-Control": "no-store",
    },
  });
}
