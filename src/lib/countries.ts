import countriesData from "./countriesData.json";

type CountryShape = {
  name: { common: string };
  cca2: string;
  flags: { svg: string; png: string };
  idd: { root: string; suffixes: string[] };
  flag: string;
};

// Bundled snapshot of https://raw.githubusercontent.com/mledoze/countries/master/countries.json,
// already normalized to CountryShape and sorted by common name. Bundling it avoids a
// ~1.4 MB remote download (2-3 s) on every uncached request.
const COUNTRIES = countriesData as CountryShape[];

export async function getCountriesCollection(): Promise<CountryShape[]> {
  return COUNTRIES;
}
