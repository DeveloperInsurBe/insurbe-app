import Image from "next/image";
import Link from "next/link";
import ContactBanner from "./ContactBanner";

export default function Footer() {
  return (
    <div>
      <ContactBanner />
      <footer className="bg-primary text-white py-4 px-6 pt-50 -mt-58 relative z-10">
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-col md:flex-row justify-between gap-8">
            {/* Brand Info */}
            <div className="space-y-4 max-w-md">
              {/* Logo */}
              <div className="text-2xl font-bold">
                <Link href="/" className="font-bold font-serif">
                  <Image src="/icons/logo_white.png" alt="Logo" width={140} height={20} />
                </Link>
              </div>{" "}
              <p className="text-sm text-gray-400 ">
                The only digital solution for all your <br /> insurance needs.
              </p>
              <div className="flex gap-4">
                {/* <div className="text-2x font-bold flex items-center">
                  <Link href="/" className="font-bold font-serif">
                    <Image
                      src="/img/footerIcon2.svg"
                      alt="Logo"
                      width={140}
                      height={20}
                    />
                  </Link>
                </div>{" "} */}
                <div className="text-2xl font-bold">
                  <Link href="/" className="font-bold font-serif">
                    <Image
                      src="/img/footerIcon1.svg"
                      alt="Logo"
                      width={80}
                      height={20}
                    />
                  </Link>
                </div>{" "}
              </div>
              <p className="text-sm text-[#FFFFFFCC]">
                Insurbe is a registered insurance intermediary in <br />{" "}
                Germany
              </p>
            </div>

            {/* Navigation Links */}
            <div className="grid grid-cols-2 gap-14 px-20">
              <div>
                <h2 className="text-xl font-semibold mb-4">Navigation</h2>
                <ul className="space-y-4">
                  <li>
                    <a href="#" className="hover:text-purple-700 transition">
                      Home
                    </a>
                  </li>
                  <li>
                    <a href="#" className="hover:text-purple-700 transition">
                      Products
                    </a>
                  </li>
                  <li>
                    <a href="#" className="hover:text-purple-700 transition">
                      Private Health
                    </a>
                  </li>
                  <li>
                    <a href="#" className="hover:text-purple-700 transition">
                      Contact
                    </a>
                  </li>
                </ul>
              </div>
              <div>
                <h2 className="text-xl font-semibold mb-4">Links</h2>
                <ul className="space-y-4">
                  <li>
                    <a href="#" className="hover:text-purple-700 transition">
                      Imprint
                    </a>
                  </li>
                  <li>
                    <a href="#" className="hover:text-purple-700 transition">
                      Data Privacy
                    </a>
                  </li>
                  <li>
                    <a href="#" className="hover:text-purple-700 transition">
                      Terms & Conditions
                    </a>
                  </li>
                  <li>
                    <a href="#" className="hover:text-purple-700 transition">
                      About Us
                    </a>
                  </li>
                  <li>
                    <a href="#" className="hover:text-purple-700 transition">
                      Careers
                    </a>
                  </li>
                </ul>
              </div>
            </div>
          </div>

          {/* Copyright */}
          <div className="border-t border-gray-200 mt-8 pt-8 text-start text-sm text-white">
            Copyright © 2024 Insurbe. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
}
