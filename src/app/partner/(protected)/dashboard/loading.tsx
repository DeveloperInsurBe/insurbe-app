export default function PartnerDashboardLoading() {
  return (
    <div className="space-y-5 animate-pulse md:space-y-6">
      {/* hero */}
      <div className="rounded-[28px] border border-[#f0e6fb] bg-gradient-to-br from-white via-[#faf7ff] to-[#f3e8ff] px-5 py-5 sm:px-7 sm:py-6 md:rounded-[32px] md:px-9 md:py-7">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between lg:gap-8">
          <div>
            <div className="h-6 w-40 rounded-full bg-[#ead7ff]" />
            <div className="mt-2.5 h-6 w-56 max-w-full rounded-xl bg-gray-200 md:h-7 md:w-72" />
            <div className="mt-2.5 h-4 w-72 max-w-full rounded-full bg-gray-100" />
          </div>
          <div className="h-12 w-full rounded-2xl bg-[#820ad1]/25 sm:w-56 md:h-14" />
        </div>
      </div>

      {/* commission + referral */}
      <div className="grid grid-cols-1 gap-5 md:gap-6 xl:grid-cols-[1.1fr_0.9fr]">
        <div className="rounded-[24px] border border-[#f0e6fb] bg-white p-5 shadow-sm md:rounded-[30px] md:p-7">
          <div className="flex items-center gap-4">
            <div className="h-12 w-12 rounded-2xl bg-gray-200" />
            <div>
              <div className="h-3 w-16 rounded-full bg-gray-200" />
              <div className="mt-2 h-6 w-32 rounded-full bg-gray-200" />
            </div>
          </div>
          <div className="mt-6 space-y-3 md:space-y-4">
            <div className="h-24 rounded-2xl bg-gray-100" />
            <div className="h-24 rounded-2xl bg-gray-100" />
          </div>
          <div className="mt-6 h-2.5 rounded-full bg-gray-100" />
        </div>

        <div className="rounded-[30px] bg-[#820ad1]/90 p-6 shadow-sm">
          <div className="h-5 w-32 rounded-full bg-white/30" />
          <div className="mt-4 h-10 w-44 rounded-2xl bg-white/20" />
          <div className="mt-6 h-14 rounded-2xl bg-white/20" />
          <div className="mt-5 grid grid-cols-3 gap-2.5 sm:grid-cols-6">
            {Array.from({ length: 6 }).map((_, idx) => (
              <div key={idx} className="h-11 rounded-xl bg-white/20" />
            ))}
          </div>
        </div>
      </div>

      {/* clicks + conversions */}
      <div className="grid grid-cols-1 gap-5 md:grid-cols-2 md:gap-6">
        {[0, 1].map((panel) => (
          <div
            key={panel}
            className="rounded-[24px] border border-[#f0e6fb] bg-white p-5 shadow-sm md:rounded-[30px] md:p-7"
          >
            <div className="flex items-center gap-4">
              <div className="h-12 w-12 rounded-2xl bg-gray-200" />
              <div>
                <div className="h-3 w-16 rounded-full bg-gray-200" />
                <div className="mt-2 h-6 w-28 rounded-full bg-gray-200" />
              </div>
            </div>
            <div className="mt-6 grid grid-cols-1 gap-3 min-[460px]:grid-cols-2">
              <div className="h-28 rounded-2xl bg-gray-100" />
              <div className="h-28 rounded-2xl bg-gray-100" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
