"use client";

import { useState, useRef } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { Menu, X } from "lucide-react";
import Image from "next/image";
import { usePathname } from "next/navigation";

// Update with actual route slugs as needed:
const navLinks = [
  { name: "Home", href: "/" },
  { name: "About Us", href: "/about" },
  {
    name: "Products",
    submenu: [
      { name: "Private", href: "/products/privateProducts" },
      { name: "Pension", href: "/products/pensionProducts" },
      {
        name: "Working Professionals",
        href: "/products/working-professionals",
      },
      { name: "Visa Seekers", href: "/products/visa-seekers" },
      { name: "Students", href: "/products/students" },
      { name: "Family", href: "/products/family" },
    ],
  },
  { name: "Careers", href: "/career" },
  { name: "Calculator", href: "/calculator" },
  { name: "Contact", href: "/contact" },
];

const Header = () => {
  const [isOpen, setIsOpen] = useState(false); // mobile drawer
  const [showProducts, setShowProducts] = useState(false);
  const hoverTimeout = useRef<NodeJS.Timeout | null>(null);
  const pathname = usePathname();

  const toggleDrawer = () => setIsOpen(!isOpen);

  const handleMouseEnter = () => {
    if (hoverTimeout.current) clearTimeout(hoverTimeout.current);
    setShowProducts(true);
  };

  const handleMouseLeave = () => {
    hoverTimeout.current = setTimeout(() => {
      setShowProducts(false);
    }, 120); // smooth delay
  };

  return (
    <header className="sticky top-0 w-full z-60 bg-white">
      <nav className="flex justify-between items-center px-6 md:px-10 xl:px-20 py-4 w-full">
        {/* Logo */}
        <Link href="/" className="font-bold font-serif flex items-center gap-2">
          <Image src="/logo.svg" alt="Logo" width={100} height={20} />
        </Link>

        {/* Desktop Navigation */}
        <div className="hidden md:flex items-center gap-10 text-lg">
          {navLinks.map((link) =>
            link.submenu ? (
              <div
                key={link.name}
                className="relative"
                onMouseEnter={handleMouseEnter}
                onMouseLeave={handleMouseLeave}
              >
                <span
                  className={`cursor-pointer h-7 px-1 ${
                    pathname.includes("/products")
                      ? "text-primary border-b-2 border-primary font-semibold pb-1"
                      : "text-black"
                  }`}
                >
                  {link.name}
                </span>
                {/* --- FULL WIDTH, HALF SPLIT MEGA MENU --- */}
                {showProducts && (
                  <div className="fixed left-0 top-[72px] w-screen z-50">
                    <div className="flex w-full bg-[#FCEAF8] min-h-[320px] py-8 px-0">
                      {/* Left: Centered image in a card with margin */}
                      <div className="flex flex-1 items-center justify-center">
                        <div className="rounded-md  overflow-hidden p-2">
                          <img
                            src="/img/menuFamily.png"
                            alt="Mega Menu Promo"
                            className="object-cover rounded-md w-[610px] h-[280px]"
                            style={{ objectPosition: "center" }}
                          />
                        </div>
                      </div>
                      {/* Right: Centered vertical menu */}
                      <div className="flex flex-1 items-center justify-center">
                        <ul className="flex flex-col gap-8 w-full max-w-[230px] pr-10">
                          {[
                            {
                              name: "Working Professionals",
                              href: "/products/privateProducts",
                            },
                            {
                              name: "Family",
                              href: "/products/pensionProducts",
                            },
                            { name: "Visa Seekers", href: "/products/visaSeakers" },
                            { name: "Students", href: "/products/students" },
                            
                          ].map((item) => (
                            <li key={item.name} className="text-right">
                              <Link
                                href={item.href}
                                className="block text-black text-lg font-normal hover:text-primary transition"
                                tabIndex={showProducts ? 0 : -1}
                                onClick={() => setShowProducts(false)}
                              >
                                {item.name}
                              </Link>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <Link
                key={link.name}
                href={link.href}
                className={`relative overflow-hidden h-7 px-1 ${
                  pathname === link.href
                    ? "text-primary border-b-2 border-primary font-semibold pb-1"
                    : "text-black"
                }`}
              >
                {link.name}
              </Link>
            )
          )}
        </div>

        {/* Mobile Menu Button */}
        <button onClick={toggleDrawer} className="md:hidden text-black">
          <Menu size={28} />
        </button>
      </nav>

      {/* Mobile Drawer */}
      {isOpen && (
        <motion.div
          initial={{ x: "100%" }}
          animate={{ x: 0 }}
          exit={{ x: "100%" }}
          transition={{ duration: 0.28, ease: "easeInOut" }}
          className="fixed inset-0 z-50 flex"
        >
          {/* Overlay */}
          <div
            className="w-1/5 bg-black/80 backdrop-blur-sm"
            onClick={toggleDrawer}
          />
          {/* Drawer */}
          <div className="w-4/5 h-full bg-white text-black p-6 flex flex-col">
            <button onClick={toggleDrawer} className="self-end mb-8">
              <X size={28} className="text-primary font-bold" />
            </button>
            <div className="flex flex-col space-y-6 mt-20">
              {navLinks.map((link) =>
                link.submenu ? (
                  <div key={link.name} className="flex flex-col gap-2">
                    <span className="text-lg font-medium">{link.name}</span>
                    {link.submenu.map((sublink) => (
                      <Link
                        key={sublink.name}
                        href={sublink.href}
                        onClick={toggleDrawer}
                        className="pl-4 text-base text-gray-700 hover:text-primary"
                      >
                        {sublink.name}
                      </Link>
                    ))}
                  </div>
                ) : (
                  <Link
                    key={link.name}
                    href={link.href}
                    onClick={toggleDrawer}
                    className={`text-lg ${
                      pathname === link.href
                        ? "text-primary underline underline-offset-4"
                        : "text-black hover:text-primary"
                    }`}
                  >
                    {link.name}
                  </Link>
                )
              )}
            </div>
          </div>
        </motion.div>
      )}
    </header>
  );
};

export default Header;
