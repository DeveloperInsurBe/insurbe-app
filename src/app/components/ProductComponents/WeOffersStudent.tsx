import React from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import {
  ArrowRight,
  Users,
  HeartPulse,
  Stethoscope,
  Sparkles,
  Star,
  StarIcon,
} from "lucide-react";
import ServiceModal from "./ServiceModal";
import { INSURANCE_PLANS } from "@/app/constants/insurance";

const plans = [
  {
    title: "Student Public Health",
    description:
      "Government-backed coverage with broad access and long-term stability.",
    icon: Stethoscope,
    key: "public",
    href: "/insurance/public-health",
    gradient: "from-blue-500 to-cyan-500",
    bgGradient: "from-blue-50 to-cyan-50",
    badge: "Most Popular",
  },
  {
    title: "Student Private Health",
    description:
      "Premium care with faster access and flexible coverage options.",
    icon: HeartPulse,
    key: "private",
    href: "/ottonovaSignupform",
    gradient: "from-purple-500 to-pink-500",
    bgGradient: "from-purple-50 to-pink-50",
    badge: "Students Choice",
    priceNote: `Starts at ${INSURANCE_PLANS.INSURBE_STUDENT_MAWISTA} € / month`,
  },
];

export default function WeOffersStudent() {
  const router = useRouter();

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2,
      },
    },
  };

  const cardVariants = {
    hidden: { opacity: 0, y: 50, scale: 0.9 },
    visible: {
      opacity: 1,
      y: 0,
      scale: 1,
      transition: {
        type: "spring",
        stiffness: 100,
        damping: 15,
      },
    },
  };

  return (
    <section className="relative py-20 sm:py-24 px-4 sm:px-8 overflow-hidden ">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <motion.div
          animate={{
            scale: [1, 1.2, 1],
            rotate: [0, 180, 360],
          }}
          transition={{
            duration: 20,
            repeat: Infinity,
            ease: "linear",
          }}
          className="absolute top-20 right-10 w-72 h-72 bg-purple-200 rounded-full mix-blend-multiply filter blur-3xl opacity-20"
        />
        <motion.div
          animate={{
            scale: [1.2, 1, 1.2],
            rotate: [360, 180, 0],
          }}
          transition={{
            duration: 25,
            repeat: Infinity,
            ease: "linear",
          }}
          className="absolute bottom-20 left-10 w-72 h-72 bg-pink-200 rounded-full mix-blend-multiply filter blur-3xl opacity-20"
        />
      </div>

      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.8 }}
        className="max-w-7xl mx-auto text-center mb-16 sm:mb-20 relative z-10"
      >
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          whileInView={{ scale: 1, opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.2 }}
          className="inline-block mb-6"
        >
          <span className="inline-flex items-center gap-2 px-5 py-2 rounded-full bg-linear-to-r from-purple-100 to-pink-100 text-purple-700 font-bold text-sm shadow-lg">
            <StarIcon className="w-4 h-4" />
            Seamless Coverage
          </span>
        </motion.div>

        <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-extrabold mb-6">
          <span className="text-gray-900">Plans </span>
          <span className="text-transparent bg-clip-text bg-linear-to-r from-primary to-purple-600">
            We Offer
          </span>
        </h2>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.4 }}
          className="text-base sm:text-lg text-gray-600 max-w-2xl mx-auto"
        >
          Carefully selected insurance plans from trusted German providers.
        </motion.p>
      </motion.div>

      {/* Cards */}
      <motion.div
        variants={containerVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.2 }}
        className="max-w-6xl mx-auto grid grid-cols-1 sm:grid-cols-2  gap-8 relative z-10"
      >
        {plans.map((plan, index) => {
          const Icon = plan.icon;

          return (
            <motion.div
              key={plan.key}
              variants={cardVariants}
              whileHover={{
                y: -15,
                scale: 1.03,
                transition: { duration: 0.3 },
              }}
              onClick={() => router.push(plan.href)}
              className="group relative rounded-3xl p-8 bg-white border-2 border-transparent hover:border-purple-200 cursor-pointer transition-all duration-500 shadow-xl hover:shadow-2xl overflow-hidden"
            >
              {/* Background Gradient on Hover */}
              <motion.div
                className={`absolute inset-0 bg-linear-to-br ${plan.bgGradient} opacity-0 group-hover:opacity-100 transition-opacity duration-500`}
              />

              {/* Floating Particles */}
              <motion.div
                animate={{
                  y: [0, -10, 0],
                  opacity: [0.5, 1, 0.5],
                }}
                transition={{
                  duration: 3,
                  repeat: Infinity,
                  delay: index * 0.2,
                }}
                className="absolute top-6 right-6 w-2 h-2 bg-purple-400 rounded-full"
              />
              <motion.div
                animate={{
                  y: [0, -15, 0],
                  opacity: [0.3, 0.8, 0.3],
                }}
                transition={{
                  duration: 4,
                  repeat: Infinity,
                  delay: index * 0.3,
                }}
                className="absolute top-10 right-10 w-1.5 h-1.5 bg-pink-400 rounded-full opacity-50"
              />

              {/* Badge */}
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: 0.5 + index * 0.1 }}
                className={`absolute top-4 right-4 bg-linear-to-r ${plan.gradient} text-white px-3 py-1 rounded-full text-xs font-bold shadow-md flex items-center gap-1 z-10`}
              >
                <Star className="w-3 h-3 fill-current" />
                {plan.badge}
              </motion.div>

              {/* Icon with Animation */}
              <motion.div
                whileHover={{ rotate: 360, scale: 1.1 }}
                transition={{ duration: 0.6 }}
                className={`relative w-16 h-16 rounded-2xl bg-linear-to-br ${plan.gradient} flex items-center justify-center mb-6 shadow-lg group-hover:shadow-xl transition-shadow`}
              >
                <motion.div
                  animate={{
                    scale: [1, 1.2, 1],
                  }}
                  transition={{
                    duration: 2,
                    repeat: Infinity,
                    delay: index * 0.1,
                  }}
                  className={`absolute inset-0 rounded-2xl bg-linear-to-br ${plan.gradient} opacity-30 blur-md`}
                />
                <Icon className="w-8 h-8 text-white relative z-10" />
              </motion.div>

              {/* Content */}
              <div className="relative z-10">
                <h3 className="text-2xl font-bold text-gray-900 mb-3 group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-linear-to-r group-hover:from-purple-600 group-hover:to-primary transition-all duration-300">
                  {plan.title}
                </h3>

                <p className="text-sm text-gray-600 leading-relaxed mb-2">
                  {plan.description}
                </p>
                {/* Price note */}
                {plan.priceNote && (
                  <div className="flex items-center gap-2 mb-2">
                    <motion.div
                      animate={{
                        scale: [1, 1.3, 1],
                        opacity: [0.5, 1, 0.5],
                      }}
                      transition={{
                        duration: 2,
                        repeat: Infinity,
                        ease: "easeInOut",
                      }}
                      className="relative shrink-0"
                    >
                      <div className="w-2 h-2 sm:w-2.5 sm:h-2.5 rounded-full bg-linear-to-r from-purple-500 to-pink-500"></div>
                      <motion.div
                        animate={{
                          scale: [1, 2, 1],
                          opacity: [0.7, 0, 0.7],
                        }}
                        transition={{
                          duration: 2,
                          repeat: Infinity,
                          ease: "easeInOut",
                        }}
                        className="absolute inset-0 w-2 h-2 sm:w-2.5 sm:h-2.5 rounded-full bg-linear-to-r from-purple-500 to-pink-500"
                      ></motion.div>
                    </motion.div>
                    <span className="text-xs sm:text-sm font-bold text-transparent bg-clip-text bg-linear-to-r from-purple-700 via-primary to-pink-600 whitespace-nowrap">
                      {plan.priceNote}
                    </span>
                  </div>
                )}

                {/* CTA with Animated Arrow */}
                <motion.div className="inline-flex items-center gap-2 text-sm font-bold text-purple-600 group-hover:gap-3 transition-all">
                  Explore plan
                  <motion.div
                    animate={{ x: [0, 5, 0] }}
                    transition={{ duration: 1.5, repeat: Infinity }}
                  >
                    <ArrowRight className="w-5 h-5" />
                  </motion.div>
                </motion.div>
              </div>

              {/* Corner Decoration */}
              <div className="absolute bottom-0 right-0 w-32 h-32 bg-linear-to-tl from-purple-100/50 to-transparent rounded-tl-full opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

              {/* Border Glow Effect */}
              <motion.div
                className={`absolute inset-0 rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 bg-linear-to-br ${plan.gradient}`}
                style={{ filter: "blur(20px)", zIndex: -1 }}
              />
            </motion.div>
          );
        })}
      </motion.div>

      {/* Modal */}
      <ServiceModal open={false} onClose={() => {}} />
    </section>
  );
}
