"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";

import { getCookieConsent, setCookieConsent } from "../../lib/cookieConsent";
import { initGoogleAnalytics } from "../../lib/initGoogleAnalytics";

export default function CookieBanner() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const consent = getCookieConsent();

    if (!consent) {
      setVisible(true);
    }

    // Initialize GA only if user already accepted
    if (consent === "accepted") {
      initGoogleAnalytics();
    }
  }, []);

  const handleAccept = () => {
    setCookieConsent("accepted");

    // Initialize Google Analytics after consent
    initGoogleAnalytics();

    setVisible(false);
  };

  const handleReject = () => {
    setCookieConsent("rejected");
    setVisible(false);
  };

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 40 }}
          transition={{ duration: 0.4 }}
          className="
            fixed bottom-4 left-4 right-4 z-[9999]
            max-w-5xl mx-auto
            rounded-2xl
            bg-white
            border border-gray-200
            shadow-2xl
            p-6
          "
        >
          <div className="flex flex-col lg:flex-row gap-6 items-start lg:items-center justify-between">
            {/* TEXT */}
            <p className="text-sm text-gray-700 leading-relaxed">
              We use cookies to ensure essential website functionality and to
              improve your experience. You can accept all cookies or reject
              non-essential ones.
              <Link
                href="/privacypolicy"
                className="ml-1 text-purple-600 font-semibold hover:underline"
              >
                Learn more
              </Link>
            </p>

            {/* ACTIONS */}
            <div className="flex gap-3 flex-shrink-0">
              <button
                onClick={handleReject}
                className="
                  px-6 py-2.5
                  rounded-full
                  border-2 border-gray-300
                  text-gray-700
                  font-semibold
                  hover:bg-gray-50
                  transition
                "
              >
                Reject
              </button>

              <button
                onClick={handleAccept}
                className="
                  px-6 py-2.5
                  rounded-full
                  font-semibold
                  text-white
                  bg-gradient-to-r from-primary to-purple-600
                  shadow-lg
                  hover:opacity-90
                  transition
                "
              >
                Accept all
              </button>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}