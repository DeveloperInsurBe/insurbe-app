"use client";

import Link from "next/link";
import Image from "next/image";

export default function Footer() {
  return (
    <footer className="w-full bg-white mt-20 border-t border-gray-200">

      {/* 🔵 MAIN CONTAINER */}
      <div className="max-w-7xl mx-auto px-6 py-10">

        {/* 🔥 TOP ROW */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">

          {/* LOGO */}
          <Link href="/" className="flex items-center">
            <Image
              src="/Pluro_Logo_Blue.png"
              alt="Pluro"
              width={120}
              height={40}
              className="h-16 w-auto object-contain"
            />
          </Link>

          {/* COPYRIGHT */}
          <p className="text-sm text-gray-500 text-center md:text-left">
            © 2026 <span className="font-semibold text-primary">PLURO</span>, a
            brand of INSURBE GmbH – All rights reserved.
          </p>

          {/* LINKS */}
          <Link
            href="/imprint"
            className="text-sm text-gray-500 hover:text-primary transition"
          >
            Imprint
          </Link>
        </div>

        {/* 🔥 DIVIDER */}
        <div className="my-8 h-px bg-gradient-to-r from-transparent via-gray-200 to-transparent" />

        {/* 🔒 TRUST SECTION */}
        <div className="flex flex-wrap justify-center items-center gap-8 md:gap-12">

          {/* GDPR */}
          <div className="flex items-center gap-3 group">
            <Image
              src="/partners_assets/gdpr.png"
              alt="GDPR"
              width={50}
              height={40}
              className="h-12 w-auto object-contain opacity-80 group-hover:opacity-100 transition"
            />
            <span className="text-sm text-gray-600 group-hover:text-primary transition">
              GDPR Compliant
            </span>
          </div>

          {/* GERMANY */}
          <div className="flex items-center gap-3 group">
            <Image
              src="/partners_assets/germany.png"
              alt="Germany"
              width={50}
              height={40}
              className="h-12 w-auto object-contain opacity-80 group-hover:opacity-100 transition"
            />
            <span className="text-sm text-gray-600 group-hover:text-primary transition">
              Hosted in Germany
            </span>
          </div>

          {/* ISO */}
          <div className="flex items-center gap-3 group">
            <Image
              src="/partners_assets/iso.png"
              alt="ISO"
              width={50}
              height={40}
              className="h-12 w-auto object-contain opacity-80 group-hover:opacity-100 transition"
            />
            <div className="flex flex-col leading-tight">
              <span className="text-sm text-gray-600 group-hover:text-primary transition">
                ISO 27001
              </span>
              <span className="text-[10px] text-gray-400">
                *in progress
              </span>
            </div>
          </div>

        </div>

      </div>
    </footer>
  );
}