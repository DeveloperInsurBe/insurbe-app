export default function PartnerDataLoading() {
  return (
    <div className="space-y-8 animate-pulse">
      <div className="h-4 w-44 rounded-full bg-gray-200" />

      <div className="rounded-[32px] border border-white/50 bg-white/90 p-6 md:p-8 shadow-sm">
        <div className="h-6 w-40 rounded-full bg-gray-200" />
        <div className="mt-4 h-12 w-56 rounded-2xl bg-gray-200" />
        <div className="mt-4 h-4 w-96 max-w-full rounded-full bg-gray-100" />
      </div>

      {Array.from({ length: 3 }).map((_, idx) => (
        <div
          key={idx}
          className="rounded-[32px] bg-white border border-gray-100 shadow-sm overflow-hidden"
        >
          <div className="p-6 md:p-8 border-b border-gray-100">
            <div className="h-8 w-64 rounded-2xl bg-gray-200" />
            <div className="mt-3 h-4 w-72 max-w-full rounded-full bg-gray-100" />
          </div>
          <div className="p-6 md:p-8 grid md:grid-cols-2 xl:grid-cols-3 gap-6">
            {Array.from({ length: 6 }).map((__, fieldIdx) => (
              <div key={fieldIdx} className="space-y-2">
                <div className="h-3 w-24 rounded-full bg-gray-200" />
                <div className="h-14 rounded-2xl bg-gray-100" />
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
