import { NextResponse } from "next/server";

import { getCountriesCollection } from "@/lib/countries";

export async function GET() {
  try {
    const countries = await getCountriesCollection();

    return NextResponse.json(
      countries
        .map((c) => ({
          name: c?.name?.common || "",
          code: c?.cca2 || "",
          dialCode:
            c?.idd?.root && c?.idd?.suffixes?.length === 1
              ? c.idd.root + c.idd.suffixes[0]
              : c?.idd?.root || "",
          flag: c?.flag || "",
        }))
        .filter((c) => c.name && c.dialCode)
        .sort((a, b) => a.name.localeCompare(b.name)),
    );
  } catch {
    return NextResponse.json([]);
  }
}
