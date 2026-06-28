"use client";

import { useMemo, useState } from "react";
import { Check, Upload } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";

type CustomerType = "existing" | "new" | "";
type YesNo = "yes" | "no" | "";
type Phase = "precheck" | "customerType" | "wizard";

type ApplicationData = {
  selectedPlan: "AOK" | "DAK";
  previousInsuredWhere: "Abroad" | "Germany" | "";
  insuranceType: "Travel Health Insurance" | "Statutory Health Insurance" | "Private Health Insurance" | "";
  previousProviderName: string;
  reasonToStay: string;
  title: string;
  gender: string;
  firstName: string;
  lastName: string;
  email: string;
  phoneDialCode: string;
  phoneNumber: string;
  acceptedStep2Terms: boolean;
  maidenName: string;
  passportNumber: string;
  confirmPassportNumber: string;
  dateOfBirth: string;
  passportIssueDate: string;
  countryOfBirth: string;
  placeOfBirth: string;
  nationality: string;
  streetNo: string;
  additionalAddress: string;
  city: string;
  districtState: string;
  country: string;
  postalCode: string;
  alreadyInGermany: boolean;
  maritalStatus: string;
  coInsureDependents: YesNo;
  studyWorkName: string;
  studyWorkCity: string;
  studyWorkStreet: string;
  studyWorkPostalCode: string;
  studyWorkStartDate: string;
  studyWorkEndDate: string;
  acceptedFinalTerms: boolean;
  acceptedFinalPrivacy: boolean;
};

const stepItems = [
  "Select Plan",
  "Personal Info",
  "Passport",
  "Address",
  "Study / Work",
  "Documents",
  "Review",
];

const dialCodeToFlag: Record<string, string> = {
  "1": "🇺🇸",
  "49": "🇩🇪",
  "91": "🇮🇳",
  "44": "🇬🇧",
  "33": "🇫🇷",
  "39": "🇮🇹",
  "971": "🇦🇪",
};

const dialCodesByLength = Object.keys(dialCodeToFlag).sort(
  (a, b) => b.length - a.length
);

const normalizeDialCode = (value: string) => {
  const digits = value.replace(/\D/g, "").slice(0, 4);
  return digits ? `+${digits}` : "+";
};

const dialCodeToFlagEmoji = (dialCode: string) => {
  const digits = dialCode.replace(/\D/g, "");
  for (const code of dialCodesByLength) {
    if (digits.startsWith(code)) return dialCodeToFlag[code];
  }
  return "🌍";
};

const cardBaseClass =
  "bg-white/92 backdrop-blur-sm border border-[#ead9fb] rounded-2xl shadow-[0_20px_45px_rgba(130,10,209,0.10)]";

const fadeInUp = {
  initial: { opacity: 0, y: 16 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -10 },
  transition: { duration: 0.24, ease: "easeOut" as const },
};

const emptyData: ApplicationData = {
  selectedPlan: "DAK",
  previousInsuredWhere: "Abroad",
  insuranceType: "Statutory Health Insurance",
  previousProviderName: "",
  reasonToStay: "Student",
  title: "",
  gender: "",
  firstName: "",
  lastName: "",
  email: "",
  phoneDialCode: "+1",
  phoneNumber: "",
  acceptedStep2Terms: false,
  maidenName: "",
  passportNumber: "",
  confirmPassportNumber: "",
  dateOfBirth: "",
  passportIssueDate: "",
  countryOfBirth: "",
  placeOfBirth: "",
  nationality: "",
  streetNo: "",
  additionalAddress: "",
  city: "",
  districtState: "",
  country: "Germany",
  postalCode: "",
  alreadyInGermany: false,
  maritalStatus: "",
  coInsureDependents: "",
  studyWorkName: "",
  studyWorkCity: "",
  studyWorkStreet: "",
  studyWorkPostalCode: "",
  studyWorkStartDate: "",
  studyWorkEndDate: "",
  acceptedFinalTerms: false,
  acceptedFinalPrivacy: false,
};

export default function PreCheckClient({
  initialProduct = "DAK",
}: {
  initialProduct?: "AOK" | "DAK";
}) {
  const initialPlan = initialProduct === "AOK" ? "AOK" : "DAK";
  const [phase, setPhase] = useState<Phase>("precheck");
  const [customerType, setCustomerType] = useState<CustomerType>("");
  const [wizardStep, setWizardStep] = useState(1);
  const [passportReady, setPassportReady] = useState(false);
  const [admissionReady, setAdmissionReady] = useState(false);
  const [passportFile, setPassportFile] = useState<File | null>(null);
  const [admissionFile, setAdmissionFile] = useState<File | null>(null);
  const [portraitFile, setPortraitFile] = useState<File | null>(null);
  const [data, setData] = useState<ApplicationData>({
    ...emptyData,
    selectedPlan: initialPlan,
  });

  const canContinuePrecheck = passportReady && admissionReady;
  const canContinueCustomerType = customerType !== "";

  const canContinueStep = useMemo(() => {
    if (wizardStep === 1) {
      return (
        !!data.selectedPlan &&
        !!data.previousInsuredWhere &&
        !!data.insuranceType &&
        data.previousProviderName.trim().length > 1
      );
    }
    if (wizardStep === 2) {
      const emailValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email.trim());
      const phoneValid = data.phoneNumber.replace(/\D/g, "").length >= 6;
      return (
        !!data.reasonToStay &&
        !!data.title &&
        !!data.gender &&
        data.firstName.trim().length > 1 &&
        data.lastName.trim().length > 1 &&
        emailValid &&
        data.phoneDialCode.replace(/\D/g, "").length > 0 &&
        phoneValid &&
        data.acceptedStep2Terms
      );
    }
    if (wizardStep === 3) {
      return (
        !!passportFile &&
        data.passportNumber.trim().length > 2 &&
        data.confirmPassportNumber.trim().length > 2 &&
        data.passportNumber.trim() === data.confirmPassportNumber.trim() &&
        !!data.dateOfBirth &&
        !!data.countryOfBirth &&
        !!data.placeOfBirth &&
        !!data.nationality
      );
    }
    if (wizardStep === 4) {
      return (
        data.streetNo.trim().length > 2 &&
        data.city.trim().length > 1 &&
        data.country.trim().length > 1 &&
        data.postalCode.trim().length > 2 &&
        data.maritalStatus.trim().length > 0 &&
        data.coInsureDependents !== ""
      );
    }
    if (wizardStep === 5) {
      return (
        data.studyWorkName.trim().length > 1 &&
        data.studyWorkCity.trim().length > 1 &&
        data.studyWorkStreet.trim().length > 1 &&
        data.studyWorkPostalCode.trim().length > 2 &&
        !!data.studyWorkStartDate &&
        !!data.studyWorkEndDate
      );
    }
    if (wizardStep === 6) {
      return !!admissionFile && !!portraitFile;
    }
    return data.acceptedFinalTerms && data.acceptedFinalPrivacy;
  }, [admissionFile, data, passportFile, portraitFile, wizardStep]);

  const setField = <K extends keyof ApplicationData>(
    key: K,
    value: ApplicationData[K]
  ) => {
    setData((prev) => ({ ...prev, [key]: value }));
  };

  const goBack = () => {
    if (phase === "wizard" && wizardStep > 1) {
      setWizardStep((prev) => prev - 1);
      return;
    }
    if (phase === "wizard" && wizardStep === 1) {
      setPhase("customerType");
      return;
    }
    if (phase === "customerType") {
      setPhase("precheck");
    }
  };

  const goNext = () => {
    if (phase === "precheck" && canContinuePrecheck) {
      setPhase("customerType");
      return;
    }
    if (phase === "customerType" && canContinueCustomerType) {
      setPhase("wizard");
      setWizardStep(1);
      return;
    }
    if (phase === "wizard" && canContinueStep && wizardStep < 7) {
      setWizardStep((prev) => prev + 1);
    }
  };

  const submitLaterMessage = () => {
    alert("Final submission will be enabled in the next step.");
  };

  return (
    <div className="bg-[radial-gradient(circle_at_20%_0%,#f8f1ff_0,#fbf7ff_38%,#fbf7ff_100%)] min-h-screen py-6 md:py-10">
      <div className="max-w-6xl mx-auto px-4 md:px-6">
        <AnimatePresence mode="wait">
        {phase === "precheck" && (
          <motion.section key="phase-precheck" {...fadeInUp} className={`${cardBaseClass} p-5 md:p-7`}>
            <h1 className="text-2xl md:text-3xl font-semibold text-[#531D6F]">Pre-check</h1>
            <p className="mt-4 rounded-xl bg-[#f8f1ff] text-[#7a52a8] p-3.5 text-sm md:text-base">
              Please note that you will need the following documents to book your insurance.
            </p>

            <h2 className="mt-6 text-xl md:text-2xl font-semibold text-[#531D6F]">
              Your documents (required)
            </h2>
            <p className="mt-2 text-[#7a52a8] text-sm md:text-base">
              Please confirm each required document is ready before you continue.
            </p>

            <div className="mt-5 space-y-3">
              <label className="flex items-center gap-3 text-base text-[#5f2a7a] font-medium">
                <input
                  type="checkbox"
                  checked={passportReady}
                  onChange={(e) => setPassportReady(e.target.checked)}
                  className="h-5 w-5 rounded border-[#c9a6e8]"
                />
                Passport <span className="text-red-500">*</span>
              </label>
              <label className="flex items-center gap-3 text-base text-[#5f2a7a] font-medium">
                <input
                  type="checkbox"
                  checked={admissionReady}
                  onChange={(e) => setAdmissionReady(e.target.checked)}
                  className="h-5 w-5 rounded border-[#c9a6e8]"
                />
                Work contract / Admission letter <span className="text-red-500">*</span>
              </label>
            </div>
          </motion.section>
        )}

        {phase === "customerType" && (
          <motion.section key="phase-customerType" {...fadeInUp} className={`${cardBaseClass} p-5 md:p-7`}>
            <h1 className="text-2xl md:text-3xl font-semibold text-[#531D6F]">
              Get Started with your Statutory Health Insurance application
            </h1>
            <p className="mt-3 text-[#7a52a8] text-sm md:text-base">
              Fill in the form below to obtain your Statutory health insurance policy for German visa application.
            </p>

            <h2 className="mt-6 text-xl md:text-2xl font-semibold text-[#531D6F]">
              Are you a new or existing customer?
            </h2>
            <div className="mt-5 space-y-4">
              <OptionCard
                title="Existing Customer"
                description="Already have an account? Retrieve your information quickly."
                selected={customerType === "existing"}
                onClick={() => setCustomerType("existing")}
              />
              <OptionCard
                title="New Customer"
                description="First time here? Start your application from scratch."
                selected={customerType === "new"}
                onClick={() => setCustomerType("new")}
              />
            </div>
          </motion.section>
        )}

        {phase === "wizard" && (
          <motion.section key="phase-wizard" {...fadeInUp} className={`${cardBaseClass} p-4 md:p-7`}>
            <Stepper activeStep={wizardStep} />

            {wizardStep === 1 && (
              <StepCard title="Statutory Health Insurance Details" subtitle="Provide information about your statutory health insurance needs">
                <SectionTitle>Select your plan *</SectionTitle>
                <div className="mt-4 grid gap-4 md:grid-cols-2">
                  <PlanCard
                    name="AOK"
                    selected={data.selectedPlan === "AOK"}
                    points={["Over 120 AOK branches", "Wide range of programs", "Bonus and payback programs"]}
                    onClick={() => setField("selectedPlan", "AOK")}
                  />
                  <PlanCard
                    name="DAK"
                    selected={data.selectedPlan === "DAK"}
                    recommended
                    points={["HPV vaccination", "60€ pay back for dental cleaning", "Optional tariffs and bonus programs"]}
                    onClick={() => setField("selectedPlan", "DAK")}
                  />
                </div>

                <SectionTitle className="mt-8">Previous Insurance Details</SectionTitle>
                <div className="mt-3 grid gap-4 md:grid-cols-2">
                  <SelectField
                    label="Where were you previously insured? *"
                    value={data.previousInsuredWhere}
                    onChange={(value) =>
                      setField("previousInsuredWhere", value as ApplicationData["previousInsuredWhere"])
                    }
                    options={["Abroad", "Germany"]}
                  />
                  <SelectField
                    label="Type of Insurance *"
                    value={data.insuranceType}
                    onChange={(value) =>
                      setField("insuranceType", value as ApplicationData["insuranceType"])
                    }
                    options={[
                      "Travel Health Insurance",
                      "Statutory Health Insurance",
                      "Private Health Insurance",
                    ]}
                  />
                </div>
                <div className="mt-4">
                  <InputField
                    label="Previous Insurance Provider Name *"
                    value={data.previousProviderName}
                    onChange={(value) => setField("previousProviderName", value)}
                    placeholder="Enter provider name"
                  />
                </div>
              </StepCard>
            )}

            {wizardStep === 2 && (
              <StepCard title="Let's Get Started with your insurance application" subtitle="Fill in the form below to obtain your German Health Insurance for your visa application.">
                <div className="grid gap-4 md:grid-cols-2">
                  <SelectField
                    label="What is your reason to stay in Germany? *"
                    value={data.reasonToStay}
                    onChange={(value) => setField("reasonToStay", value)}
                    options={["Student", "Vocational Training", "Employee"]}
                  />
                  <SelectField
                    label="Title *"
                    value={data.title}
                    onChange={(value) => setField("title", value)}
                    options={["Mr.", "Ms.", "Mx."]}
                    placeholder="Please select your title"
                  />
                  <SelectField
                    label="Gender *"
                    value={data.gender}
                    onChange={(value) => setField("gender", value)}
                    options={["Male", "Female", "Other"]}
                    placeholder="Please select your gender"
                  />
                  <InputField
                    label="First name *"
                    value={data.firstName}
                    onChange={(value) => setField("firstName", value)}
                    placeholder="e.g., John"
                  />
                  <InputField
                    label="Last name *"
                    value={data.lastName}
                    onChange={(value) => setField("lastName", value)}
                    placeholder="e.g., Doe"
                  />
                  <InputField
                    label="E-mail *"
                    type="email"
                    value={data.email}
                    onChange={(value) => setField("email", value)}
                    placeholder="e.g., name@example.com"
                  />
                </div>
                <div className="mt-4">
                  <PhoneField
                    dialCode={data.phoneDialCode}
                    number={data.phoneNumber}
                    onDialCodeChange={(value) => setField("phoneDialCode", value)}
                    onNumberChange={(value) => setField("phoneNumber", value)}
                  />
                </div>
                <label className="mt-6 flex items-start gap-3 text-[#7548a1]">
                  <input
                    type="checkbox"
                    checked={data.acceptedStep2Terms}
                    onChange={(e) => setField("acceptedStep2Terms", e.target.checked)}
                    className="h-5 w-5 mt-0.5"
                  />
                  <span>
                    You agree to our <span className="text-primary underline">Terms & Conditions</span>.
                  </span>
                </label>
              </StepCard>
            )}

            {wizardStep === 3 && (
              <StepCard title="Passport Information" subtitle="Upload your passport and verify the details below.">
                <div className="grid gap-4 md:grid-cols-2">
                  <FileField
                    label="Passport *"
                    file={passportFile}
                    onChange={setPassportFile}
                  />
                  <div className="space-y-4">
                    <InputField
                      label="Maiden Name"
                      value={data.maidenName}
                      onChange={(value) => setField("maidenName", value)}
                      placeholder="Enter maiden name (optional)"
                    />
                    <InputField
                      label="Passport Number *"
                      value={data.passportNumber}
                      onChange={(value) => setField("passportNumber", value)}
                    />
                    <InputField
                      label="Confirm Passport Number *"
                      value={data.confirmPassportNumber}
                      onChange={(value) => setField("confirmPassportNumber", value)}
                    />
                    <InputField
                      label="Date of Birth *"
                      type="date"
                      value={data.dateOfBirth}
                      onChange={(value) => setField("dateOfBirth", value)}
                    />
                    <InputField
                      label="Passport Issue Date"
                      type="date"
                      value={data.passportIssueDate}
                      onChange={(value) => setField("passportIssueDate", value)}
                    />
                    <SelectField
                      label="Country of Birth *"
                      value={data.countryOfBirth}
                      onChange={(value) => setField("countryOfBirth", value)}
                      options={["Germany", "India", "Pakistan", "Bangladesh", "Nepal", "Other"]}
                    />
                    <InputField
                      label="Place of Birth *"
                      value={data.placeOfBirth}
                      onChange={(value) => setField("placeOfBirth", value)}
                    />
                    <SelectField
                      label="Nationality *"
                      value={data.nationality}
                      onChange={(value) => setField("nationality", value)}
                      options={["German", "Indian", "Pakistani", "Bangladeshi", "Nepali", "Other"]}
                    />
                  </div>
                </div>
              </StepCard>
            )}

            {wizardStep === 4 && (
              <StepCard title="Continue with providing your address" subtitle="Fill the form below to obtain your German Health Insurance for Visa.">
                <SectionTitle>Address Details</SectionTitle>
                <div className="mt-3 grid gap-4 md:grid-cols-2">
                  <InputField label="Street & No. *" value={data.streetNo} onChange={(value) => setField("streetNo", value)} placeholder="e.g., Friedrichstrasse 123" />
                  <InputField label="Additional Address" value={data.additionalAddress} onChange={(value) => setField("additionalAddress", value)} placeholder="e.g., Apt 4B" />
                  <InputField label="City *" value={data.city} onChange={(value) => setField("city", value)} placeholder="e.g., Berlin" />
                  <InputField label="District / State" value={data.districtState} onChange={(value) => setField("districtState", value)} placeholder="e.g., Berlin" />
                  <InputField label="Country *" value={data.country} onChange={(value) => setField("country", value)} placeholder="e.g., Germany" />
                  <InputField label="Postal Code *" value={data.postalCode} onChange={(value) => setField("postalCode", value)} placeholder="e.g., 10115" />
                </div>
                <label className="mt-4 flex items-center gap-3 text-[#7548a1]">
                  <input
                    type="checkbox"
                    checked={data.alreadyInGermany}
                    onChange={(e) => setField("alreadyInGermany", e.target.checked)}
                    className="h-5 w-5"
                  />
                  I am already in Germany
                </label>
                <SectionTitle className="mt-8">Marital Status</SectionTitle>
                <div className="mt-3 space-y-4">
                  <SelectField
                    label="Marital Status *"
                    value={data.maritalStatus}
                    onChange={(value) => setField("maritalStatus", value)}
                    options={["Single", "Married", "Divorced", "Widowed"]}
                    placeholder="Please select your marital status"
                  />
                  <div>
                    <p className="mb-2 text-[#5f2a7a] font-semibold">
                      Do you want to co-insure your dependents living in Germany free of charge? *
                    </p>
                    <div className="grid gap-3 md:grid-cols-2">
                      <ToggleCard
                        selected={data.coInsureDependents === "yes"}
                        label="Yes"
                        onClick={() => setField("coInsureDependents", "yes")}
                      />
                      <ToggleCard
                        selected={data.coInsureDependents === "no"}
                        label="No"
                        onClick={() => setField("coInsureDependents", "no")}
                      />
                    </div>
                  </div>
                </div>
              </StepCard>
            )}

            {wizardStep === 5 && (
              <StepCard title="Study / Work Details" subtitle="Please provide your university or company details.">
                <div className="grid gap-4 md:grid-cols-2">
                  <InputField label="Name *" value={data.studyWorkName} onChange={(value) => setField("studyWorkName", value)} placeholder="University / Company Name" />
                  <InputField label="City *" value={data.studyWorkCity} onChange={(value) => setField("studyWorkCity", value)} placeholder="e.g., Berlin" />
                  <InputField label="Street *" value={data.studyWorkStreet} onChange={(value) => setField("studyWorkStreet", value)} placeholder="e.g., Main St 10" />
                  <InputField label="Postal Code *" value={data.studyWorkPostalCode} onChange={(value) => setField("studyWorkPostalCode", value)} placeholder="e.g., 10115" />
                  <InputField label="Start Date *" type="date" value={data.studyWorkStartDate} onChange={(value) => setField("studyWorkStartDate", value)} />
                  <InputField label="End Date *" type="date" value={data.studyWorkEndDate} onChange={(value) => setField("studyWorkEndDate", value)} />
                </div>
              </StepCard>
            )}

            {wizardStep === 6 && (
              <StepCard title="Supporting Documents" subtitle="Upload all required supporting files before continuing.">
                <div className="grid gap-4 md:grid-cols-2">
                  <FileField
                    label="Admission Letter / Work Contract *"
                    file={admissionFile}
                    onChange={setAdmissionFile}
                  />
                  <FileField
                    label="Portrait Photo *"
                    file={portraitFile}
                    onChange={setPortraitFile}
                  />
                </div>
              </StepCard>
            )}

            {wizardStep === 7 && (
              <StepCard title="Review and Declaration" subtitle="Please review your statutory health insurance details carefully before submitting.">
                <ReviewGrid data={data} />
                <div className="mt-8 space-y-3">
                  <label className="flex items-start gap-3 text-[#7548a1]">
                    <input
                      type="checkbox"
                      checked={data.acceptedFinalTerms}
                      onChange={(e) => setField("acceptedFinalTerms", e.target.checked)}
                      className="h-5 w-5 mt-0.5"
                    />
                    I confirm and read the <span className="text-primary underline">Terms & Conditions</span>.
                  </label>
                  <label className="flex items-start gap-3 text-[#7548a1]">
                    <input
                      type="checkbox"
                      checked={data.acceptedFinalPrivacy}
                      onChange={(e) => setField("acceptedFinalPrivacy", e.target.checked)}
                      className="h-5 w-5 mt-0.5"
                    />
                    I confirm and read the <span className="text-primary underline">Data Protection and Privacy Policy</span>.
                  </label>
                </div>
              </StepCard>
            )}
          </motion.section>
        )}
        </AnimatePresence>

        <div className="mt-6 flex flex-wrap items-center justify-center gap-3 md:gap-4">
          <button
            type="button"
            onClick={goBack}
            disabled={phase === "precheck"}
            className="px-6 py-2.5 rounded-xl border border-[#ead9fb] bg-white text-[#531D6F] font-semibold cursor-pointer transition hover:shadow-[0_6px_16px_rgba(130,10,209,0.18)] hover:-translate-y-0.5 disabled:opacity-45 disabled:cursor-not-allowed"
          >
            Back
          </button>

          {phase === "wizard" && wizardStep === 7 ? (
            <button
              type="button"
              onClick={submitLaterMessage}
              disabled={!canContinueStep}
              className="min-w-[220px] px-6 py-2.5 rounded-xl bg-[linear-gradient(135deg,#820ad1,#6b21a8)] text-white font-semibold cursor-pointer transition hover:shadow-[0_10px_20px_rgba(130,10,209,0.28)] hover:-translate-y-0.5 disabled:bg-[#cfd8e6] disabled:shadow-none disabled:translate-y-0 disabled:cursor-not-allowed"
            >
              Book now
            </button>
          ) : (
            <button
              type="button"
              onClick={goNext}
              disabled={
                (phase === "precheck" && !canContinuePrecheck) ||
                (phase === "customerType" && !canContinueCustomerType) ||
                (phase === "wizard" && !canContinueStep)
              }
              className="min-w-[220px] px-6 py-2.5 rounded-xl bg-[linear-gradient(135deg,#820ad1,#6b21a8)] text-white font-semibold cursor-pointer transition hover:shadow-[0_10px_20px_rgba(130,10,209,0.28)] hover:-translate-y-0.5 disabled:bg-[#cfd8e6] disabled:shadow-none disabled:translate-y-0 disabled:cursor-not-allowed"
            >
              Further
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

function Stepper({ activeStep }: { activeStep: number }) {
  return (
    <div className="mb-6 overflow-x-auto">
      <div className="min-w-[880px] flex items-center gap-2">
        {stepItems.map((label, index) => {
          const stepNumber = index + 1;
          const isActive = stepNumber === activeStep;
          const isDone = stepNumber < activeStep;
          return (
            <div key={label} className="flex items-center flex-1">
              <div className="flex items-center gap-2">
                <div
                  className={`h-7 w-7 rounded-full flex items-center justify-center text-xs font-semibold ${
                    isActive
                      ? "bg-[#820ad1] text-white"
                      : isDone
                      ? "bg-[#531D6F] text-white"
                      : "bg-white border border-[#c9a6e8] text-[#531D6F]"
                  }`}
                >
                  {stepNumber}
                </div>
                <span className="text-[#6b3a8f] whitespace-nowrap text-sm">{label}</span>
              </div>
              {stepNumber < stepItems.length && (
                <div className="mx-2 h-px flex-1 bg-[#ead9fb]" />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

function StepCard({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle: string;
  children: React.ReactNode;
}) {
  return (
    <motion.div
      key={title}
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.22, ease: "easeOut" }}
      className="rounded-2xl border border-[#efe3fb] bg-gradient-to-b from-white to-[#fdfaff] p-4 md:p-6 shadow-[0_10px_26px_rgba(130,10,209,0.12)]"
    >
      <h2 className="text-xl md:text-2xl font-semibold text-[#531D6F]">{title}</h2>
      <p className="mt-1.5 text-[#8a67b6] text-sm md:text-base">{subtitle}</p>
      <div className="mt-5">{children}</div>
    </motion.div>
  );
}

function SectionTitle({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return <h3 className={`text-lg md:text-xl font-semibold text-[#531D6F] ${className}`}>{children}</h3>;
}

function OptionCard({
  title,
  description,
  selected,
  onClick,
}: {
  title: string;
  description: string;
  selected: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`w-full text-left rounded-2xl border p-4 transition-all duration-200 cursor-pointer ${
        selected
          ? "border-primary bg-[#f5ecff] shadow-[0_8px_18px_rgba(0,0,255,0.14)]"
          : "border-[#ead9fb] bg-white hover:border-[#c9a6e8] hover:-translate-y-0.5 hover:shadow-[0_10px_18px_rgba(130,10,209,0.14)]"
      }`}
    >
      <p className="text-lg md:text-xl font-semibold text-[#531D6F]">{title}</p>
      <p className="text-[#7a52a8] mt-1 text-sm md:text-base">{description}</p>
    </button>
  );
}

function PlanCard({
  name,
  points,
  selected,
  recommended = false,
  onClick,
}: {
  name: string;
  points: string[];
  selected: boolean;
  recommended?: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`text-left rounded-2xl border p-4 transition-all duration-200 cursor-pointer ${
        selected
          ? "border-[#a65de0] bg-[#f5ecff] shadow-[0_10px_22px_rgba(130,10,209,0.20)]"
          : "border-[#ead9fb] bg-white hover:border-[#c9a6e8] hover:-translate-y-0.5 hover:shadow-[0_10px_20px_rgba(130,10,209,0.12)]"
      }`}
    >
      <div className="flex items-center justify-between gap-3">
        <p className="text-2xl font-semibold text-[#531D6F]">{name}</p>
        {recommended && (
          <span className="rounded-full bg-[#d9b3ff] px-3 py-1 text-sm text-[#5f2a7a] font-semibold">
            Recommended
          </span>
        )}
      </div>
      <ul className="mt-3 space-y-1 text-sm">
        {points.map((point) => (
          <li key={point} className="flex items-center gap-2 text-[#7a52a8]">
            <Check className="w-4 h-4 text-[#a65de0]" />
            <span>{point}</span>
          </li>
        ))}
      </ul>
    </button>
  );
}

function InputField({
  label,
  value,
  onChange,
  placeholder,
  type = "text",
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  type?: string;
}) {
  return (
    <label className="block">
      <span className="block mb-1 text-[#5f2a7a] text-sm font-semibold">{label}</span>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full h-11 rounded-xl border border-[#ead9fb] bg-[#fbf7ff] px-3.5 text-sm text-[#6b3a8f] outline-none transition focus:ring-2 focus:ring-[#c9a6e8]"
      />
    </label>
  );
}

function SelectField({
  label,
  value,
  onChange,
  options,
  placeholder,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  options: string[];
  placeholder?: string;
}) {
  return (
    <label className="block">
      <span className="block mb-1 text-[#5f2a7a] text-sm font-semibold">{label}</span>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full h-11 rounded-xl border border-[#ead9fb] bg-[#fbf7ff] px-3.5 text-sm text-[#6b3a8f] outline-none transition focus:ring-2 focus:ring-[#c9a6e8]"
      >
        <option value="">{placeholder ?? "Please select"}</option>
        {options.map((opt) => (
          <option key={opt} value={opt}>
            {opt}
          </option>
        ))}
      </select>
    </label>
  );
}

function PhoneField({
  dialCode,
  number,
  onDialCodeChange,
  onNumberChange,
}: {
  dialCode: string;
  number: string;
  onDialCodeChange: (value: string) => void;
  onNumberChange: (value: string) => void;
}) {
  const flag = dialCodeToFlagEmoji(dialCode);
  return (
    <div>
      <p className="mb-1 text-[#5f2a7a] text-sm font-semibold">Phone Number *</p>
      <div className="flex gap-2">
        <div className="w-[130px] h-11 rounded-xl border border-[#ead9fb] bg-[#fbf7ff] px-3 flex items-center gap-2">
          <span className="text-lg">{flag}</span>
          <input
            type="text"
            value={dialCode}
            onChange={(e) => onDialCodeChange(normalizeDialCode(e.target.value))}
            className="w-full bg-transparent text-sm text-[#6b3a8f] outline-none"
            placeholder="+1"
          />
        </div>
        <input
          type="tel"
          value={number}
          onChange={(e) => onNumberChange(e.target.value.replace(/[^\d\s-]/g, ""))}
          className="flex-1 h-11 rounded-xl border border-[#ead9fb] bg-[#fbf7ff] px-3.5 text-sm text-[#6b3a8f] outline-none focus:ring-2 focus:ring-[#c9a6e8]"
          placeholder="Enter phone number"
        />
      </div>
    </div>
  );
}

function FileField({
  label,
  file,
  onChange,
}: {
  label: string;
  file: File | null;
  onChange: (file: File | null) => void;
}) {
  return (
    <div>
      <p className="mb-2 text-[#5f2a7a] text-sm font-semibold">{label}</p>
      <label className="h-36 rounded-2xl border-2 border-dashed border-[#c9a6e8] bg-[#fbf7ff] flex flex-col items-center justify-center gap-2 cursor-pointer transition hover:bg-[#f5ecff]">
        <Upload className="w-6 h-6 text-primary" />
        <span className="text-[#531D6F] text-sm font-semibold">
          {file ? "Click to replace file" : "Click to upload"}
        </span>
        <span className="text-[#9b79c2] text-sm">PNG, PDF, JPG (max 5MB)</span>
        <input
          type="file"
          accept=".png,.jpg,.jpeg,.pdf"
          className="hidden"
          onChange={(e) => onChange(e.target.files?.[0] ?? null)}
        />
      </label>
      <p className="mt-2 text-sm text-[#8a67b6] min-h-5">{file?.name ?? ""}</p>
    </div>
  );
}

function ToggleCard({
  selected,
  label,
  onClick,
}: {
  selected: boolean;
  label: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`h-11 rounded-xl border text-left px-4 text-sm font-semibold cursor-pointer transition-all duration-200 ${
        selected
          ? "border-primary bg-[#f5ecff] text-[#531D6F]"
          : "border-[#ead9fb] bg-white text-[#7a52a8] hover:border-[#c9a6e8]"
      }`}
    >
      {label}
    </button>
  );
}

function ReviewGrid({ data }: { data: ApplicationData }) {
  return (
    <div className="rounded-xl border border-[#ead9fb] bg-[#fdfaff] p-4 md:p-6">
      <div className="grid gap-3 md:grid-cols-2 text-[#6b3a8f] text-sm">
        <ReviewItem label="Provider" value={data.selectedPlan} />
        <ReviewItem label="Previously insured" value={data.previousInsuredWhere} />
        <ReviewItem label="Insurance type" value={data.insuranceType} />
        <ReviewItem label="Previous provider" value={data.previousProviderName} />
        <ReviewItem label="First name" value={data.firstName} />
        <ReviewItem label="Last name" value={data.lastName} />
        <ReviewItem label="E-mail" value={data.email} />
        <ReviewItem label="Phone" value={`${data.phoneDialCode} ${data.phoneNumber}`} />
        <ReviewItem label="Passport number" value={data.passportNumber} />
        <ReviewItem label="Date of birth" value={data.dateOfBirth} />
        <ReviewItem label="Country of birth" value={data.countryOfBirth} />
        <ReviewItem label="Nationality" value={data.nationality} />
        <ReviewItem label="Street" value={data.streetNo} />
        <ReviewItem label="City" value={data.city} />
        <ReviewItem label="Postal code" value={data.postalCode} />
        <ReviewItem label="Country" value={data.country} />
      </div>
    </div>
  );
}

function ReviewItem({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-sm text-[#a786cc]">{label}</p>
      <p className="text-base">{value || "-"}</p>
    </div>
  );
}



