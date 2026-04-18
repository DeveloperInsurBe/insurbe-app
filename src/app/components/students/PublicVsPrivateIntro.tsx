"use client";

import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { Shield, Heart, CheckCircle2 } from "lucide-react";

export default function PublicVsPrivateIntro() {
  return (
    <section className="relative py-10 md:py-16 px-4 sm:px-8 lg:px-18 overflow-hidden">
      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center">
        {/* LEFT CONTENT */}
        <motion.div
          initial={{ opacity: 0, x: -30 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="space-y-6"
        >
          {/* Badge */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="inline-flex items-center gap-2 bg-purple-100 text-purple-700 px-4 py-2 rounded-full text-sm font-semibold"
          >
            <Shield className="w-4 h-4" />
            Mawista Student Insurance
          </motion.div>

          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 leading-tight">
            Who needs{" "}
            <span className="text-transparent bg-clip-text bg-linear-to-r from-primary to-purple-600">
              MAWISTA Student?
            </span>
          </h2>

          <div className="space-y-6 text-gray-700 text-sm sm:text-base leading-relaxed">
            {/* Description */}
            <p>The MAWISTA Student health insurance is intended for:</p>

            {/* Main List */}
            <ul className="list-disc pl-6 space-y-2">
              <li>Preparatory college students</li>
              <li>Postdoctoral researchers</li>
              <li>Foreign exchange students</li>
              <li>Internships, Work & Travel</li>
              <li>Accompanying family members</li>
              <li>Participants in exchange programs</li>
              <li>University graduates seeking employment in Germany</li>
            </ul>

            {/* Additional Info */}
            <p>
              It is also intended for people who are not entitled to statutory
              health insurance, for example:
            </p>

            <ul className="list-disc pl-6 space-y-2">
              <li>
                Language students who are not yet enrolled at a university
              </li>
              <li>
                Students who are older than 30 years (can also be insured with a
                statutory health insurance fund, but with high insurance
                premiums)
              </li>
              <li>(in many cases) interns and visiting scholars</li>
            </ul>

            <p className="text-gray-600">
              Contact us if you are unsure what type of insurance you need for
              your stay in Germany!
            </p>         
          </div>
        </motion.div>

        {/* RIGHT VISUAL */}
        <motion.div
          initial={{ opacity: 0, x: 30 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="relative"
        >
          
          {/* Decorative elements */}
          <div className="absolute -top-4 -right-4 w-72 h-72 bg-purple-200 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-blob"></div>
          <div className="absolute -bottom-8 -left-4 w-72 h-72 bg-primary/20 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-blob animation-delay-2000"></div>

          <div className="relative">
            {/* Main Image */}
            <div className="relative overflow-hidden rounded-3xl shadow-2xl">
              <Image
                src="/hero_assets/groupStudent.jpg"
                alt="Public vs Private Health Insurance"
                width={500}
                height={500}
                className="w-full h-auto object-cover"
                priority
              />

              {/* Overlay linear */}
              <div className="absolute inset-0 bg-linear-to-t from-purple-900/20 to-transparent"></div>
            </div>

            {/* Floating badges */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.3 }}
              className="absolute -bottom-6 -left-6 bg-white rounded-2xl shadow-xl p-4 border border-gray-100"
            >
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-linear-to-br from-purple-500 to-primary rounded-xl flex items-center justify-center">
                  <Shield className="w-6 h-6 text-white" />
                </div>
                <div>
                  <p className="text-xs text-gray-500 font-medium">
                    Trusted by
                  </p>
                  <p className="text-lg font-bold text-gray-900">
                    10,000+ Users
                  </p>
                </div>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.5 }}
              className="absolute -top-6 -right-6 bg-white rounded-2xl shadow-xl p-4 border border-gray-100"
            >
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-linear-to-br from-green-500 to-emerald-500 rounded-xl flex items-center justify-center">
                  <CheckCircle2 className="w-6 h-6 text-white" />
                </div>
                <div>
                  <p className="text-xs text-gray-500 font-medium">Coverage</p>
                  <p className="text-lg font-bold text-gray-900">100%</p>
                </div>
              </div>
            </motion.div>
          </div>
           {/* More Advantages Box */}
            <div className="bg-linear-to-r from-purple-50 to-blue-50 rounded-2xl mt-14 p-6 border border-purple-100 space-y-4">
              <h4 className="font-semibold text-gray-900">More advantages</h4>

              <div className="flex items-start gap-3">
                <CheckCircle2 className="w-5 h-5 text-purple-600 shrink-0 mt-0.5" />
                <span>
                  Protection against high medical costs in case of unexpected
                  illness or accident
                </span>
              </div>

              <div className="flex items-start gap-3">
                <CheckCircle2 className="w-5 h-5 text-purple-600 shrink-0 mt-0.5" />
                <span>24/7 emergency hotline</span>
              </div>

              <div className="flex items-start gap-3">
                <CheckCircle2 className="w-5 h-5 text-purple-600 shrink-0 mt-0.5" />
                <span>
                  Residence secured both in Germany and in EU countries
                </span>
              </div>

              <div className="flex items-start gap-3">
                <CheckCircle2 className="w-5 h-5 text-purple-600 shrink-0 mt-0.5" />
                <span>Fast processing of application</span>
              </div>
            </div>
        </motion.div>
      </div>

      <style jsx>{`
        @keyframes blob {
          0% {
            transform: translate(0px, 0px) scale(1);
          }
          33% {
            transform: translate(30px, -50px) scale(1.1);
          }
          66% {
            transform: translate(-20px, 20px) scale(0.9);
          }
          100% {
            transform: translate(0px, 0px) scale(1);
          }
        }
        .animate-blob {
          animation: blob 7s infinite;
        }
        .animation-delay-2000 {
          animation-delay: 2s;
        }
      `}</style>
    </section>
  );
}
