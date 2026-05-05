export default function PartnerDashboard() {
  return (
    <div className="space-y-6">

      {/* HEADER */}
      <div>
        <p className="text-sm text-gray-500">Your Profile / Partner Program</p>

        <h1 className="text-3xl font-bold mt-1 relative inline-block">
          Hello Dalip!
          <span className="absolute left-0 bottom-1 w-full h-2 bg-green-200 -z-10"></span>
        </h1>
      </div>

      {/* GRID */}
      <div className="grid md:grid-cols-2 gap-6">

        {/* COMMISSION */}
        <div className="bg-white p-6 rounded-xl shadow-sm border">
          <h2 className="font-semibold text-lg mb-4">
            Commission Amount
          </h2>

          <div className="grid grid-cols-3 text-sm text-gray-500 mb-3">
            <p>Status</p>
            <p>Conversion</p>
            <p>Commission</p>
          </div>

          <div className="grid grid-cols-3 py-2 border-t">
            <p>Pending</p>
            <p className="font-semibold">0</p>
            <p className="text-green-600 font-semibold">€ 0</p>
          </div>

          <div className="grid grid-cols-3 py-2 border-t">
            <p>Approved</p>
            <p className="font-semibold">0</p>
            <p className="text-green-600 font-semibold">€ 0</p>
          </div>
        </div>

        {/* EMPTY RIGHT BOX (like image) */}
        <div className="bg-white rounded-xl shadow-sm border flex items-center justify-center text-gray-400">
          Banner / Referral Section
        </div>

      </div>

      {/* LOWER GRID */}
      <div className="grid md:grid-cols-2 gap-6">

        {/* CLICKS */}
        <div className="bg-white p-6 rounded-xl shadow-sm border">
          <h2 className="font-semibold text-lg mb-4">Clicks</h2>

          <div className="flex justify-between border-t py-2">
            <p>Today</p>
            <p className="text-green-600 font-semibold">0</p>
          </div>

          <div className="flex justify-between border-t py-2">
            <p>This month</p>
            <p className="text-green-600 font-semibold">0</p>
          </div>

          <div className="flex justify-between border-t py-2">
            <p>This year</p>
            <p className="text-green-600 font-semibold">0</p>
          </div>
        </div>

        {/* CONVERSIONS */}
        <div className="bg-white p-6 rounded-xl shadow-sm border">
          <h2 className="font-semibold text-lg mb-4">Conversions</h2>

          <div className="flex justify-between border-t py-2">
            <p>Today</p>
            <p className="text-green-600 font-semibold">0</p>
          </div>

          <div className="flex justify-between border-t py-2">
            <p>This month</p>
            <p className="text-green-600 font-semibold">0</p>
          </div>

          <div className="flex justify-between border-t py-2">
            <p>This year</p>
            <p className="text-green-600 font-semibold">0</p>
          </div>
        </div>

      </div>
    </div>
  );
}