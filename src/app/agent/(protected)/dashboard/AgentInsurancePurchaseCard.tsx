"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ChevronRight, Plus, Plane, X } from "lucide-react";
import Image from "next/image";

type Props = {
  agentRef: string;
};

export default function AgentInsurancePurchaseCard({ agentRef }: Props) {
  const router = useRouter();
  const [openModal, setOpenModal] = useState(false);

  return (
    <>
      <div className="rounded-[22px] md:rounded-[30px] border border-white/50 bg-white/90 p-5 md:p-6 shadow-[0_10px_35px_rgba(130,10,209,0.06)]">
        <div className="flex items-center justify-between gap-4">
          <div>
            <p className="text-xs font-bold uppercase tracking-[2px] text-[#820ad1]">
              Insurance Purchase
            </p>
            <h2 className="mt-2 text-2xl font-black text-[#111827]">
              Create Application
            </h2>
            <p className="mt-2 text-sm text-[#667085]">
              Start public or private insurance flow with your agent attribution.
            </p>
          </div>

          <button
            type="button"
            onClick={() => setOpenModal(true)}
            className="group inline-flex h-11 cursor-pointer items-center justify-center rounded-2xl bg-gradient-to-r from-[#820ad1] to-[#9f3cff] px-4 text-sm font-semibold text-white transition-all hover:scale-[1.02] gap-2"
          >
            <Plus size={16} className="transition-all group-hover:rotate-90" />
            Select
          </button>
        </div>
      </div>

      {openModal ? (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-3 sm:p-6">
          <div className="w-full max-w-5xl max-h-[92vh] overflow-y-auto bg-white rounded-[24px] md:rounded-[32px] p-4 sm:p-6 md:p-10 relative animate-in fade-in zoom-in duration-200">
            <button
              type="button"
              onClick={() => setOpenModal(false)}
              className="absolute right-6 top-6 w-11 h-11 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center transition-all"
            >
              <X size={22} />
            </button>

            <div className="mb-8 md:mb-10 pr-10">
              <h2 className="text-2xl sm:text-3xl md:text-4xl font-black text-gray-900">
                Please Select a Product Type
              </h2>
              <p className="text-gray-500 mt-3 text-base md:text-lg">
                Choose an insurance category to continue.
              </p>
            </div>

            <div className="grid lg:grid-cols-4 gap-4 md:gap-6">
              <button
                type="button"
                onClick={() => {
                  router.push(
                    `/insuranceSignupFlow?provider=dak&source=agent&ref=${agentRef}`,
                  );
                }}
                className="group relative text-left cursor-pointer border border-gray-200 hover:border-[#820ad1] rounded-3xl p-7 transition-all hover:-translate-y-1 hover:shadow-xl bg-white overflow-hidden"
              >
                <div className="absolute -top-14 -right-14 w-40 h-40 bg-[#820ad1]/5 rounded-full blur-3xl" />
                <div className="relative z-10 flex items-center justify-between mb-7">
                  <div className="w-16 h-16 rounded-2xl bg-[#820ad1]/10 flex items-center justify-center">
                    <div className="h-12 w-auto flex items-center justify-center">
                      <Image
                        src="/icons/dak_logo.jpeg"
                        alt="DAK Logo"
                        width={40}
                        height={32}
                        className="object-contain"
                      />
                    </div>
                  </div>
                </div>

                <div className="relative z-10">
                  <h3 className="text-2xl font-bold text-gray-900 leading-snug">
                    Public Health Insurance
                  </h3>
                  <p className="text-gray-500 mt-4 leading-relaxed">
                    Students / Employees
                  </p>
                  <div className="mt-6 inline-flex items-center gap-2 text-[#820ad1] font-semibold group-hover:gap-3 transition-all">
                    Continue
                    <ChevronRight size={18} />
                  </div>
                </div>
              </button>

              <button
                type="button"
                onClick={() => {
                  router.push(`/mawistaBooking?source=agent&ref=${agentRef}`);
                }}
                className="group relative text-left cursor-pointer border-2 border-[#820ad1] bg-[#faf7ff] rounded-3xl p-7 transition-all hover:-translate-y-1 hover:shadow-2xl overflow-hidden"
              >
                <div className="absolute -top-14 -right-14 w-40 h-40 bg-[#820ad1]/10 rounded-full blur-3xl" />
                <div className="relative z-10 flex items-center justify-between mb-7">
                  <div className="w-16 h-16 rounded-2xl bg-[#820ad1]/10 flex items-center justify-center">
                    <div className="h-12 w-auto flex items-center justify-center">
                      <Image
                        src="/partners_asset/mawista.svg"
                        alt="Mawista Logo"
                        width={110}
                        height={32}
                        className="object-contain"
                      />
                    </div>
                  </div>
                </div>

                <div className="relative z-10">
                  <h3 className="text-2xl font-bold text-gray-900 leading-snug">
                    Private Health Insurance
                  </h3>
                  <p className="text-gray-500 mt-4 leading-relaxed">
                    Students / Working Professionals
                  </p>
                  <div className="mt-6 inline-flex items-center gap-2 text-[#820ad1] font-semibold group-hover:gap-3 transition-all">
                    Continue
                    <ChevronRight size={18} />
                  </div>
                </div>
              </button>

              <button
                type="button"
                onClick={() => {
                  router.push("/products/insuranceJourney");
                }}
                className="group relative text-left cursor-pointer border border-gray-200 hover:border-[#820ad1] rounded-3xl p-7 transition-all hover:-translate-y-1 hover:shadow-xl bg-white overflow-hidden"
              >
                <div className="absolute -top-14 -right-14 w-40 h-40 bg-[#820ad1]/5 rounded-full blur-3xl" />
                <div className="relative z-10 flex items-center justify-between mb-7">
                  <div className="w-16 h-16 rounded-2xl bg-[#820ad1]/10 flex items-center justify-center">
                    <div className="h-12 w-auto flex items-center justify-center">
                      <Image
                        src="/icons/H.svg"
                        alt="Hallesche Logo"
                        width={44}
                        height={32}
                        className="object-contain"
                      />
                    </div>
                  </div>
                </div>

                <div className="relative z-10">
                  <h3 className="text-2xl font-bold text-gray-900 leading-snug">
                    Hallesche Insurance
                  </h3>
                  <p className="text-gray-500 mt-4 leading-relaxed">
                    Private Insurance Journey
                  </p>
                  <div className="mt-6 inline-flex items-center gap-2 text-[#820ad1] font-semibold group-hover:gap-3 transition-all">
                    Continue
                    <ChevronRight size={18} />
                  </div>
                </div>
              </button>

              <button
                type="button"
                disabled
                className="group relative text-left border border-gray-200 opacity-60 rounded-3xl p-7 bg-white overflow-hidden"
              >
                <div className="absolute -top-14 -right-14 w-40 h-40 bg-[#820ad1]/5 rounded-full blur-3xl" />
                <div className="relative z-10">
                  <div className="w-16 h-16 rounded-2xl bg-[#820ad1]/10 flex items-center justify-center mb-6">
                    <Plane className="text-[#820ad1]" size={30} />
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900 leading-snug">
                    Travel Students to Germany
                  </h3>
                  <p className="text-gray-500 mt-4 leading-relaxed">
                    Incoming / Travel Insurance
                  </p>
                  <div className="mt-6 inline-flex px-4 py-2 rounded-full bg-gray-100 text-gray-600 text-sm font-semibold">
                    Coming Soon
                  </div>
                </div>
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}
