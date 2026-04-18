"use client";

import Image from "next/image";

export default function AboutTeamNew() {
  return (
    <section className="relative md:py-24 py-10 px-4 sm:px-6 lg:px-12 overflow-hidden">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center">

          {/* LEFT CONTENT */}
          <div className="space-y-6 lg:space-y-8">
            {/* Label */}
            <span className="inline-block text-sm font-semibold tracking-wide text-primary uppercase">
              Our Team
            </span>

            {/* Heading */}
            <h2 className="text-3xl sm:text-4xl font-extrabold leading-tight">
              <span className="text-transparent bg-clip-text bg-linear-to-r from-primary to-purple-600">
                Built by people
              </span>{" "}
              who understand insurance, technology, and trust
            </h2>

            {/* Description */}
            <p className="text-base sm:text-lg text-gray-700 leading-relaxed">
              At InsurBe, our team brings together expertise in insurance,
              technology, compliance, and customer experience. From product
              specialists and engineers to legal and operations experts, we
              work together to simplify insurance and make it accessible,
              transparent, and reliable.
            </p>

            <p className="text-base sm:text-lg text-gray-700 leading-relaxed">
              Every solution we build is backed by strong security standards,
              advanced technology, and a deep understanding of regulatory
              requirements—so our customers can focus on their journey with
              confidence.
            </p>

            {/* CTA (Optional / Ready for future use) */}
            <div className="pt-2">
              <p className="text-base sm:text-lg text-gray-700">
                Want to be part of a team shaping the future of insurance?
              </p>

              {/* Uncomment when careers page is ready */}
              {/*
              <Link href="/careers">
                <button className="mt-4 inline-flex items-center gap-2 px-8 py-3 rounded-full font-semibold text-white bg-gradient-to-r from-primary to-purple-600 shadow-lg hover:shadow-xl transition">
                  View Open Roles
                </button>
              </Link>
              */}
            </div>
          </div>

          {/* RIGHT IMAGE */}
          <div className="relative">
            <div className="relative rounded-3xl overflow-hidden backdrop-blur-xl bg-white/70 border border-white/40 shadow-2xl shadow-purple-500/10">
              <Image
                src="/about_assets/colorTshirt.webp"
                alt="InsurBe team representing diversity and collaboration"
                width={800}
                height={600}
                className="w-full h-auto object-contain"
                priority
              />
            </div>
          </div>

        </div>
      </div>
    </section>
  );
}
