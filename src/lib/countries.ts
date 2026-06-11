type CountryShape = {
  name: { common: string };
  cca2: string;
  flags: { svg: string; png: string };
  idd: { root: string; suffixes: string[] };
  flag: string;
};

const COUNTRIES_URL =
  "https://restcountries.com/v3.1/all?fields=name,cca2,flags,idd,flag";
const COUNTRIES_FALLBACK_URL =
  "https://raw.githubusercontent.com/mledoze/countries/master/countries.json";

function asArrayPayload(payload: unknown): any[] {
  if (Array.isArray(payload)) return payload;

  if (
    payload &&
    typeof payload === "object" &&
    "data" in payload &&
    Array.isArray((payload as { data?: unknown }).data)
  ) {
    return (payload as { data: any[] }).data;
  }

  return [];
}

function normalizeCountry(entry: any): CountryShape | null {
  const commonName =
    typeof entry?.name?.common === "string"
      ? entry.name.common.trim()
      : typeof entry?.name === "string"
        ? entry.name.trim()
        : "";

  const cca2 = typeof entry?.cca2 === "string" ? entry.cca2 : "";

  if (!commonName || !cca2) return null;

  const flagSvg =
    typeof entry?.flags?.svg === "string" ? entry.flags.svg : "";
  const flagPng =
    typeof entry?.flags?.png === "string" ? entry.flags.png : "";
  const flagEmoji =
    typeof entry?.flag === "string" ? entry.flag : "";

  const iddRoot =
    typeof entry?.idd?.root === "string" ? entry.idd.root : "";
  const iddSuffixes = Array.isArray(entry?.idd?.suffixes)
    ? entry.idd.suffixes.filter((suffix: unknown) => typeof suffix === "string")
    : [];

  return {
    name: { common: commonName },
    cca2,
    flags: { svg: flagSvg, png: flagPng },
    idd: { root: iddRoot, suffixes: iddSuffixes },
    flag: flagEmoji,
  };
}

export async function getCountriesCollection(): Promise<CountryShape[]> {
  try {
    const primaryResponse = await fetch(COUNTRIES_URL, {
      next: { revalidate: 60 * 60 * 24 },
    });

    if (primaryResponse.ok) {
      const primaryPayload = await primaryResponse.json();
      const primaryCountries = asArrayPayload(primaryPayload)
        .map(normalizeCountry)
        .filter((item): item is CountryShape => Boolean(item))
        .sort((a, b) => a.name.common.localeCompare(b.name.common));

      if (primaryCountries.length > 0) {
        return primaryCountries;
      }
    }

    const fallbackResponse = await fetch(COUNTRIES_FALLBACK_URL, {
      next: { revalidate: 60 * 60 * 24 },
    });

    if (!fallbackResponse.ok) return [];

    const fallbackPayload = await fallbackResponse.json();
    const fallbackCountries = asArrayPayload(fallbackPayload)
      .map(normalizeCountry)
      .filter((item): item is CountryShape => Boolean(item))
      .sort((a, b) => a.name.common.localeCompare(b.name.common));

    return fallbackCountries;
  } catch {
    return [];
  }
}
