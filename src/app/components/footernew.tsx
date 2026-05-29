import Image from "next/image";
import Link from "next/link";
import ContactBanner from "./ContactBanner";
import { Lock, Server, Shield } from "lucide-react";
import { CARD_BG } from "../constants/styles";

export default function Footernew() {
  return (
    <footer
      className="text-black py-20 px-6 md:px-20"
      style={{
        background:
          "linear-gradient(135deg, rgba(130,10,209,0.18), rgba(192,132,252,0.08))",
      }}
    >
      <div className="max-w-full mx-auto">
        <div className="flex flex-col md:flex-row justify-between gap-12">
          {/* Brand Info */}
          <div className="space-y-4 max-w-md text-center md:text-left mx-auto md:mx-0 ">
            {/* Logo */}
            <div className="flex justify-center md:justify-start py-2 gap-20">
              <Link href="/" className="font-bold font-serif">
                <Image
                  src="/logo.svg"
                  alt="Logo"
                  width={120}
                  height={30}
                />
              </Link>
            </div>

            {/* Subtitle */}
            <p className="md:text-lg text-2xl text-black">
              The only digital solution for all your insurance needs.
            </p>

            {/* GDPR Icon */}
            <div className="flex justify-center md:justify-start ">
              <div className="flex flex-col sm:flex-row gap-2 md:gap-4 py-4 ">
                {/* GDPR Compliant */}
                <div className="flex items-center gap-3 rounded-xl py-2">
                  <div className="w-10 h-10 rounded-full overflow-hidden flex-shrink-0">
                    <Image
                      src="/gifs_assets/gdprlogo.svg"
                      alt="Germany Flag"
                      width={40}
                      height={40}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <span className="text-sm font-medium text-black">
                    GDPR Compliant
                  </span>
                </div>

                {/* Data Centre in EU */}
                <div className="flex items-center gap-3 p-2">
                  <Image
                    src="/gifs_assets/germany2.png"
                    alt="Germany flag"
                    width={40}
                    height={40}
                    className="rounded-full object-cover flex-shrink-0"
                  />

                  <span className="text-sm font-medium text-black leading-tight">
                    <span className="block whitespace-nowrap">Data Centre</span>
                    <span className="block whitespace-nowrap">in Germany</span>
                  </span>
                </div>

                {/* Data Security */}
                <div className="flex items-center gap-1 p-2">
                  <Image
                    src="/gifs_assets/sslnew.png"
                    alt="Secure SSL Encryption"
                    width={50}
                    height={50}
                    className="rounded-full object-cover flex-shrink-0"
                  />

                  <span className="text-sm font-medium text-black leading-tight">
                    SECURE
                    <span className="block whitespace-nowrap">
                      SSL Encryption
                    </span>
                  </span>
                </div>
              </div>
            </div>

            {/* Register Info */}
            {/* <p className="md:text-lg text-2xl text-gray-300 ">
              InsurBe is a registered insurance intermediary in Germany
            </p> */}
          </div>

          {/* Navigation + Links */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center md:text-left mx-auto md:mx-0">
            {/* Insurance */}
            <div className="">
              <h2 className="md:text-lg text-3xl font-semibold mb-4">
                Insurance
              </h2>
              <ul className="space-y-4">
                <li>
                  <a
                    href="/insurance/private-health"
                    className="hover:text-purple-900 text-xl md:text-[18px]"
                  >
                    Private
                  </a>
                </li>
                <li>
                  <a
                    href="/insurance/public-health"
                    className="hover:text-purple-900 text-xl md:text-[18px]"
                  >
                    Public
                  </a>
                </li>

                <li>
                  <a
                    href="/insurance/expat-health"
                    className="hover:text-purple-900 text-xl md:text-[18px]"
                  >
                    Expat
                  </a>
                </li>
                <li>
                  <a
                    href="/products/students"
                    className="hover:text-purple-900 text-xl md:text-[18px]"
                  >
                    Student
                  </a>
                </li>
              </ul>
            </div>
            {/* Navigation */}
            <div>
              <h2 className="md:text-lg text-3xl font-semibold mb-4">
                Company
              </h2>
              <ul className="space-y-4">
                 <li>
                  <a
                    href="/about"
                    className="hover:text-purple-900 text-xl md:text-[18px]"
                  >
                    About InsurBe
                  </a>
                </li>
                 <li>
                  <a
                    href="/career"
                    className="hover:text-purple-900 text-xl md:text-[18px]"
                  >
                    Careers
                  </a>
                </li>
                 <li>
                  <a
                    href="/becomepartner"
                    className="hover:text-purple-900 text-xl md:text-[18px]"
                  >
                    Become a Partner
                  </a>
                </li>
                <li>
                  <a
                    href="/support"
                    className="hover:text-purple-900 text-xl md:text-[18px]"
                  >
                    Contact
                  </a>
                </li>                
              </ul>
            </div>    
            
            {/* Links */}
            <div>
              <h2 className="md:text-lg text-3xl font-semibold mb-4">General</h2>
              <ul className="space-y-4">
                <li>
                  <a
                    href="/imprint"
                    className="hover:text-purple-900 text-xl md:text-[18px]"
                  >
                    Imprint
                  </a>
                </li>
                <li>
                  <a
                    href="/privacypolicy"
                    className="hover:text-purple-900 text-xl md:text-[18px]"
                  >
                    Data Privacy
                  </a>
                </li>
                <li>
                  <a
                    href="/termscondition"
                    className="hover:text-purple-900 text-xl md:text-[18px]"
                  >
                    Terms & Conditions
                  </a>
                 
                </li>
<li>
                  <a
                    href="/accessibility"
                    className="hover:text-purple-900 text-xl md:text-[18px]"
                  >
                    Accessibility
                  </a>
                 
                </li>
               
              </ul>
            </div>
          </div>
        </div>

        {/* Footer Bottom */}
        <div className="border-t border-black/15 mt-10 pt-6">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4 text-black/80 text-sm">
            {/* Copyright */}
            <p className="text-center md:text-left">
              Copyright © 2026 InsurBe GmbH
              <span className="hidden md:inline"> - All rights reserved.</span>
              <span className="md:hidden block">All rights reserved.</span>
            </p>

            {/* Social Icons */}
            <div className="flex items-center gap-4">
              <a
                href="https://www.linkedin.com/company/insurbe-gmbh/"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-purple-900 transition-colors"
                aria-label="LinkedIn"
              >
                <svg
                  className="w-4 h-4"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
                </svg>
              </a>            

              <a
                href="https://www.facebook.com/share/1CFrgoW6TV/"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-purple-900 transition-colors"
                aria-label="Facebook"
              >
                <svg
                  className="w-4 h-4"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                </svg>
              </a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
