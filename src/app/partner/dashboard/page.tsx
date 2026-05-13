export default function PartnerDashboard() {
  return (
    <div className="space-y-8">
      {/* HEADER */}
      <div>
        <p className="text-sm text-gray-500 mb-2">
          Your Profile / Partner Program
        </p>

        <div className="relative inline-block">
          <h1 className="text-5xl font-black text-gray-900 relative z-10">
            Hello Dalip!
          </h1>

          <div className="absolute left-0 bottom-2 h-3 w-full bg-[#820ad1]/20 rounded-full" />
        </div>
      </div>

      {/* TOP GRID */}
      <div className="grid xl:grid-cols-2 gap-8">
        {/* COMMISSION CARD */}
        <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-8">
          <div className="flex items-center gap-2 mb-8">
            <h2 className="text-3xl font-bold text-gray-900">
              Commission Amount
            </h2>

            <div className="w-6 h-6 rounded-full bg-[#820ad1]/10 flex items-center justify-center text-[#820ad1] text-xs font-bold">
              i
            </div>
          </div>

          <div className="grid grid-cols-3 pb-4 border-b text-gray-500 font-medium text-sm">
            <p>Status</p>
            <p className="text-center">Conversion</p>
            <p className="text-right">Commission</p>
          </div>

          <div className="grid grid-cols-3 py-6 border-b items-center">
            <p className="text-lg text-gray-700">Pending</p>

            <p className="text-center text-3xl font-bold text-gray-900">
              0
            </p>

            <p className="text-right text-3xl font-bold text-[#820ad1]">
              € 0
            </p>
          </div>

          <div className="grid grid-cols-3 py-6 items-center">
            <p className="text-lg text-gray-700">Approved</p>

            <p className="text-center text-3xl font-bold text-gray-900">
              0
            </p>

            <p className="text-right text-3xl font-bold text-[#820ad1]">
              € 0
            </p>
          </div>
        </div>

        {/* BANNER */}
        <div className="bg-gradient-to-br from-[#820ad1] to-[#9f3cff] rounded-3xl p-10 text-white relative overflow-hidden min-h-[320px] flex flex-col justify-between">
          <div>
            <p className="uppercase tracking-[4px] text-sm opacity-80">
              Partner Referral
            </p>

            <h2 className="text-4xl font-black mt-4 leading-tight">
              Invite Students <br />
              Earn Commission
            </h2>

            <p className="mt-4 text-white/80 max-w-sm">
              Share your referral link and start earning for every successful
              conversion.
            </p>
          </div>

          <button className="w-fit px-6 py-3 bg-white text-[#820ad1] rounded-xl font-semibold hover:scale-105 transition-all">
            Copy Referral Link
          </button>

          <div className="absolute -right-16 -top-16 w-56 h-56 bg-white/10 rounded-full" />
          <div className="absolute -bottom-20 -left-10 w-64 h-64 bg-white/5 rounded-full" />
        </div>
      </div>

      {/* LOWER GRID */}
      <div className="grid xl:grid-cols-2 gap-8">
        {/* CLICKS */}
        <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-8">
          <h2 className="text-3xl font-bold mb-8">Clicks</h2>

          {[
            { label: "Today", value: 0 },
            { label: "This month", value: 0 },
            { label: "This year", value: 0 },
          ].map((item) => (
            <div
              key={item.label}
              className="flex items-center justify-between py-5 border-t"
            >
              <p className="text-lg text-gray-700">{item.label}</p>

              <p className="text-3xl font-bold text-[#820ad1]">
                {item.value}
              </p>
            </div>
          ))}
        </div>

        {/* CONVERSIONS */}
        <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-8">
          <h2 className="text-3xl font-bold mb-8">Conversions</h2>

          {[
            { label: "Today", value: 0 },
            { label: "This month", value: 0 },
            { label: "This year", value: 0 },
          ].map((item) => (
            <div
              key={item.label}
              className="flex items-center justify-between py-5 border-t"
            >
              <p className="text-lg text-gray-700">{item.label}</p>

              <p className="text-3xl font-bold text-[#820ad1]">
                {item.value}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}