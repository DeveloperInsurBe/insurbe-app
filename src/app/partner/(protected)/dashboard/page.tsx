import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";

import { authOptions } from "@/lib/authOptions";
import { prisma } from "@/lib/prisma";
import CopyReferralButton from "@/app/components/CopyReferralButton";

export default async function PartnerDashboard() {
  const session = await getServerSession(authOptions);

  // IF NOT LOGGED IN
  if (!session?.user?.email) {
    redirect("/");
  }

  // GET PARTNER
  const partner: any = await prisma.user.findUnique({
    where: {
      email: session.user.email,
    },
  });

  // IF USER NOT FOUND
  if (!partner) {
    redirect("/");
  }

  // GET APPLICATIONS
  const applications = await prisma.application.findMany({
    where: {
      partnerId: partner.email,
      source: "partner",
    },
  });

  // PENDING APPLICATIONS
  const pendingApplications = applications.filter(
    (item) => item.commissionStatus === "Pending",
  );

  // APPROVED APPLICATIONS
  const approvedApplications = applications.filter(
    (item) => item.commissionStatus === "Approved",
  );

  // TOTAL COUNTS
  const pendingCount = pendingApplications.length;

  const approvedCount = approvedApplications.length;

  // TOTAL COMMISSION
  const pendingCommission = pendingApplications.reduce(
    (acc, item) => acc + (item.commission || 0),
    0,
  );

  const approvedCommission = approvedApplications.reduce(
    (acc, item) => acc + (item.commission || 0),
    0,
  );

  // REFERRAL LINK
  const referralLink = `${process.env.NEXTAUTH_URL}/register?ref=${partner.partnerId}`;

  return (
    <div className="space-y-8">
      {/* HEADER */}
      <div>
        <p className="text-sm text-gray-500 mb-2">
          Your Profile / Partner Program
        </p>

        <div className="relative inline-block">
          <h1 className="text-4xl md:text-5xl font-black text-gray-900 relative z-10">
            Hello {partner?.firstName}!
          </h1>

          <div className="absolute left-0 bottom-2 h-3 w-full bg-[#820ad1]/20 rounded-full" />
        </div>
      </div>

      {/* TOP GRID */}
      <div className="grid xl:grid-cols-2 gap-8">
        {/* COMMISSION CARD */}
        <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-6 md:p-8">
          <div className="flex items-center gap-2 mb-8">
            <h2 className="text-2xl md:text-3xl font-bold text-gray-900">
              Commission Amount
            </h2>

            <div className="w-6 h-6 rounded-full bg-[#820ad1]/10 flex items-center justify-center text-[#820ad1] text-xs font-bold">
              i
            </div>
          </div>

          {/* TABLE HEADER */}
          <div className="grid grid-cols-3 pb-4 border-b text-gray-500 font-medium text-sm">
            <p>Status</p>

            <p className="text-center">Conversion</p>

            <p className="text-right">Commission</p>
          </div>

          {/* PENDING */}
          <div className="grid grid-cols-3 py-6 border-b items-center">
            <p className="text-lg text-gray-700">Pending</p>

            <p className="text-center text-3xl font-bold text-gray-900">
              {pendingCount}
            </p>

            <p className="text-right text-3xl font-bold text-[#820ad1]">
              € {pendingCommission}
            </p>
          </div>

          {/* APPROVED */}
          <div className="grid grid-cols-3 py-6 items-center">
            <p className="text-lg text-gray-700">Approved</p>

            <p className="text-center text-3xl font-bold text-gray-900">
              {approvedCount}
            </p>

            <p className="text-right text-3xl font-bold text-[#820ad1]">
              € {approvedCommission}
            </p>
          </div>
        </div>

        {/* BANNER */}
        <div className="relative overflow-hidden rounded-[32px] bg-gradient-to-br from-[#820ad1] to-[#9f3cff] p-6 md:p-7 text-white shadow-2xl shadow-[#820ad1]/20">
          {/* BG EFFECTS */}
          <div className="absolute -top-24 -right-24 w-72 h-72 bg-white/10 rounded-full blur-3xl" />

          <div className="absolute -bottom-32 -left-10 w-72 h-72 bg-black/10 rounded-full blur-3xl" />

          <div className="relative z-10 flex flex-col gap-8">
            {/* TOP */}
            <div className="space-y-4">
              <p className="uppercase tracking-[4px] text-[11px] md:text-xs text-white/70 font-semibold">
                Partner Referral
              </p>

              <div className="space-y-3">
                <h2 className="text-2xl md:text-4xl font-medium leading-tight max-w-xl">
                  Invite Students & Earn Commission
                </h2>

                <p className="text-white/75 text-sm md:text-base leading-relaxed max-w-lg">
                  Share your affiliate link and earn commission for every
                  successful insurance application.
                </p>
              </div>
            </div>

            {/* REFERRAL SECTION */}
            <div className="space-y-4">
              {/* LINK BAR */}
              <div className="h-14 rounded-2xl bg-white/10 border border-white/15 backdrop-blur-md flex items-center px-5 overflow-hidden">
                <p className="truncate text-sm md:text-base font-semibold text-white">
                  {referralLink}
                </p>
              </div>

              {/* BUTTONS */}
              <div className="flex flex-col sm:flex-row gap-3">
                {/* OPEN */}
                <a
                  href={referralLink}
                  target="_blank"
                  className="h-12 px-6 rounded-2xl bg-white text-[#820ad1] font-semibold inline-flex items-center justify-center hover:scale-[1.02] transition-all duration-200"
                >
                  Open Link
                </a>

                {/* COPY */}
                <CopyReferralButton referralLink={referralLink} />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ANALYTICS */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
        {/* CLICKS */}
        <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-6 md:p-8">
          {/* HEADER */}
          <div className="flex items-center gap-3 mb-8">
            <h2 className="text-2xl md:text-3xl font-black text-gray-900 relative inline-block">
              Clicks
              <span className="absolute left-0 bottom-1 h-2 w-full bg-[#820ad1]/20 rounded-full" />
            </h2>

            <div className="w-8 h-8 rounded-full bg-[#820ad1]/10 text-[#820ad1] flex items-center justify-center text-sm font-bold">
              i
            </div>
          </div>

          {/* TODAY */}
          <div className="flex items-center justify-between py-5 border-b border-gray-100">
            <p className="text-base md:text-lg text-gray-700">Today</p>

            <p className="text-3xl md:text-4xl font-black text-[#820ad1]">
              {
                applications.filter((item) => {
                  const today = new Date();

                  const itemDate = new Date(item.createdAt);

                  return (
                    itemDate.getDate() === today.getDate() &&
                    itemDate.getMonth() === today.getMonth() &&
                    itemDate.getFullYear() === today.getFullYear()
                  );
                }).length
              }
            </p>
          </div>

          {/* MONTH */}
          <div className="flex items-center justify-between py-5 border-b border-gray-100">
            <p className="text-base md:text-lg text-gray-700">This Month</p>

            <p className="text-3xl md:text-4xl font-black text-[#820ad1]">
              {
                applications.filter((item) => {
                  const today = new Date();

                  const itemDate = new Date(item.createdAt);

                  return (
                    itemDate.getMonth() === today.getMonth() &&
                    itemDate.getFullYear() === today.getFullYear()
                  );
                }).length
              }
            </p>
          </div>

          {/* YEAR */}
          <div className="flex items-center justify-between pt-5">
            <p className="text-base md:text-lg text-gray-700">This Year</p>

            <p className="text-3xl md:text-4xl font-black text-[#820ad1]">
              {
                applications.filter((item) => {
                  const today = new Date();

                  const itemDate = new Date(item.createdAt);

                  return itemDate.getFullYear() === today.getFullYear();
                }).length
              }
            </p>
          </div>
        </div>

        {/* CONVERSIONS */}
        <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-6 md:p-8">
          {/* HEADER */}
          <div className="flex items-center gap-3 mb-8">
            <h2 className="text-2xl md:text-3xl font-black text-gray-900 relative inline-block">
              Conversions
              <span className="absolute left-0 bottom-1 h-2 w-full bg-[#820ad1]/20 rounded-full" />
            </h2>

            <div className="w-8 h-8 rounded-full bg-[#820ad1]/10 text-[#820ad1] flex items-center justify-center text-sm font-bold">
              €
            </div>
          </div>

          {/* TODAY */}
          <div className="flex items-center justify-between py-5 border-b border-gray-100">
            <div>
              <p className="text-base md:text-lg text-gray-700">Today</p>

              <p className="text-sm text-gray-400 mt-1">Approved Commission</p>
            </div>

            <p className="text-2xl md:text-4xl font-black text-[#820ad1]">
              €
              {approvedApplications
                .filter((item) => {
                  const today = new Date();

                  const itemDate = new Date(item.createdAt);

                  return (
                    itemDate.getDate() === today.getDate() &&
                    itemDate.getMonth() === today.getMonth() &&
                    itemDate.getFullYear() === today.getFullYear()
                  );
                })
                .reduce((acc, item) => acc + (item.commission || 0), 0)}
            </p>
          </div>

          {/* MONTH */}
          <div className="flex items-center justify-between py-5 border-b border-gray-100">
            <div>
              <p className="text-base md:text-lg text-gray-700">This Month</p>

              <p className="text-sm text-gray-400 mt-1">Approved Commission</p>
            </div>

            <p className="text-2xl md:text-4xl font-black text-[#820ad1]">
              €
              {approvedApplications
                .filter((item) => {
                  const today = new Date();

                  const itemDate = new Date(item.createdAt);

                  return (
                    itemDate.getMonth() === today.getMonth() &&
                    itemDate.getFullYear() === today.getFullYear()
                  );
                })
                .reduce((acc, item) => acc + (item.commission || 0), 0)}
            </p>
          </div>

          {/* YEAR */}
          <div className="flex items-center justify-between pt-5">
            <div>
              <p className="text-base md:text-lg text-gray-700">This Year</p>

              <p className="text-sm text-gray-400 mt-1">Approved Commission</p>
            </div>

            <p className="text-2xl md:text-4xl font-black text-[#820ad1]">
              €
              {approvedApplications
                .filter((item) => {
                  const today = new Date();

                  const itemDate = new Date(item.createdAt);

                  return itemDate.getFullYear() === today.getFullYear();
                })
                .reduce((acc, item) => acc + (item.commission || 0), 0)}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
