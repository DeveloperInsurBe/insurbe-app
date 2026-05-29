export default function PartnerDashboardLoading() {
  return (
    <div className="space-y-6 animate-pulse">
      <div className="rounded-[32px] border border-white/50 bg-white/80 p-7 shadow-sm">
        <div className="h-5 w-40 rounded-full bg-gray-200" />
        <div className="mt-5 h-12 w-72 rounded-2xl bg-gray-200" />
        <div className="mt-4 h-4 w-96 max-w-full rounded-full bg-gray-100" />
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-[1.1fr_0.9fr] gap-6">
        <div className="rounded-[28px] border border-white/50 bg-white/90 p-6 shadow-sm">
          <div className="h-6 w-36 rounded-full bg-gray-200" />
          <div className="mt-6 space-y-4">
            <div className="h-24 rounded-2xl bg-gray-100" />
            <div className="h-24 rounded-2xl bg-gray-100" />
          </div>
        </div>

        <div className="rounded-[30px] bg-[#820ad1]/90 p-6 shadow-sm">
          <div className="h-5 w-32 rounded-full bg-white/30" />
          <div className="mt-4 h-10 w-44 rounded-2xl bg-white/20" />
          <div className="mt-6 h-14 rounded-2xl bg-white/20" />
          <div className="mt-5 grid grid-cols-3 sm:grid-cols-6 gap-2.5">
            {Array.from({ length: 6 }).map((_, idx) => (
              <div key={idx} className="h-11 rounded-xl bg-white/20" />
            ))}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="rounded-[28px] border border-white/50 bg-white/90 p-6 shadow-sm">
          <div className="h-6 w-28 rounded-full bg-gray-200" />
          <div className="mt-6 space-y-4">
            <div className="h-20 rounded-2xl bg-gray-100" />
            <div className="h-20 rounded-2xl bg-gray-100" />
          </div>
        </div>

        <div className="rounded-[28px] border border-white/50 bg-white/90 p-6 shadow-sm">
          <div className="h-6 w-32 rounded-full bg-gray-200" />
          <div className="mt-6 space-y-4">
            <div className="h-20 rounded-2xl bg-gray-100" />
            <div className="h-20 rounded-2xl bg-gray-100" />
          </div>
        </div>
      </div>
    </div>
  );
}
