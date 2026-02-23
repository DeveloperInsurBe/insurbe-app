"use client";

import { motion } from "framer-motion";
import { useState, useEffect } from "react";
import { INSURANCE_PLANS } from "../constants/insurance";

export default function MawistaBookingIframe() {
  const [isLoaded, setIsLoaded] = useState(false);

  // Delay badge appearance by 1 second
  const [showBadge, setShowBadge] = useState(false);
  
  useEffect(() => {
    const timer = setTimeout(() => {
      setShowBadge(true);
    }, 1000);
    return () => clearTimeout(timer);
  }, []);

  return (
    <section className="py-20 px-4 sm:px-8 lg:px-16 bg-gradient-to-b from-white to-purple-50">
      <div className="max-w-7xl mx-auto">

        {/* Heading */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <p className="text-sm font-semibold text-purple-600 uppercase tracking-widest">
            Official Partner
          </p>

          <h2 className="text-4xl sm:text-5xl font-bold text-gray-900 mt-3">
            Apply for{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-purple-600">
              Mawista Student Insurance
            </span>
          </h2>

          <p className="mt-4 text-gray-600 max-w-2xl mx-auto">
            Complete your insurance application securely through our official
            partner booking system.
          </p>
        </motion.div>

        {/* Iframe Container - REMOVED overflow-hidden */}
        <div className="relative rounded-3xl bg-white shadow-2xl">
          
          {/* 🎁 Offer Badge - DELAYED & CONDITIONAL */}
          {showBadge && isLoaded && (
            <div className="absolute -top-10 -right-0 translate-x-1/4 -translate-y-1/4 z-40">
              {/* Glow layer */}
              <motion.div
                aria-hidden
                initial={{ opacity: 0 }}
                animate={{
                  opacity: [0.4, 0.8, 0.4],
                  scale: [1, 1.08, 1],
                }}
                transition={{
                  duration: 2.8,
                  repeat: Infinity,
                  ease: "easeInOut",
                }}
                className="
                  absolute inset-0
                  rounded-full
                  bg-gradient-to-br from-pink-300 to-pink-400
                  blur-xl
                "
              />

              {/* Badge */}
              <motion.div
                initial={{ scale: 0.6, opacity: 0, rotate: -20 }}
                animate={{
                  scale: 1,
                  opacity: 1,
                  rotate: 0,
                  y: [0, -6, 0],
                }}
                transition={{
                  scale: { duration: 0.4, ease: "easeOut" },
                  opacity: { duration: 0.3 },
                  rotate: { duration: 0.4 },
                  y: {
                    duration: 3,
                    repeat: Infinity,
                    ease: "easeInOut",
                  },
                }}
                whileHover={{ scale: 1.08 }}
                className="
                  relative
                  w-24 h-24
                  rounded-full
                  bg-gradient-to-br from-primary to-purple-400 
                  text-white
                  flex items-center justify-center
                  shadow-2xl
                  border border-white
                  cursor-default
                "
              >
                {/* TEXT WRAPPER WITH TILT */}
                <motion.div
                  initial={{ rotate: -6 }}
                  animate={{ rotate: [-6, -4, -6] }}
                  transition={{
                    duration: 4,
                    repeat: Infinity,
                    ease: "easeInOut",
                  }}
                  className="text-center font-extrabold"
                >
                  <span className="block text-xl leading-none tracking-tight">
                    €{INSURANCE_PLANS.INSURBE_STUDENT_BONUS}
                  </span>

                  <span className="block text-[12px] font-semibold px-2 leading-tight opacity-95 mt-0.5">
                    Amazon Welcome Bonus*
                  </span>
                </motion.div>
              </motion.div>
            </div>
          )}

          <div className="w-full h-[2700px] relative">
            {/* Skeleton Loader */}
            {!isLoaded && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="absolute inset-0 bg-gradient-to-r from-gray-100 to-gray-200 animate-pulse"
              >
                {/* Skeleton Form Structure */}
                <div className="p-8 space-y-6">
                  {/* Header Row */}
                  <div className="flex items-center justify-between mb-8">
                    <div className="h-10 w-48 bg-gray-300 rounded-lg"></div>
                    <div className="h-8 w-24 bg-gray-300 rounded-md"></div>
                  </div>

                  {/* Form Sections */}
                  {[1, 2, 3, 4, 5].map((section) => (
                    <div key={section} className="space-y-4">
                      <div className="h-6 w-32 bg-gray-300 rounded-md"></div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {[1, 2, 3].map((field) => (
                          <div key={field} className="h-12 bg-gray-300 rounded-lg"></div>
                        ))}
                      </div>
                    </div>
                  ))}

                  {/* Bottom Buttons */}
                  <div className="flex flex-col sm:flex-row gap-4 pt-8 border-t">
                    <div className="h-12 flex-1 bg-gray-300 rounded-lg"></div>
                    <div className="h-12 w-32 bg-blue-300 rounded-lg"></div>
                  </div>
                </div>
              </motion.div>
            )}

            {/* Iframe */}
            <iframe
              src="https://www2.elviab2b.de/mawista-booking/index.faces?SPRACHE=EN&PT=STU&UVM=IB25"
              className={`w-full h-full transition-opacity duration-500 ${
                isLoaded ? "opacity-100" : "opacity-0"
              }`}
              loading="lazy"
              onLoad={() => setIsLoaded(true)}
              title="Mawista Student Insurance Application"
            />
          </div>
        </div>
      </div>
    </section>
  );
}
