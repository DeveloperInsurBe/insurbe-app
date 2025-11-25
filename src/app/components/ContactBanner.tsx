"use client";
import { motion } from "framer-motion";
import Image from "next/image";

export default function ContactBanner() {
  return (
  <motion.section
  initial={{ opacity: 0, y: 50 }}
  whileInView={{ opacity: 1, y: 0 }}
  transition={{ duration: 0.6 }}
  viewport={{ once: true }}
  className="relative z-50 py-20"
>
  <div className="  max-w-5xl mx-auto px-4 lg:px-8">
    <div className="bg-white rounded-2xl shadow-[0_0_49.7px_0_rgba(0,0,0,0.25)] overflow-hidden flex flex-col md:flex-row items-center">
      {/* Text Content */}
      <div className="p-8 md:p-12 flex-1 ">
        <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-4 pr-10">
          Let us guide you to the best insurance with{" "}
          <span className="text-primary">Insurbe</span>
        </h2>
        <p className="text-sm text-black mb-6">
          Get a quote in Less than 5 minutes
        </p>
        <button className="bg-primary text-white px-6 py-2 rounded shadow hover:bg-primary/95 transition">
          Send Message
        </button>
      </div>

      {/* Image */}
      <div className="md:w-1/3 w-full relative min-h-[300px] self-stretch">
        <Image
          src="/img/familyContact.png"
          alt="Happy family"
          fill
          className="object-cover"
          priority
        />
      </div>
    </div>
  </div>
</motion.section>

  );
}
