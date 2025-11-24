"use client";
import Image from "next/image";
import React from "react";
import { motion } from "framer-motion";
import { useInView } from "react-intersection-observer";

const ContactSection = () => {
  const [ref, inView] = useInView({ triggerOnce: true, threshold: 0.2 });

  return (
    <section className="bg-[linear-gradient(0deg,#FFF_0%,#FFF_100%),linear-gradient(180deg,rgba(255,255,255,0.08)_0%,rgba(255,255,255,0.20)_100%)] backdrop-blur-[75px] pb-20 pt-10 px-4 md:px-10 lg:px-20">
      <div className="max-w-7xl mx-auto">
        <motion.h2
          ref={ref}
          initial={{ opacity: 0, y: 50 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="text-5xl md:text-6xl font-bold mb-12 leading-tight text-gray-900"
        >
          Get in touch with us. We’re <br /> here to assist you.
        </motion.h2>

        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ delay: 0.2, duration: 0.6 }}
          className="grid lg:grid-cols-2 gap-16"
        >
          {/* Form Section */}
          <form className="space-y-6 px-8">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-sm text-gray-500 mb-1 block">
                  First Name
                </label>
                <input
                  type="text"
                  placeholder="Vivek"
                  className="w-full border border-gray-300 text-black rounded-md px-4 py-2 focus:outline-none focus:ring-2 focus:ring-[#8224E3]"
                />
              </div>
              <div>
                <label className="text-sm text-gray-500 mb-1 block">
                  Last Name
                </label>
                <input
                  type="text"
                  placeholder="Shahi"
                  className="w-full border border-gray-300 text-black rounded-md px-4 py-2 focus:outline-none focus:ring-2 focus:ring-[#8224E3]"
                />
              </div>
            </div>

            <div>
              <label className="text-sm text-gray-500 mb-1 block">Email</label>
              <input
                type="email"
                placeholder="hello@insurbe.com"
                className="w-full border border-gray-300 text-black rounded-md px-4 py-2 focus:outline-none focus:ring-2 focus:ring-[#8224E3]"
              />
            </div>

            <div>
              <label className="text-sm text-gray-500 mb-1 block">Message</label>
              <textarea
                placeholder="I am coming to Germany in June"
                rows={9}
                className="w-full border border-gray-300 text-black rounded-md px-4 py-2 focus:outline-none focus:ring-2 focus:ring-[#8224E3]"
              />
            </div>

            <button
              type="submit"
              className="bg-primary hover:bg-primary/96 text-white px-6 py-2 rounded-md w-full font-semibold transition"
            >
              Submit
            </button>
          </form>

          {/* Map + Contact Info Section */}
          <div>
            {/* Map */}
            <div className="w-full h-[400px] rounded-xl shadow-md overflow-hidden">
              <iframe
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d2960.290168182957!2d-72.58234762515691!3d42.101255951414785!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x89e6e6e332f00113%3A0x48fa34cbf226ca80!2s123%20Maple%20St%2C%20Springfield%2C%20MA%2001105%2C%20USA!5e0!3m2!1sen!2sin!4v1748326693662!5m2!1sen!2sin"
                width="100%"
                height="100%"
                style={{ border: 0 }}
                allowFullScreen
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
              />
            </div>

            {/* Contact Info */}
            <motion.div
              initial={{ opacity: 0, y: 50 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ delay: 0.4, duration: 0.6 }}
              className="py-4 pt-10 text-gray-300/70"
            >
              <hr />
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 mt-8">
                <div className="flex items-center gap-4">
                  <Image
                    src="/icons/PhoneIcon.svg"
                    alt="Phone Icon"
                    height={28}
                    width={28}
                  />
                  <div>
                    <p className="text-sm text-gray-700">Phone</p>
                    <p className="text-xs text-gray-500">
                      Office: +48 6232 1151 22
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  <Image
                    src="/icons/emailIcon.svg"
                    alt="Email Icon"
                    height={28}
                    width={28}
                  />
                  <div>
                    <p className="text-sm text-gray-700">Email</p>
                    <p className="text-xs text-gray-500">
                      Office: hello@uiwiki.co
                    </p>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default ContactSection;
