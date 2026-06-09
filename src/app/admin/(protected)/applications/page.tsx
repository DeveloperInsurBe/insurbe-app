import { prisma } from "@/lib/prisma";
import ApplicationsTable from "./ApplicationsTable";

type PersonalInfo = {
  firstName?: string;
  lastName?: string;
  email?: string;
  phone?: string;
  city?: string;
  country?: string;
};

export default async function AdminApplicationsPage() {
  const applications = await prisma.application.findMany({
    select: {
      id: true,
      orderId: true,
      source: true,
      status: true,
      createdAt: true,
      firstName: true,
      lastName: true,
      userId: true,
      partnerId: true,
      product: true,
      commission: true,
      commissionStatus: true,
      personalDetails: true,
    },
    orderBy: { createdAt: "desc" },
  });

  const partnerIds = Array.from(
    new Set(applications.map((item) => item.partnerId).filter(Boolean)),
  ) as string[];

  const partners = await prisma.user.findMany({
    where: {
      partnerId: { in: partnerIds },
      role: "partner",
    },
    select: {
      partnerId: true,
      firstName: true,
      lastName: true,
      companyName: true,
      email: true,
    },
  });

  const partnerMap = new Map(
    partners.map((partner) => [
      partner.partnerId,
      {
        fullName: `${partner.firstName ?? ""} ${partner.lastName ?? ""}`.trim(),
        companyName: partner.companyName || "",
        email: partner.email,
      },
    ]),
  );

  const rows = applications.map((item) => {
    const personal = (item.personalDetails as PersonalInfo | null) ?? null;
    const partner = item.partnerId ? partnerMap.get(item.partnerId) : undefined;

    return {
      id: item.id,
      orderId: item.orderId,
      source: item.source || "-",
      status: item.status,
      createdAt: item.createdAt.toISOString(),
      firstName: item.firstName || personal?.firstName || "",
      lastName: item.lastName || personal?.lastName || "",
      userId: item.userId || "",
      partnerId: item.partnerId || "",
      partnerName: partner?.fullName || "",
      partnerCompany: partner?.companyName || "",
      partnerEmail: partner?.email || "",
      product: item.product || "",
      commission: item.commission,
      commissionStatus: item.commissionStatus,
      details: {
        email: personal?.email || "",
        phone: personal?.phone || "",
        city: personal?.city || "",
        country: personal?.country || "",
        personalJson: item.personalDetails,
      },
    };
  });

  return (
    <div className="space-y-5">
      <div className="rounded-2xl border border-gray-200 bg-white p-5">
        <p className="text-xs font-bold uppercase tracking-[2px] text-[#820ad1]">
          Applications
        </p>
        <h1 className="mt-2 text-3xl font-black text-gray-900">
          Partner & User Applications
        </h1>
        <p className="mt-2 text-sm text-gray-500">
          Manage all applications, full user details, and commission status.
        </p>
      </div>

      <ApplicationsTable initialRows={rows} />
    </div>
  );
}
