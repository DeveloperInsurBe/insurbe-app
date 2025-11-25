import React from "react";

function AboutPartners() {
  return (
    <section className="overflow-x-hidden py-16 px-4 sm:px-10 lg:px-20 bg-white">
      <div className="max-w-5xl mx-auto space-y-6 text-center">
        {/* Label */}
        <span className="inline-block bg-gray-100 text-gray-600 text-sm font-medium px-4 py-1 rounded-full">
          Seamless Synergy
        </span>

        {/* Heading */}
        <h3 className="text-3xl sm:text-4xl md:text-[64px] font-medium text-gray-900 leading-snug">
          Partners & Integration
        </h3>

        {/* Description */}
        <p className="text-gray-600 text-base sm:text-lg md:text-xl max-w-3xl mx-auto">
          We collaborate with top platforms and services to enhance functionality,
          ensure seamless operations, and deliver unmatched user experiences.
        </p>

        {/* Buttons */}
        <div className="flex flex-col sm:flex-row justify-center items-center gap-4 pt-4">
          <button className="bg-primary hover:bg-primary/60 text-white px-6 py-3 rounded-md text-sm font-medium shadow transition">
            Contact us →
          </button>
          <button className="border border-gray-200 text-black px-6 py-3 rounded-md text-sm font-medium hover:bg-gray-100 transition">
            Get Started →
          </button>
        </div>
      </div>
    </section>
  );
}

export default AboutPartners;
