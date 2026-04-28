"use client";

import { motion } from "framer-motion";
import { ArrowRight, Check } from "lucide-react";
import Image from "next/image";
import { useState } from "react";
import { useRouter } from "next/navigation";

const categories = [
  {
    title: "Employee Benefits",
    description: "Comprehensive health and wellness coverage tailored for your workforce",
    features: ["Healthcare coverage", "Wellness programs", "Mental health support"],
    image: "/gifs_assets/Doc_on_call.svg",
    icon: "👥",
  },
  {
    title: "Embedded Insurance",
    description: "Seamlessly integrate insurance into your customer experience",
    features: ["Easy integration", "Frictionless experience", "Higher conversion"],
    image: "/gifs_assets/Offer_gift.svg",
    icon: "🚀",
  },
  {
    title: "Cyber Security",
    description: "Enterprise-grade protection against evolving cyber threats",
    features: ["24/7 monitoring", "Incident response", "Risk management"],
    image: "/gifs_assets/Recommend_plan.svg",
    icon: "🛡️",
  },
];

const fadeInUp = {
  hidden: { opacity: 0, y: 20 },
  visible: { 
    opacity: 1, 
    y: 0,
    transition: { duration: 0.6, ease: "easeOut" }
  },
};

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.12,
      delayChildren: 0.2,
    },
  },
};

export default function EnterpriseHeroSection() {
  const router = useRouter();
  const [hoveredCard, setHoveredCard] = useState<number | null>(null);

  return (
    <section className="relative w-full bg-white overflow-hidden">
      {/* Hero Background */}
      <div className="absolute inset-0 bg-gradient-to-b from-slate-50 via-white to-white" />
      
      {/* Subtle Background Elements */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-blue-50 rounded-full mix-blend-multiply filter blur-3xl opacity-20" />
        <div className="absolute top-40 right-1/4 w-96 h-96 bg-purple-50 rounded-full mix-blend-multiply filter blur-3xl opacity-20" />
        <div className="absolute -bottom-32 right-0 w-96 h-96 bg-indigo-50 rounded-full mix-blend-multiply filter blur-3xl opacity-15" />
      </div>

      <div className="relative z-10 w-full">
        {/* Main Hero Section */}
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-20 md:py-28">
          <motion.div
            initial="hidden"
            animate="visible"
            variants={staggerContainer}
            className="max-w-4xl"
          >
            {/* Badge */}
            <motion.div
              variants={fadeInUp}
              className="inline-block mb-6"
            >
              <div className="px-4 py-2 rounded-full bg-blue-50 border border-blue-200">
                <span className="text-sm font-semibold text-blue-700">
                  ✓ Trusted by 500+ Global Enterprises
                </span>
              </div>
            </motion.div>

            {/* Heading */}
            <motion.h1
              variants={fadeInUp}
              className="text-5xl sm:text-6xl md:text-7xl font-bold text-slate-900 mb-6 leading-tight tracking-tight"
            >
              Enterprise Insurance,
              <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 via-purple-600 to-blue-600">
                Simplified
              </span>
            </motion.h1>

            {/* Description */}
            <motion.p
              variants={fadeInUp}
              className="text-lg sm:text-xl text-slate-600 max-w-3xl mb-8 leading-relaxed"
            >
              Insure your employees, embed insurance for your customers, and protect your business—all from a single, unified platform.
            </motion.p>

            {/* CTA Buttons */}
            <motion.div
              variants={fadeInUp}
              className="flex flex-col sm:flex-row gap-4"
            >
              <motion.button
                onClick={() => router.push("/book-appointment")}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition-colors shadow-lg hover:shadow-xl"
              >
                Book a Demo
                <ArrowRight className="w-5 h-5" />
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-slate-100 hover:bg-slate-200 text-slate-900 font-semibold rounded-lg transition-colors"
              >
                View Pricing
              </motion.button>
            </motion.div>
          </motion.div>
        </div>

        {/* Stats Section */}
        <motion.div
          initial="hidden"
          whileInView="visible"
          variants={staggerContainer}
          viewport={{ once: true, margin: "-100px" }}
          className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-16 border-t border-b border-slate-200"
        >
          <div className="grid grid-cols-3 md:grid-cols-5 gap-8 md:gap-12">
            {[
              { value: "50M+", label: "Lives Covered" },
              { value: "500+", label: "Enterprise Partners" },
              { value: "99.99%", label: "Uptime SLA" },
              { value: "24/7", label: "Support" },
              { value: "40+", label: "Countries" },
            ].map((stat, idx) => (
              <motion.div key={idx} variants={fadeInUp} className="text-center">
                <p className="text-2xl sm:text-3xl font-bold text-slate-900">
                  {stat.value}
                </p>
                <p className="text-xs sm:text-sm text-slate-600 mt-2 leading-tight">
                  {stat.label}
                </p>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Features Cards Section */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 md:py-28">
          <motion.div
            initial="hidden"
            whileInView="visible"
            variants={staggerContainer}
            viewport={{ once: true, margin: "-100px" }}
            className="mb-12"
          >
            <motion.h2
              variants={fadeInUp}
              className="text-3xl sm:text-4xl md:text-5xl font-bold text-slate-900 mb-4"
            >
              Tailored Solutions for Every Need
            </motion.h2>
            <motion.p
              variants={fadeInUp}
              className="text-lg text-slate-600 max-w-3xl"
            >
              Whether you're insuring employees, integrating insurance into your products, or securing your enterprise, we have the right solution.
            </motion.p>
          </motion.div>

          {/* Cards Grid */}
          <motion.div
            initial="hidden"
            whileInView="visible"
            variants={staggerContainer}
            viewport={{ once: true, margin: "-100px" }}
            className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8"
          >
            {categories.map((category, index) => (
              <motion.div
                key={index}
                variants={fadeInUp}
                onMouseEnter={() => setHoveredCard(index)}
                onMouseLeave={() => setHoveredCard(null)}
                className="group relative"
              >
                <div className="relative h-full bg-white border-2 border-slate-200 rounded-2xl p-8 transition-all duration-300 hover:border-blue-300 hover:shadow-xl">
                  {/* Top Icon */}
                  <div className="text-5xl mb-6">{category.icon}</div>

                  {/* Title */}
                  <h3 className="text-2xl font-bold text-slate-900 mb-3">
                    {category.title}
                  </h3>

                  {/* Description */}
                  <p className="text-slate-600 mb-6 leading-relaxed">
                    {category.description}
                  </p>

                  {/* Features List */}
                  <motion.div
                    animate={
                      hoveredCard === index
                        ? { opacity: 1, height: "auto" }
                        : { opacity: 0, height: 0 }
                    }
                    transition={{ duration: 0.3 }}
                    className="space-y-3 mb-6 overflow-hidden"
                  >
                    {category.features.map((feature, idx) => (
                      <div key={idx} className="flex items-start gap-3">
                        <Check className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                        <span className="text-sm text-slate-700">{feature}</span>
                      </div>
                    ))}
                  </motion.div>

                  {/* CTA Link */}
                  <motion.button
                    animate={
                      hoveredCard === index
                        ? { x: 5, opacity: 1 }
                        : { x: -5, opacity: 0.6 }
                    }
                    className="inline-flex items-center gap-2 text-blue-600 font-semibold text-sm hover:text-blue-700 group"
                  >
                    Learn more
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </motion.button>

                  {/* Hover Border Animation */}
                  <motion.div
                    animate={
                      hoveredCard === index
                        ? { width: "100%" }
                        : { width: 0 }
                    }
                    transition={{ duration: 0.3 }}
                    className="absolute bottom-0 left-0 h-1 bg-gradient-to-r from-blue-500 to-purple-500"
                  />
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>

        {/* CTA Section */}
        <motion.div
          initial="hidden"
          whileInView="visible"
          variants={staggerContainer}
          viewport={{ once: true, margin: "-100px" }}
          className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-20 md:py-24 text-center"
        >
          <motion.div variants={fadeInUp} className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-2xl p-12 md:p-16 border border-blue-100">
            <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4">
              Ready to Transform Your Enterprise?
            </h2>
            <p className="text-lg text-slate-600 mb-8 max-w-2xl mx-auto">
              Join hundreds of global enterprises that trust InsurBe for their insurance needs.
            </p>
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => router.push("/book-appointment")}
              className="inline-flex items-center gap-2 px-8 py-4 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition-colors shadow-lg hover:shadow-xl"
            >
              Schedule Your Demo
              <ArrowRight className="w-5 h-5" />
            </motion.button>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}
