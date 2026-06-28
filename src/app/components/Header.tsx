"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import {
  Menu,
  X,
  ChevronDown,
  ChevronRight,
  Briefcase,
  Users,
  Globe,
  GraduationCap,
  LogOut,
  UserPlus,
  User,
  LayoutDashboard,
} from "lucide-react";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import { signOut, useSession } from "next-auth/react";

// Updated navLinks with About Us dropdown
const navLinks = [
  // { name: "Home", href: "/" },
  {
    name: "About Us",
    submenu: [
      { name: "About InsurBe", href: "/about", icon: "ℹ️" },
      { name: "Careers", href: "/career", icon: "💼" },
    ],
  },
  {
    name: "Insurances",
    submenu: [
      {
        name: "Working Professionals",
        href: "/products/privateProducts",
        icon: "💼",
      },
      { name: "Family", href: "/products/pensionProducts", icon: "👨‍👩‍👧‍👦" },
      { name: "Visa Seekers", href: "/products/visaSeakers", icon: "✈️" },
      { name: "Students", href: "/products/students", icon: "🎓" },
    ],
  },
  {
    name: "Blocked Account",
    submenu: [
      { name: "Blocked Account", href: "/blocked-account", icon: "🏦" },
      {
        name: "Travel Health insurance for visa",
        href: "/blocked-account/travel-health-insurance-for-visa",
        icon: "✈️",
      },
      {
        name: "Private Health insurance",
        href: "/blocked-account/private-health-insurance",
        icon: "🩺",
      },
      {
        name: "Statutory health insurance",
        href: "/blocked-account/statutory-health-insurance",
        icon: "📜",
      },
    ],
  },
  { name: "Support", href: "/support" },
];

const productTagsConfig: Record<
  string,
  { label: string; href: string; icon: string; color: string }[]
> = {
  "Working Professionals": [
    {
      label: "Private",
      href: "/insurance/private-health",
      icon: "💼",
      color: "bg-indigo-100 text-indigo-700",
    },
    {
      label: "Public",
      href: "/insurance/public-health",
      icon: "🏥",
      color: "bg-indigo-100 text-indigo-700",
    },
    {
      label: "Expat",
      href: "/insurance/expat-health",
      icon: "🌍",
      color: "bg-indigo-100 text-indigo-700",
    },
  ],

  Family: [
    {
      label: "Pension",
      href: "/products/pensionProducts",
      icon: "👴",
      color: "bg-rose-100 text-rose-700",
    },
    {
      label: "Investments",
      href: "/products/pensionProducts",
      icon: "📈",
      color: "bg-rose-100 text-rose-700",
    },
  ],

  "Visa Seekers": [
    {
      label: "Students",
      href: "/products/visaSeakers",
      icon: "🎓",
      color: "bg-emerald-100 text-emerald-700",
    },
    {
      label: "Tourist",
      href: "/products/visaSeakers",
      icon: "✈️",
      color: "bg-emerald-100 text-emerald-700",
    },
    {
      label: "Global Nomad",
      href: "/products/visaSeakers",
      icon: "🌐",
      color: "bg-emerald-100 text-emerald-700",
    },
  ],

  Students: [
    {
      label: "Public",
      href: "/insurance/public-health",
      icon: "🏛️",
      color: "bg-sky-100 text-sky-700",
    },
    {
      label: "Private",
      href: "/ottonovaSignupform",
      icon: "💼",
      color: "bg-sky-100 text-sky-700",
    },
  ],
};

const Header = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [showProducts, setShowProducts] = useState(false);
  const [showAbout, setShowAbout] = useState(false);
  const [showBlockedAccount, setShowBlockedAccount] = useState(false);
  const [mobileProductsOpen, setMobileProductsOpen] = useState(false);
  const [mobileAboutOpen, setMobileAboutOpen] = useState(false);
  const [mobileBlockedAccountOpen, setMobileBlockedAccountOpen] =
    useState(false);
  const productHoverTimeout = useRef<NodeJS.Timeout | null>(null);
  const aboutHoverTimeout = useRef<NodeJS.Timeout | null>(null);
  const blockedAccountHoverTimeout = useRef<NodeJS.Timeout | null>(null);
  const pathname = usePathname();
  const router = useRouter();

  const { data: session, status } = useSession();

  const toggleDrawer = () => {
    setIsOpen(!isOpen);
    setMobileProductsOpen(false);
    setMobileAboutOpen(false);
    setMobileBlockedAccountOpen(false);
    // Prevent body scroll when drawer is open
    if (!isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
  };

  const handleProductMouseEnter = () => {
    if (productHoverTimeout.current) clearTimeout(productHoverTimeout.current);
    setShowProducts(true);
    setShowAbout(false);
    setShowBlockedAccount(false);
  };

  const handleProductMouseLeave = () => {
    productHoverTimeout.current = setTimeout(() => {
      setShowProducts(false);
    }, 120);
  };

  const handleAboutMouseEnter = () => {
    if (aboutHoverTimeout.current) clearTimeout(aboutHoverTimeout.current);
    setShowAbout(true);
    setShowProducts(false);
    setShowBlockedAccount(false);
  };

  const handleAboutMouseLeave = () => {
    aboutHoverTimeout.current = setTimeout(() => {
      setShowAbout(false);
    }, 120);
  };

  const handleBlockedAccountMouseEnter = () => {
    if (blockedAccountHoverTimeout.current) {
      clearTimeout(blockedAccountHoverTimeout.current);
    }
    setShowBlockedAccount(true);
    setShowProducts(false);
    setShowAbout(false);
  };

  const handleBlockedAccountMouseLeave = () => {
    blockedAccountHoverTimeout.current = setTimeout(() => {
      setShowBlockedAccount(false);
    }, 120);
  };

  // Close drawer when clicking a link
  const handleLinkClick = () => {
    setIsOpen(false);
    setMobileProductsOpen(false);
    setMobileAboutOpen(false);
    setMobileBlockedAccountOpen(false);
    document.body.style.overflow = "unset";
  };

  const handleSignOut = async () => {
    await signOut({ redirect: false });
    router.push("/");
    handleLinkClick();
  };

  return (
    <header className="sticky top-0 w-full z-50 backdrop-blur-xl bg-white/70 supports-backdrop-filter:bg-white/60 border-b border-white/20 shadow-[0_8px_30px_rgba(0,0,0,0.06)]">
      <nav className="flex justify-between items-center px-6 md:px-10 xl:px-20 py-4 w-full">
        {/* Logo */}
        <Link href="/" className="font-bold font-serif flex items-center gap-2">
          <Image src="/logo.svg" alt="Logo" width={100} height={20} priority />
        </Link>

        {/* Desktop Navigation */}
        <div className="hidden md:flex items-center gap-10 text-lg">
          {navLinks.map((link) =>
            link.submenu ? (
              <div
                key={link.name}
                className="relative"
                onMouseEnter={
                  link.name === "Insurances"
                    ? handleProductMouseEnter
                    : link.name === "About Us"
                      ? handleAboutMouseEnter
                      : handleBlockedAccountMouseEnter
                }
                onMouseLeave={
                  link.name === "Insurances"
                    ? handleProductMouseLeave
                    : link.name === "About Us"
                      ? handleAboutMouseLeave
                      : handleBlockedAccountMouseLeave
                }
              >
                <span
                  className={`cursor-pointer h-7 px-1 flex items-center gap-1 ${
                    (link.name === "Insurances" &&
                      pathname.includes("/products")) ||
                    (link.name === "About Us" &&
                      (pathname === "/about" || pathname === "/career")) ||
                    (link.name === "Blocked Account" &&
                      pathname.startsWith("/blocked-account"))
                      ? "text-primary border-b-2 border-primary font-semibold pb-1"
                      : "text-black hover:text-primary transition"
                  }`}
                >
                  {link.name}
                  <ChevronDown size={16} />
                </span>

                {/* About Us Dropdown */}
                {link.name === "About Us" && (
                  <AnimatePresence>
                    {showAbout && (
                      <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        transition={{ duration: 0.2 }}
                        className="absolute left-0 top-full mt-2 w-48 bg-white rounded-lg shadow-xl border border-gray-200 overflow-hidden z-50"
                      >
                        {link.submenu.map((item) => (
                          <Link
                            key={item.name}
                            href={item.href}
                            onClick={() => setShowAbout(false)}
                            className={`flex items-center gap-3 px-4 py-3 text-sm font-medium transition hover:bg-gray-50 ${
                              pathname === item.href
                                ? "bg-primary/10 text-primary"
                                : "text-gray-700"
                            }`}
                          >
                            <span className="text-lg">{item.icon}</span>
                            {item.name}
                          </Link>
                        ))}
                      </motion.div>
                    )}
                  </AnimatePresence>
                )}

                {/* Blocked Account Dropdown */}
                {link.name === "Blocked Account" && (
                  <AnimatePresence>
                    {showBlockedAccount && (
                      <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        transition={{ duration: 0.2 }}
                        className="absolute left-0 top-full mt-2 min-w-[320px] bg-white rounded-lg shadow-xl border border-gray-200 overflow-hidden z-50"
                      >
                        {link.submenu.map((item) => (
                          <Link
                            key={item.name}
                            href={item.href}
                            onClick={() => setShowBlockedAccount(false)}
                            className={`flex items-center gap-3 px-4 py-3 text-sm font-medium transition hover:bg-gray-50 ${
                              pathname === item.href
                                ? "bg-primary/10 text-primary"
                                : "text-gray-700"
                            }`}
                          >
                            <span className="text-lg">{item.icon}</span>
                            {item.name}
                          </Link>
                        ))}
                      </motion.div>
                    )}
                  </AnimatePresence>
                )}

                {/* Insurance Products Mega Menu */}
                {link.name === "Insurances" && (
                  <AnimatePresence>
                    {showProducts && (
                      <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        transition={{ duration: 0.2 }}
                        className="fixed left-0 top-[72px] w-screen z-50"
                      >
                        <div className="w-full backdrop-blur-xl bg-[#f4f4f4]/98 supports-[backdrop-filter]:bg-[#f4f4f4]/98 border-b border-white/20 shadow-[0_8px_30px_rgba(0,0,0,0.06)]">
                          <div className="max-w-6xl mx-auto px-8 py-10">
                            <h3 className="text-xl font-bold text-gray-900 mb-6">
                              Insurance Products
                            </h3>

                            <div className="grid grid-cols-4 gap-6">
                              {link.submenu.map((item, index) => {
                                const getIcon = (name: string) => {
                                  switch (name) {
                                    case "Working Professionals":
                                      return (
                                        <Briefcase className="w-7 h-7 text-indigo-600" />
                                      );
                                    case "Family":
                                      return (
                                        <Users className="w-7 h-7 text-rose-600" />
                                      );
                                    case "Visa Seekers":
                                      return (
                                        <Globe className="w-7 h-7 text-emerald-600" />
                                      );
                                    case "Students":
                                      return (
                                        <GraduationCap className="w-7 h-7 text-sky-600" />
                                      );
                                    default:
                                      return null;
                                  }
                                };

                                const getBg = (name: string) => {
                                  switch (name) {
                                    case "Working Professionals":
                                      return "bg-indigo-50";
                                    case "Family":
                                      return "bg-rose-50";
                                    case "Visa Seekers":
                                      return "bg-emerald-50";
                                    case "Students":
                                      return "bg-sky-50";
                                    default:
                                      return "bg-gray-50";
                                  }
                                };

                                return (
                                  <motion.div
                                    key={item.name}
                                    className="h-full"
                                    initial={{ opacity: 0, y: 12 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: index * 0.05 }}
                                  >
                                    <div
                                      role="button"
                                      tabIndex={0}
                                      onClick={() => {
                                        setShowProducts(false);
                                        router.push(item.href);
                                      }}
                                      className="group h-60 p-6 rounded-2xl border border-gray-200 hover:border-primary hover:shadow-xl transition-all bg-white cursor-pointer"
                                    >
                                      <div className="flex flex-col h-full">
                                        {/* ICON */}
                                        <div
                                          className={`w-12 h-12 rounded-xl flex items-center justify-center ${getBg(
                                            item.name,
                                          )} group-hover:scale-110 transition-transform`}
                                        >
                                          {getIcon(item.name)}
                                        </div>

                                        {/* TITLE */}
                                        <h4 className="font-semibold text-gray-900 mb-2 group-hover:text-primary transition mt-3">
                                          {item.name}
                                        </h4>

                                        {/* PRODUCT TAGS */}
                                        <div className="flex flex-wrap gap-2 mb-3">
                                          {productTagsConfig[item.name]?.map(
                                            (tag) => (
                                              <button
                                                key={tag.label}
                                                type="button"
                                                onClick={(e) => {
                                                  e.stopPropagation();
                                                  setShowProducts(false);
                                                  router.push(tag.href);
                                                }}
                                                className={`flex items-center gap-1.5 text-[11px] px-2.5 py-1 rounded-full font-semibold ${tag.color} transition-all duration-200 hover:-translate-y-0.5 hover:scale-[1.03] hover:shadow-sm`}
                                              >
                                                <span className="text-xs">
                                                  {tag.icon}
                                                </span>
                                                {tag.label}
                                              </button>
                                            ),
                                          )}
                                        </div>

                                        {/* DESCRIPTION */}
                                        <p className="text-sm text-gray-600 mt-auto leading-relaxed">
                                          {item.name ===
                                            "Working Professionals" &&
                                            "Comprehensive health coverage for working individuals"}
                                          {item.name === "Family" &&
                                            "Reliable protection plans for your entire family"}
                                          {item.name === "Visa Seekers" &&
                                            "Insurance solutions for visa and relocation needs"}
                                          {item.name === "Students" &&
                                            "Affordable and flexible insurance plans for students"}
                                        </p>
                                      </div>
                                    </div>
                                  </motion.div>
                                );
                              })}
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                )}
              </div>
            ) : (
              <Link
                key={link.name}
                href={link.href}
                className={`relative overflow-hidden h-7 px-1 ${
                  pathname === link.href
                    ? "text-primary border-b-2 border-primary font-semibold pb-1"
                    : "text-black hover:text-primary transition"
                }`}
              >
                {link.name}
              </Link>
            ),
          )}
        </div>

        {/* Desktop Auth Buttons */}
        <div className="hidden md:flex items-center gap-4 ml-6">
          {!session ? (
            <Link
              href="/login"
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-gray-900 text-[15px] font-medium transition"
            >
              <User className="w-5 h-5" />
              Log in
            </Link>
          ) : (
            <button
              type="button"
              onClick={() => router.push("/dashboard")}
              className="flex items-center cursor-pointer gap-2 px-4 py-2 rounded-xl text-gray-800 hover:bg-purple-50 transition-all"
            >
              <User className="w-4 h-4" />
              <span className="text-sm font-medium">My Account</span>
            </button>
          )}
        </div>

        {/* Mobile Menu Button */}
        <motion.button
          whileTap={{ scale: 0.95 }}
          onClick={toggleDrawer}
          className="md:hidden text-black p-2 hover:bg-gray-100 rounded-lg transition"
          aria-label="Toggle menu"
        >
          <Menu size={28} />
        </motion.button>
      </nav>

      {/* Mobile Drawer */}
      <AnimatePresence>
        {isOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.25 }}
              className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm md:hidden"
              onClick={toggleDrawer}
            />

            {/* Drawer */}
            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
              className="fixed right-0 top-0 h-screen w-[85%] max-w-sm z-50 bg-white shadow-2xl md:hidden"
            >
              <div className="h-full flex flex-col">
                {/* Header */}
                <div className="flex items-center justify-between px-5 py-4 border-b border-gray-200 bg-linear-to-r from-primary/5 to-purple-50">
                  <Link
                    href="/"
                    onClick={handleLinkClick}
                    className="font-bold font-serif"
                  >
                    <Image src="/logo.svg" alt="Logo" width={90} height={18} />
                  </Link>
                  <motion.button
                    whileTap={{ scale: 0.9 }}
                    onClick={toggleDrawer}
                    className="p-2 hover:bg-white/80 rounded-full transition"
                    aria-label="Close menu"
                  >
                    <X size={24} className="text-primary" />
                  </motion.button>
                </div>

                {/* Navigation Links */}
                <div className="flex-1 min-h-0 overflow-y-auto p-4">
                  <div className="space-y-1">
                    {/* Mobile Auth CTA */}
                    {!session ? (
                      <Link
                        href="/login"
                        onClick={handleLinkClick}
                        className="flex items-center justify-center px-4 py-3.5 mb-2 rounded-xl bg-gradient-to-r from-primary to-purple-600 text-white font-semibold shadow-lg transition"
                      >
                        <User className="w-5 h-5 mr-2" />
                        Log in
                      </Link>
                    ) : (
                      <div className="mb-3 space-y-2">
                        <button
                          onClick={() => {
                            router.push("/dashboard");
                            handleLinkClick();
                          }}
                          className="w-full flex items-center justify-center px-4 py-3.5 rounded-xl bg-gradient-to-r from-primary to-purple-600 text-white font-semibold shadow-lg transition"
                        >
                          <LayoutDashboard className="w-5 h-5 mr-2" />
                          My Account
                        </button>
                        <button
                          onClick={handleSignOut}
                          className="w-full flex items-center justify-center px-4 py-3 rounded-xl bg-red-50 text-red-600 font-semibold border border-red-200 hover:bg-red-100 transition"
                        >
                          <LogOut className="w-5 h-5 mr-2" />
                          Sign Out
                        </button>
                      </div>
                    )}

                    {navLinks.map((link) =>
                      link.submenu ? (
                        <div key={link.name}>
                          <button
                            onClick={() => {
                              if (link.name === "Insurances") {
                                setMobileProductsOpen(!mobileProductsOpen);
                                setMobileAboutOpen(false);
                                setMobileBlockedAccountOpen(false);
                              } else if (link.name === "About Us") {
                                setMobileAboutOpen(!mobileAboutOpen);
                                setMobileProductsOpen(false);
                                setMobileBlockedAccountOpen(false);
                              } else if (link.name === "Blocked Account") {
                                setMobileBlockedAccountOpen(
                                  !mobileBlockedAccountOpen,
                                );
                                setMobileProductsOpen(false);
                                setMobileAboutOpen(false);
                              }
                            }}
                            className={`w-full flex items-center justify-between px-4 py-3.5 text-base font-semibold rounded-lg transition ${
                              (link.name === "Insurances" &&
                                pathname.includes("/products")) ||
                              (link.name === "About Us" &&
                                (pathname === "/about" ||
                                  pathname === "/career")) ||
                              (link.name === "Blocked Account" &&
                                pathname.startsWith("/blocked-account"))
                                ? "bg-primary/10 text-primary"
                                : "text-gray-800 hover:bg-gray-100"
                            }`}
                          >
                            <span className="flex items-center gap-3">
                              <span className="text-xl">
                                {link.name === "Insurances" && "📦"}
                                {link.name === "About Us" && "ℹ️"}
                                {link.name === "Blocked Account" && "🏦"}
                              </span>
                              {link.name}
                            </span>
                            <motion.div
                              animate={{
                                rotate:
                                  (link.name === "Insurances" &&
                                    mobileProductsOpen) ||
                                  (link.name === "About Us" &&
                                    mobileAboutOpen) ||
                                  (link.name === "Blocked Account" &&
                                    mobileBlockedAccountOpen)
                                    ? 180
                                    : 0,
                              }}
                              transition={{ duration: 0.3 }}
                            >
                              <ChevronDown size={20} />
                            </motion.div>
                          </button>

                          <AnimatePresence initial={false}>
                            {((link.name === "Insurances" &&
                              mobileProductsOpen) ||
                              (link.name === "About Us" &&
                                mobileAboutOpen) ||
                              (link.name === "Blocked Account" &&
                                mobileBlockedAccountOpen)) && (
                              <motion.div
                                initial={{ height: 0, opacity: 0 }}
                                animate={{ height: "auto", opacity: 1 }}
                                exit={{ height: 0, opacity: 0 }}
                                transition={{ duration: 0.25 }}
                                className="overflow-hidden"
                              >
                                <div className="py-2 pl-3 space-y-1">
                                  {link.submenu.map((sublink) => (
                                    <Link
                                      key={sublink.name}
                                      href={sublink.href}
                                      onClick={handleLinkClick}
                                      className={`flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition group ${
                                        pathname === sublink.href
                                          ? "bg-primary text-white"
                                          : "text-gray-700 hover:bg-gray-100"
                                      }`}
                                    >
                                      <span className="text-xl">
                                        {sublink.icon}
                                      </span>
                                      <span className="flex-1">
                                        {sublink.name}
                                      </span>
                                      <ChevronRight
                                        size={16}
                                        className={`transition ${
                                          pathname === sublink.href
                                            ? "opacity-100"
                                            : "opacity-0 group-hover:opacity-100"
                                        }`}
                                      />
                                    </Link>
                                  ))}
                                </div>
                              </motion.div>
                            )}
                          </AnimatePresence>
                        </div>
                      ) : (
                        <Link
                          key={link.name}
                          href={link.href}
                          onClick={handleLinkClick}
                          className={`flex items-center justify-between px-4 py-3.5 text-base font-semibold rounded-lg transition ${
                            pathname === link.href
                              ? "bg-primary/10 text-primary"
                              : "text-gray-800 hover:bg-gray-100"
                          }`}
                        >
                          <span className="flex items-center gap-3">
                            <span className="text-xl">
                              {link.name === "Blocked Account" && "⛔"}
                              {link.name === "Support" && "🆘"}
                            </span>
                            {link.name}
                          </span>
                          {pathname === link.href && (
                            <motion.div
                              initial={{ scale: 0 }}
                              animate={{ scale: 1 }}
                              className="w-2 h-2 bg-primary rounded-full"
                            />
                          )}
                        </Link>
                      ),
                    )}
                  </div>
                </div>

                {/* Footer */}
                <div className="border-t border-gray-200 p-4 bg-gray-50">
                  <div className="text-center">
                    <p className="text-sm text-gray-600 mb-2">Need help?</p>
                    <Link
                      href="/support"
                      onClick={handleLinkClick}
                      className="inline-block px-6 py-2.5 bg-primary text-white rounded-lg font-semibold hover:bg-primary/90 transition text-sm"
                    >
                      Contact Support
                    </Link>
                  </div>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </header>
  );
};

export default Header;
