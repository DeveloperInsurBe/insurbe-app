"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import {
  Users,
  TrendingUp,
  Euro,
  CheckCircle,
  Star,
  Shield,
  Globe,
  Zap,
  Award,
  BarChart3,
  Headphones,
  FileText,
  ArrowRight,
  Sparkles,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";

export default function BecomePartnerPage() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    company: "",
    phone: "",
    website: "",
    message: "",
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Partner application:", formData);
    // Handle form submission
  };

  return (
    <section className="relative overflow-hidden bg-linear-to-br from-slate-50 via-blue-50/50 to-purple-50/30 py-8 sm:py-12 lg:py-16 xl:py-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 xl:px-12 2xl:px-16">
        {/* Hero Section */}
        <section className="relative pb-20 px-4 overflow-hidden">
          {/* Animated Background */}
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
              className="absolute top-20 right-10 w-96 h-96 bg-purple-200 rounded-full mix-blend-multiply filter blur-3xl opacity-20"
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
              className="absolute bottom-20 left-10 w-96 h-96 bg-purple-200 rounded-full mix-blend-multiply filter blur-3xl opacity-20"
            />
          </div>

          <div className="max-w-7xl mx-auto relative z-10">
            <div className="grid lg:grid-cols-2 gap-12 items-center">
              {/* Left Content */}
              <motion.div
                initial={{ opacity: 0, x: -50 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.8 }}
              >
                <motion.div
                  initial={{ opacity: 0, y: -20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                  className="inline-flex items-center gap-2 px-4 py-2 bg-purple-100 rounded-full text-purple-700 font-semibold mb-6"
                >
                  Insurance Affiliate Program
                </motion.div>

                <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-gray-900 mb-6 leading-tight">
                  Join InsurBe's{" "}
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-purple-600">
                    Affiliate Program
                  </span>
                </h1>

                <p className="text-lg sm:text-xl text-gray-600 mb-8 leading-relaxed">
                  Partner with InsurBe to simplify insurance in Germany. On
                  average, our affiliates earn{" "}
                  <span className="font-bold text-purple-600">€750/month</span>
                </p>

                <div className="flex flex-col sm:flex-row gap-4 mb-12">
                  {/* SIGN UP */}
                  <Link href="/partner/signup">
                    <motion.button
                      whileHover={{ scale: 1.05, y: -2 }}
                      whileTap={{ scale: 0.95 }}
                      className="px-8 py-4 bg-gradient-to-r from-[#820ad1] to-[#820ad1] text-white rounded-full font-bold shadow-xl hover:shadow-2xl hover:shadow-purple-500/50 transition-all flex items-center justify-center gap-2"
                    >
                      Sign up
                      <ArrowRight className="w-5 h-5" />
                    </motion.button>
                  </Link>

                  {/* LOGIN */}
                  <Link href="/partner/login">
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      className="px-8 py-4 bg-white border-2 border-[#820ad1] text-[#820ad1] rounded-full font-bold shadow-lg hover:bg-purple-50 transition-all"
                    >
                      Log in
                    </motion.button>
                  </Link>
                </div>

                {/* Trust Indicators */}
                <div className="flex flex-wrap items-center gap-8">
                  <div className="flex items-center gap-2">
                    <div className="flex">
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={i}
                          className="w-5 h-5 fill-yellow-400 text-yellow-400"
                        />
                      ))}
                    </div>
                    <span className="font-bold text-gray-900">4.8</span>
                    <span className="text-gray-500">Google</span>
                  </div>

                  <div className="flex items-center gap-2">
                    <div className="flex">
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={i}
                          className="w-5 h-5 fill-green-500 text-green-500"
                        />
                      ))}
                    </div>
                    <span className="font-bold text-gray-900">Excellent</span>
                    <span className="text-gray-500">Trustpilot</span>
                  </div>
                </div>
              </motion.div>

              {/* Right Image */}
              <motion.div
                initial={{ opacity: 0, x: 50 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.8, delay: 0.2 }}
                className="relative"
              >
                <div className="relative rounded-3xl overflow-hidden shadow-2xl">
                  <Image
                    src="/hero_assets/phero2.jpg"
                    alt="Partner with InsurBe"
                    width={600}
                    height={400}
                    className="w-full h-auto"
                  />
                  {/* Overlay Badge */}
                  <div className="absolute bottom-6 left-6 right-6 bg-white/90 backdrop-blur-xl rounded-2xl p-6 shadow-xl">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-gray-600 mb-1">
                          Average Monthly Earnings
                        </p>
                        <p className="text-3xl font-bold text-purple-600">
                          €750
                        </p>
                      </div>
                      <div className="w-16 h-16 rounded-full bg-gradient-to-r from-purple-600 to-purple-600 flex items-center justify-center">
                        <TrendingUp className="w-8 h-8 text-white" />
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            </div>
          </div>
        </section>

        {/* Benefits Section */}
        <section className="py-20 px-4 bg-white">
          <div className="max-w-7xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
              className="text-center mb-16"
            >
              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-gray-900 mb-4">
                Why Partner with{" "}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-purple-600">
                  InsurBe?
                </span>
              </h2>
              <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                Join hundreds of successful partners earning competitive
                commissions
              </p>
            </motion.div>

            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8">
              {[
                {
                  icon: Euro,
                  title: "High Commissions",
                  description:
                    "Earn up to €750/month with competitive commission rates on every sale",
                  color: "from-green-500 to-emerald-500",
                },
                {
                  icon: BarChart3,
                  title: "Real-time Analytics",
                  description:
                    "Track your performance with our advanced dashboard and detailed reports",
                  color: "from-blue-500 to-cyan-500",
                },
                {
                  icon: Zap,
                  title: "Fast Payouts",
                  description:
                    "Monthly payments directly to your account with no minimum threshold",
                  color: "from-purple-500 to-purple-500",
                },
                {
                  icon: Headphones,
                  title: "Dedicated Support",
                  description:
                    "Get help from our partner success team whenever you need it",
                  color: "from-orange-500 to-red-500",
                },
                {
                  icon: FileText,
                  title: "Marketing Materials",
                  description:
                    "Access professional banners, landing pages, and promotional content",
                  color: "from-indigo-500 to-purple-500",
                },
                {
                  icon: Award,
                  title: "Performance Bonuses",
                  description:
                    "Unlock additional rewards and bonuses for top performers",
                  color: "from-purple-500 to-rose-500",
                },
              ].map((benefit, idx) => (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: idx * 0.1 }}
                  whileHover={{ y: -10 }}
                  className="bg-gradient-to-br from-gray-50 to-white rounded-2xl p-8 shadow-lg hover:shadow-2xl transition-all border border-gray-100"
                >
                  <div
                    className={`w-16 h-16 rounded-2xl bg-gradient-to-r ${benefit.color} flex items-center justify-center mb-6 shadow-lg`}
                  >
                    <benefit.icon className="w-8 h-8 text-white" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-3">
                    {benefit.title}
                  </h3>
                  <p className="text-gray-600 leading-relaxed">
                    {benefit.description}
                  </p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* How It Works */}
        <section className="py-20 px-4">
          <div className="max-w-7xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
              className="text-center mb-16"
            >
              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-gray-900 mb-4">
                How It Works
              </h2>
              <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                Start earning in three simple steps
              </p>
            </motion.div>

            <div className="grid md:grid-cols-3 gap-8">
              {[
                {
                  step: "01",
                  title: "Sign Up",
                  description:
                    "Complete our simple application form and get approved within 24 hours",
                  icon: Users,
                },
                {
                  step: "02",
                  title: "Promote",
                  description:
                    "Share your unique affiliate link using our marketing materials",
                  icon: Globe,
                },
                {
                  step: "03",
                  title: "Earn",
                  description:
                    "Receive monthly commissions for every successful referral",
                  icon: TrendingUp,
                },
              ].map((item, idx) => (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: idx * 0.2 }}
                  className="relative"
                >
                  <div className="bg-white rounded-3xl p-8 shadow-xl hover:shadow-2xl transition-all border border-purple-100">
                    <div className="text-6xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-purple-600 mb-4">
                      {item.step}
                    </div>
                    <div className="w-16 h-16 rounded-2xl bg-gradient-to-r from-purple-600 to-purple-600 flex items-center justify-center mb-6 shadow-lg">
                      <item.icon className="w-8 h-8 text-white" />
                    </div>
                    <h3 className="text-2xl font-bold text-gray-900 mb-3">
                      {item.title}
                    </h3>
                    <p className="text-gray-600 leading-relaxed">
                      {item.description}
                    </p>
                  </div>
                  {idx < 2 && (
                    <div className="hidden md:block absolute top-1/2 -right-4 transform -translate-y-1/2">
                      <ArrowRight className="w-8 h-8 text-purple-300" />
                    </div>
                  )}
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Application Form */}
        <section id="application-form" className="py-20 px-4 bg-white">
          <div className="max-w-3xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
              className="text-center mb-12"
            >
              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-gray-900 mb-4">
                Apply Now
              </h2>
              <p className="text-lg text-gray-600">
                Fill out the form below and start earning today
              </p>
            </motion.div>

            <motion.form
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8, delay: 0.2 }}
              onSubmit={handleSubmit}
              className="bg-gradient-to-br from-purple-50 to-purple-50 rounded-3xl p-8 sm:p-12 shadow-2xl border border-purple-100"
            >
              <div className="space-y-6">
                <div className="grid sm:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Full Name *
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.name}
                      onChange={(e) =>
                        setFormData({ ...formData, name: e.target.value })
                      }
                      className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-purple-500 focus:ring-4 focus:ring-purple-100 focus:outline-none transition-all"
                      placeholder="John Doe"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Email *
                    </label>
                    <input
                      type="email"
                      required
                      value={formData.email}
                      onChange={(e) =>
                        setFormData({ ...formData, email: e.target.value })
                      }
                      className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-purple-500 focus:ring-4 focus:ring-purple-100 focus:outline-none transition-all"
                      placeholder="john@example.com"
                    />
                  </div>
                </div>

                <div className="grid sm:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Company Name
                    </label>
                    <input
                      type="text"
                      value={formData.company}
                      onChange={(e) =>
                        setFormData({ ...formData, company: e.target.value })
                      }
                      className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-purple-500 focus:ring-4 focus:ring-purple-100 focus:outline-none transition-all"
                      placeholder="Your Company"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Phone Number *
                    </label>
                    <input
                      type="tel"
                      required
                      value={formData.phone}
                      onChange={(e) =>
                        setFormData({ ...formData, phone: e.target.value })
                      }
                      className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-purple-500 focus:ring-4 focus:ring-purple-100 focus:outline-none transition-all"
                      placeholder="+49 123 456 7890"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Website / Social Media
                  </label>
                  <input
                    type="url"
                    value={formData.website}
                    onChange={(e) =>
                      setFormData({ ...formData, website: e.target.value })
                    }
                    className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-purple-500 focus:ring-4 focus:ring-purple-100 focus:outline-none transition-all"
                    placeholder="https://yourwebsite.com"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Tell us about your audience
                  </label>
                  <textarea
                    value={formData.message}
                    onChange={(e) =>
                      setFormData({ ...formData, message: e.target.value })
                    }
                    rows={4}
                    className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-purple-500 focus:ring-4 focus:ring-purple-100 focus:outline-none transition-all resize-none"
                    placeholder="Tell us about your marketing channels, audience size, and why you'd be a great partner..."
                  />
                </div>

                <motion.button
                  type="submit"
                  whileHover={{ scale: 1.02, y: -2 }}
                  whileTap={{ scale: 0.98 }}
                  className="w-full py-4 bg-gradient-to-r from-purple-600 to-purple-600 text-white rounded-full font-bold text-lg shadow-xl hover:shadow-2xl hover:shadow-purple-500/50 transition-all flex items-center justify-center gap-2"
                >
                  <Sparkles className="w-5 h-5" />
                  Submit Application
                  <ArrowRight className="w-5 h-5" />
                </motion.button>

                <p className="text-center text-sm text-gray-500">
                  We'll review your application and get back to you within 24
                  hours
                </p>
              </div>
            </motion.form>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-20 px-4">
          <div className="max-w-5xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
              className="bg-gradient-to-r from-purple-600 via-purple-600 to-purple-700 rounded-3xl p-12 sm:p-16 text-center shadow-2xl"
            >
              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-white mb-6">
                Ready to Start Earning?
              </h2>
              <p className="text-xl text-purple-100 mb-8 max-w-2xl mx-auto">
                Join our growing network of successful partners and start
                earning commissions today
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() =>
                    document
                      .getElementById("application-form")
                      ?.scrollIntoView({ behavior: "smooth" })
                  }
                  className="px-8 py-4 bg-white text-purple-600 rounded-full font-bold shadow-xl hover:shadow-2xl transition-all"
                >
                  Apply Now
                </motion.button>
              </div>
            </motion.div>
          </div>
        </section>
      </div>
    </section>
  );
}
