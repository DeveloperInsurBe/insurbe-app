import { FileText } from "lucide-react";

export default function DocumentsPage() {
  return (
    <div className="space-y-6 md:space-y-8">
      <div className="modal-item-in text-sm text-gray-500">
        Partner Portal / <span className="font-semibold text-black">Documents</span>
      </div>

      <section className="modal-panel-in relative overflow-hidden rounded-[28px] md:rounded-[32px] border border-[#f0e6fb] bg-gradient-to-br from-white via-[#faf7ff] to-[#f3e8ff] px-5 py-5 sm:px-7 sm:py-6 md:px-9 md:py-7 text-[#111827] shadow-[0_12px_40px_rgba(130,10,209,0.08)]">
        {/* animated background shapes */}
        <div className="modal-float pointer-events-none absolute -left-16 -top-16 h-64 w-64 rounded-full bg-[#820ad1]/10 blur-2xl" />
        <div
          className="modal-float pointer-events-none absolute -bottom-24 -right-16 h-72 w-72 rounded-full bg-[#a855f7]/15 blur-3xl"
          style={{ animationDelay: "-4s" }}
        />
        <div
          className="pointer-events-none absolute inset-0 opacity-[0.10]"
          style={{
            backgroundImage: "radial-gradient(circle, #820ad1 1px, transparent 1px)",
            backgroundSize: "22px 22px",
          }}
        />

        <div className="relative z-10 flex items-start gap-4">
          <div
            className="modal-item-in relative h-11 w-11 shrink-0 sm:h-12 sm:w-12"
            style={{ animationDelay: "120ms" }}
          >
            <span className="modal-ring absolute inset-0 rounded-2xl bg-[#820ad1]/25" />
            <span className="relative flex h-full w-full items-center justify-center rounded-2xl bg-gradient-to-br from-[#820ad1] to-[#a855f7] text-white shadow-lg shadow-[#820ad1]/25">
              <FileText size={22} />
            </span>
          </div>
          <div>
            <h1
              className="modal-item-in text-xl font-extrabold leading-tight tracking-tight sm:text-2xl md:text-[26px]"
              style={{ animationDelay: "200ms" }}
            >
              Documents
            </h1>
            <p
              className="modal-item-in mt-1 max-w-xl text-[13px] leading-relaxed text-[#667085] md:mt-1.5 md:text-sm"
              style={{ animationDelay: "280ms" }}
            >
              We are organizing all partner documents and templates here for quick access across mobile, tablet, and desktop.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
