"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { usePremiumStore } from "@/app/stores/premiumStore";
import { useJourneyStore } from "@/app/stores/journeyStore";
import { Shield, Star, Mail, CheckCircle2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { useApplicationStore } from "@/app/stores/applicationStore";
import Link from "next/link";

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
  const [coverageStart, setCoverageStart] = useState(
    application?.coverageStart || calculateCoverageStartDate(),
  );
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
  const [loadingStep, setLoadingStep] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [showNewUserModal, setShowNewUserModal] = useState(false);
  const [newUserEmail, setNewUserEmail] = useState("");

  const birthYear = journeyStore.dob ? journeyStore.dob.split("-")[0] : "";
  /* ---------- Guard ---------- */

  function formatToInputDate(dateStr: string) {
    if (!dateStr) return "";

    // already yyyy-mm-dd
    if (dateStr.includes("-")) return dateStr;

    // convert dd.mm.yyyy → yyyy-mm-dd
    const [day, month, year] = dateStr.split(".");
    return `${year}-${month}-${day}`;
  }

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

  const sectionHeaderClass =
    "bg-linear-to-r from-violet-600 via-indigo-600 to-blue-600 rounded-xl p-4 shadow-md";
  const inputClass =
    "w-full border border-violet-200 rounded-lg px-4 py-3 focus:ring-2 focus:ring-violet-400 focus:border-violet-500 transition-all bg-white";
  const panelClass =
    "bg-white rounded-xl p-6 border border-violet-200 shadow-sm";
  const mutedButtonClass =
    "w-full py-3 px-6 rounded-lg font-medium text-sm text-violet-700 bg-violet-50 border border-violet-200 hover:border-violet-300 hover:bg-violet-100 transition-all";

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
    setLoadingStep(1);

    setTimeout(() => setLoadingStep(2), 1500);
    setTimeout(() => setLoadingStep(3), 3500);
    setTimeout(() => setLoadingStep(4), 6000);
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
      tariffIds: plan?.tariffIds || ["35659", "24449", "24332", "1803"],
      ktgValue: "150",
      vorname: firstName,
      name: lastName,
      geburtsdatum: dob,
      anrede: salutationMap[salutation],
      geschlecht: genderMap[gender],
      beginn: formatToGermanDate(coverageStart),
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

      /* ✅ CHECK SOAP FAULT */
      if (responseText.includes("Fault")) {
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

          sessionStorage.setItem("applicationId", applicationId);
        } catch (err) {
          console.error("❌ Failed to save application:", err);
        }
      }

      /* ✅ SAVE TO SESSION STORAGE */
      sessionStorage.setItem("applicationOrderId", finalOrderId);

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

      // ✅ SAVE USER DATA TO APPLICATION DB
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

      if (session) {
        router.push("/dashboard");
        return;
      }

      // 🔍 check if user exists
      const checkRes = await fetch("/api/user/check", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      const { exists } = await checkRes.json();

      if (exists) {
        // existing user
        router.push("/login");
      } else {
        // 🚀 NEW USER FLOW - Show modal instead of redirecting immediately

        const createRes = await fetch("/api/user/create", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            email,
          }),
        });

        const createData = await createRes.json();

        console.log("CREATE USER RESPONSE:", createData);

        if (!createData.success) {
          console.error("❌ User creation failed");
          return;
        }

        const password = createData.password;

        console.log("PASSWORD BEFORE EMAIL:", password);

        if (!password) {
          console.error("❌ Password missing before email call");
          return;
        }

        // ✅ send email
        await fetch("/api/send-credentials", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            email,
            name: `${firstName} ${lastName}`,
            password: password,
          }),
        });

        console.log("✅ SENT PASSWORD:", password);

        // ✅ Show success modal for new user
        setNewUserEmail(email);
        setLoading(false);
        setShowNewUserModal(true);
      }
    } catch (err) {
      console.error("❌ Submit error:", err);
      setError("Failed to submit application");
    } finally {
      setLoading(false);
      setLoadingStep(0);
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
    const month = today.getMonth();
    const year = today.getFullYear();

    if (month === 11) {
      return `01.04.${year + 1}`;
    }

    if (month === 0) {
      return `01.05.${year}`;
    }

    const fallbackDate = new Date();
    fallbackDate.setDate(fallbackDate.getDate() + 2);

    return fallbackDate.toISOString().split("T")[0];
  }

  const formattedCategory = plan?.category
    ? plan.category.split(" ").length > 1
      ? `${plan.category.split(" ")[1]} - ${plan.category.split(" ")[0]}`
      : plan.category
    : "Private Health";

  function formatToGermanDate(dateStr: string) {
    if (!dateStr) return "";
    const [year, month, day] = dateStr.split("-");
    return `${day}.${month}.${year}`;
  }

  /* ---------- UI ---------- */

  return (
    <div className="min-h-screen pb-12 bg-slate-50">
      {/* Header */}
      <div className="w-full bg-linear-to-br from-violet-50 via-indigo-50 to-blue-50 py-16 px-4 border-b border-violet-100">
        <div className="max-w-4xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="inline-flex items-center gap-2 px-5 py-2 rounded-full bg-violet-100 border border-violet-200 mb-6"
          >
            <Shield className="w-5 h-5 text-violet-600" />
            <span className="text-violet-700 font-bold text-sm tracking-wide">
              InsurBe
            </span>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="text-3xl md:text-5xl md:px-12 font-extrabold bg-linear-to-r from-violet-700 to-blue-700 bg-clip-text text-transparent leading-snug"
          >
            <span className="text-gray-700">
              <span className="text-gray-700">{formattedCategory}</span>
            </span>{" "}
            insurance application
          </motion.h1>
        </div>
      </div>

      {/* FORM */}
      <motion.div className="max-w-4xl mx-auto mt-6 bg-white rounded-2xl shadow-lg p-8 border border-violet-100">
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
            {/* SECTION 1 */}
            <div className="space-y-6">
              <div className={sectionHeaderClass}>
                <h2 className="text-xl font-bold text-white">
                  Personal Details
                </h2>
              </div>

              <motion.div variants={itemVariants} className="space-y-3">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Salutation *
                </label>
                <motion.select
                  whileFocus={{ scale: 1.01 }}
                  value={salutation}
                  onChange={(e) => setSalutation(e.target.value)}
                  className={inputClass}
                  required
                >
                  <option value="Mr">Mr</option>
                  <option value="Mrs">Mrs</option>
                  <option value="Ms">Ms</option>
                  <option value="Dr">Dr</option>
                </motion.select>
              </motion.div>

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
                    className={inputClass}
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
                    className={inputClass}
                    placeholder="Mustermann"
                    required
                  />
                </div>
              </motion.div>

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
                    className={inputClass}
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
                    className={inputClass}
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
                    type="date"
                    value={formatToInputDate(coverageStart)}
                    onChange={(e) => setCoverageStart(e.target.value)}
                    min={new Date().toISOString().split("T")[0]}
                    className={inputClass}
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Default is auto-calculated. You can change it if needed.
                  </p>
                </div>
              </motion.div>
            </div>

            {/* SECTION 2 */}
            <div className="space-y-4">
              <div className={sectionHeaderClass}>
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
                    className={inputClass}
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
                    className={inputClass}
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
                    className={inputClass}
                    placeholder="Enter your full address"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    This helps us process your application faster
                  </p>
                </div>
              </motion.div>
            </div>

            {/* SECTION 3 */}
            {plan && (
              <div className="space-y-4">
                <div className={sectionHeaderClass}>
                  <h2 className="text-xl font-bold text-white">
                    Selected Plan Details
                  </h2>
                </div>

                <motion.div variants={itemVariants} className={panelClass}>
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
                      <p className="text-xl font-extrabold bg-linear-to-r from-violet-700 to-blue-700 bg-clip-text text-transparent">
                        {plan.price}
                      </p>
                    </div>
                  </div>

                  <div className="pt-4 border-t border-violet-100">
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => router.back()}
                      className={mutedButtonClass}
                    >
                      ← Change Plan
                    </motion.button>
                  </div>
                </motion.div>
              </div>
            )}

            {/* SECTION 4 */}
            <div className="space-y-4">
              <div className={sectionHeaderClass}>
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
                    className={`flex items-center p-4 border rounded-lg cursor-pointer transition-all ${
                      seriousIllness === "yes"
                        ? "border-violet-500 bg-violet-50"
                        : "border-violet-200 bg-white hover:border-violet-300"
                    }`}
                  >
                    <input
                      type="radio"
                      name="seriousIllness"
                      value="yes"
                      checked={seriousIllness === "yes"}
                      onChange={(e) => setSeriousIllness(e.target.value)}
                      className="h-5 w-5 text-violet-600 focus:ring-violet-500"
                      required
                    />
                    <span className="ml-3 text-sm font-medium text-gray-900">
                      Yes
                    </span>
                  </motion.label>

                  <motion.label
                    whileHover={{ scale: 1.02 }}
                    className={`flex items-center p-4 border rounded-lg cursor-pointer transition-all ${
                      seriousIllness === "no"
                        ? "border-violet-500 bg-violet-50"
                        : "border-violet-200 bg-white hover:border-violet-300"
                    }`}
                  >
                    <input
                      type="radio"
                      name="seriousIllness"
                      value="no"
                      checked={seriousIllness === "no"}
                      onChange={(e) => setSeriousIllness(e.target.value)}
                      className="h-5 w-5 text-violet-600 focus:ring-violet-500"
                      required
                    />
                    <span className="ml-3 text-sm font-medium text-gray-900">
                      No
                    </span>
                  </motion.label>
                </div>
              </motion.div>
            </div>

            {/* SECTION 5 */}
            <div className="space-y-4">
              <div className={sectionHeaderClass}>
                <h2 className="text-xl font-bold text-white">
                  Important Notice & Agreement
                </h2>
              </div>

              <motion.div
                variants={itemVariants}
                whileHover={{ scale: 1.01 }}
                className="bg-violet-50 border border-violet-200 rounded-xl p-6 shadow-sm"
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
                      <span className="mr-2 text-violet-600 font-bold">•</span>
                      <span>{item}</span>
                    </motion.li>
                  ))}
                </ul>

                <div className="mt-4 pt-4 border-t border-violet-200">
                  <p className="text-sm text-gray-600 italic">
                    <strong>Note:</strong> Some documents may not be
                    automatically generated because multiple tariff IDs are
                    being processed. Our team is working on this, and we'll
                    share any missing documents with you as soon as they're
                    available.
                  </p>
                </div>
              </motion.div>

              <motion.div
                variants={itemVariants}
                className="flex items-start bg-violet-50 border border-violet-200 rounded-xl p-4"
              >
                <input
                  type="checkbox"
                  id="terms"
                  checked={agreeTerms}
                  onChange={(e) => setAgreeTerms(e.target.checked)}
                  className="mt-1 h-5 w-5 text-violet-600 focus:ring-violet-500 border-violet-300 rounded"
                  required
                />
                <label htmlFor="terms" className="ml-3 text-sm text-gray-700">
                  I agree to the{" "}
                  <Link
                    href="/termscondition"
                    className="text-violet-700 font-semibold hover:underline"
                  >
                    Terms and Conditions
                  </Link>{" "}
                  and{" "}
                  <Link
                    href="/privacypolicy"
                    className="text-violet-700 font-semibold hover:underline"
                  >
                    Privacy Policy
                  </Link>
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
                  className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg font-medium"
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
            className={`w-full py-4 cursor-pointer rounded-xl font-bold text-lg text-white transition-all shadow-lg ${
              loading
                ? "bg-gray-400 cursor-not-allowed"
                : "bg-linear-to-r from-violet-600 via-indigo-600 to-blue-600 hover:from-violet-700 hover:via-indigo-700 hover:to-blue-700 shadow-violet-300/50"
            }`}
          >
            {loading ? "Submitting..." : "Submit Application "}
          </motion.button>
        </motion.form>
      </motion.div>

      {/* Loading Overlay */}
      {loading && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/20 backdrop-blur-[2px]">
          <div className="bg-white rounded-2xl p-8 w-[90%] max-w-md text-center shadow-2xl border border-violet-100">
            <div className="w-12 h-12 border-4 border-violet-200 border-t-violet-600 rounded-full animate-spin mx-auto mb-6"></div>

            <h2 className="text-lg font-semibold text-gray-800 mb-4">
              Processing your application
            </h2>

            <div className="text-sm text-violet-700 font-medium min-h-[24px] transition-all">
              {loadingStep === 1 && "🔍 Analyzing your details..."}
              {loadingStep === 2 && "📄 Generating your application..."}
              {loadingStep === 3 && "📧 Preparing your documents..."}
              {loadingStep === 4 && "🚀 Redirecting you..."}
            </div>
          </div>
        </div>
      )}

      {/* ✅ NEW USER SUCCESS MODAL */}
      <AnimatePresence>
        {showNewUserModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4"
            onClick={() => {
              setShowNewUserModal(false);
              router.push("/login");
            }}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              transition={{ type: "spring", duration: 0.5 }}
              className="bg-white rounded-2xl p-8 w-full max-w-md shadow-2xl border border-violet-100"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Success Icon */}
              <div className="w-16 h-16 bg-gradient-to-br from-green-400 to-emerald-500 rounded-full flex items-center justify-center mx-auto mb-6">
                <CheckCircle2 className="w-10 h-10 text-white" />
              </div>

              {/* Title */}
              <h2 className="text-2xl font-bold text-gray-900 text-center mb-3">
                Account Created Successfully!
              </h2>

              {/* Message */}
              <div className="bg-violet-50 border border-violet-200 rounded-xl p-4 mb-6">
                <div className="flex items-start gap-3">
                  <Mail className="w-5 h-5 text-violet-600 flex-shrink-0 mt-0.5" />
                  <div className="flex-1">
                    <p className="text-sm text-gray-700 leading-relaxed">
                      We've sent your login credentials to{" "}
                      <span className="font-semibold text-violet-700">
                        {newUserEmail}
                      </span>
                    </p>
                  </div>
                </div>
              </div>

              {/* Info List */}
              <div className="space-y-3 mb-6">
                <div className="flex items-start gap-2">
                  <span className="text-violet-600 font-bold mt-0.5">•</span>
                  <p className="text-sm text-gray-600">
                    Check your inbox for the email with your password
                  </p>
                </div>
                <div className="flex items-start gap-2">
                  <span className="text-violet-600 font-bold mt-0.5">•</span>
                  <p className="text-sm text-gray-600">
                    Use your email and the password provided to log in
                  </p>
                </div>
                <div className="flex items-start gap-2">
                  <span className="text-violet-600 font-bold mt-0.5">•</span>
                  <p className="text-sm text-gray-600">
                    You can change your password after logging in
                  </p>
                </div>
              </div>

              {/* Action Button */}
              <motion.button
                whileHover={{ scale: 1.02, y: -2 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => {
                  setShowNewUserModal(false);
                  router.push("/login");
                }}
                className="w-full py-3 bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-700 hover:to-indigo-700 text-white font-semibold rounded-xl shadow-lg shadow-violet-200 transition-all"
              >
                Go to Login
              </motion.button>

              {/* Footer Note */}
              <p className="text-xs text-gray-500 text-center mt-4">
                Didn't receive the email? Check your spam folder or contact
                support.
              </p>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
