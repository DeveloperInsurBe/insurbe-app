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
                  onClick={() => router.push("/insurance/public-health")}
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

            {/* RIGHT IMAGE — Enhanced with trendy decorations */}
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
              {/* ── BG LAYER 1: Large soft radial glow behind everything ── */}
              <div
                className="absolute inset-0 z-0 pointer-events-none"
                style={{
                  background:
                    "radial-gradient(ellipse 70% 60% at 55% 50%, rgba(130,10,209,0.13) 0%, rgba(130,10,209,0.04) 55%, transparent 80%)",
                }}
              />

              {/* ── BG LAYER 2: Blurred orb — top-right accent ── */}
              <motion.div
                animate={{ y: [0, -12, 0], scale: [1, 1.05, 1] }}
                transition={{
                  duration: 6,
                  repeat: Infinity,
                  ease: "easeInOut",
                }}
                className="absolute -top-6 right-4 w-36 h-36 rounded-full z-0 pointer-events-none"
                style={{
                  background:
                    "radial-gradient(circle, rgba(168,85,247,0.22) 0%, rgba(130,10,209,0.10) 50%, transparent 75%)",
                  filter: "blur(18px)",
                }}
              />

              {/* ── BG LAYER 3: Blurred orb — bottom-left accent ── */}
              <motion.div
                animate={{ y: [0, 10, 0], scale: [1, 1.08, 1] }}
                transition={{
                  duration: 7,
                  repeat: Infinity,
                  ease: "easeInOut",
                  delay: 1.5,
                }}
                className="absolute bottom-4 -left-4 w-28 h-28 rounded-full z-0 pointer-events-none"
                style={{
                  background:
                    "radial-gradient(circle, rgba(99,102,241,0.20) 0%, rgba(130,10,209,0.08) 50%, transparent 75%)",
                  filter: "blur(16px)",
                }}
              />

              {/* ── GRID DOTS pattern — top-left ── */}
              <div
                className="absolute top-0 left-0 z-10 pointer-events-none"
                style={{
                  width: 90,
                  height: 90,
                  backgroundImage:
                    "radial-gradient(circle, rgba(130,10,209,0.35) 1.2px, transparent 1.2px)",
                  backgroundSize: "14px 14px",
                  maskImage:
                    "radial-gradient(ellipse at top left, black 40%, transparent 80%)",
                  WebkitMaskImage:
                    "radial-gradient(ellipse at top left, black 40%, transparent 80%)",
                }}
              />

              {/* ── GRID DOTS pattern — bottom-right ── */}
              <div
                className="absolute bottom-6 right-2 z-10 pointer-events-none"
                style={{
                  width: 80,
                  height: 80,
                  backgroundImage:
                    "radial-gradient(circle, rgba(130,10,209,0.28) 1.2px, transparent 1.2px)",
                  backgroundSize: "13px 13px",
                  maskImage:
                    "radial-gradient(ellipse at bottom right, black 40%, transparent 80%)",
                  WebkitMaskImage:
                    "radial-gradient(ellipse at bottom right, black 40%, transparent 80%)",
                }}
              />

              {/* ── DECORATIVE RING — large, behind card ── */}
              <div
                className="absolute z-0 pointer-events-none"
                style={{
                  width: "92%",
                  height: "92%",
                  top: "4%",
                  left: "4%",
                  borderRadius: "36px",
                  border: "1.5px solid rgba(130,10,209,0.13)",
                  boxShadow: "0 0 0 8px rgba(130,10,209,0.04)",
                }}
              />

              {/* ── DECORATIVE RING — inner offset ring ── */}
              <div
                className="absolute z-0 pointer-events-none"
                style={{
                  width: "84%",
                  height: "84%",
                  top: "8%",
                  left: "8%",
                  borderRadius: "30px",
                  border: "1px dashed rgba(130,10,209,0.18)",
                }}
              />

              {/* ── SQUIGGLE / ACCENT LINES top-right ── */}
              <motion.div
                animate={{ rotate: [0, 8, -4, 0] }}
                transition={{
                  duration: 5,
                  repeat: Infinity,
                  ease: "easeInOut",
                }}
                className="absolute -top-5 right-10 z-20 pointer-events-none"
              >
                <svg width="52" height="52" viewBox="0 0 52 52" fill="none">
                  <path
                    d="M10 38 Q18 10 28 26 Q38 42 46 14"
                    stroke="rgba(130,10,209,0.55)"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                    fill="none"
                  />
                  <circle cx="46" cy="14" r="3" fill="rgba(130,10,209,0.45)" />
                  <circle cx="10" cy="38" r="2.5" fill="rgba(130,10,209,0.3)" />
                </svg>
              </motion.div>

              {/* ── SPARKLE STARS ── */}
              {/* Top-left sparkle */}
              <motion.div
                animate={{ scale: [1, 1.3, 1], opacity: [0.7, 1, 0.7] }}
                transition={{
                  duration: 3,
                  repeat: Infinity,
                  ease: "easeInOut",
                }}
                className="absolute top-3 left-12 z-20 pointer-events-none"
              >
                <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
                  <path
                    d="M9 1 L10.2 7.8 L17 9 L10.2 10.2 L9 17 L7.8 10.2 L1 9 L7.8 7.8 Z"
                    fill="rgba(130,10,209,0.55)"
                  />
                </svg>
              </motion.div>

              {/* Bottom-right sparkle */}
              <motion.div
                animate={{ scale: [1, 1.4, 1], opacity: [0.5, 1, 0.5] }}
                transition={{
                  duration: 4,
                  repeat: Infinity,
                  ease: "easeInOut",
                  delay: 1,
                }}
                className="absolute bottom-10 right-6 z-20 pointer-events-none"
              >
                <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                  <path
                    d="M7 1 L8 6 L13 7 L8 8 L7 13 L6 8 L1 7 L6 6 Z"
                    fill="rgba(168,85,247,0.6)"
                  />
                </svg>
              </motion.div>

              {/* Mid-right tiny sparkle */}
              <motion.div
                animate={{ scale: [0.8, 1.2, 0.8], opacity: [0.4, 0.9, 0.4] }}
                transition={{
                  duration: 3.5,
                  repeat: Infinity,
                  ease: "easeInOut",
                  delay: 0.5,
                }}
                className="absolute top-1/2 -right-2 z-20 pointer-events-none"
              >
                <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
                  <path
                    d="M5 1 L5.7 4.3 L9 5 L5.7 5.7 L5 9 L4.3 5.7 L1 5 L4.3 4.3 Z"
                    fill="rgba(99,102,241,0.6)"
                  />
                </svg>
              </motion.div>

              {/* ── FLOATING PILL BADGE — top right of image ── */}
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.9, duration: 0.5 }}
                style={{
                  position: "absolute",
                  top: "10%",
                  right: "-8px",
                  zIndex: 30,
                }}
              >
                <motion.div
                  animate={{ y: [0, -5, 0] }}
                  transition={{
                    duration: 3.5,
                    repeat: Infinity,
                    ease: "easeInOut",
                  }}
                  className="
                    flex items-center gap-1.5
                    bg-white
                    border border-purple-200
                    rounded-full
                    px-3 py-1.5
                    shadow-[0_4px_20px_rgba(130,10,209,0.18)]
                  "
                >
                  <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
                  <span className="text-[11px] font-semibold text-purple-700 whitespace-nowrap">
                    Instant Approval
                  </span>
                </motion.div>
              </motion.div>

              {/* ── FLOATING PILL BADGE — bottom left of image ── */}
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 1.1, duration: 0.5 }}
                style={{
                  position: "absolute",
                  bottom: "12%",
                  left: "-8px",
                  zIndex: 30,
                }}
              >
                <motion.div
                  animate={{ y: [0, 5, 0] }}
                  transition={{
                    duration: 4,
                    repeat: Infinity,
                    ease: "easeInOut",
                    delay: 0.8,
                  }}
                  className="
                    flex items-center gap-2
                    bg-white
                    border border-purple-200
                    rounded-full
                    px-3 py-1.5
                    shadow-[0_4px_20px_rgba(130,10,209,0.18)]
                  "
                >
                  <div className="w-5 h-5 rounded-full bg-purple-100 flex items-center justify-center shrink-0">
                    <ShieldCheck className="w-3 h-3 text-purple-600" />
                  </div>
                  <span className="text-[11px] font-semibold text-purple-700 whitespace-nowrap">
                    100% Secure
                  </span>
                </motion.div>
              </motion.div>

              {/* ── CORNER ACCENT — top-left geometric ── */}
              <motion.div
                animate={{ rotate: [0, -8, 0] }}
                transition={{
                  duration: 6,
                  repeat: Infinity,
                  ease: "easeInOut",
                }}
                className="absolute -top-4 -left-4 z-20 pointer-events-none"
              >
                <svg width="44" height="44" viewBox="0 0 44 44" fill="none">
                  <rect
                    x="4"
                    y="4"
                    width="36"
                    height="36"
                    rx="10"
                    stroke="rgba(130,10,209,0.35)"
                    strokeWidth="2"
                    fill="none"
                    strokeDasharray="5 4"
                  />
                  <circle cx="22" cy="22" r="5" fill="rgba(130,10,209,0.18)" />
                  <circle cx="22" cy="22" r="2.5" fill="rgba(130,10,209,0.5)" />
                </svg>
              </motion.div>

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
        </div>
      </section>

      <AppointmentModal
        open={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />
    </>
  );
}
