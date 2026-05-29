export default function ContactLoading() {
  return (
    <div className="space-y-8 animate-pulse">
      <div className="h-4 w-44 rounded-full bg-gray-200" />

      <div className="rounded-[32px] border border-white/50 bg-white/90 p-6 md:p-8 shadow-sm">
        <div className="h-6 w-40 rounded-full bg-gray-200" />
        <div className="mt-4 h-12 w-72 rounded-2xl bg-gray-200" />
        <div className="mt-4 h-4 w-96 max-w-full rounded-full bg-gray-100" />
      </div>

      <div className="rounded-[32px] bg-white border border-gray-100 shadow-sm overflow-hidden">
        <div className="p-6 md:p-8 border-b border-gray-100">
          <div className="h-8 w-56 rounded-2xl bg-gray-200" />
          <div className="mt-3 h-4 w-80 max-w-full rounded-full bg-gray-100" />
        </div>

        <div className="p-6 md:p-8 space-y-6">
          <div className="grid md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <div className="h-3 w-24 rounded-full bg-gray-200" />
              <div className="h-14 rounded-2xl bg-gray-100" />
            </div>
            <div className="space-y-2">
              <div className="h-3 w-32 rounded-full bg-gray-200" />
              <div className="h-14 rounded-2xl bg-gray-100" />
            </div>
          </div>

          <div className="space-y-2">
            <div className="h-3 w-20 rounded-full bg-gray-200" />
            <div className="h-14 rounded-2xl bg-gray-100" />
          </div>

          <div className="space-y-2">
            <div className="h-3 w-28 rounded-full bg-gray-200" />
            <div className="h-40 rounded-3xl bg-gray-100" />
          </div>

          <div className="h-20 rounded-2xl bg-gray-100" />
          <div className="h-14 w-44 rounded-2xl bg-[#820ad1]/20" />
        </div>
      </div>
    </div>
  );
}
