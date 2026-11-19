import { redirect } from "next/navigation";

import PartnerDataClient from "@/app/partner/(protected)/partner-data/PartnerDataClient";
import { getCountriesCollection } from "@/lib/countries";
import { prisma } from "@/lib/prisma";
import { getCurrentTeamAdmin } from "@/lib/team/access";

export const dynamic = "force-dynamic";

type Country = { name: string; code: string; dialCode: string; flag: string };

async function getCountries(): Promise<Country[]> {
  try {
    const data = await getCountriesCollection();
    return data
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      .map((c: any) => ({
        name: c?.name?.common || "",
        code: c?.cca2 || "",
        dialCode: c?.idd?.root && c?.idd?.suffixes?.length === 1 ? c.idd.root + c.idd.suffixes[0] : c?.idd?.root || "",
        flag: c?.flag || "",
      }))
      .filter((c: Country) => c.name && c.dialCode)
      .sort((a: Country, b: Country) => a.name.localeCompare(b.name));
  } catch {
    return [];
  }
}

/**
 * The Sales Leader's own profile and bank details (same form as partners).
 * The bank details are what the Super Admin uses to pay their commission.
 * Saved through /api/partner/save-profile, which only ever writes the
 * signed-in user's own profile.
 */
export default async function TeamMyDataPage() {
  const teamAdmin = await getCurrentTeamAdmin();
  if (!teamAdmin) redirect("/team/login");

  const [profile, countries] = await Promise.all([
    prisma.partnerProfile.findUnique({ where: { userId: teamAdmin.id } }),
    getCountries(),
  ]);

  return <PartnerDataClient initialProfile={profile} initialCountries={countries} />;
}
