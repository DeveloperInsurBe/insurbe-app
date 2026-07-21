export default function PortalProtectedLoading() {
  return (
    <div className="space-y-6 animate-pulse">
      <div className="rounded-[24px] border border-white/50 bg-white p-5 shadow-sm md:p-6">
        <div className="h-3 w-28 rounded bg-[#f3e8ff]" />
        <div className="mt-3 h-9 w-96 max-w-full rounded bg-gray-100" />
        <div className="mt-3 h-4 w-[30rem] max-w-full rounded bg-gray-100" />
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <div className="rounded-[24px] border border-white/50 bg-white p-5 shadow-sm">
          <div className="h-4 w-20 rounded bg-gray-100" />
          <div className="mt-4 h-9 w-20 rounded bg-gray-100" />
          <div className="mt-2 h-3 w-28 rounded bg-gray-100" />
        </div>
        <div className="rounded-[24px] border border-white/50 bg-white p-5 shadow-sm">
          <div className="h-4 w-24 rounded bg-gray-100" />
          <div className="mt-4 h-9 w-20 rounded bg-gray-100" />
          <div className="mt-2 h-3 w-32 rounded bg-gray-100" />
        </div>
        <div className="rounded-[24px] border border-white/50 bg-white p-5 shadow-sm">
          <div className="h-4 w-24 rounded bg-gray-100" />
          <div className="mt-4 h-9 w-24 rounded bg-gray-100" />
          <div className="mt-2 h-3 w-36 rounded bg-gray-100" />
        </div>
      </div>

      <div className="rounded-[24px] border border-white/50 bg-white p-5 shadow-sm md:p-6">
        <div className="h-6 w-52 rounded bg-gray-100" />
        <div className="mt-5 space-y-3">
          <div className="h-14 rounded-2xl bg-gray-100" />
          <div className="h-14 rounded-2xl bg-gray-100" />
          <div className="h-14 rounded-2xl bg-gray-100" />
          <div className="h-14 rounded-2xl bg-gray-100" />
        </div>
      </div>
    </div>
  );
}
