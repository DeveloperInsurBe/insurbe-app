import RolePage from "@/app/partner/(protected)/conversions-list/page";

export default async function PortalRolePage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  // Forward ?page= and ?pageSize= so pagination works under /portal.
  return <RolePage searchParams={searchParams} />;
}
