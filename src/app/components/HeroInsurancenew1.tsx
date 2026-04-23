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
      <section className="relative overflow-hidden bg-linear-to-br from-slate-50 via-blue-50/50 to-purple-50/30 py-8 sm:py-12 lg:py-16 xl:py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 xl:px-12 2xl:px-16">
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
              <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl  font-extrabold text-gray-900 leading-tight px-2 sm:px-4">
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
                  // onClick={() => setIsModalOpen(true)}
                  onClick={handleScroll1}
                  whileHover={{ scale: 1.04 }}
                  whileTap={{ scale: 0.96 }}
                  className="w-full xs:flex-1 rounded-2xl cursor-pointer lg:rounded-3xl bg-linear-to-r from-primary to-purple-600 text-white text-sm sm:text-base font-bold py-3 sm:py-4 px-6 shadow-xl hover:shadow-2xl transition-all duration-300 focus:outline-none focus:ring-4 focus:ring-purple-300/50"
                >
                  Explore Our Policies
                </motion.button>

                <motion.button
                  onClick={() => router.push("/products/insuranceJourney")}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.96 }}
                  className="w-full xs:flex-1 cursor-pointer rounded-2xl lg:rounded-3xl border-2 border-gray-300 hover:border-gray-400 px-6 py-3 sm:py-4 text-gray-800 font-semibold text-sm sm:text-base hover:bg-gray-50 hover:shadow-lg transition-all duration-300 focus:outline-none focus:ring-4 focus:ring-blue-300/50"
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
                className="pt-4 sm:pt-6 flex justify-center lg:justify-start px-4"
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

            {/* RIGHT IMAGE - FIXED FOR DESKTOP */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="relative w-full h-[400px] sm:h-[500px] md:h-[550px] lg:h-[500px] xl:h-[600px] order-1 lg:order-2"
            >
              <div className="absolute inset-0 w-full h-full rounded-2xl lg:rounded-3xl overflow-hidden shadow-2xl ">
                <Image
                  src="/hero_assets/phero8.avif"
                  alt="Insurance made easy"
                  fill
                  priority
                  className="object-contain sm:object-cover object-center hover:object-[center_top] transition-all duration-500 rounded-2xl lg:rounded-3xl w-full h-full"
                  sizes="(max-width: 1024px) 100vw, 50vw"
                />
                {/* Decorative Badge */}
              </div>
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
