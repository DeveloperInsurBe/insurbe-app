'use client';
import { FC } from "react";
import { motion } from "framer-motion";

const CalculatorHeroSection: FC = () => (
  <div className="flex flex-col md:flex-row items-center justify-between min-h-screen bg-gradient-to-r from-[#f5f2fa] to-[#fafbff] px-8 md:px-20 py-16">
    {/* Left Side - Text Content */}
    <motion.div
      className="max-w-xl"
      initial={{ opacity: 0, x: -30 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.6 }}
    >
      <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
        Find the perfect insurance plan based on your profile <br /> with Insubre
      </h1>
      <button className="mt-8 px-6 py-3 bg-purple-800 rounded-md text-white font-medium hover:bg-purple-700 transition-colors duration-200">
        Start Calculating
      </button>
    </motion.div>

    {/* Right Side - Illustration */}
    <motion.div
      className="mt-12 md:mt-0 md:ml-8"
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8, delay: 0.4 }}
    >
      {/* Illustration - Use your SVG/PNG here */}
      <img
        src="/calculator_assets/Calculator.svg"
        alt="Calculator and Girl Illustration"
        className="w-[360px] max-w-full h-auto"
        draggable={false}
      />
    </motion.div>
  </div>
);

export default CalculatorHeroSection;
