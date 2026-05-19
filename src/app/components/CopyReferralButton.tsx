"use client";

import { useState } from "react";

type Props = {
  referralLink: string;
};

export default function CopyReferralButton({ referralLink }: Props) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(referralLink);

    setCopied(true);

    setTimeout(() => {
      setCopied(false);
    }, 2200);
  };

  return (
    <div className="relative w-full sm:w-auto">
      <button
        onClick={handleCopy}
        className="h-14 px-6 rounded-2xl border border-white/20 bg-white/10 text-white font-semibold inline-flex items-center justify-center hover:bg-white/20 transition-all whitespace-nowrap"
      >
        Copy Link
      </button>

      {/* POPUP */}
      <div
        className={`absolute left-1/2 -translate-x-1/2 -top-14 transition-all duration-300 ${
          copied
            ? "opacity-100 translate-y-0"
            : "opacity-0 translate-y-2 pointer-events-none"
        }`}
      >
        <div className="px-4 py-2 rounded-xl bg-white text-[#820ad1] text-sm font-semibold shadow-xl whitespace-nowrap">
          copied
        </div>
      </div>
    </div>
  );
}
