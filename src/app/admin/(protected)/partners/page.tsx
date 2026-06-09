import { prisma } from "@/lib/prisma";

export default async function AdminPartnersPage() {
  const [partners, partnerMetrics] = await Promise.all([
    prisma.user.findMany({
      where: { role: "partner" },
      select: {
        id: true,
        partnerId: true,
        firstName: true,
        lastName: true,
        email: true,
        companyName: true,
      },
      orderBy: { createdAt: "desc" },
    }),
    prisma.application.groupBy({
      by: ["partnerId"],
      where: {
        source: "partner",
        partnerId: { not: null },
        status: { not: "incomplete" },
      },
      _count: { _all: true },
      _sum: { commission: true },
    }),
  ]);

  const partnerMetricMap = new Map(
    partnerMetrics.map((item) => [
      item.partnerId,
      {
        enrollments: item._count._all,
        commission: item._sum.commission ?? 0,
      },
    ]),
  );

  return (
    <div className="space-y-5">
      <div className="rounded-2xl border border-gray-200 bg-white p-5">
        <p className="text-xs font-bold uppercase tracking-[2px] text-[#820ad1]">
          Partners
        </p>
        <h1 className="mt-2 text-3xl font-black text-gray-900">
          Partner Enrollments & Commission
        </h1>
        <p className="mt-2 text-sm text-gray-500">
          View every partner, number of enrollments, and total commission.
        </p>
      </div>

      <div className="overflow-x-auto rounded-2xl border border-gray-200 bg-white">
        <table className="min-w-[980px] w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-bold uppercase tracking-wide text-gray-500">
                Partner
              </th>
              <th className="px-4 py-3 text-left text-xs font-bold uppercase tracking-wide text-gray-500">
                Company
              </th>
              <th className="px-4 py-3 text-left text-xs font-bold uppercase tracking-wide text-gray-500">
                Email
              </th>
              <th className="px-4 py-3 text-left text-xs font-bold uppercase tracking-wide text-gray-500">
                Partner ID
              </th>
              <th className="px-4 py-3 text-left text-xs font-bold uppercase tracking-wide text-gray-500">
                Enrollments
              </th>
              <th className="px-4 py-3 text-left text-xs font-bold uppercase tracking-wide text-gray-500">
                Commission
              </th>
            </tr>
          </thead>

          <tbody>
            {partners.map((partner) => {
              const metric = partner.partnerId
                ? partnerMetricMap.get(partner.partnerId)
                : undefined;
              const fullName =
                `${partner.firstName ?? ""} ${partner.lastName ?? ""}`.trim() ||
                "Partner";

              return (
                <tr key={partner.id} className="border-t border-gray-100">
                  <td className="px-4 py-3 text-sm font-semibold text-gray-900">
                    {fullName}
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-700">
                    {partner.companyName || "-"}
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-700">
                    {partner.email}
                  </td>
                  <td className="px-4 py-3 text-sm font-semibold text-[#820ad1]">
                    {partner.partnerId || "-"}
                  </td>
                  <td className="px-4 py-3 text-sm font-semibold text-gray-900">
                    {metric?.enrollments ?? 0}
                  </td>
                  <td className="px-4 py-3 text-sm font-semibold text-gray-900">
                    EUR {metric?.commission ?? 0}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
