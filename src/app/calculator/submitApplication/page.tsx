"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { usePremiumStore } from "@/app/stores/premiumStore";
import { useJourneyStore } from "@/app/stores/journeyStore";
import { Shield, Star } from "lucide-react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { useApplicationStore } from "@/app/stores/applicationStore";
/* ---------------- Helpers ---------------- */

type Plan = {
  title: string;
  price: string;
  category: string;
  tariffIds: string[];
};

function getTwoDaysFromNow() {
  const date = new Date();
  date.setDate(date.getDate() + 2);
  return date.toISOString().split("T")[0];
}

function normalizePhone(phone: string) {
  return phone.startsWith("+49") ? phone : "+49" + phone.replace(/\D/g, "");
}

/* ---------------- Component ---------------- */

export default function SubmitApplication() {
  const router = useRouter();
  const { form: premiumForm } = usePremiumStore();
  const journeyStore = useJourneyStore();

  const [plan, setPlan] = useState<Plan | null>(null);

  /* ---------- Form state ---------- */
  const { application, updateStep } = useApplicationStore();

  const [firstName, setFirstName] = useState(
    application?.personal?.firstName || premiumForm.firstName || "",
  );
  const [lastName, setLastName] = useState(
    application?.personal?.lastName || premiumForm.lastName || "",
  );
  const [dob, setDob] = useState(
    application?.personal?.dob || premiumForm.dob || "",
  );
  const [salutation, setSalutation] = useState(
    application?.personal?.salutation || "Mr",
  );

  const [gender, setGender] = useState(
    application?.personal?.gender || premiumForm.gender || "Male",
  );
  const [coverageStart] = useState(calculateCoverageStartDate());
  const [email, setEmail] = useState(
    application?.contact?.email || journeyStore.email || "",
  );
  const [phone, setPhone] = useState(
    application?.contact?.phone || journeyStore.phone || "",
  );
  const [address, setAddress] = useState(application?.contact?.address || "");
  const [agreeTerms, setAgreeTerms] = useState(false);
  const [seriousIllness, setSeriousIllness] = useState(
    application?.health?.seriousIllness || "",
  );
  const selectedPlan = useJourneyStore((s) => s.selectedPlan);
  const hasHydrated = useJourneyStore.persist.hasHydrated();
  const { data: session } = useSession();
  /* ---------- UI state ---------- */

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const birthYear = journeyStore.dob ? journeyStore.dob.split("-")[0] : "";
  /* ---------- Guard ---------- */

  useEffect(() => {
    updateStep("personalDetails", {
      firstName,
      lastName,

      day: dob?.split("-")[2],
      month: dob?.split("-")[1],
      year: dob?.split("-")[0],

      gender,
      salutation,

      email,
      phone,
      street: address,

      seriousIllness,
    });
  }, [
    firstName,
    lastName,
    dob,
    gender,
    salutation,
    email,
    phone,
    address,
    seriousIllness,
    updateStep,
  ]);

  useEffect(() => {
    const storedPlan = sessionStorage.getItem("selectedPlan");

    if (storedPlan) {
      try {
        const parsedPlan = JSON.parse(storedPlan);
        setPlan(parsedPlan);
      } catch (err) {
        console.error("Invalid stored plan", err);
      }
    }
  }, []);

  useEffect(() => {
    if (!hasHydrated) return;

    if (!selectedPlan) {
      router.push("/calculator");
    }
  }, [hasHydrated, selectedPlan, router]);

  /* ---------- Submit ---------- */

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: { duration: 0.4 },
    },
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    console.log("🟡 Submit clicked");

    if (!firstName || !lastName || !dob || !email || !phone) {
      setError("Please fill all required fields");
      return;
    }

    if (!agreeTerms) {
      setError("Please agree to the Terms and Conditions");
      return;
    }

    if (!seriousIllness) {
      setError("Please answer the health question");
      return;
    }
    //  LOGIC: If serious illness → stop flow
    if (seriousIllness === "yes") {
      console.log("⚠️ High-risk user → redirecting to appointment");

      router.push("/book-appointment");
      return;
    }

    if (!plan?.tariffIds) {
      setError("Tariff ID missing. Please select a plan again.");
      return;
    }

    setLoading(true);
    setError(null);

    const genderMap: Record<string, string> = {
      Male: "Item1",
      Female: "Item2",
      Other: "Item1",
    };

    const salutationMap: Record<string, string> = {
      Mr: "Item1",
      Mrs: "Item2",
      Ms: "Item2",
      Dr: "Item1",
    };

    const payload = {
      tariffIds: plan?.tariffIds || ["35653", "24449", "24332", "1803"],
      vorname: firstName,
      name: lastName,
      geburtsdatum: dob,
      anrede: salutationMap[salutation],
      geschlecht: genderMap[gender],
      beginn: coverageStart,
      email,
      telefon: normalizePhone(phone),
      strasse: address,
      hausnummer: "1",
      plz: "10115",
      ort: "Berlin",
      land: "DE",
      seriousIllness,
      bank: {
        iban: "DE44500105175407324931",
        bic: "INGDDEFFXXX",
        kontoinhaber: `${firstName} ${lastName}`,
      },
    };

    console.log("📦 SUBMIT APPLICATION PAYLOAD");
    console.log(payload);

    try {
      const res = await fetch("/api/getorder", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const responseText = await res.text();

      console.log("⬅️ RESPONSE STATUS:", res);
      // console.log("📄 RAW SOAP RESPONSE:", responseText || "(empty)");

      /* ✅ CHECK SOAP FAULT */
      if (responseText.includes("Fault")) {
        // console.error("SOAP Fault detected:", responseText);
        setError("Insurance provider rejected the request. Please try again.");
        return;
      }

      if (!res.ok) {
        setError("Application submission failed");
        return;
      }

      /* ✅ PARSE SOAP RESPONSE */
      const parser = new DOMParser();
      const xmlDoc = parser.parseFromString(responseText, "application/xml");

      // Log all fields so we can see what the server returns
      const allElements = xmlDoc.querySelectorAll("*");
      allElements.forEach((el) => {
        if (el.textContent?.trim() && el.children.length === 0) {
          console.log(
            `🔍 ${el.tagName}:`,
            el.textContent.trim().substring(0, 100),
          );
        }
      });

      // Extract PDF
      const valueField = xmlDoc.querySelector("valueField");
      const dateinameField = xmlDoc.querySelector("dateinameField");
      const pdfBase64 = valueField?.textContent || null;
      const pdfName = dateinameField?.textContent || "application.pdf";

      // console.log("📄 PDF found:", !!pdfBase64);
      // console.log("📄 PDF name:", pdfName);

      // Extract real order ID from SOAP response
      const realOrderId =
        xmlDoc.querySelector("antragsnummerField")?.textContent ||
        xmlDoc.querySelector("vorgangsnummerVUField")?.textContent ||
        xmlDoc.querySelector("vorgangsnummerVMField")?.textContent ||
        xmlDoc.querySelector("vertragsnummerField")?.textContent ||
        null;

      console.log("🆔 Real Order ID from SOAP:", realOrderId);

      const finalOrderId = realOrderId || `INS-${Date.now()}`;

      let applicationId = null;

      if (pdfBase64) {
        try {
          const saveRes = await fetch("/api/application/save", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              orderId: finalOrderId,
              pdfBase64,
            }),
          });

          const saveData = await saveRes.json();

          applicationId = saveData.applicationId;

          console.log("✅ Application saved:", applicationId);

          // store only ID (not full PDF)
          sessionStorage.setItem("applicationId", applicationId);
        } catch (err) {
          console.error("❌ Failed to save application:", err);
        }
      }

      /* ✅ SAVE TO SESSION STORAGE — only once, correctly */
      sessionStorage.setItem("applicationOrderId", finalOrderId);

      // if (pdfBase64) {
      //   sessionStorage.setItem("applicationPdfBase64", pdfBase64);
      //   sessionStorage.setItem("applicationPdfFilename", pdfName);
      // }

      sessionStorage.setItem(
        "applicationDetails",
        JSON.stringify({
          name: `${salutation} ${firstName} ${lastName}`,
          email,
          phone,
          dob,
          coverageStart,
          tariffId: plan?.tariffIds,
        }),
      );

      // 🔥 Attach immediately if user already logged in
      if (session && applicationId) {
        try {
          console.log("🔗 Attaching immediately (user already logged in)");

          await fetch("/api/application/assign", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ applicationId }),
          });

          console.log("✅ Application linked instantly");

          sessionStorage.removeItem("applicationId");
        } catch (err) {
          console.error("❌ Failed to link application:", err);
        }
      }
      console.log("Selected plan:", plan);

      // ✅ SAVE USER DATA TO APPLICATION DB (CRITICAL)
      try {
        await fetch(`/api/application/${applicationId}`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            personalDetails: {
              firstName,
              lastName,
              email,
              phone,
              gender,
              salutation,

              // ✅ DOB split (important for your other page)
              day: dob?.split("-")[2],
              month: dob?.split("-")[1],
              year: dob?.split("-")[0],

              street: address,
              seriousIllness,
            },
          }),
        });

        console.log("✅ Personal details saved to DB");
      } catch (err) {
        console.error("❌ Failed to save personal details", err);
      }

      // router.push("/calculator/submitApplication/success");.
      if (session) {
        router.push("/dashboard");
      } else {
        router.push("/login");
      }
    } catch (err) {
      console.error("❌ Submit error:", err);
      setError("Failed to submit application");
    } finally {
      setLoading(false);
    }
  };

  const calculateAge = (date: string) => {
    if (!date) return "";
    const today = new Date();
    const birthDate = new Date(date);

    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();

    if (
      monthDiff < 0 ||
      (monthDiff === 0 && today.getDate() < birthDate.getDate())
    ) {
      age--;
    }

    return age;
  };

  function calculateCoverageStartDate() {
    const today = new Date();
    const month = today.getMonth(); // 0 = Jan, 11 = Dec
    const year = today.getFullYear();

    // December → 01.04 next year
    if (month === 11) {
      return `01.04.${year + 1}`;
    }

    // January → 01.05 same year
    if (month === 0) {
      return `01.05.${year}`;
    }

    // ✅ Fallback → 2 days after today
    const fallbackDate = new Date();
    fallbackDate.setDate(fallbackDate.getDate() + 2);

    return fallbackDate.toISOString().split("T")[0];
  }

  // let formattedCategory = "Private Health";

  const formattedCategory = plan?.category
    ? plan.category.split(" ").length > 1
      ? `${plan.category.split(" ")[1]} - ${plan.category.split(" ")[0]}`
      : plan.category
    : "Private Health";

  // if (plan?.category) {
  //   const parts = plan.category.split(" ");
  //   formattedCategory =
  //     parts.length > 1 ? `${parts[1]} - ${parts[0]}` : plan.category;
  // }

  /* ---------- UI ---------- */

  return (
    <div className="min-h-screen pb-12">
      {/* ========== HEADER - Like the image ========== */}
      <div className="w-full bg-gradient-to-br from-gray-50 to-purple-50/20 py-16 px-4">
        <div className="max-w-4xl mx-auto text-center">
          {/* Badge */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="inline-flex items-center gap-2 px-5 py-2 rounded-full bg-purple-100 border border-purple-200 mb-6"
          >
            <Shield className="w-5 h-5 text-purple-600" />
            <span className="text-purple-700 font-bold text-sm tracking-wide ">
              InsurBe
            </span>
          </motion.div>

          {/* Main Heading */}
          <motion.h1
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="text-3xl md:text-5xl md:px-12 font-extrabold bg-gradient-to-r from-primary to-purple-800 bg-clip-text text-transparent leading-snug"
          >
            <span className="text-gray-700">
              <span className="text-gray-700">{formattedCategory}</span>
            </span>{" "}
            Health insurance application{" "}
          </motion.h1>

          {/* Subheading */}
          {/* <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.7, delay: 0.2 }}
            className="text-md md:text-lg text-gray-600 max-w-2xl mx-auto"
          >
            You can only apply for this insurance, if you provide an address in Germany.
          </motion.p> */}
        </div>
      </div>

      {/* FORM */}
      <motion.div className="max-w-4xl mx-auto bg-white/80 backdrop-blur-sm rounded-2xl shadow-2xl p-8 border border-white/40">
        <motion.form
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          onSubmit={handleSubmit}
          className="space-y-8"
        >
          <motion.div
            initial={{ y: 50, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="space-y-8"
          >
            {/* ========== SECTION 1: PERSONAL DETAILS - Orange to Pink ========== */}
            <div className="space-y-6">
              <div className="bg-gradient-to-r from-orange-400 to-pink-600 rounded-xl p-5 shadow-lg border-2 border-orange-200">
                <h2 className="text-2xl font-bold text-white">
                  Personal Details
                </h2>
              </div>

              {/* Salutation */}
              <motion.div variants={itemVariants} className="space-y-3">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Salutation *
                </label>
                <motion.select
                  whileFocus={{ scale: 1.01 }}
                  value={salutation}
                  onChange={(e) => setSalutation(e.target.value)}
                  className="w-full border-2 border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all"
                  required
                >
                  <option value="Mr">Mr</option>
                  <option value="Mrs">Mrs</option>
                  <option value="Ms">Ms</option>
                  <option value="Dr">Dr</option>
                </motion.select>
              </motion.div>

              {/* Name Fields */}
              <motion.div
                variants={itemVariants}
                className="grid grid-cols-1 md:grid-cols-2 gap-4"
              >
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    First Name *
                  </label>
                  <motion.input
                    whileFocus={{ scale: 1.01 }}
                    type="text"
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    className="w-full border-2 border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all"
                    placeholder="Max"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Last Name *
                  </label>
                  <motion.input
                    whileFocus={{ scale: 1.01 }}
                    type="text"
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    className="w-full border-2 border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all"
                    placeholder="Mustermann"
                    required
                  />
                </div>
              </motion.div>

              {/* DOB, Gender & Coverage Start */}
              <motion.div
                variants={itemVariants}
                className="grid grid-cols-1 md:grid-cols-2 gap-4"
              >
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Date of Birth *
                  </label>
                  <motion.input
                    whileFocus={{ scale: 1.01 }}
                    type="date"
                    value={dob}
                    onChange={(e) => setDob(e.target.value)}
                    max={new Date().toISOString().split("T")[0]}
                    className="w-full border-2 border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all"
                    required
                  />
                  <AnimatePresence>
                    {dob && (
                      <motion.p
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        className="text-xs text-gray-500 mt-1"
                      >
                        Age: {calculateAge(dob)} years
                      </motion.p>
                    )}
                  </AnimatePresence>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Gender *
                  </label>
                  <motion.select
                    whileFocus={{ scale: 1.01 }}
                    value={gender}
                    onChange={(e) => setGender(e.target.value)}
                    className="w-full border-2 border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all"
                    required
                  >
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Other">Other</option>
                  </motion.select>
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Coverage Start Date
                  </label>
                  <motion.input
                    type="text"
                    value={coverageStart}
                    readOnly
                    className="w-full border-2 border-gray-300 rounded-lg px-4 py-3 bg-gray-100 cursor-not-allowed"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Based on your cancellation month or default 2-day rule.
                  </p>
                </div>
              </motion.div>
            </div>

            {/* ========== SECTION 2: Contact Information & Address - Blue to Indigo ========== */}
            <div className="space-y-4">
              <div className="bg-gradient-to-r from-primary via-indigo-600 to-purple-700 rounded-xl p-4 shadow-lg">
                <h2 className="text-xl font-bold text-white">
                  Contact Information & Address
                </h2>
              </div>

              <motion.div variants={itemVariants} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Email Address *
                  </label>
                  <motion.input
                    whileFocus={{ scale: 1.01 }}
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full border-2 border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                    placeholder="max.mustermann@example.com"
                    required
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    We'll send your policy documents to this email
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Mobile Number *
                  </label>
                  <motion.input
                    whileFocus={{ scale: 1.01 }}
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full border-2 border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                    placeholder="+49 123 456 7890"
                    required
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    For important updates about your policy
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Address (Optional)
                  </label>
                  <motion.textarea
                    whileFocus={{ scale: 1.01 }}
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    rows={3}
                    className="w-full border-2 border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                    placeholder="Enter your full address"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    This helps us process your application faster
                  </p>
                </div>
              </motion.div>
            </div>

            {/* ========== SECTION 3: Selected Plan Details - Purple to Indigo ========== */}
            {plan && (
              <div className="space-y-4">
                <div className="bg-gradient-to-r from-primary via-indigo-600 to-purple-700 rounded-xl p-4 shadow-lg">
                  <h2 className="text-xl font-bold text-white">
                    Selected Plan Details
                  </h2>
                </div>

                <motion.div
                  variants={itemVariants}
                  className="space-y-6 bg-white rounded-xl p-6 border-2 border-gray-200 shadow-sm"
                >
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-end">
                    <div>
                      <p className="text-[12px] font-medium text-gray-500 uppercase tracking-wide mb-1">
                        Plan Category & Name
                      </p>
                      <p className="text-xl font-bold text-gray-900">
                        {plan.category} {plan.title}
                      </p>
                    </div>

                    <div className="text-right">
                      <p className="text-[12px] font-medium text-gray-500 uppercase tracking-wide mb-2">
                        Monthly Premium
                      </p>
                      <p className="text-xl font-extrabold bg-gradient-to-r from-primary to-purple-600 bg-clip-text text-transparent">
                        {plan.price}
                      </p>
                    </div>
                  </div>

                  <div className="pt-4 border-t-2 border-gray-100">
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => router.back()}
                      className="w-full py-3 px-6 rounded-lg font-medium text-sm  text-primary bg-gradient-to-r from-primary/10 to-purple-100 border-2 border-primary/20 hover:border-primary hover:bg-primary/20 transition-all"
                    >
                      ← Change Plan
                    </motion.button>
                  </div>
                </motion.div>
              </div>
            )}

            {/* ========== SECTION 4: Health Information - Green to Cyan ========== */}
            <div className="space-y-4">
              <div className="bg-gradient-to-r from-green-500 via-teal-500 to-cyan-600 rounded-xl p-4 shadow-lg">
                <h2 className="text-xl font-bold text-white">
                  Health Information
                </h2>
              </div>

              <motion.div variants={itemVariants} className="space-y-3">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Have you had a serious illness in the last 5 years? *
                </label>
                <p className="text-xs text-gray-600 mb-4">
                  This includes, among other things, cancer, severe addictions,
                  cardiovascular diseases, or serious illnesses affecting
                  organs, other parts of the body, or the psyche.
                </p>

                <div className="space-y-3">
                  <motion.label
                    whileHover={{ scale: 1.02 }}
                    className={`flex items-center p-4 border-2 rounded-lg cursor-pointer transition-all ${
                      seriousIllness === "yes"
                        ? "border-red-500 bg-red-50"
                        : "border-gray-300 bg-white hover:border-red-300"
                    }`}
                  >
                    <input
                      type="radio"
                      name="seriousIllness"
                      value="yes"
                      checked={seriousIllness === "yes"}
                      onChange={(e) => setSeriousIllness(e.target.value)}
                      className="h-5 w-5 text-red-600 focus:ring-red-500"
                      required
                    />
                    <span className="ml-3 text-sm font-medium text-gray-900">
                      Yes
                    </span>
                  </motion.label>

                  <motion.label
                    whileHover={{ scale: 1.02 }}
                    className={`flex items-center p-4 border-2 rounded-lg cursor-pointer transition-all ${
                      seriousIllness === "no"
                        ? "border-green-500 bg-green-50"
                        : "border-gray-300 bg-white hover:border-green-300"
                    }`}
                  >
                    <input
                      type="radio"
                      name="seriousIllness"
                      value="no"
                      checked={seriousIllness === "no"}
                      onChange={(e) => setSeriousIllness(e.target.value)}
                      className="h-5 w-5 text-green-600 focus:ring-green-500"
                      required
                    />
                    <span className="ml-3 text-sm font-medium text-gray-900">
                      No
                    </span>
                  </motion.label>
                </div>
              </motion.div>
            </div>

            {/* ========== SECTION 5: Important Notice & Agreement - Pink to Amber ========== */}
            <div className="space-y-4">
              <div className="bg-gradient-to-r from-pink-500 via-rose-500 to-amber-500 rounded-xl p-4 shadow-lg">
                <h2 className="text-xl font-bold text-white">
                  Important Notice & Agreement
                </h2>
              </div>

              {/* Important Info Box */}
              <motion.div
                variants={itemVariants}
                whileHover={{ scale: 1.01 }}
                className="bg-gradient-to-br from-pink-50 to-rose-50 border-2 border-pink-200 rounded-xl p-6 shadow-sm"
              >
                <h3 className="font-semibold text-gray-900 mb-3">
                  Important Information
                </h3>
                <ul className="space-y-2 text-sm text-gray-700">
                  {[
                    "Your application will be processed within 24-48 hours",
                    "You'll receive a confirmation email with your policy number",
                    "Coverage begins on your selected start date",
                    "You can cancel within 14 days for a full refund",
                  ].map((item, index) => (
                    <motion.li
                      key={index}
                      initial={{ x: -20, opacity: 0 }}
                      animate={{ x: 0, opacity: 1 }}
                      transition={{ delay: 0.8 + index * 0.1 }}
                      className="flex items-start"
                    >
                      <span className="mr-2 text-pink-600 font-bold">•</span>
                      <span>{item}</span>
                    </motion.li>
                  ))}
                </ul>

                <div className="mt-4 pt-4 border-t border-pink-300">
                  <p className="text-sm text-gray-600 italic">
                    <strong>Note:</strong> Some documents may not be
                    automatically generated because multiple tariff IDs are
                    being processed. Our team is working on this, and we'll
                    share any missing documents with you as soon as they're
                    available.
                  </p>
                </div>
              </motion.div>

              {/* Terms Checkbox */}
              <motion.div
                variants={itemVariants}
                className="flex items-start bg-amber-50 border-2 border-amber-200 rounded-xl p-4"
              >
                <input
                  type="checkbox"
                  id="terms"
                  checked={agreeTerms}
                  onChange={(e) => setAgreeTerms(e.target.checked)}
                  className="mt-1 h-5 w-5 text-amber-600 focus:ring-amber-500 border-gray-300 rounded"
                  required
                />
                <label htmlFor="terms" className="ml-3 text-sm text-gray-700">
                  I agree to the{" "}
                  <a
                    href="/termscondition"
                    className="text-amber-600 font-semibold hover:underline"
                  >
                    Terms and Conditions
                  </a>{" "}
                  and{" "}
                  <a
                    href="/privacypolicy"
                    className="text-amber-600 font-semibold hover:underline"
                  >
                    Privacy Policy
                  </a>
                </label>
              </motion.div>
            </div>

            {/* Error Display */}
            <AnimatePresence>
              {error && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="bg-red-50 border-2 border-red-300 text-red-700 px-4 py-3 rounded-lg font-medium"
                >
                  ⚠️ {error}
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>

          {/* Submit Button */}
          <motion.button
            type="submit"
            disabled={loading}
            whileHover={!loading ? { scale: 1.02, y: -2 } : {}}
            whileTap={!loading ? { scale: 0.98 } : {}}
            className={`w-full py-4 rounded-xl font-bold text-lg text-white transition-all shadow-xl ${
              loading
                ? "bg-gray-400 cursor-not-allowed"
                : "bg-gradient-to-r from-purple-600 via-pink-600 to-red-600 hover:from-purple-700 hover:via-pink-700 hover:to-red-700 shadow-purple-500/50"
            }`}
          >
            {loading ? "Submitting..." : "Submit Application "}
          </motion.button>
        </motion.form>
      </motion.div>
    </div>
  );
}
