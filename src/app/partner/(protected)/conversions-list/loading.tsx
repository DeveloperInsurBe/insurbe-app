export default function ConversionsLoading() {
  return (
    <div className="space-y-8 animate-pulse">
      <div className="h-4 w-44 rounded-full bg-gray-200" />

      <div className="rounded-[32px] border border-gray-100 bg-white p-6 md:p-8 shadow-sm">
        <div className="flex flex-col xl:flex-row xl:items-center xl:justify-between gap-8">
          <div className="space-y-4">
            <div className="h-10 w-56 rounded-2xl bg-gray-200" />
            <div className="h-4 w-96 max-w-full rounded-full bg-gray-100" />
          </div>
          <div className="flex gap-4">
            <div className="h-14 w-40 rounded-2xl bg-gray-100" />
            <div className="h-14 w-44 rounded-2xl bg-[#820ad1]/20" />
          </div>
        </div>
      </div>

      <div className="rounded-[32px] border border-gray-100 bg-white shadow-sm overflow-hidden">
        <div className="px-6 md:px-8 py-6 border-b border-gray-100">
          <div className="h-8 w-56 rounded-2xl bg-gray-200" />
          <div className="mt-3 h-4 w-80 max-w-full rounded-full bg-gray-100" />
        </div>
        <div className="p-6 space-y-4">
          {Array.from({ length: 5 }).map((_, idx) => (
            <div key={idx} className="h-16 rounded-2xl bg-gray-100" />
          ))}
        </div>
      </div>
    </div>
  );
}
