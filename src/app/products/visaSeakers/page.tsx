"use client";
import Image from "next/image";

export default function ComingSoon() {
  return (
    <div className="relative min-h-screen flex items-center justify-center bg-white overflow-hidden">
      {/* Background pink gradient blob, always covers right side */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: "radial-gradient(circle at 78% 40%, #f5d9f7 60%, transparent 80%)",
          zIndex: 0,
        }}
      />

      {/* Left-bottom illustration for desktop, above text on mobile */}
      <div className="absolute -left-10 bottom-10 z-10 hidden md:block p-2">
        <Image
          src="/img/visa.png"
          alt="Visa illustration"
          width={210}
          height={260}
          className="opacity-80"
        />
      </div>
      {/* Mobile: illustration above text */}
      <div className="block md:hidden absolute left-1/2 top-12 -translate-x-1/2 z-10">
        <Image
          src="/img/visa.png"
          alt="Visa illustration"
          width={120}
          height={140}
          className="opacity-80"
        />
      </div>

      {/* Center block */}
      <div className="relative z-20 w-full flex flex-col items-center justify-center px-4 py-24">
        <Image
          src="/logo.svg"
          alt="InsurBe Logo"
          width={140}
          height={48}
          className="mb-8 mx-auto"
          priority
        />
        <h1 className="font-bold text-3xl md:text-4xl text-center mb-6">
          Coming Soon
        </h1>
        <p className="text-gray-700 text-center mb-8 max-w-xl mx-auto">
          This section is under development and will be available soon for you to access<br />through insurbe.com
        </p>
        <a
          href="/contact"
          className="px-7 py-2 rounded-md border border-primary text-primary font-medium hover:bg-primary hover:text-white transition"
        >
          Contact Us
        </a>
      </div>
    </div>
  );
}
