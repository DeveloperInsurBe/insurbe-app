import { prisma } from "@/lib/prisma";

type PersonalDetails = {
  email?: string;
  phone?: string;
  city?: string;
  country?: string;
};

export default async function AdminUsersPage() {
  const applications = await prisma.application.findMany({
    where: {
      source: "user",
      status: { not: "incomplete" },
      userId: { not: null },
    },
    select: {
      id: true,
      userId: true,
      firstName: true,
      lastName: true,
      product: true,
      status: true,
      createdAt: true,
      personalDetails: true,
    },
    orderBy: { createdAt: "desc" },
  });

  const grouped = new Map<
    string,
    {
      userId: string;
      enrollments: number;
      latestAt: Date;
      latestProduct: string;
      firstName: string;
      lastName: string;
      email: string;
      phone: string;
      city: string;
      country: string;
    }
  >();

  for (const app of applications) {
    const key = app.userId || "";
    if (!key) continue;

    const details = (app.personalDetails as PersonalDetails | null) ?? null;
    const current = grouped.get(key);

    if (!current) {
      grouped.set(key, {
        userId: key,
        enrollments: 1,
        latestAt: app.createdAt,
        latestProduct: app.product || "-",
        firstName: app.firstName || "",
        lastName: app.lastName || "",
        email: details?.email || (key.includes("@") ? key : ""),
        phone: details?.phone || "",
        city: details?.city || "",
        country: details?.country || "",
      });
      continue;
    }

    current.enrollments += 1;

    if (app.createdAt > current.latestAt) {
      current.latestAt = app.createdAt;
      current.latestProduct = app.product || "-";
      current.firstName = app.firstName || current.firstName;
      current.lastName = app.lastName || current.lastName;
      current.email =
        details?.email ||
        current.email ||
        (key.includes("@") ? key : current.email);
      current.phone = details?.phone || current.phone;
      current.city = details?.city || current.city;
      current.country = details?.country || current.country;
    }
  }

  const users = Array.from(grouped.values()).sort(
    (a, b) => b.latestAt.getTime() - a.latestAt.getTime(),
  );

  return (
    <div className="space-y-5">
      <div className="rounded-2xl border border-gray-200 bg-white p-5">
        <p className="text-xs font-bold uppercase tracking-[2px] text-[#820ad1]">
          Users
        </p>
        <h1 className="mt-2 text-3xl font-black text-gray-900">
          User Application Enrollments
        </h1>
        <p className="mt-2 text-sm text-gray-500">
          Full user-level enrollment visibility across user application flow.
        </p>
      </div>

      <div className="overflow-x-auto rounded-2xl border border-gray-200 bg-white">
        <table className="min-w-[1080px] w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-bold uppercase tracking-wide text-gray-500">
                User
              </th>
              <th className="px-4 py-3 text-left text-xs font-bold uppercase tracking-wide text-gray-500">
                User ID
              </th>
              <th className="px-4 py-3 text-left text-xs font-bold uppercase tracking-wide text-gray-500">
                Email
              </th>
              <th className="px-4 py-3 text-left text-xs font-bold uppercase tracking-wide text-gray-500">
                Phone
              </th>
              <th className="px-4 py-3 text-left text-xs font-bold uppercase tracking-wide text-gray-500">
                Location
              </th>
              <th className="px-4 py-3 text-left text-xs font-bold uppercase tracking-wide text-gray-500">
                Enrollments
              </th>
              <th className="px-4 py-3 text-left text-xs font-bold uppercase tracking-wide text-gray-500">
                Latest Product
              </th>
              <th className="px-4 py-3 text-left text-xs font-bold uppercase tracking-wide text-gray-500">
                Latest Enrollment
              </th>
            </tr>
          </thead>

          <tbody>
            {users.map((user) => {
              const fullName = `${user.firstName} ${user.lastName}`.trim() || "-";

              return (
                <tr key={user.userId} className="border-t border-gray-100">
                  <td className="px-4 py-3 text-sm font-semibold text-gray-900">
                    {fullName}
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-700">
                    {user.userId}
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-700">
                    {user.email || "-"}
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-700">
                    {user.phone || "-"}
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-700">
                    {[user.city, user.country].filter(Boolean).join(", ") || "-"}
                  </td>
                  <td className="px-4 py-3 text-sm font-semibold text-gray-900">
                    {user.enrollments}
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-700">
                    {user.latestProduct}
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-700">
                    {new Date(user.latestAt).toLocaleString()}
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
