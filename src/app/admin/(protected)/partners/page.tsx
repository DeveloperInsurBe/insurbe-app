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
      <div className="rounded-2xl border border-gray-200 bg-white p-4 sm:p-5">
        <p className="text-xs font-bold uppercase tracking-[2px] text-[#820ad1]">
          Partners
        </p>
        <h1 className="mt-2 text-2xl font-black text-gray-900 sm:text-3xl">
          Partner Enrollments & Commission
        </h1>
        <p className="mt-2 text-sm text-gray-500">
          View every partner, number of enrollments, and total commission.
        </p>
      </div>

      <div className="space-y-3 xl:hidden">
        {partners.map((partner) => {
          const metric = partner.partnerId
            ? partnerMetricMap.get(partner.partnerId)
            : undefined;
          const fullName =
            `${partner.firstName ?? ""} ${partner.lastName ?? ""}`.trim() ||
            "Partner";

          return (
            <div
              key={partner.id}
              className="rounded-2xl border border-gray-200 bg-white p-4"
            >
              <p className="text-sm font-semibold text-gray-900">{fullName}</p>
              <p className="mt-1 text-xs text-[#820ad1]">
                {partner.partnerId || "-"}
              </p>
              <p className="mt-3 text-sm text-gray-700">{partner.email}</p>
              <p className="mt-1 text-sm text-gray-500">
                {partner.companyName || "-"}
              </p>

              <div className="mt-4 grid grid-cols-2 gap-3">
                <div className="rounded-xl bg-gray-50 p-3">
                  <p className="text-[11px] font-semibold uppercase tracking-wide text-gray-500">
                    Enrollments
                  </p>
                  <p className="mt-1 text-lg font-black text-gray-900">
                    {metric?.enrollments ?? 0}
                  </p>
                </div>
                <div className="rounded-xl bg-gray-50 p-3">
                  <p className="text-[11px] font-semibold uppercase tracking-wide text-gray-500">
                    Commission
                  </p>
                  <p className="mt-1 text-lg font-black text-[#820ad1]">
                    EUR {metric?.commission ?? 0}
                  </p>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="hidden overflow-x-auto rounded-2xl border border-gray-200 bg-white xl:block">
        <table className="w-full min-w-[980px]">
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
