type CountryShape = {
  name: { common: string };
  cca2: string;
  flags: { svg: string; png: string };
  idd: { root: string; suffixes: string[] };
  flag: string;
};

const COUNTRIES_SOURCE_URL =
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
    const response = await fetch(COUNTRIES_SOURCE_URL, {
      next: { revalidate: 60 * 60 * 24 },
    });

    if (!response.ok) return [];

    const payload = await response.json();
    const countries = asArrayPayload(payload)
      .map(normalizeCountry)
      .filter((item): item is CountryShape => Boolean(item))
      .sort((a, b) => a.name.common.localeCompare(b.name.common));

    return countries;
  } catch {
    return [];
  }
}
