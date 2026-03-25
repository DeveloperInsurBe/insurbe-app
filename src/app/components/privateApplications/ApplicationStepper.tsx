"use client";

type StepKey =
  | "personalDetails"
  | "financialHistory"
  | "insuranceHistory"
  | "healthAnswers";

type Props = {
  currentStep: StepKey;
};

const steps = [
  { label: "Personal info", key: "personalDetails" },
  { label: "Financial history", key: "financialHistory" },
  { label: "Insurance history", key: "insuranceHistory" },
  { label: "Medical history", key: "healthAnswers" },
];

export default function ApplicationStepper({ currentStep }: Props) {
  return (
    <div className="w-full flex items-center justify-center gap-8 text-sm mb-10">
      {steps.map((step, i) => {
        const isActive = step.key === currentStep;

        return (
          <div key={step.key} className="flex items-center gap-2">
            <span
              className={`${
                isActive
                  ? "text-black font-semibold"
                  : "text-gray-400"
              }`}
            >
              {step.label}
            </span>
          </div>
        );
      })}
    </div>
  );
}