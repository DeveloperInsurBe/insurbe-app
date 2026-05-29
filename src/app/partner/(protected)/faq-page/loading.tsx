export default function FaqLoading() {
  return (
    <div className="space-y-4 md:space-y-5 animate-pulse">
      <div className="h-4 w-36 rounded-full bg-gray-200" />

      <div className="rounded-[18px] md:rounded-[22px] border border-white/50 bg-white/90 p-4 md:p-5 shadow-sm">
        <div className="h-5 w-48 rounded-full bg-gray-200" />
        <div className="mt-4 h-8 w-48 rounded-xl bg-gray-200" />
        <div className="mt-3 h-4 w-96 max-w-full rounded-full bg-gray-100" />
      </div>

      <div className="rounded-[18px] md:rounded-[22px] bg-white border border-gray-100 shadow-sm overflow-hidden p-3 space-y-2">
        {Array.from({ length: 6 }).map((_, idx) => (
          <div key={idx} className="h-14 rounded-xl bg-gray-100" />
        ))}
      </div>
    </div>
  );
}
