"use client";

import Slider from "react-slick";
import Image from "next/image";
import { motion } from "framer-motion";

const logos = [
  "/partners/allianz.png",
  "/partners/aok.png",
  "/partners/barmer.png",
  "/partners/bothaer.png",
  "/partners/dkv.png",
  "/partners/haliesche.png",
  "/partners/hanse.png",
  "/partners/signal.png",
];

export default function ClientLogos() {
  const settings = {
    infinite: true,
    speed: 5000,
    slidesToShow: 5,
    slidesToScroll: 1,
    autoplay: true,
    autoplaySpeed: 0,
    cssEase: "linear",
    pauseOnHover: false,
    arrows: false,
    responsive: [
      {
        breakpoint: 1024,
        settings: { slidesToShow: 4 },
      },
      {
        breakpoint: 768,
        settings: { slidesToShow: 3 },
      },
      {
        breakpoint: 480,
        settings: { slidesToShow: 2 },
      },
    ],
  };

  return (
    <motion.section
      initial={{ opacity: 0 }}
      whileInView={{ opacity: 1 }}
      transition={{ duration: 0.8, ease: "easeOut" }}
      viewport={{ once: true }}
      className="py-12 bg-gradient-to-br from-[#fdf3ff] to-white"
    >
      <div className="max-w-7xl w-full mx-auto px-4">
        {/* Heading */}
        <motion.div
          className="text-center mb-8"
          initial={{ opacity: 0, y: -20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
        >
          <h2 className="text-3xl font-bold">
            Trusted Partners in Your Insurance Journey
          </h2>
        </motion.div>

        {/* Logos Slider */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7 }}
          viewport={{ once: true }}
        >
          <Slider {...settings}>
            {logos.map((logo, idx) => (
              <motion.div
                key={idx}
                className="px-4 flex justify-center items-center"
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.4, delay: idx * 0.1 }}
                viewport={{ once: true }}
              >
                <div className="w-32 h-16 flex items-center justify-center">
                  <Image
                    src={logo}
                    alt={`Client Logo ${idx}`}
                    width={128}
                    height={64}
                    className="object-contain"
                  />
                </div>
              </motion.div>
            ))}
          </Slider>
        </motion.div>
      </div>
    </motion.section>
  );
}
