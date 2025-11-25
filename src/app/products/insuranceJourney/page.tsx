"use client";
import React, { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { useJourneyStore } from "@/app/stores/journeyStore";
import { usePremiumStore } from "@/app/stores/premiumStore";

export default function InsuranceJourney() {
  const router = useRouter();

  // Get Zustand stores
  const {
    employmentStatus,
    otherEmployment,
    incomeRange,
    email,
    phone,
    selectedCountry,
    dob,
    setEmploymentStatus,
    setOtherEmployment,
    setIncomeRange,
    setEmail,
    setPhone,
    setSelectedCountry,
    setDob,
  } = useJourneyStore();

  const { setPremium, setDocuments } = usePremiumStore();

  // --- Local UI States ---
  const [step, setStep] = useState(1);
  const [countries, setCountries] = useState<Array<{ name: string; flag: string; code: string }>>([]);
  const [popup, setPopup] = useState("");
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Fetch countries API with flags
  interface CountryAPI {
    name: {
      common: string;
    };
    flags: {
      svg: string;
      png: string;
    };
    cca2: string;
  }

  useEffect(() => {
    async function fetchCountries() {
      try {
        const res = await fetch(
          "https://restcountries.com/v3.1/all?fields=name,flags,cca2"
        );
        const data: CountryAPI[] = await res.json();

        const list = data
          .map((c: CountryAPI) => ({
            name: c.name.common,
            flag: c.flags.svg || c.flags.png,
            code: c.cca2,
          }))
          .filter((country) => country.name.trim().length > 0)
          .sort((a, b) => a.name.localeCompare(b.name));

        setCountries(list);
      } catch (e) {
        console.log("Error loading countries", e);
      }
    }

    fetchCountries();
  }, []);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // =============== HANDLERS ====================
  const handleEmploymentSelect = (val: string) => {
    setEmploymentStatus(val);
    if (val === "Others") {
      setStep(99);
    } else {
      setStep(2);
    }
  };

  const handleIncomeSelect = (val: string) => {
    setIncomeRange(val);
    if (val === "<30000" || val === ">73800") {
      setStep(98);
    } else {
      setStep(4); // Go to DOB step
    }
  };

 const handleOtherSubmit = () => {
  // Validate fields
  if (!otherEmployment || !email || !phone) {
    setPopup("Please fill in all fields");
    setTimeout(() => setPopup(""), 2000);
    return;
  }

  // Basic email validation
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    setPopup("Please enter a valid email address");
    setTimeout(() => setPopup(""), 2000);
    return;
  }

  // Basic phone validation (at least 10 digits)
  const phoneRegex = /^\+?[\d\s-]{10,}$/;
  if (!phoneRegex.test(phone)) {
    setPopup("Please enter a valid phone number");
    setTimeout(() => setPopup(""), 2000);
    return;
  }

  setPopup("Thank you! We will connect with you shortly!");
 setTimeout(() => {
    setPopup("");
    router.push("/products/privateProducts");
  }, 2000);
};


  const handleContactSubmit = () => {
    setPopup("We will connect with you shortly!");
    setTimeout(() => setPopup(""), 2000);
  };

  const handleDobSubmit = () => {
    if (!dob) {
      setPopup("Please select your birth year");
      setTimeout(() => setPopup(""), 2000);
      return;
    }
    setStep(5); // Move to country selection
  };

  const handleCountrySelect = (countryName: string) => {
    setSelectedCountry(countryName);
    setIsDropdownOpen(false);
    setSearchTerm("");
  };

  // API Call to get premium
  const handleCountrySubmit = async () => {
    if (!selectedCountry) {
      setPopup("Please select a country");
      setTimeout(() => setPopup(""), 2000);
      return;
    }

    setLoading(true);

    // Convert birth year to full date format (YYYY-01-01)
    const fullDob = `${dob}-01-01`;

    // Get coverage start date (today)
    const coverageStart = new Date().toISOString().split('T')[0];

    const payload = {
      tarifId: "34572",
      vorname: "User", // Default first name (can be collected in another step)
      name: "Customer", // Default last name (can be collected in another step)
      geburtsdatum: fullDob,
      beginn: coverageStart,
    };

    console.log("Journey Data & API Payload:", {
      employmentStatus,
      otherEmployment,
      incomeRange,
      email,
      phone,
      dob,
      selectedCountry,
      payload
    });

    try {
      const res = await fetch("/api/getOfferEinzel", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const txt = await res.text();
        throw new Error(`Server ${res.status}: ${txt}`);
      }

      const json = await res.json();

      // Save to Zustand premium store
      setPremium(json.premium ?? null);
      setDocuments(json.documents ?? []);

      // Navigate to calculator/results page
      router.push("/calculator");
    } catch (e: unknown) {
      if (e instanceof Error) {
        setPopup(`Error: ${e.message}`);
      } else {
        setPopup("Failed to calculate premium. Please try again.");
      }
      setTimeout(() => setPopup(""), 3000);
    } finally {
      setLoading(false);
    }
  };

  const stepImages: Record<number, string> = {
    1: "/gifs_assets/step1.gif",
    99: "/gifs_assets/step2.gif",
    2: "/gifs_assets/step3.svg",
    98: "/gifs_assets/step1.gif",
    4: "/gifs_assets/step2.gif",
    5: "/gifs_assets/step3.svg",
  };

  // Get selected country data
  const selectedCountryData = countries.find((c) => c.name === selectedCountry);

  // Filter countries based on search
  const filteredCountries = countries.filter((c) =>
    c.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Generate birth year options (from 1924 to current year - 18)
  const currentYear = new Date().getFullYear();
  const birthYears = Array.from({ length: 100 }, (_, i) => currentYear - 18 - i);

  // =============== UI ====================
  return (
    <section className="bg-gradient-to-br from-[#f5f0ff] to-white py-16 px-4 md:px-10 min-h-screen">
      <div className="max-w-3xl mx-auto text-center mb-10">
        <h2 className="text-3xl md:text-4xl font-bold text-black mb-3">
          Just 2 minutes to find your best-fit insurance type.
        </h2>
        <p className="text-gray-500 text-base md:text-lg">
          No calls, no commitments — unless you want them.
        </p>
      </div>

      {/* Employment Status Step */}
      {step === 1 && (
        <div className="w-full max-w-6xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
            <div className="flex justify-center items-center">
              <Image
                src={stepImages[1]}
                alt="Employment GIF"
                width={400}
                height={300}
                className="w-full max-w-md"
              />
            </div>

            <div className="space-y-4">
              <h3 className="text-xl font-semibold mb-6 text-gray-700">
                What&apos;s your Employment Status?
              </h3>
              {["Self-employed/Freelancer", "Employed", "Others"].map(
                (item) => (
                  <button
                    key={item}
                    onClick={() => handleEmploymentSelect(item)}
                    className="w-full p-4 cursor-pointer border rounded-lg text-left hover:border-primary transition"
                  >
                    {item}
                  </button>
                )
              )}
            </div>
          </div>
        </div>
      )}

     {/* If "Others" Employment */}
{step === 99 && (
  <div className="w-full max-w-6xl mx-auto">
    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
      <div className="flex justify-center items-center">
        <Image
          src={stepImages[99]}
          alt="Other Employment GIF"
          width={400}
          height={300}
          className="w-full max-w-md"
        />
      </div>

      <div className="space-y-4">
        <h3 className="text-xl font-semibold mb-4 text-gray-700">
          Please provide your details
        </h3>
        
        <input
          className="w-full border p-3 rounded-lg"
          placeholder="Enter employment type"
          value={otherEmployment}
          onChange={(e) => setOtherEmployment(e.target.value)}
        />

        <input
          type="email"
          className="w-full border p-3 rounded-lg"
          placeholder="Email address"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />

        <input
          type="tel"
          className="w-full border p-3 rounded-lg"
          placeholder="Phone number"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
        />

        <button
          onClick={handleOtherSubmit}
          className="px-6 py-3 bg-primary text-white rounded-lg w-full hover:bg-primary/90 transition"
        >
          Submit
        </button>
      </div>
    </div>
  </div>
)}


      {/* Income Range Step */}
      {step === 2 && (
        <div className="w-full max-w-6xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
            <div className="flex justify-center items-center">
              <Image
                src={stepImages[2]}
                alt="Income GIF"
                width={400}
                height={300}
                className="w-full max-w-md"
              />
            </div>

            <div className="space-y-4">
              <h3 className="text-xl font-semibold mb-6 text-gray-700">
                How much is your yearly gross (pretax) income?
              </h3>
              <button
                onClick={() => handleIncomeSelect("<30000")}
                className="w-full p-4 border cursor-pointer rounded-lg text-left hover:border-primary transition"
              >
                &lt; €30,000
              </button>
              <button
                onClick={() => handleIncomeSelect("30001-73800")}
                className="w-full p-4 border cursor-pointer rounded-lg text-left hover:border-primary transition"
              >
                €30,001 – €77,400
              </button>
              <button
                onClick={() => handleIncomeSelect(">73800")}
                className="w-full p-4 border cursor-pointer rounded-lg text-left hover:border-primary transition"
              >
                &gt; €73,800
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Email + Phone Step */}
      {step === 98 && (
        <div className="w-full max-w-6xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
            <div className="flex justify-center items-center">
              <Image
                src={stepImages[98]}
                alt="Contact GIF"
                width={400}
                height={300}
                className="w-full max-w-md"
              />
            </div>

            <div className="space-y-4">
              <h3 className="text-xl font-semibold mb-4 text-gray-700">
                Enter your contact details
              </h3>
              <input
                type="email"
                className="w-full border p-3 rounded-lg"
                placeholder="Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
              <input
                type="tel"
                className="w-full border p-3 rounded-lg"
                placeholder="Phone Number"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
              />
              <button
                onClick={handleContactSubmit}
                className="px-6 py-3 bg-primary cursor-pointer text-white rounded-lg w-full"
              >
                Submit
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Birth Year Step */}
      {step === 4 && (
        <div className="w-full max-w-6xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
            <div className="flex justify-center items-center">
              <Image
                src={stepImages[4]}
                alt="DOB GIF"
                width={400}
                height={300}
                className="w-full max-w-md"
              />
            </div>

            <div className="space-y-4">
              <h3 className="text-xl font-semibold mb-4 text-gray-700">
                What&apos;s your Birth Year?
              </h3>
              <select
                className="w-full cursor-pointer border p-3 rounded-lg"
                value={dob}
                onChange={(e) => setDob(e.target.value)}
              >
                <option value="">Select Birth Year</option>
                {birthYears.map((year) => (
                  <option key={year} value={year}>
                    {year}
                  </option>
                ))}
              </select>

              {dob && (
                <div className="text-sm text-gray-600">
                  Age: <span className="font-semibold">{currentYear - parseInt(dob)} years</span>
                </div>
              )}

              <button
                onClick={handleDobSubmit}
                className="px-6 py-3 bg-primary cursor-pointer text-white rounded-lg w-full"
              >
                Continue
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Country Select Step with API Call */}
      {step === 5 && (
        <div className="w-full max-w-6xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
            <div className="flex justify-center items-center">
              <Image
                src={stepImages[5]}
                alt="Country GIF"
                width={400}
                height={300}
                className="w-full max-w-md"
              />
            </div>

            <div className="space-y-4">
              <h3 className="text-xl font-semibold mb-4 text-gray-700">
                Where are you moving from?
              </h3>

              {/* Custom Country Dropdown */}
              <div className="relative" ref={dropdownRef}>
                <button
                  onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                  className="w-full cursor-pointer border p-3 rounded-lg text-left flex items-center justify-between hover:border-primary transition"
                  disabled={loading}
                >
                  <div className="flex items-center gap-3">
                    {selectedCountryData ? (
                      <>
                        <Image
                          src={selectedCountryData.flag}
                          alt={selectedCountryData.name}
                          width={24}
                          height={16}
                          className="rounded"
                        />
                        <span>{selectedCountryData.name}</span>
                      </>
                    ) : (
                      <span className="text-gray-500">Select Country</span>
                    )}
                  </div>
                  <svg
                    className={`w-5 h-5 text-gray-400 transition-transform ${
                      isDropdownOpen ? "rotate-180" : ""
                    }`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M19 9l-7 7-7-7"
                    />
                  </svg>
                </button>

                {isDropdownOpen && (
                  <div className="absolute z-10 w-full mt-2 bg-white border rounded-lg shadow-lg max-h-60 overflow-hidden">
                    <div className="p-2 border-b sticky top-0 bg-white">
                      <input
                        type="text"
                        placeholder="Search country..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full p-2 border rounded cursor-pointer"
                      />
                    </div>

                    <div className="overflow-y-auto max-h-48">
                      {filteredCountries.map((country) => (
                        <button
                          key={country.code}
                          onClick={() => handleCountrySelect(country.name)}
                          className="w-full p-3 flex items-center cursor-pointer gap-3 hover:bg-gray-100 transition text-left"
                        >
                          <Image
                            src={country.flag}
                            alt={country.name}
                            width={24}
                            height={16}
                            className="rounded"
                          />
                          <span>{country.name}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              <button
                onClick={handleCountrySubmit}
                disabled={loading}
                className={`px-6 py-3 rounded-lg w-full font-semibold transition-all ${
                  loading
                    ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                    : "bg-primary text-white cursor-pointer hover:bg-primary/90"
                }`}
              >
                {loading ? (
                  <span className="flex items-center justify-center gap-2">
                    <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                        fill="none"
                      />
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      />
                    </svg>
                    Calculating Premium...
                  </span>
                ) : (
                  "Calculate My Premium"
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* POPUP */}
      {popup && (
        <div className="fixed bottom-10 left-1/2 -translate-x-1/2 bg-primary text-white px-6 py-3 rounded-lg shadow-lg z-50">
          {popup}
        </div>
      )}
    </section>
  );
}
