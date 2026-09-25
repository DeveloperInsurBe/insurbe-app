import { CheckCircle2, Fingerprint, UserPlus } from "lucide-react";

type Tone = "purple" | "green";

const TONES: Record<Tone, { panel: string; blob: string }> = {
  purple: {
    panel: "from-[#3b0764] via-[#820ad1] to-[#a855f7]",
    blob: "bg-[#f0abfc]/25",
  },
  green: {
    panel: "from-[#064e3b] via-[#0f8a5f] to-[#34d399]",
    blob: "bg-[#a7f3d0]/25",
  },
};

const HIGHLIGHTS = [
  "Share your personal referral link",
  "Track clicks and conversions in real-time",
  "Monitor pending and approved commissions",
];

// Brand side of the partner login / signup cards (same look as CreateApplicationModal).
export default function AccessBrandPanel({
  title,
  description,
  variant,
  tone = "purple",
}: {
  title: string;
  description: string;
  variant: "login" | "signup";
  tone?: Tone;
}) {
  const colors = TONES[tone];

  return (
    <aside
      className={`relative shrink-0 overflow-hidden bg-gradient-to-br ${colors.panel} px-6 pb-8 pt-8 text-white md:w-[42%] md:px-10 md:py-12`}
    >
      {/* animated background shapes */}
      <div className="modal-float pointer-events-none absolute -left-16 -top-16 h-64 w-64 rounded-full bg-white/10 blur-2xl" />
      <div
        className={`modal-float pointer-events-none absolute -bottom-24 -right-16 h-72 w-72 rounded-full ${colors.blob} blur-3xl`}
        style={{ animationDelay: "-4s" }}
      />
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.14]"
        style={{
          backgroundImage: "radial-gradient(circle, #fff 1px, transparent 1px)",
          backgroundSize: "22px 22px",
        }}
      />

      <div className="relative flex h-full flex-col">
        <div
          className="modal-item-in relative mb-6 h-14 w-14 md:mb-8 md:h-16 md:w-16"
          style={{ animationDelay: "120ms" }}
        >
          {variant === "login" ? (
            // fingerprint being scanned: a light bar sweeps over it while the tile glows
            <span className="glow-breathe relative flex h-full w-full items-center justify-center overflow-hidden rounded-2xl border border-white/30 bg-white/15 backdrop-blur">
              <Fingerprint size={30} />
              <span className="scan-sweep pointer-events-none absolute inset-x-1.5 top-0 h-1/2 bg-gradient-to-b from-transparent via-white/45 to-transparent motion-reduce:hidden">
                <span className="absolute inset-x-0 bottom-1/2 h-0.5 rounded-full bg-white shadow-[0_0_8px_2px_rgba(255,255,255,0.8)]" />
              </span>
            </span>
          ) : (
            <>
              {/* bobbing user-plus while "+1" badges pop up and float away */}
              <span className="relative flex h-full w-full items-center justify-center rounded-2xl border border-white/30 bg-white/15 backdrop-blur">
                <UserPlus size={28} className="icon-bob" />
              </span>
              <span className="badge-rise pointer-events-none absolute -right-3 -top-3 rounded-full bg-white px-1.5 py-0.5 text-[10px] font-black leading-none text-[#111827] shadow-md motion-reduce:hidden">
                +1
              </span>
              <span
                className="badge-rise pointer-events-none absolute -left-3 top-1 rounded-full bg-white/90 px-1.5 py-0.5 text-[10px] font-black leading-none text-[#111827] shadow-md motion-reduce:hidden"
                style={{ animationDelay: "1.5s" }}
              >
                +1
              </span>
            </>
          )}
        </div>

        <div className="modal-item-in" style={{ animationDelay: "180ms" }}>
          <span className="inline-flex rounded-full border border-white/25 bg-white/10 px-3.5 py-1 text-[11px] font-bold uppercase tracking-[2px] text-white/90">
            InsurBe Partner Program
          </span>
        </div>

        <h2
          className="modal-item-in mt-4 text-3xl font-black leading-[1.1] sm:text-4xl"
          style={{ animationDelay: "240ms" }}
        >
          {title}
        </h2>

        <p
          className="modal-item-in mt-3 max-w-sm text-sm leading-relaxed text-white/80 md:text-base"
          style={{ animationDelay: "300ms" }}
        >
          {description}
        </p>

        <ul className="mt-8 hidden space-y-3 md:block">
          {HIGHLIGHTS.map((item, index) => (
            <li
              key={item}
              className="modal-item-in flex items-start gap-2.5 text-sm text-white/85"
              style={{ animationDelay: `${380 + index * 70}ms` }}
            >
              <CheckCircle2 size={18} className="mt-0.5 shrink-0 text-white" />
              {item}
            </li>
          ))}
        </ul>
      </div>
    </aside>
  );
}
