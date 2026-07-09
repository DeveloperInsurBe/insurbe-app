"use client";

import { useState, useMemo, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Check, X, Star } from "lucide-react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import PlansCompare from "./PlanCompares";
import { usePremiumStore } from "@/app/stores/premiumStore";
import { useJourneyStore } from "@/app/stores/journeyStore";
import { useDocumentStore } from "@/app/stores/documentStore";

// ✅ Health Answer Types
interface HealthAnswer {
  doctorVisit: string | null;
  doctorPreventative: string | null;
  hospitalized: string | null;
  psychotherapy: string | null;
  chronicDiseases: string | null;
  dentalVisit: string | null;
  missingTeeth: string | null;
}

export default function ComparePlans() {
  const router = useRouter();
  // const { setPremium, setTKPremium } = usePremiumStore();
  const { premium, setPremium, setTKPremium } = usePremiumStore();
  const { setHalleschePremiumDocs, setHallescheExpatDocs } = useDocumentStore();
  const { incomeRange, employmentStatus, dob, selectedCountry } =
    useJourneyStore();

  const [viewMode, setViewMode] = useState("default");
  const [expandedCard, setExpandedCard] = useState<string | null>(null);
  const [showCalculator, setShowCalculator] = useState(false);
  const [showComingSoonModal, setShowComingSoonModal] = useState(false);
  const [selectedPlanName, setSelectedPlanName] = useState("");
  const [hoveredCard, setHoveredCard] = useState<string | null>(null);

  // ✅ Health Questions Modal State
  const [showHealthModal, setShowHealthModal] = useState(false);
  const [currentHealthQuestion, setCurrentHealthQuestion] = useState(0);
  const [healthAnswers, setHealthAnswers] = useState<HealthAnswer>({
    doctorVisit: null,
    doctorPreventative: null,
    hospitalized: null,
    psychotherapy: null,
    chronicDiseases: null,
    dentalVisit: null,
    missingTeeth: null,
  });
  const [pendingPlanId, setPendingPlanId] = useState<string | null>(null);

  // ✅ Get products from Zustand store
  const availableProducts = useJourneyStore((state) => state.availableProducts);

  // ✅ Fetch premiums on mount for products with loading=true
  const fetchedRef = useRef(false);

  useEffect(() => {
    if (fetchedRef.current) return;

    fetchedRef.current = true;

    const fetchPremiums = async () => {
      if (!availableProducts || availableProducts.length === 0) return;

      const currentYear = new Date().getFullYear();
      const fullDob = dob ? `${dob}-01-01` : "2000-01-01";
      const coverageStart = new Date().toISOString().split("T")[0];

      const EU_COUNTRIES = [
        "Austria",
        "Belgium",
        "Bulgaria",
        "Croatia",
        "Cyprus",
        "Czech Republic",
        "Denmark",
        "Estonia",
        "Finland",
        "France",
        "Germany",
        "Greece",
        "Hungary",
        "Ireland",
        "Italy",
        "Latvia",
        "Lithuania",
        "Luxembourg",
        "Malta",
        "Netherlands",
        "Poland",
        "Portugal",
        "Romania",
        "Slovakia",
        "Slovenia",
        "Spain",
        "Sweden",
        "Iceland",
        "Liechtenstein",
        "Norway",
        "Switzerland",
        "United Kingdom",
      ];

      const isEU = selectedCountry
        ? EU_COUNTRIES.includes(selectedCountry)
        : true;

      const requests: Promise<any>[] = [];

      const premiumProduct = availableProducts.find(
        (p: any) => p.id === "hallesche-premium" && p.loading,
      );

      const expatProduct = availableProducts.find(
        (p: any) => p.id === "hallesche-expat" && p.loading && !isEU,
      );

      if (premiumProduct) {
        requests.push(
          fetch("/api/getOfferEinzel", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              tariffIds: ["35659", "36129", "24332", "1803"],
              vorname: "User",
              name: "Customer",
              geburtsdatum: fullDob,
              beginn: coverageStart,
            }),
          }).then((res) => res.json()),
        );
      }

      if (expatProduct) {
        requests.push(
          fetch("/api/getOfferEinzel", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              tariffIds: ["35057", "35063", "24332", "1803"],
              vorname: "User",
              name: "Customer",
              geburtsdatum: fullDob,
              beginn: coverageStart,
            }),
          }).then((res) => res.json()),
        );
      }

      const results = await Promise.all(requests);

      let resultIndex = 0;

      const updatedProducts = availableProducts.map((product: any) => {
        if (product.id === "hallesche-premium" && premiumProduct) {
          const data = results[resultIndex++];
          setHalleschePremiumDocs(data.documents || []);
          return {
            ...product,
            premium: Number(data.premium),
            documentCount: data.documents?.length || 0,
            loading: false,
          };
        }

        if (product.id === "hallesche-expat" && expatProduct) {
          const data = results[resultIndex++];

          setHallescheExpatDocs(data.documents || []);
          return {
            ...product,
            premium: Number(data.premium),
            documentCount: data.documents?.length || 0,
            loading: false,
          };
        }

        return product;
      });

      useJourneyStore.getState().setAvailableProducts(updatedProducts);
    };

    fetchPremiums();
  }, []);
  // ✅ Transform store products to display format
  const plans = useMemo(() => {
    if (!availableProducts || availableProducts.length === 0) {
      return [];
    }

    return availableProducts.map((product: any) => {
      let logo = "/icons/default.svg";
      let bgColor = "bg-gradient-to-br from-white to-gray-50";
      let available = false;
      let textColor = "text-black";
      let buttonColor = "bg-white text-primary";

      if (product.id === "tk") {
        logo = "/icons/tk.png";
        bgColor = "bg-white";
        textColor = "text-gray-700";
        buttonColor =
          "bg-gradient-to-r from-purple-600 to-purple-700 text-white";
        available = false;
      } else if (product.id === "dak") {
        // ✅ DAK Styling
        logo = "/icons/dak.svg";
        bgColor = "bg-gradient-to-br from-blue-50 via-cyan-50 to-teal-50";
        textColor = "text-gray-800";
        buttonColor = "bg-gradient-to-r from-cyan-600 to-teal-600 text-white";
        available = false;
      } else if (product.id === "hallesche-premium") {
        logo = "/icons/H.svg";
        bgColor =
          "bg-gradient-to-br from-purple-200 via-purple-300 to-pink-200  hover:from-purple-200 hover:via-purple-300 hover:to-pink-300";
        textColor = "text-purple-900";
        buttonColor = "bg-white text-purple-600";
        available = true;
      } else if (product.id === "hallesche-expat") {
        logo = "/icons/H.svg";
        bgColor = "bg-white";
        textColor = "text-black";
        buttonColor =
          "bg-gradient-to-r from-purple-600 to-purple-700 text-white";
        available = true;
      }

      const isEmployed =
        employmentStatus?.trim().toLowerCase().includes("employed") &&
        !employmentStatus?.toLowerCase().includes("self");
      const isHallesche =
        product.id === "hallesche-premium" || product.id === "hallesche-expat";

      const premiumNumber =
        typeof product.premium === "number"
          ? product.premium
          : Number(product.premium);

      let displayPremium: string;
      if (product.loading || product.premium == null) {
        displayPremium = "...";
      } else if (!Number.isNaN(premiumNumber)) {
        let adjusted = premiumNumber;

        if (isEmployed && isHallesche) {
          const MAX_EMPLOYER_SUBSIDY = 508.59;

          const employerSubsidy = Math.min(
            premiumNumber * 0.5,
            MAX_EMPLOYER_SUBSIDY,
          );

          adjusted = premiumNumber - employerSubsidy;
        }

        displayPremium = adjusted.toFixed(2);
      } else {
        displayPremium = "N/A";
      }

      return {
        id: product.id,
        name: product.name,
        price: displayPremium,
        period: "/ Month",
        logo,
        description: product.description,
        features: product.features || [],
        bgColor,
        textColor,
        buttonColor,
        available,
        recommended: product.type === "premium",
        tariffIds: product.tariffIds,
        documentCount: product.documentCount || 0,
        provider: product.provider,
        loading: product.loading || false,
      };
    });
  }, [availableProducts, employmentStatus]);

  // Determine which card should be highlighted initially
  const getRecommendedPlanId = () => {
    // Check if DAK is available
    const dakExists = plans.some((p) => p.id === "dak");
    if (dakExists) return "dak";

    if (incomeRange === ">77400") {
      return "hallesche-premium";
    }
    return "tk";
  };

  const recommendedPlanId = getRecommendedPlanId();
  const hasExactSpecialComparisonSet = useMemo(() => {
    if (plans.length !== 3) return false;

    const ids = new Set(plans.map((plan) => plan.id));

    return (
      ids.has("tk") &&
      ids.has("hallesche-premium") &&
      ids.has("hallesche-expat")
    );
  }, [plans]);

  // Set initial hover state to recommended plan
  useEffect(() => {
    setHoveredCard(recommendedPlanId);
  }, [recommendedPlanId]);

  const handlePersonalizeClick = () => {
    setViewMode("personalize");
    setShowCalculator(true);
  };

  const handleDefaultClick = () => {
    setViewMode("default");
    setShowCalculator(false);
  };

  const handlePersonalizedCalculationClick = () => {
    setViewMode("personalize");
    setShowCalculator(true);
  };

  // ✅ Health Questions Configuration
  const healthQuestions = [
    {
      id: 0,
      title: "Quick health check",
      subtitle: "Have you visited a doctor in the past 3 years?",
      helper: "This helps us recommend the right path for you.",
      key: "doctorVisit" as keyof HealthAnswer,
    },
    {
      id: 1,
      title: "Quick health check",
      subtitle: "Was the visit for a preventive health checkup?",
      helper: "Preventive = routine check-up without symptoms.",
      key: "doctorPreventative" as keyof HealthAnswer,
    },
    {
      id: 2,
      title: "Almost there",
      subtitle: "Have you been hospitalized in the past five years?",
      key: "hospitalized" as keyof HealthAnswer,
    },
    {
      id: 3,
      title: "Mental health matters",
      subtitle: "Have you had psychotherapy in the past 10 years?",
      key: "psychotherapy" as keyof HealthAnswer,
    },
    {
      id: 4,
      title: "Health status",
      subtitle: "Do you have disabilities or chronic diseases?",
      key: "chronicDiseases" as keyof HealthAnswer,
    },
    {
      id: 5,
      title: "Dental care",
      subtitle: "Have you been to the dentist in the past 3 years?",
      key: "dentalVisit" as keyof HealthAnswer,
    },
    {
      id: 6,
      title: "Dental health",
      subtitle: "Do you have any missing teeth?",
      helper: "Excluding wisdom teeth.",
      key: "missingTeeth" as keyof HealthAnswer,
    },
  ];

  // ✅ Handle Health Question Answers
  const handleHealthAnswer = (key: keyof HealthAnswer, value: string) => {
    const updatedAnswers = { ...healthAnswers, [key]: value };
    setHealthAnswers(updatedAnswers);

    if (currentHealthQuestion === 0) {
      if (value === "yes") {
        setCurrentHealthQuestion(1);
      } else {
        setCurrentHealthQuestion(2);
      }
    } else if (currentHealthQuestion === 1) {
      setCurrentHealthQuestion(2);
    } else if (currentHealthQuestion === 2) {
      setCurrentHealthQuestion(3);
    } else if (currentHealthQuestion === 3) {
      setCurrentHealthQuestion(4);
    } else if (currentHealthQuestion === 4) {
      setCurrentHealthQuestion(5);
    } else if (currentHealthQuestion === 5) {
      setCurrentHealthQuestion(6);
    } else if (currentHealthQuestion === 6) {
      // Last question - evaluate
      evaluateHealthAnswers({ ...updatedAnswers, missingTeeth: value });
    }
  };

  // ✅ Evaluate Health Answers
  const evaluateHealthAnswers = (finalAnswers: HealthAnswer) => {
    const doctorPathSafe =
      finalAnswers.doctorVisit === "no" ||
      (finalAnswers.doctorVisit === "yes" &&
        finalAnswers.doctorPreventative === "yes");

    const otherQuestionsSafe =
      finalAnswers.hospitalized === "no" &&
      finalAnswers.psychotherapy === "no" &&
      finalAnswers.chronicDiseases === "no" &&
      finalAnswers.dentalVisit === "no" &&
      finalAnswers.missingTeeth === "no";

    const canProceed = doctorPathSafe && otherQuestionsSafe;

    // ✅ Close modal FIRST
    setShowHealthModal(false);

    // ✅ Reset AFTER navigation is scheduled
    //   requestAnimationFrame(() => {
    //     if (canProceed && pendingPlanId) {
    //       useJourneyStore.setState({ selectedPlan: pendingPlanId });
    //       router.push("/calculator/submitApplication");
    //     } else {
    //       router.push("/book-appointment");
    //     }

    //     // Cleanup state safely
    //     setCurrentHealthQuestion(0);
    //     setHealthAnswers({
    //       doctorVisit: null,
    //       doctorPreventative: null,
    //       hospitalized: null,
    //       psychotherapy: null,
    //       chronicDiseases: null,
    //       dentalVisit: null,
    //       missingTeeth: null,
    //     });
    //   });
  };

  // ✅ Handle Choose Plan - Opens Health Modal for available plans
  const setSelectedPlan = useJourneyStore((s) => s.setSelectedPlan);

  const handleChoosePlan = (plan: (typeof plans)[0]) => {
    if (plan.id === "tk") {
      router.push("/insuranceSignupFlow?provider=tk");
      return;
    }

    // ✅ Handle DAK routing
    if (plan.id === "dak") {
      router.push("/insuranceSignupFlow?provider=dak");
      return;
    }

    if (!plan.available) {
      setSelectedPlanName(plan.name);
      setShowComingSoonModal(true);
      return;
    }

    const isSelfEmployed =
      employmentStatus?.toLowerCase().includes("self") || false;

    if (!isSelfEmployed && incomeRange !== ">77400") {
      setSelectedPlanName(plan.name);
      setShowComingSoonModal(true);
      return;
    }

    sessionStorage.setItem("selectedPlan", JSON.stringify(plan));

    // ✅ Use the hook result here
    setSelectedPlan(plan);

    router.push("/calculator/submitApplication");
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.1 } },
  };

  const cardVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.4 } },
  };

  // ✅ Show loading state if no products yet
  if (plans.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50">
        <div className="text-center">
          <div className="w-20 h-20 border-4 border-purple-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-700 font-semibold text-lg">
            Loading your personalized plans...
          </p>
        </div>
      </div>
    );
  }
  const { halleschePremiumDocs } = useDocumentStore();
  const downloadPDF = (base64: string, fileName: string) => {
    const byteCharacters = atob(base64);

    const byteNumbers = new Array(byteCharacters.length)
      .fill(0)
      .map((_, i) => byteCharacters.charCodeAt(i));

    const byteArray = new Uint8Array(byteNumbers);

    const blob = new Blob([byteArray], {
      type: "application/pdf",
    });

    const url = URL.createObjectURL(blob);

    const link = document.createElement("a");
    link.href = url;
    link.download = fileName;
    link.click();

    URL.revokeObjectURL(url);
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="min-h-screen pt-16 pb-10 px-4 sm:px-6 md:px-16 overflow-visible"
    >
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex justify-center mb-10">
          <motion.div
            initial={{ y: 30, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="text-center max-w-2xl"
          >
            {/* Badge */}

            {/* Heading */}
            <h1 className="text-3xl md:text-4xl font-extrabold leading-snug">
              Best Plans suggested based{" "}
              <span className="text-transparent bg-clip-text bg-linear-to-r from-primary to-purple-600">
                on your personal Profile
              </span>
            </h1>

        
          </motion.div>
        </div>

       

        {/* Product Count Badge */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8 text-center"
        >
          <span className="inline-block bg-linear-to-r from-purple-100 to-blue-100 text-primary px-6 py-3 rounded-full text-sm font-bold shadow-lg border-2 border-purple-200">
            🎯{" "}
            {plans.length === 1
              ? "1 Plan Available for You"
              : `${plans.length} Plans Available for You`}
          </span>
        </motion.div>

        {/* Cards with Equal Heights */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className={`
             flex md:grid gap-6 
  overflow-x-auto md:overflow-visible
  snap-x snap-mandatory md:snap-none
  pt-6 pb-6
  scrollbar-hide
            ${plans.length === 2 ? "md:grid-cols-2" : "md:grid-cols-3"}
          `}
        >
          {plans.map((plan, index) => {
            const isRecommended = plan.id === recommendedPlanId;
            const isHovered = hoveredCard === plan.id;

            return (
              <motion.div
                key={plan.id}
                variants={cardVariants}
                custom={index}
                whileHover={{
                  y: -12,
                  transition: { duration: 0.3 },
                }}
                onMouseEnter={() => setHoveredCard(plan.id)}
                onMouseLeave={() => setHoveredCard(recommendedPlanId)}
                className={`
                  min-w-[85%] xs:min-w-[75%] sm:min-w-[60%] md:min-w-0
  snap-center
  rounded-3xl p-6 sm:p-8 shadow-xl hover:shadow-2xl transition-all
  flex flex-col relative mt-4
                 
                  ${plan.bgColor}
                 
                `}
              >
                {/* Most Popular Badge for DAK */}
                {plan.id === "dak" && (
                  <motion.div
                    initial={{ scale: 0, rotate: -180 }}
                    animate={{ scale: 1, rotate: 0 }}
                    transition={{ delay: 0.6, type: "spring" }}
                    className="absolute -top-3 sm:-top-4 -right-3 sm:-right-4 bg-gradient-to-r from-cyan-400 to-teal-400 text-white text-xs font-bold px-4 py-2 rounded-full shadow-xl z-10 border-2 border-white"
                  >
                    <span className="flex gap-1 items-center">
                      <Star className="w-3 h-3 fill-current" />
                      Most Popular
                    </span>
                  </motion.div>
                )}
                {/* Recommended Badge */}
                {isRecommended && plan.id !== "dak" && (
                  <motion.div
                    initial={{ scale: 0, rotate: -180 }}
                    animate={{ scale: 1, rotate: 0 }}
                    transition={{ delay: 0.6, type: "spring" }}
                    className="absolute -top-3 sm:-top-4 -right-3 sm:-right-4 bg-linear-to-r from-purple-400 to-blue-400 text-black text-xs font-bold px-4 py-2 rounded-full shadow-xl z-10 border-2 border-white"
                  >
                    <span className="flex gap-1 items-center">
                      <Star className="w-3 h-3 fill-current" />
                      Recommended
                    </span>
                  </motion.div>
                )}

                {/* Header */}
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: index * 0.1 + 0.3 }}
                  className="flex justify-between items-start mb-6"
                >
                  <div>
                    <motion.div
                      initial={{ scale: 0.8 }}
                      animate={{ scale: 1 }}
                      transition={{ delay: index * 0.1 + 0.4, type: "spring" }}
                      className="flex flex-col xs:flex-row xs:items-baseline xs:gap-1 gap-0.5"
                    >
                      {plan.loading ? (
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 border-4 border-purple-600 border-t-transparent rounded-full animate-spin"></div>
                          <span className="text-sm text-gray-600 font-medium">
                            Loading...
                          </span>
                        </div>
                      ) : (
                        <>
                          <div className="flex items-baseline gap-0.5 xs:gap-1">
                            <span
                              className={`text-2xl xs:text-3xl sm:text-4xl font-bold ${plan.textColor}`}
                            >
                              €
                            </span>
                            <span
                              className={`text-2xl xs:text-3xl sm:text-4xl bg-gradient-to-br from-gray-900 to-purple-900 bg-clip-text text-transparent font-extrabold ${plan.textColor}`}
                            >
                              {plan.price}
                            </span>
                          </div>

                          <span
                            className={`text-xs xs:text-sm text-gray-600 font-medium ${plan.textColor}`}
                          >
                            {plan.period}
                          </span>

                          {plan.id === "tk" && (
                            <span className="text-xs xs:text-sm text-gray-500 font-medium order-first xs:order-none">
                              (approx.)
                            </span>
                          )}
                        </>
                      )}
                    </motion.div>

                    <div
                      className={`mt-3 font-bold text-gray-900 text-[16px] ${plan.textColor}`}
                    >
                      {plan.name}
                    </div>

                    {plan.id === "tk" && (
                      <p
                        className={`text-xs text-gray-500 mt-1 font-medium ${plan.textColor}`}
                      >
                        (Employee portion)
                      </p>
                    )}
                  </div>

                  <motion.div
                    initial={{ rotate: -180, opacity: 0 }}
                    animate={{ rotate: 0, opacity: 1 }}
                    transition={{ delay: index * 0.1 + 0.5, duration: 0.5 }}
                    className="bg-white rounded-2xl p-3 shadow-md"
                  >
                    <Image
                      src={plan.logo}
                      width={50}
                      height={50}
                      alt={`${plan.name} logo`}
                      className="object-contain"
                    />
                  </motion.div>
                </motion.div>

                {/* Description */}
                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: index * 0.1 + 0.6 }}
                  className={`text-sm text-gray-700 mb-6 leading-relaxed font-medium ${plan.textColor}`}
                >
                  {plan.description}
                </motion.p>

                {/* Features */}
                <motion.ul
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: index * 0.1 + 0.7 }}
                  className="space-y-3 mb-6 flex-grow"
                  role="list"
                >
                  {plan.features.map((feature: string, i: number) => (
                    <motion.li
                      key={i}
                      initial={{ x: -20, opacity: 0 }}
                      animate={{ x: 0, opacity: 1 }}
                      transition={{
                        delay: index * 0.1 + 0.7 + i * 0.05,
                      }}
                      className="flex items-start gap-3"
                    >
                      <div className="bg-green-100 rounded-full p-1 mt-0.5">
                        <Check className="w-4 h-4 text-green-600 shrink-0" />
                      </div>
                      <span
                        className={`text-sm text- font-medium ${plan.textColor}`}
                      >
                        {feature}
                      </span>
                    </motion.li>
                  ))}
                </motion.ul>

                {/* Button */}
                <motion.button
                  type="button"
                  whileHover={{ scale: 1.03, y: -2 }}
                  whileTap={{ scale: 0.97 }}
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: index * 0.1 + 0.8 }}
                  onClick={() => handleChoosePlan(plan)}
                  disabled={plan.loading}
                  className={`w-full  py-4 rounded-4xl font-bold cursor-pointer transition-all mt-auto shadow-lg focus:outline-none focus:ring-4 disabled:opacity-50 disabled:cursor-not-allowed  
                   ${plan.buttonColor} `}
                >
                  {plan.loading
                    ? "Loading..."
                    : plan.available
                      ? "Apply Now →"
                      : "Apply Now →"}
                </motion.button>
                {/* pdf download button  */}
                {/* {halleschePremiumDocs?.map((doc, index) => (
                  <button
                    key={index}
                    onClick={() => downloadPDF(doc.base64, doc.name)}
                    className="bg-blue-500 text-white px-4 py-2 rounded mb-2"
                  >
                    Download {doc.name}
                  </button>
                ))} */}
              </motion.div>
            );
          })}
        </motion.div>

        {/* Show / Hide Details Button */}
        <motion.div
          initial={{ y: 30, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 1, duration: 0.5 }}
          className="flex justify-center mt-12"
        >
          {expandedCard ? (
            <motion.button
              type="button"
              whileHover={{ scale: 1.05, y: -2 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setExpandedCard(null)}
              className="px-12 py-4 rounded-4xl font-bold cursor-pointer bg-white text-primary border-2 border-primary hover:bg-purple-50 transition-all shadow-lg focus:outline-none focus:ring-4 focus:ring-purple-300"
            >
              Hide Details ↑
            </motion.button>
          ) : (
            <motion.button
              type="button"
              whileHover={{ scale: 1.05, y: -2 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setExpandedCard("compare")}
              className="px-12 cursor-pointer py-4 rounded-4xl font-bold bg-linear-to-r from-primary to-purple-600 text-white  transition-all shadow-xl shadow-purple-500/50 focus:outline-none focus:ring-4 focus:ring-purple-300"
            >
              Show Details ↓
            </motion.button>
          )}
        </motion.div>

        {/* Comparison Table */}
        <AnimatePresence>
          {expandedCard === "compare" && (
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -30 }}
              transition={{ duration: 0.4 }}
              className="mt-10"
            >
              <PlansCompare
                plans={plans}
                comparisonMode={
                  hasExactSpecialComparisonSet
                    ? "special_tk_hallesche_combo"
                    : "default"
                }
              />
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* ✅ Health Questions Modal */}
      <AnimatePresence>
        {showHealthModal && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/70 z-40 backdrop-blur-md"
            />

            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              transition={{ type: "spring", duration: 0.5 }}
              className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-white rounded-3xl shadow-2xl p-10 max-w-2xl w-full mx-4 z-50 max-h-[90vh] overflow-y-auto border-4 border-purple-100"
            >
              <button
                type="button"
                onClick={() => {
                  setShowHealthModal(false);
                  setCurrentHealthQuestion(0);
                  setHealthAnswers({
                    doctorVisit: null,
                    doctorPreventative: null,
                    hospitalized: null,
                    psychotherapy: null,
                    chronicDiseases: null,
                    dentalVisit: null,
                    missingTeeth: null,
                  });
                }}
                className="absolute top-6 right-6 text-gray-400 hover:text-gray-700 transition bg-gray-100 rounded-full p-2 hover:bg-gray-200"
              >
                <X className="w-6 h-6" />
              </button>

              <div className="space-y-6">
                {currentHealthQuestion > 0 && (
                  <button
                    type="button"
                    onClick={() =>
                      setCurrentHealthQuestion(
                        Math.max(0, currentHealthQuestion - 1),
                      )
                    }
                    className="flex items-center gap-2 text-gray-600 hover:text-purple-600 transition mb-4 font-semibold"
                  >
                    <svg
                      className="w-5 h-5"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M15 19l-7-7 7-7"
                      />
                    </svg>
                    Back
                  </button>
                )}

                <h2 className="text-3xl md:text-4xl font-extrabold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
                  {healthQuestions[currentHealthQuestion].title}
                </h2>

                <p className="text-xl text-gray-700 font-medium">
                  {healthQuestions[currentHealthQuestion].subtitle}
                </p>

                {healthQuestions[currentHealthQuestion].helper && (
                  <p className="text-sm text-gray-600 bg-blue-50 border-l-4 border-blue-500 p-4 rounded-lg">
                    💡 {healthQuestions[currentHealthQuestion].helper}
                  </p>
                )}

                <div className="space-y-4 mt-8">
                  <motion.button
                    type="button"
                    whileHover={{ scale: 1.02, x: 5 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() =>
                      handleHealthAnswer(
                        healthQuestions[currentHealthQuestion].key,
                        "yes",
                      )
                    }
                    className="w-full p-5 border-2 cursor-pointer rounded-xl text-left hover:border-purple-500 hover:bg-purple-50 transition font-semibold text-gray-800 shadow-sm hover:shadow-md"
                  >
                    ✓ Yes
                  </motion.button>

                  <motion.button
                    type="button"
                    whileHover={{ scale: 1.02, x: 5 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() =>
                      handleHealthAnswer(
                        healthQuestions[currentHealthQuestion].key,
                        "no",
                      )
                    }
                    className="w-full p-5 border-2 cursor-pointer rounded-xl text-left hover:border-purple-500 hover:bg-purple-50 transition font-semibold text-gray-800 shadow-sm hover:shadow-md"
                  >
                    ✗ No
                  </motion.button>
                </div>

                {/* Progress Indicator */}
                <div className="mt-8 flex items-center gap-2">
                  {healthQuestions.map((_, idx) => (
                    <div
                      key={idx}
                      className={`h-2.5 flex-1 rounded-full transition-all ${
                        idx <= currentHealthQuestion
                          ? "bg-gradient-to-r from-purple-600 to-blue-600"
                          : "bg-gray-200"
                      }`}
                    />
                  ))}
                </div>
                <p className="text-sm text-gray-500 text-center font-medium">
                  Question {currentHealthQuestion + 1} of{" "}
                  {healthQuestions.length}
                </p>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Coming Soon Modal */}
      <AnimatePresence>
        {showComingSoonModal && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowComingSoonModal(false)}
              className="fixed inset-0 bg-black/70 z-40 backdrop-blur-md"
            />

            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              transition={{ type: "spring", duration: 0.5 }}
              className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-white rounded-3xl shadow-2xl p-10 max-w-md w-full mx-4 z-50 border-4 border-purple-100"
            >
              <motion.button
                type="button"
                whileHover={{ scale: 1.1, rotate: 90 }}
                whileTap={{ scale: 0.9 }}
                onClick={() => setShowComingSoonModal(false)}
                className="absolute top-6 right-6 text-gray-400 hover:text-gray-700 transition focus:outline-none focus:ring-2 focus:ring-purple-500 rounded-full bg-gray-100 p-2 hover:bg-gray-200"
              >
                <X className="w-6 h-6" />
              </motion.button>

              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.2, type: "spring" }}
                className="text-center"
              >
                <div className="w-24 h-24 bg-gradient-to-br from-purple-100 to-blue-100 rounded-full flex items-center justify-center mx-auto mb-6 border-4 border-purple-200">
                  <motion.svg
                    animate={{ rotate: 360 }}
                    transition={{
                      duration: 2,
                      repeat: Infinity,
                      ease: "linear",
                    }}
                    className="w-12 h-12 text-purple-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </motion.svg>
                </div>

                <motion.h2
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.3 }}
                  className="text-3xl font-extrabold text-gray-900 mb-3"
                >
                  Coming Soon! 🚀
                </motion.h2>
                <motion.p
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.4 }}
                  className="text-gray-600 mb-8 leading-relaxed"
                >
                  <span className="font-bold text-purple-600">
                    {selectedPlanName}
                  </span>{" "}
                  integration is currently under development. We'll notify you
                  once it's available.
                </motion.p>

                <motion.button
                  type="button"
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.5 }}
                  whileHover={{ scale: 1.05, y: -2 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setShowComingSoonModal(false)}
                  className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white font-bold py-4 rounded-xl transition-all shadow-lg shadow-purple-500/50 focus:outline-none focus:ring-4 focus:ring-purple-300"
                >
                  Got it ✓
                </motion.button>
              </motion.div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      <style jsx global>{`
        .scrollbar-hide {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
      `}</style>
    </motion.div>
  );
}
