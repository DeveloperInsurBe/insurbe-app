"use client";
import Image from "next/image";

export default function FoundationSection() {
  return (
    <section className="px-4 sm:px-6 lg:px-20 py-16">
      <div className="max-w-7xl mx-auto w-full">
        {/* Heading */}
        <h2 className="text-center text-3xl md:text-5xl font-bold mb-16">
          Insurbe’s Journey
        </h2>

        {/* Grid Content */}
        <div className="grid grid-cols-1 lg:grid-cols-2 items-center gap-10">
          {/* Left Text Content */}
          <div className="text-center lg:text-left space-y-6">
            <span className="inline-block bg-gray-100 text-gray-600 text-sm font-medium px-3 py-1 rounded-full">
              The Birth
            </span>
            <h3 className="text-3xl md:text-[64px] font-semibold text-gray-900">
              2020: Foundation and Vision
            </h3>
            <p className="text-gray-600 text-base sm:text-lg max-w-xl mx-auto lg:mx-0">
              Insurbe was founded with a vision to simplify the insurance
              process for individuals and families.
            </p>

            <div className="flex flex-col sm:flex-row justify-center lg:justify-start gap-4 pt-2">
              <button className="bg-primary hover:bg-primary/60 text-white px-6 py-3 rounded-md text-sm font-medium shadow transition">
                Contact us →
              </button>
              <button className="border border-gray-200 text-black px-6 py-3 rounded-md text-sm font-medium hover:bg-gray-100 transition">
                Get Started →
              </button>
            </div>
          </div>

          {/* Right Image Content */}
          <div className="relative w-full max-w-md mx-auto">
            <div className="rounded-xl overflow-hidden">
              <Image
                src="/about/aboutHero.png"
                alt="Expanding for Expats"
                width={500}
                height={500}
                className="w-full h-auto rounded-xl object-cover"
              />
            </div>

            {/* Overlay Card */}
            <div className="absolute -bottom-8 right-4">
              <Image
                src="/about/HeroOverlay.png"
                alt="Expats Stats"
                width={260}
                height={160}
                className="rounded-xl shadow-md object-contain"
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
