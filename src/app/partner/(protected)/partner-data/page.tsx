import { redirect } from "next/navigation";

import PartnerDataClient from "./PartnerDataClient";
import { getCurrentPartnerAccess } from "@/lib/applicationAccess";

type Country = {
  name: string;
  code: string;
  dialCode: string;
  flag: string;
};

async function getCountries(): Promise<Country[]> {
  try {
    const res = await fetch(
      "https://restcountries.com/v3.1/all?fields=name,cca2,idd,flag",
      {
        // Cache on server so partner-data doesn't wait on countries each visit.
        next: { revalidate: 60 * 60 * 24 },
      },
    );

    if (!res.ok) {
      return [];
    }

    const data = await res.json();

    return data
      .map((c: any) => ({
        name: c?.name?.common || "",
        code: c?.cca2 || "",
        dialCode:
          c?.idd?.root && c?.idd?.suffixes?.length === 1
            ? c.idd.root + c.idd.suffixes[0]
            : c?.idd?.root || "",
        flag: c?.flag || "",
      }))
      .filter((c: Country) => c.name && c.dialCode)
      .sort((a: Country, b: Country) => a.name.localeCompare(b.name));
  } catch {
    return [];
  }
}

export default async function PartnerDataPage() {
  const { session, partner } = await getCurrentPartnerAccess();

  if (!session?.user?.email) {
    redirect("/");
  }

  if (!partner) {
    redirect("/");
  }

  const countries = await getCountries();

  return (
    <PartnerDataClient
      initialProfile={partner.partnerProfile}
      initialCountries={countries}
    />
  );
}
