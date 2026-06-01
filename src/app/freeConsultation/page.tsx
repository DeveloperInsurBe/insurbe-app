"use client";

import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";

export default function FreeConsultation() {
  return (
    <section className="w-full md:pb-16 pb-10">
      <div className="container mx-auto px-4">
       
        <div className="overflow-hidden rounded-[32px] border border-purple-100 bg-[#faf8ff] shadow-sm">
          <div className="grid lg:grid-cols-2">
            {/* LEFT IMAGE */}
            <div className="relative min-h-[320px] lg:min-h-[400px]">
              <Image
                src="/hero_assets/consultation.png"
                alt="Free Consultation"
                fill
                priority
                className="object-cover"
              />
            </div>

            {/* RIGHT CONTENT */}
            <div className="flex items-center">
              <div className="w-full p-8 md:p-12 lg:px-10 lg:py-4">
                {/* Badge */}
                <div className="mb-6 inline-flex items-center rounded-full border border-purple-200 bg-purple-50 px-4 py-2 text-sm  text-primary">
                  Free Expert Support
                </div>

                {/* Heading */}
                <h2 className="max-w-xl text-2xl font-black leading-tight text-slate-900 md:text-3xl lg:text-4xl">
                  Do you have any questions?
                  <span className="mt-2 block">
                    <span className="bg-purple-100 px-2 py-1">
                      Let's sort this out together.
                    </span>
                  </span>
                </h2>

                {/* Description */}
                <p className="mt-8 max-w-lg text-[12px] leading-8 text-slate-600 md:text-[14px]">
                  <span className="bg-purple-50 px-1">
                    Speak to an expert who speaks your language
                  </span>{" "}
                  — no insurance jargon.
                  <br />
                  Free, friendly and completely without obligation.
                </p>

                {/* Features */}
                <div className="mt-8 flex flex-wrap gap-3">
                  <div className="rounded-full bg-white px-4 py-2 text-[12px] font-medium text-slate-700 shadow-sm">
                    ✓ 30-Min Call
                  </div>

                  <div className="rounded-full bg-white px-4 py-2 text-[12px] font-medium text-slate-700 shadow-sm">
                    ✓ Multilingual Support
                  </div>

                  <div className="rounded-full bg-white px-4 py-2 text-[12px] font-medium text-slate-700 shadow-sm">
                    ✓ No Obligation
                  </div>
                </div>

                {/* CTA */}
                <div className="mt-10">
                  <Link
                    href="/book-appointment"
                    className="group inline-flex items-center cursor-pointer gap-3 rounded-xl bg-primary px-7 py-4 text-[14px] font-semibold text-white transition-all duration-300 hover:scale-[1.02] hover:shadow-xl"
                  >
                    Free 30-Minute Consultation
                    <ArrowRight className="h-5 w-5 transition-transform duration-300 group-hover:translate-x-1" />
                  </Link>
                </div>

               
              </div>
            </div>
          </div>
        </div>

      </div>
    </section>
  );
}
