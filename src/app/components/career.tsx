"use client";

import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import Image from "next/image";

const positions = [
  {
    category: "Sales",
    jobs: [
      { title: "Country Sales Head", location: "Amsterdam" },
      { title: "Sales Rep", location: "Remote – Berlin" },
      { title: "Field Sales Agent", location: "Paris" },
    ],
  },
  {
    category: "Others",
    jobs: [{ title: "Customer Support Representative", location: "Remote" }],
  },
];

const images = [
  "/contact/contact1.png",
  "/contact/contact2.png",
  "/contact/contact3.png",
  "/contact/contact4.png",
  "/contact/contact1.png",
  "/contact/contact5.png",
  "/contact/contact3.png",
  "/contact/contact2.png",
];

const fadeInUp = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" } },
};

const CareerSection = () => {
  const [scrollDuration, setScrollDuration] = useState(180);

  useEffect(() => {
    const handleResize = () => {
      const isMobile = window.innerWidth < 768;
      setScrollDuration(isMobile ? 260 : 100);
    };

    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const renderLoopingRow = (reverse = false) => (
    <div className="w-full flex justify-center overflow-hidden px-4">
      <div className="relative w-full max-w-7xl overflow-hidden">
        <motion.div
          className={`flex space-x-3 ${reverse ? "flex-row-reverse" : ""}`}
          animate={{ x: reverse ? ["0%", "-50%"] : ["-50%", "0%"] }}
          transition={{
            duration: scrollDuration,
            repeat: Infinity,
            ease: "linear",
          }}
          style={{ width: "200%" }}
        >
          {[...images, ...images].map((src, index) => (
            <div
              key={`${reverse ? "r" : "f"}-${index}`}
              className="flex-shrink-0 w-80"
            >
              <Image
                src={src}
                alt={`Team ${index}`}
                width={300}
                height={200}
                className="w-full h-60 object-cover rounded-xl"
              />
            </div>
          ))}
        </motion.div>
      </div>
    </div>
  );

  return (
    <section className="bg-gradient-to-br from-white via-[#f7e9ff] to-white py-16 overflow-x-hidden">
      {/* Header */}
      <motion.div
        variants={fadeInUp}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.3 }}
        className="text-center mb-10 px-4 md:px-10 lg:px-20"
      >
        <h2 className="text-4xl md:text-5xl font-bold mb-4">
          Want to Work with Us?
        </h2>
        <p className="text-gray-600 text-lg max-w-xl mx-auto">
          Do meaningful work. Take ownership. Push your ideas. Never stop
          learning.
        </p>
      </motion.div>

      {/* Image Gallery */}
      <motion.div
        variants={fadeInUp}
        initial="hidden"
        animate="visible"
        className="space-y-3 mb-16"
      >
        {/* Row 1 - Scroll Left to Right */}
        {renderLoopingRow(false)}

        {/* Row 2 - Scroll Right to Left */}
        {renderLoopingRow(true)}
      </motion.div>

      {/* Open Positions */}
      <motion.div
        variants={fadeInUp}
        initial="hidden"
        animate="visible"
        className="max-w-3xl mx-auto px-4 md:px-10 lg:px-20"
      >
        <h3 className="text-2xl font-semibold mb-6 text-center">
          Open positions at Insurbe
        </h3>

        {positions.map((group, index) => (
          <div key={index} className="mb-6">
            <h4 className="text-gray-500 text-sm uppercase mb-2">
              {group.category}
            </h4>
            {group.jobs.map((job, idx) => (
              <motion.div
                key={idx}
                variants={fadeInUp}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                className="flex justify-between items-center bg-white rounded-xl px-4 py-4 shadow-sm hover:shadow-md transition mb-2 cursor-pointer"
              >
                <div>
                  <p className="font-medium text-gray-900">{job.title}</p>
                  <p className="text-sm text-gray-400">{job.location}</p>
                </div>
                <span className="text-primary text-xl">&rarr;</span>
              </motion.div>
            ))}
          </div>
        ))}

        {/* Open Application */}
        <motion.div
          variants={fadeInUp}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="mt-10 p-6 bg-white rounded-xl shadow"
        >
          <h4 className="font-semibold mb-2">Open application</h4>
          <p className="text-gray-600 text-sm">
            Believe you’re a great fit but can’t find a position listed for your
            skillset? Reach out to us at{" "}
            <a
              href="mailto:careers@insurbe.com"
              className="text-[#8224E3] underline"
            >
              careers@insurbe.com
            </a>
          </p>
        </motion.div>
      </motion.div>
    </section>
  );
};

export default CareerSection;
