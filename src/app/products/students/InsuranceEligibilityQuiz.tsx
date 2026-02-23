"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  CheckCircle,
  Sparkles,
  Shield,
  Clock,
  Award,
  ChevronRight,
  GraduationCap,
  Calendar,
  PartyPopper,
  StarIcon,
  Users,
  Heart,
  ArrowRight,
  Globe,
  Euro,
  Zap,
  Star,
} from "lucide-react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { INSURANCE_PLANS } from "@/app/constants/insurance";

export default function InsuranceEligibilityQuiz() {
  const router = useRouter();

  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [degree, setDegree] = useState<string>("");
  const [age, setAge] = useState<string>("");

  const handleContinue = () => {
    if (step === 1 && degree) {
      setStep(2);
    } else if (step === 2 && age) {
      setStep(3);
    }
  };

  const degreeOptions = [
    { value: "bachelor", label: "Bachelor's Degree", icon: "🎓" },
    { value: "master", label: "Master's Degree", icon: "📚" },
    { value: "phd", label: "PhD / Doctorate", icon: "🔬" },
    { value: "other", label: "Other Studies", icon: "📖" },
  ];

  const ageOptions = [
    { value: "below-30", label: "Below 30 years" },
    { value: "above-30", label: "30 years & above" },
  ];

  const benefits = [
    {
      icon: Shield,
      text: "Accepted for university enrollment & city registration in Germany",
      color: "text-emerald-600",
    },
    {
      icon: Clock,
      text: "Access to private & public doctors including extensive dental care",
      color: "text-blue-600",
    },
    {
      icon: Award,
      text: "Dedicated personal support to find doctors & schedule appointments",
      color: "text-purple-600",
    },
    {
      icon: Sparkles,
      text: "Fast digital reimbursement process for medical bills",
      color: "text-pink-600",
    },
    {
      icon: Award,
      text: "Awarded 1st place for service & customer satisfaction",
      color: "text-yellow-600",
    },
    {
      icon: Shield,
      text: "Option to switch to Public Health Insurance after graduation",
      color: "text-indigo-600",
    },
  ];

  // TK Public Insurance benefits for under 30
  const tkBenefits = [
    {
      icon: Shield,
      text: "Statutory health coverage",
      color: "text-blue-600",
    },
    {
      icon: Users,
      text: "Income-based premium",
      color: "text-green-600",
    },
    {
      icon: Heart,
      text: "Family insurance available",
      color: "text-red-600",
    },
  ];

  // Determine if user is eligible for public insurance (age < 30)
  const isEligibleForPublic = age === "below-30";

  const handlePlanSelect = ({
    title,
    price,
    category,
  }: {
    title: string;
    price: string;
    category: "Public" | "Private";
  }) => {
    const planData = {
      title,
      price,
      category,
      age,
      degree,
    };

    sessionStorage.setItem("selectedPlan", JSON.stringify(planData));
  };

  return (
    <section className="relative py-16 sm:py-10 px-4 sm:px-8 lg:px-18 overflow-hidden">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <motion.div
          animate={{
            scale: [1, 1.2, 1],
            rotate: [0, 90, 0],
            opacity: [0.03, 0.06, 0.03],
          }}
          transition={{ duration: 20, repeat: Infinity }}
          className="absolute -top-1/4 -left-1/4 w-1/2 h-1/2 bg-gradient-to-br from-purple-500 to-blue-500 rounded-full blur-3xl"
        />
        <motion.div
          animate={{
            scale: [1, 1.3, 1],
            rotate: [0, -90, 0],
            opacity: [0.03, 0.06, 0.03],
          }}
          transition={{ duration: 25, repeat: Infinity }}
          className="absolute -bottom-1/4 -right-1/4 w-1/2 h-1/2 bg-gradient-to-r from-primary to-purple-600 rounded-full blur-3xl"
        />
      </div>

      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-20 items-center relative z-10">
        {/* LEFT CONTENT - Enhanced */}
        <motion.div
          initial={{ opacity: 0, x: -40 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7, ease: "easeOut" }}
          className="space-y-8"
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-purple-100 to-blue-100 border border-purple-200/50">
            <Sparkles className="w-4 h-4 text-purple-600" />
            <span className="text-sm font-semibold text-purple-700">
              Smart Insurance Finder
            </span>
          </div>

          <h2 className="text-4xl sm:text-5xl font-extrabold text-gray-900 leading-[1.1]">
            Not sure which plan
            <span className="block mt-3 text-transparent bg-clip-text bg-gradient-to-r from-primary to-purple-600 animate-gradient">
              fits your profile?
            </span>
          </h2>

          <p className="text-lg sm:text-xl text-gray-600 leading-relaxed max-w-xl">
            Take our intelligent 30-second quiz. We'll analyze your educational
            background and age to recommend the perfect health insurance plan —
            whether public or private.
          </p>

          {/* Trust Indicators */}
          <div className="flex flex-wrap gap-6 pt-4">
            {[
              { label: "Students Protected", value: "50K+" },
              { label: "Satisfaction Rate", value: "98%" },
              { label: "Avg. Response Time", value: "< 2h" },
            ].map((stat, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.1 }}
                className="flex flex-col"
              >
                <span className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-primary to-purple-600">
                  {stat.value}
                </span>
                <span className="text-sm text-gray-600">{stat.label}</span>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* QUIZ CARD - Glassmorphism Style */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7, ease: "easeOut" }}
          className="relative"
        >
          {/* Glassmorphism Container */}
          <div className="relative backdrop-blur-xl bg-white/70 border border-white/40 rounded-[2rem] shadow-2xl shadow-purple-500/10 p-8 sm:p-6">
            {/* Progress Bar */}
            <div className="absolute top-0 left-0 right-0 h-1.5 bg-gray-200/50 rounded-t-[2rem] overflow-hidden">
              <motion.div
                initial={{ width: "0%" }}
                animate={{
                  width: step === 1 ? "33%" : step === 2 ? "66%" : "100%",
                }}
                transition={{ duration: 0.5, ease: "easeOut" }}
                className="h-full bg-gradient-to-r from-purple-600 via-pink-600 to-blue-600"
              />
            </div>

            <AnimatePresence mode="wait">
              {/* STEP 1 – DEGREE */}
              {step === 1 && (
                <motion.div
                  key="step1"
                  initial={{ opacity: 0, x: 30 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -30 }}
                  transition={{ duration: 0.4 }}
                  className="space-y-6"
                >
                  <div className="flex items-center gap-3 mb-2">
                    <div className="p-2.5 rounded-xl bg-gradient-to-br from-purple-500 to-blue-500">
                      <GraduationCap className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-500">
                        Question 1 of 2
                      </p>
                      <h3 className="text-2xl sm:text-3xl font-bold text-gray-900">
                        What are you studying?
                      </h3>
                    </div>
                  </div>

                  <p className="text-gray-600">
                    Select your current degree program to help us tailor your
                    insurance options.
                  </p>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {degreeOptions.map((option) => (
                      <motion.button
                        key={option.value}
                        onClick={() => setDegree(option.value)}
                        whileHover={{ scale: 1.02, y: -2 }}
                        whileTap={{ scale: 0.98 }}
                        className={`
                          relative p-5 rounded-2xl border-2 text-left transition-all duration-300
                          ${
                            degree === option.value
                              ? "border-purple-500 bg-gradient-to-br from-purple-50 to-blue-50 shadow-lg shadow-purple-500/20"
                              : "border-gray-200 bg-white/50 hover:border-purple-300 hover:bg-white/80"
                          }
                        `}
                      >
                        <div className="flex items-center gap-3">
                          <span className="text-3xl">{option.icon}</span>
                          <span className="font-semibold text-gray-900 text-base">
                            {option.label}
                          </span>
                        </div>
                        {degree === option.value && (
                          <motion.div
                            layoutId="selectedDegree"
                            className="absolute top-3 right-3"
                          >
                            <CheckCircle className="w-6 h-6 text-purple-600 fill-purple-100" />
                          </motion.div>
                        )}
                      </motion.button>
                    ))}
                  </div>

                  <motion.button
                    onClick={handleContinue}
                    disabled={!degree}
                    whileHover={{ scale: degree ? 1.02 : 1 }}
                    whileTap={{ scale: degree ? 0.98 : 1 }}
                    className={`
                      w-full py-5 rounded-2xl font-bold text-lg flex items-center justify-center gap-2 transition-all
                      ${
                        degree
                          ? "bg-gradient-to-r from-purple-600 via-pink-600 to-blue-600 text-white shadow-xl shadow-purple-500/30 hover:shadow-2xl hover:shadow-purple-500/40"
                          : "bg-gray-200 text-gray-400 cursor-not-allowed"
                      }
                    `}
                  >
                    Continue
                    <ChevronRight className="w-5 h-5" />
                  </motion.button>
                </motion.div>
              )}

              {/* STEP 2 – AGE */}
              {step === 2 && (
                <motion.div
                  key="step2"
                  initial={{ opacity: 0, x: 30 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -30 }}
                  transition={{ duration: 0.4 }}
                  className="space-y-6"
                >
                  <div className="flex items-center gap-3 mb-2">
                    <div className="p-2.5 rounded-xl bg-gradient-to-br from-pink-500 to-purple-500">
                      <Calendar className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-500">
                        Question 2 of 2
                      </p>
                      <h3 className="text-2xl sm:text-3xl font-bold text-gray-900">
                        What's your age range?
                      </h3>
                    </div>
                  </div>

                  <p className="text-gray-600">
                    Your age helps determine which insurance plans are available
                    to you.
                  </p>

                  <div className="grid grid-cols-1 gap-3">
                    {ageOptions.map((option) => (
                      <motion.button
                        key={option.value}
                        onClick={() => setAge(option.value)}
                        whileHover={{ scale: 1.02, x: 4 }}
                        whileTap={{ scale: 0.98 }}
                        className={`
                          relative p-5 rounded-2xl border-2 text-left transition-all duration-300
                          ${
                            age === option.value
                              ? "border-pink-500 bg-gradient-to-br from-pink-50 to-purple-50 shadow-lg shadow-pink-500/20"
                              : "border-gray-200 bg-white/50 hover:border-pink-300 hover:bg-white/80"
                          }
                        `}
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-semibold text-gray-900 text-lg">
                            {option.label}
                          </span>
                          {age === option.value && (
                            <motion.div layoutId="selectedAge">
                              <CheckCircle className="w-6 h-6 text-pink-600 fill-pink-100" />
                            </motion.div>
                          )}
                        </div>
                      </motion.button>
                    ))}
                  </div>

                  <div className="flex gap-3">
                    <motion.button
                      onClick={() => setStep(1)}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      className="px-6 py-5 rounded-2xl font-semibold border-2 border-gray-300 text-gray-700 hover:bg-gray-50 transition-all"
                    >
                      Back
                    </motion.button>
                    <motion.button
                      onClick={handleContinue}
                      disabled={!age}
                      whileHover={{ scale: age ? 1.02 : 1 }}
                      whileTap={{ scale: age ? 0.98 : 1 }}
                      className={`
                        flex-1 py-5 rounded-2xl font-bold text-lg flex items-center justify-center gap-2 transition-all
                        ${
                          age
                            ? "bg-gradient-to-r from-pink-600 via-purple-600 to-blue-600 text-white shadow-xl shadow-pink-500/30 hover:shadow-2xl hover:shadow-pink-500/40"
                            : "bg-gray-200 text-gray-400 cursor-not-allowed"
                        }
                      `}
                    >
                      See My Results
                      <Sparkles className="w-5 h-5" />
                    </motion.button>
                  </div>
                </motion.div>
              )}

              {/* STEP 3 – RESULT */}
              {step === 3 && (
                <motion.div
                  key="step3"
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.5 }}
                  className="space-y-6"
                >
                  {isEligibleForPublic ? (
                    // TK PUBLIC INSURANCE FOR UNDER 30
                    <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-blue-600 via-cyan-600 to-blue-700 p-[2px]">
                      <div className="bg-white rounded-3xl p-8 space-y-6">
                        {/* Header */}
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex-1">
                            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-gradient-to-r from-purple-100 to-purple-100 border border-green-200 mb-3">
                              <PartyPopper className="w-4 h-4 text-purple-600" />
                              <span className="text-xs font-bold text-purple-700 uppercase tracking-wide">
                                Best Value
                              </span>
                            </div>
                            <h4 className="text-3xl font-extrabold text-gray-900 mb-2">
                              TK Public Insurance
                            </h4>
                            <p className="text-gray-600 text-sm">
                              German public health insurance for students under
                              30
                            </p>
                          </div>
                          <div className="flex items-center">
                            <Image
                              src="/partners_asset/TK_logo.avif"
                              alt="TK"
                              width={40}
                              height={40}
                              className="object-contain"
                            />
                          </div>
                        </div>

                        {/* Benefits */}
                        <div className="space-y-3">
                          {tkBenefits.map((benefit, idx) => {
                            const Icon = benefit.icon;
                            return (
                              <motion.div
                                key={idx}
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: idx * 0.1 }}
                                className="flex items-start gap-4 px-4 py-3 rounded-xl bg-gradient-to-br from-gray-50 to-white border border-gray-100 hover:shadow-md transition-shadow"
                              >
                                <div
                                  className={`p-2 rounded-lg bg-gradient-to-br ${
                                    idx === 0
                                      ? "from-blue-100 to-blue-200"
                                      : idx === 1
                                        ? "from-green-100 to-green-200"
                                        : "from-red-100 to-red-200"
                                  }`}
                                >
                                  <Icon
                                    className={`w-5 h-5 ${benefit.color}`}
                                  />
                                </div>
                                <span className="text-gray-700 font-medium text-sm leading-relaxed flex-1">
                                  {benefit.text}
                                </span>
                              </motion.div>
                            );
                          })}
                        </div>

                        {/* Pricing & CTA */}
                        <div className="pt-4 border-t border-gray-200">
                          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                            <div>
                              <p className="text-sm text-gray-500 mb-1">
                                Starting from
                              </p>
                              <p className="text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-primary to-purple-600">
                                €141
                                <span className="text-lg text-gray-500 font-medium">
                                  /month
                                </span>
                              </p>
                            </div>

                            <motion.button
                              onClick={() => {
                                handlePlanSelect({
                                  title: "TK Public Insurance",
                                  price: "141",
                                  category: "Public",
                                });
                                router.push("/insuranceSignupFlow");
                              }}
                              whileHover={{ scale: 1.05, y: -2 }}
                              whileTap={{ scale: 0.95 }}
                              className="w-full sm:w-auto px-8 py-4 rounded-2xl font-bold text-lg text-white bg-gradient-to-r from-purple-600 to-pink-400 shadow-2xl shadow-blue-500/40 hover:shadow-blue-500/60 transition-all flex items-center justify-center gap-2"
                            >
                              Purchase Now
                              <ChevronRight className="w-5 h-5" />
                            </motion.button>
                          </div>

                          <p className="text-xs text-gray-500 mt-4 text-center sm:text-left">
                            🔒 No commitment required • Cancel anytime •
                            Money-back guarantee
                          </p>
                        </div>
                      </div>
                    </div>
                  ) : (
                    // <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
                                        <div className="grid grid-cols-1 gap-4 sm:gap-6">

                      {/* ================= OTTONOVA ================= */}
                      {/* <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.5 }}
                        whileHover={{ y: -4 }}
                        className="relative group"
                      >
                        <div className="absolute inset-0 bg-gradient-to-br from-purple-600 via-pink-600 to-blue-600 rounded-2xl sm:rounded-3xl blur-lg opacity-30 group-hover:opacity-50 transition-opacity" />

                        <div className="relative bg-white rounded-2xl sm:rounded-3xl p-4 sm:p-6 shadow-xl border border-purple-200">

                          <div className="flex items-start justify-between mb-3 sm:mb-4">
                            <div className="flex-1">
                              <div className="w-24 h-8 sm:w-32 sm:h-10 relative mb-2">
                                <Image
                                  src="/partners_asset/ottonova.png"
                                  alt="Ottonova"
                                  fill
                                  className="object-contain object-left"
                                />
                              </div>
                              <h4 className="text-base sm:text-lg font-bold text-gray-900 mb-1">
                                Ottonova Private Insurance
                              </h4>
                              <p className="text-xs text-gray-600 line-clamp-2">
                                Premium private health coverage for students
                              </p>
                            </div>
                          </div>

                          
                          <div className="grid grid-cols-2 gap-2 mb-3 sm:mb-4">
                            <div className="flex items-center gap-1.5 text-xs">
                              <div className="w-5 h-5 rounded bg-green-50 flex items-center justify-center flex-shrink-0">
                                <CheckCircle className="w-3 h-3 text-green-600" />
                              </div>
                              <span className="text-gray-700 truncate">
                                Digital-first
                              </span>
                            </div>
                            <div className="flex items-center gap-1.5 text-xs">
                              <div className="w-5 h-5 rounded bg-purple-50 flex items-center justify-center flex-shrink-0">
                                <Star className="w-3 h-3 text-purple-600" />
                              </div>
                              <span className="text-gray-700 truncate">
                                English support
                              </span>
                            </div>
                            <div className="flex items-center gap-1.5 text-xs">
                              <div className="w-5 h-5 rounded bg-blue-50 flex items-center justify-center flex-shrink-0">
                                <Zap className="w-3 h-3 text-blue-600" />
                              </div>
                              <span className="text-gray-700 truncate">
                                Fast processing
                              </span>
                            </div>
                            <div className="flex items-center gap-1.5 text-xs">
                              <div className="w-5 h-5 rounded bg-pink-50 flex items-center justify-center flex-shrink-0">
                                <Shield className="w-3 h-3 text-pink-600" />
                              </div>
                              <span className="text-gray-700 truncate">
                                Full coverage
                              </span>
                            </div>
                          </div>

                         
                          <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl p-3 sm:p-4 mb-3 sm:mb-4">
                            <p className="text-[10px] sm:text-xs text-gray-600 mb-1">
                              Starting from
                            </p>
                            <div className="flex items-baseline gap-1">
                              <span className="text-2xl sm:text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-pink-600">
                                €{INSURANCE_PLANS.INSURBE_STUDENT_OTTONOVA}
                              </span>
                              <span className="text-sm text-gray-500 font-semibold">
                                /month
                              </span>
                            </div>
                          </div>

                        
                          <motion.button
                            onClick={() => {
                              handlePlanSelect({
                                title: "Ottonova Private Insurance",
                                price:
                                  INSURANCE_PLANS.INSURBE_STUDENT_CLASSIC.toString(),
                                category: "Private",
                              });
                              router.push("/ottonovaSignupform");
                            }}
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            className="w-full py-2.5 sm:py-3 rounded-xl font-bold text-sm sm:text-base text-white bg-gradient-to-r from-purple-600 via-pink-600 to-blue-600 shadow-lg hover:shadow-xl transition-all flex items-center justify-center gap-2"
                          >
                            Get Started
                            <ArrowRight className="w-4 h-4" />
                          </motion.button>
                        </div>
                      </motion.div> */}

                      {/* ================= MAWISTA ================= */}
                      <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.5, delay: 0.1 }}
                        whileHover={{ y: -4 }}
                        className="relative group"
                      >
                        <div className="absolute inset-0 bg-gradient-to-br from-blue-600 via-purple-600 to-pink-600 rounded-2xl sm:rounded-3xl blur-lg opacity-30 group-hover:opacity-50 transition-opacity" />

                        <div className="relative bg-white rounded-2xl sm:rounded-3xl p-4 sm:p-6 shadow-xl border border-blue-200">
                          {/* Header */}
                          <div className="flex items-start justify-between mb-3 sm:mb-4">
                            <div className="flex-1">
                              <div className="w-24 h-8 sm:w-32 sm:h-10 relative mb-2">
                                <Image
                                  src="/partners_asset/mawista.svg"
                                  alt="Mawista"
                                  fill
                                  className="object-contain object-left"
                                />
                              </div>
                              <h4 className="text-base sm:text-lg font-bold text-gray-900 mb-1">
                                Mawista Student Insurance
                              </h4>
                              <p className="text-xs text-gray-600 line-clamp-2">
                                Affordable coverage tailored for international
                                students
                              </p>
                            </div>
                          </div>

                          {/* Features - Compact */}
                          <div className="grid grid-cols-2 gap-2 mb-3 sm:mb-4">
                            <div className="flex items-center gap-1.5 text-xs">
                              <div className="w-5 h-5 rounded bg-green-50 flex items-center justify-center flex-shrink-0">
                                <Euro className="w-3 h-3 text-green-600" />
                              </div>
                              <span className="text-gray-700 truncate">
                                Budget-friendly
                              </span>
                            </div>
                            <div className="flex items-center gap-1.5 text-xs">
                              <div className="w-5 h-5 rounded bg-blue-50 flex items-center justify-center flex-shrink-0">
                                <Globe className="w-3 h-3 text-blue-600" />
                              </div>
                              <span className="text-gray-700 truncate">
                                International
                              </span>
                            </div>
                            <div className="flex items-center gap-1.5 text-xs">
                              <div className="w-5 h-5 rounded bg-purple-50 flex items-center justify-center flex-shrink-0">
                                <Clock className="w-3 h-3 text-purple-600" />
                              </div>
                              <span className="text-gray-700 truncate">
                                Quick setup
                              </span>
                            </div>
                            <div className="flex items-center gap-1.5 text-xs">
                              <div className="w-5 h-5 rounded bg-pink-50 flex items-center justify-center flex-shrink-0">
                                <Heart className="w-3 h-3 text-pink-600" />
                              </div>
                              <span className="text-gray-700 truncate">
                                Great value
                              </span>
                            </div>
                          </div>

                          {/* Price Section - Compact */}
                          <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl p-3 sm:p-4 mb-3 sm:mb-4">
                            <p className="text-[10px] sm:text-xs text-gray-600 mb-1">
                              Starting from
                            </p>
                            <div className="flex items-baseline gap-1">
                              <span className="text-2xl sm:text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-pink-600">
                                €{INSURANCE_PLANS.INSURBE_STUDENT_MAWISTA}
                              </span>
                              <span className="text-sm text-gray-500 font-semibold">
                                /month
                              </span>
                            </div>
                          </div>

                          {/* CTA Button - Compact */}
                          <motion.button
                            // onClick={() => {
                            //   window.location.href =
                            //     "https://www2.elviab2b.de/mawista-booking/index.faces?SPRACHE=EN&PT=STU&UVM=IB25";
                            // }}
                            onClick={() => router.push("/mawistaBooking")}
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            className="w-full py-2.5 sm:py-3 rounded-xl font-bold text-sm sm:text-base text-white bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 shadow-lg hover:shadow-xl transition-all flex items-center justify-center gap-2"
                          >
                            Get Started
                            <ArrowRight className="w-4 h-4" />
                          </motion.button>
                        </div>
                      </motion.div>
                    </div>
                  )}

                  {/* Reset Button */}
                  <motion.button
                    onClick={() => {
                      setStep(1);
                      setDegree("");
                      setAge("");
                    }}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="w-full py-4 rounded-2xl font-semibold text-gray-600 border-2 border-gray-200 hover:bg-gray-50 transition-all"
                  >
                    Start Over
                  </motion.button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Decorative Elements */}
          <div className="absolute -z-10 top-8 -right-8 w-72 h-72 bg-gradient-to-br from-purple-400 to-pink-400 rounded-full blur-3xl opacity-20" />
          <div className="absolute -z-10 -bottom-8 -left-8 w-72 h-72 bg-gradient-to-br from-blue-400 to-purple-400 rounded-full blur-3xl opacity-20" />
        </motion.div>
      </div>
    </section>
  );
}
