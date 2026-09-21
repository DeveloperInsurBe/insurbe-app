"use client";

import { useState } from "react";
import { Plus } from "lucide-react";

import CreateApplicationModal from "../CreateApplicationModal";

type CreateApplicationButtonProps = {
  partnerRef: string;
};

// Opens the same product picker as the Conversions page's Create Application button.
export default function CreateApplicationButton({
  partnerRef,
}: CreateApplicationButtonProps) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="group cursor-pointer w-full sm:w-auto h-12 md:h-14 px-5 md:px-7 rounded-2xl bg-gradient-to-r from-[#820ad1] to-[#9f3cff] text-white font-semibold flex items-center justify-center gap-3 hover:scale-[1.02] transition-all duration-300 shadow-xl shadow-[#820ad1]/20"
      >
        <Plus
          size={18}
          className="group-hover:rotate-90 transition-all duration-300"
        />

        <span className="whitespace-nowrap text-sm md:text-base">
          Create Application
        </span>
      </button>

      <CreateApplicationModal
        open={open}
        onClose={() => setOpen(false)}
        partnerRef={partnerRef}
      />
    </>
  );
}
