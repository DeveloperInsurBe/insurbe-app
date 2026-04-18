"use client";

import { CheckCircle, Mail, User, X } from "lucide-react";
import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";

interface Partner {
  name: string;
  logo: string;
  width: number;
  height: number;
}

const partners: Partner[] = [
  { name: "Allianz", logo: "/partners/allianz.png", width: 120, height: 40 },
  { name: "AOK", logo: "/partners/aok.png", width: 120, height: 40 },
  { name: "Barmer", logo: "/partners/barmer.png", width: 120, height: 40 },
  { name: "Barmenia", logo: "/partners/bothaer.png", width: 120, height: 40 },
  { name: "DKV", logo: "/partners/dkv.png", width: 120, height: 40 },
  { name: "Hallesche", logo: "/partners/haliesche.png", width: 120, height: 40 },
  { name: "HanseMerkur", logo: "/partners/hanse.png", width: 120, height: 40 },
  { name: "Signal Iduna", logo: "/partners/signal.png", width: 120, height: 40 },
];

export default function AboutPartners() {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    message: "",
  });

  /* -------- Auto Scroll -------- */
  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;

    let interval: NodeJS.Timeout;

    const start = () => {
      interval = setInterval(() => {
        el.scrollLeft += 1;
        if (el.scrollLeft >= el.scrollWidth - el.clientWidth) {
          el.scrollLeft = 0;
        }
      }, 30);
    };

    start();
    el.addEventListener("mouseenter", () => clearInterval(interval));
    el.addEventListener("mouseleave", start);

    return () => clearInterval(interval);
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setShowSuccess(true);

    setTimeout(() => {
      setShowSuccess(false);
      setIsModalOpen(false);
      setFormData({ name: "", email: "", message: "" });
    }, 1000);
  };

  return (
    <>
      {/* PARTNERS SECTION */}
      <section className="relative md:py-24 py-10 px-4 sm:px-6 lg:px-12 bg-gradient-to-br from-slate-50 via-purple-50/40 to-blue-50/40 overflow-hidden">
        <div className="max-w-6xl mx-auto">

          {/* Heading */}
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-extrabold">
              <span className="text-transparent bg-clip-text bg-linear-to-r from-primary to-purple-600">
                Trusted by leading
              </span>{" "}
              insurance partners
            </h2>

            <p className="mt-4 text-gray-600 text-base sm:text-lg max-w-2xl mx-auto">
              We collaborate with licensed and regulated insurance providers to
              offer secure, compliant, and value-driven solutions across Germany.
            </p>
          </div>

          {/* Logos */}
          <div className="relative">
            {/* Fade edges */}
            <div className="absolute left-0 top-0 bottom-0 w-20 bg-gradient-to-r from-slate-50 to-transparent z-10" />
            <div className="absolute right-0 top-0 bottom-0 w-20 bg-gradient-to-l from-slate-50 to-transparent z-10" />

            <div
              ref={scrollRef}
              className="overflow-x-auto scrollbar-hide"
              style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
            >
              <div className="flex items-center gap-8 py-6 min-w-max">
                {[...partners, ...partners].map((partner, index) => (
                  <div
                    key={`${partner.name}-${index}`}
                    className="flex-shrink-0"
                  >
                    {/* LOGO CARD */}
                    <div className="w-40 h-20 flex items-center justify-center rounded-2xl bg-white/70 backdrop-blur border border-white/40 shadow-md hover:shadow-lg transition group">
                      <Image
                        src={partner.logo}
                        alt={partner.name}
                        width={140}
                        height={60}
                        className="object-contain grayscale group-hover:grayscale-0 transition"
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* CTA */}
          <div className="text-center mt-14">
            <p className="text-gray-700 text-base sm:text-lg mb-6">
              Interested in partnering with InsurBe?
            </p>

            <motion.button
              onClick={() => setIsModalOpen(true)}
              whileHover={{ scale: 1.04 }}
              whileTap={{ scale: 0.96 }}
              className="px-10 py-3.5 rounded-full font-semibold text-white bg-gradient-to-r from-primary to-purple-600 shadow-lg hover:shadow-xl transition"
            >
              Contact Us
            </motion.button>
          </div>
        </div>
      </section>

      {/* CONTACT MODAL */}
      <AnimatePresence>
        {isModalOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
            onClick={() => setIsModalOpen(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              transition={{ duration: 0.3 }}
              onClick={(e) => e.stopPropagation()}
              className="relative w-full max-w-md bg-white rounded-2xl shadow-2xl overflow-hidden"
            >
              {/* Success */}
              <AnimatePresence>
                {showSuccess && (
                  <motion.div className="absolute inset-0 bg-white z-10 flex flex-col items-center justify-center">
                    <CheckCircle className="w-20 h-20 text-green-500 mb-4" />
                    <h3 className="text-xl font-bold">Success!</h3>
                    <p className="text-gray-600">We’ll reach out shortly.</p>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Close */}
              <button
                onClick={() => setIsModalOpen(false)}
                className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
              >
                <X className="w-6 h-6" />
              </button>

              {/* Form */}
              <div className="p-8">
                <h3 className="text-2xl font-bold mb-2">Partner with InsurBe</h3>
                <p className="text-gray-600 mb-6">
                  Tell us about your organization and collaboration goals.
                </p>

                <form onSubmit={handleSubmit} className="space-y-5">
                  <Input
                    icon={<User className="w-5 h-5" />}
                    placeholder="Full Name"
                    value={formData.name}
                    onChange={(v) =>
                      setFormData({ ...formData, name: v })
                    }
                  />

                  <Input
                    icon={<Mail className="w-5 h-5" />}
                    placeholder="Email Address"
                    value={formData.email}
                    onChange={(v) =>
                      setFormData({ ...formData, email: v })
                    }
                  />

                  <textarea
                    required
                    rows={4}
                    placeholder="Your message"
                    value={formData.message}
                    onChange={(e) =>
                      setFormData({ ...formData, message: e.target.value })
                    }
                    className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-primary focus:border-transparent"
                  />

                  <button
                    type="submit"
                    className="w-full py-3 rounded-lg font-semibold text-white bg-gradient-to-r from-primary to-purple-600 shadow-lg"
                  >
                    Submit Request
                  </button>
                </form>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

/* ---------- Reusable Input ---------- */
function Input({
  icon,
  placeholder,
  value,
  onChange,
}: {
  icon: React.ReactNode;
  placeholder: string;
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <div className="relative">
      <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
        {icon}
      </div>
      <input
        required
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full pl-10 pr-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-primary focus:border-transparent"
      />
    </div>
  );
}
