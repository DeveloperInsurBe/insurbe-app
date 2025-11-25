"use client";
import Image from "next/image";

export default function AboutGrowth() {
  return (
    <section className="px-2">
      <div className="bg-[#470877] text-white py-20 px-4 sm:px-10 lg:px-20 rounded-[48px] overflow-hidden">
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 items-center gap-12">
          {/* Left Side Layout */}
          <div className="grid grid-cols-2 gap-4 ">
            {/* Image 1 */}
            <div className=" h-70">
              <Image
                src="/about/image1.png"
                alt="Image 1"
                width={600}
                height={400}
              />
            </div>

            {/* Image 2 */}
            <div className=" h-72">
              <Image
                src="/about/image2.png"
                alt="Image 2"
                width={400}
                height={300}
              />
            </div>

            {/* Image 3 */}
            <div className=" h-60">
              <Image
                src="/about/image3.png"
                alt="Image 3"
                width={400}
                height={300}
              />
            </div>

            {/* Image 4 */}
            <div className="">
              <Image
                src="/about/image4.png"
                alt="Image 4"
                width={400}
                height={300}
              />
            </div>
          </div>

          {/* Right Side Content */}
          <div className="space-y-6">
            <span className="inline-block bg-white/10 text-xs px-3 py-1 rounded-full font-medium">
              Building
            </span>
            <h1 className="text-3xl md:text-[64px] font-medium leading-tight">
              2023: Growth and Innovation
            </h1>
            <p className="text-white/80 text-[18px] md:text-lg max-w-md">
              Achieved 100,000 satisfied customers and launched AI-driven
              recommendation tools to enhance user experience.
            </p>
            <button className="bg-white text-primary hover:bg-gray-100 px-6 py-3 rounded-md text-sm font-semibold transition">
              Read About Us →
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
