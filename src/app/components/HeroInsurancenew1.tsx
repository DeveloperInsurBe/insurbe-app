"use client";

import Image from "next/image";
import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";
import {
  ArrowRight,
  Star,
  GraduationCap,
  Briefcase,
  ShieldCheck,
  Calendar,
  Mail,
  User,
  X,
  CheckCircle,
  Clock,
  Sparkles,
  Shield,
  Smartphone,
  Headphones,
  Flashlight,
  Zap,
} from "lucide-react";
import { useState } from "react";
import AppointmentModal from "./modals/AppointmentModal";
import { useRouter } from "next/navigation";

/* ---------------- Feature Item ---------------- */

interface FeatureItemProps {
  icon: React.ElementType;
  text: string;
}

function FeatureItem({ icon: Icon, text }: FeatureItemProps) {
  return (
    <div className="flex items-start gap-2 sm:gap-3">
      <Icon className="w-4 h-4 sm:w-5 sm:h-5 mt-1 flex-shrink-0 text-primary" />
      <p className="text-gray-700 text-xs sm:text-sm leading-relaxed">{text}</p>
    </div>
  );
}

/* ---------------- Hero ---------------- */

export default function HeroInsurancenew1() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    date: "",
    time: "",
    comment: "",
  });
  const router = useRouter();
  const toggleFAQ = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Appointment data:", formData);
    setShowSuccess(true);
    setTimeout(() => {
      setShowSuccess(false);
      setIsModalOpen(false);
      setFormData({ name: "", email: "", date: "", time: "", comment: "" });
    }, 1000);
  };

  const handleScroll = () => {
    const el = document.getElementById("choose-us");
    if (!el) return;
    const y = el.getBoundingClientRect().top + window.scrollY - 80;
    window.scrollTo({ top: y, behavior: "smooth" });
  };

  const handleScroll1 = () => {
    const le = document.getElementById("explore");
    if (!le) return;
    const y = le.getBoundingClientRect().top + window.scrollY - 80;
    window.scrollTo({ top: y, behavior: "smooth" });
  };

  return (
    <>
      <section className="relative overflow-hidden py-14 sm:py-16 px-4 sm:px-8 lg:px-16">
        <div className="max-w-7xl mx-auto   ">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8 lg:gap-12 xl:gap-16 items-stretch">
            {/* LEFT CONTENT */}
            <motion.div
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="flex flex-col gap-4 sm:gap-5 lg:gap-6 text-center lg:text-left max-w-xl mx-auto lg:mx-0 order-2 lg:order-1"
            >
              {/* Badge */}
              <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: 0.3, duration: 0.5 }}
                className="inline-flex items-center gap-2 px-3 sm:px-4 py-1.5 sm:py-2 rounded-full bg-linear-to-r from-purple-100 to-blue-100 border-2 border-purple-200 shadow-lg mx-auto lg:mx-0 w-fit"
              >
                <Star className="w-3 h-3 text-purple-600" />
                <span className="text-[10px] font-bold text-purple-700 uppercase tracking-wide">
                  Instant Coverage
                </span>
              </motion.div>

              {/* Heading */}
              <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-extrabold text-gray-900 leading-tight px-2 sm:px-4">
                Get Insured in{" "}
                <span className="text-transparent bg-clip-text bg-linear-to-r from-primary to-purple-600">
                  Minutes
                </span>
              </h1>

              {/* Sub text */}
              <p className="text-gray-500 text-sm sm:text-base lg:text-lg leading-relaxed max-w-md mx-auto lg:mx-0 px-2 sm:px-4">
                Insurance Made Simple for You, Fully digital and compliant.
              </p>

              {/* CTAs */}
              <div className="flex flex-col xs:flex-row gap-3 pt-2 max-w-md mx-auto lg:mx-0 px-2 sm:px-4">
                <motion.button
                  onClick={handleScroll1}
                  whileHover={{ scale: 1.04 }}
                  whileTap={{ scale: 0.96 }}
                  className="
      w-full xs:flex-1
      flex items-center justify-between
      rounded-2xl lg:rounded-3xl
      cursor-pointer
      bg-linear-to-r from-primary to-purple-600
      text-white
      text-sm sm:text-base font-bold
      py-3 sm:py-4
      px-5 sm:px-7 md:px-10
      shadow-xl hover:shadow-2xl
      transition-all duration-300
      focus:outline-none focus:ring-4 focus:ring-purple-300/50
    "
                >
                  {/* LEFT ICON */}
                  <div className="flex h-6 w-6 items-center justify-center shrink-0">
                    <Shield
                      className="h-5 w-5 sm:h-6 sm:w-6 text-white"
                      strokeWidth={2.2}
                    />
                  </div>

                  {/* TEXT */}
                  <span className="flex-1 text-center whitespace-nowrap">
                    Explore Our Policies
                  </span>

                  {/* RIGHT ICON */}
                  <div className="flex items-center justify-center shrink-0">
                    <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5" />
                  </div>
                </motion.button>

                <motion.button
                  onClick={() => router.push("/products/insuranceJourney")}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.96 }}
                  className="w-full xs:flex-1 cursor-pointer rounded-2xl lg:rounded-3xl border-2 border-purple-300 hover:border-purple-400 px-6 py-3 sm:py-4 text-purple-600 font-semibold text-sm sm:text-base hover:bg-purple-50 hover:shadow-lg transition-all duration-300 focus:outline-none focus:ring-4 focus:ring-purple-600/50"
                >
                  Learn more
                  <ArrowRight className="w-4 h-4 inline-block ml-1 -mt-0.5" />
                </motion.button>
              </div>

              {/* Reviews */}
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6 }}
                className="pt-4 flex justify-center lg:justify-start px-4"
              >
                <div className="inline-flex items-center gap-2 sm:gap-3 rounded-2xl border border-gray-200 bg-white/80 backdrop-blur-sm px-4 sm:px-6 py-2.5 sm:py-3 shadow-lg">
                  <div className="flex gap-0.5 sm:gap-1">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        className="w-3.5 h-3.5 sm:w-4 sm:h-4 fill-yellow-400 text-yellow-400"
                      />
                    ))}
                  </div>
                  <span className="text-xs sm:text-sm text-gray-600 font-medium hidden sm:inline">
                    Rated Excellent
                  </span>
                  <img
                    src="/gifs_assets/google.png"
                    alt="Google"
                    className="w-4 h-4 sm:w-5 sm:h-5"
                  />
                </div>
              </motion.div>
            </motion.div>

            {/* RIGHT IMAGE  */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="
                relative
                w-full
                h-[350px]
                sm:h-[400px]
                md:h-[450px]
                lg:h-[520px]
                order-1 lg:order-2
                flex items-center justify-center
              "
            >
              {/* ── DOUBLE SHADE BACKGROUND LAYERS ── */}

              {/* SHADE LAYER 1 — TOP RIGHT */}
              <div
                className="absolute z-[1] pointer-events-none"
                style={{
                  width: "92%",
                  height: "92%",
                  top: "-14px",
                  right: "-14px",
                  borderRadius: "38px",
                  background:
                    "linear-gradient(135deg, rgba(130,10,209,0.18), rgba(192,132,252,0.08))",
                  border: "1px solid rgba(168,85,247,0.18)",
                  transform: "rotate(6deg)",
                  boxShadow: "0 25px 50px rgba(130,10,209,0.10)",
                }}
              />

              {/* SHADE LAYER 2 — BOTTOM LEFT */}
              <div
                className="absolute z-[1] pointer-events-none"
                style={{
                  width: "92%",
                  height: "92%",
                  bottom: "-16px",
                  left: "-16px",
                  borderRadius: "38px",
                  background:
                    "linear-gradient(180deg, rgba(255,255,255,0.95), rgba(243,232,255,0.78))",
                  border: "1px solid rgba(255,255,255,0.75)",
                  transform: "rotate(-5deg)",
                  boxShadow: "0 20px 45px rgba(130,10,209,0.08)",
                }}
              />

              {/* ── IMAGE CARD — main image with premium border glow ── */}
              <motion.div
                whileHover={{ scale: 1.015 }}
                transition={{ duration: 0.4 }}
                className="
                  absolute inset-0
                  rounded-[28px]
                  sm:rounded-[34px]
                  border-[3px]
                  border-white
                  overflow-hidden
                  z-10
                "
                style={{
                  boxShadow:
                    "0 20px 60px rgba(0,0,0,0.08), 0 0 0 1px rgba(130,10,209,0.10), 0 8px 32px rgba(130,10,209,0.12)",
                }}
              >
                {/* Purple shimmer overlay on hover — purely CSS */}
                <div
                  className="absolute inset-0 z-10 pointer-events-none rounded-[28px] sm:rounded-[34px]"
                  style={{
                    background:
                      "linear-gradient(135deg, rgba(130,10,209,0.06) 0%, transparent 40%, rgba(168,85,247,0.04) 100%)",
                  }}
                />

                <Image
                  src="/hero_assets/phero8.avif"
                  alt="Insurance made easy"
                  fill
                  priority
                  className="object-cover object-center rounded-[28px] sm:rounded-[34px]"
                  sizes="(max-width: 1024px) 100vw, 50vw"
                />
              </motion.div>

              {/* ── BOTTOM GLOW LINE — underline accent ── */}
              <div
                className="absolute bottom-0 left-1/2 z-5 pointer-events-none"
                style={{
                  transform: "translateX(-50%)",
                  width: "70%",
                  height: "1px",
                  background:
                    "linear-gradient(90deg, transparent 0%, rgba(130,10,209,0.35) 30%, rgba(168,85,247,0.5) 50%, rgba(130,10,209,0.35) 70%, transparent 100%)",
                  filter: "blur(1px)",
                }}
              />
            </motion.div>
          </div>
          {/* ───────────────── FEATURES STRIP ───────────────── */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7, duration: 0.6 }}
            className="mt-10 sm:mt-14"
          >
            <div
              className="
      relative overflow-hidden
      rounded-[28px]
      border border-white/60
      bg-white/80
      backdrop-blur-xl
      shadow-[0_15px_50px_rgba(130,10,209,0.08)]
      px-4 sm:px-6 lg:px-8
      py-5 sm:py-6
    "
            >
              {/* SOFT PURPLE GLOW */}
              <div className="absolute inset-0 pointer-events-none">
                <div
                  className="absolute -top-10 left-1/4 w-60 h-60 rounded-full"
                  style={{
                    background:
                      "radial-gradient(circle, rgba(130,10,209,0.10) 0%, transparent 70%)",
                    filter: "blur(40px)",
                  }}
                />
              </div>

              {/* GRID */}
              <div className="relative z-10 grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-4">
                {/* ITEM */}
                <div className="flex items-center gap-3 sm:gap-4">
                  <div className="w-12 h-12 rounded-full bg-linear-to-br from-primary to-purple-600 flex items-center justify-center shadow-lg shadow-purple-500/20 shrink-0">
                    <Zap className="w-5 h-5 text-white" />
                  </div>

                  <div>
                    <h4 className="text-sm sm:text-base font-bold text-gray-900">
                      Instant Coverage
                    </h4>
                    <p className="text-xs sm:text-sm text-gray-500 mt-0.5">
                      Get insured in minutes
                    </p>
                  </div>
                </div>

                {/* ITEM */}
                <div className="flex items-center gap-3 sm:gap-4 md:border-l border-purple-100 md:pl-6">
                  <div className="w-12 h-12 rounded-full bg-linear-to-br from-primary to-purple-600 flex items-center justify-center shadow-lg shadow-purple-500/20 shrink-0">
                    <ShieldCheck className="w-5 h-5 text-white" />
                  </div>

                  <div>
                    <h4 className="text-sm sm:text-base font-bold text-gray-900">
                      Secure & Compliant
                    </h4>
                    <p className="text-xs sm:text-sm text-gray-500 mt-0.5">
                      Your data is always safe
                    </p>
                  </div>
                </div>

                {/* ITEM */}
                <div className="flex items-center gap-3 sm:gap-4 md:border-l border-purple-100 md:pl-6">
                  <div className="w-12 h-12 rounded-full bg-linear-to-br from-primary to-purple-600 flex items-center justify-center shadow-lg shadow-purple-500/20 shrink-0">
                    <Headphones className="w-5 h-5 text-white" />
                  </div>

                  <div>
                    <h4 className="text-sm sm:text-base font-bold text-gray-900">
                      24/7 Support
                    </h4>
                    <p className="text-xs sm:text-sm text-gray-500 mt-0.5">
                      We're here for you
                    </p>
                  </div>
                </div>

                {/* ITEM */}
                <div className="flex items-center gap-3 sm:gap-4 md:border-l border-purple-100 md:pl-6">
                  <div className="w-12 h-12 rounded-full bg-linear-to-br from-primary to-purple-600 flex items-center justify-center shadow-lg shadow-purple-500/20 shrink-0">
                    <Smartphone className="w-5 h-5 text-white" />
                  </div>

                  <div>
                    <h4 className="text-sm sm:text-base font-bold text-gray-900">
                      100% Digital
                    </h4>
                    <p className="text-xs sm:text-sm text-gray-500 mt-0.5">
                      No paperwork, no hassle
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      <AppointmentModal
        open={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />
    </>
  );
}
