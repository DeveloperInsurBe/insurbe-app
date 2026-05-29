import { Megaphone } from "lucide-react";

export default function MarketingAssetsPage() {
  return (
    <div className="space-y-6 md:space-y-8">
      <div className="text-sm text-gray-500">
        Partner Portal / <span className="font-semibold text-black">Marketing Assets</span>
      </div>

      <div className="relative overflow-hidden rounded-[24px] md:rounded-[32px] border border-white/50 bg-gradient-to-br from-white via-[#faf7ff] to-[#f3e8ff] p-5 sm:p-6 md:p-8 shadow-[0_12px_40px_rgba(130,10,209,0.08)]">
        <div className="absolute top-0 right-0 h-64 w-64 rounded-full bg-[#820ad1]/10 blur-3xl pointer-events-none" />

        <div className="relative z-10 flex items-start gap-4">
          <div className="flex h-12 w-12 sm:h-14 sm:w-14 items-center justify-center rounded-2xl bg-[#820ad1]/10 text-[#820ad1]">
            <Megaphone size={24} />
          </div>
          <div>
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-black text-[#111827]">Marketing Assets</h1>
            <p className="mt-2 text-sm md:text-base text-[#667085] max-w-2xl">
              This section is being prepared with banners, social creatives, and ready-to-use partner materials.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
