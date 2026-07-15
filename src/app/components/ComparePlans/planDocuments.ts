export type PlanDocumentCategory = "premium" | "expat";

export interface PlanDocument {
  id: string;
  title: string;
  fileName: string;
  file: string;
}

export const PLAN_DOCUMENTS: Record<PlanDocumentCategory, PlanDocument[]> = {
  premium: [
    {
      id: "premium-xl-coverage",
      title: "XL Coverage",
      fileName: "premium-xl.pdf",
      file: "https://www.hallesche.de/pm253u-e-0822.pdf",
    },
    {
      id: "premium-bonus-tariff",
      title: "Bonus Tariff",
      fileName: "premium-bonus.pdf",
      file:
        "https://www.hallesche.de/beratungsblatt-bonus-tariffs-pm156e.pdf",
    },
    {
      id: "premium-flex-coverage",
      title: "Flex Coverage",
      fileName: "premium-flex.pdf",
      file: "https://www.hallesche.de/pm256u-e-0922.pdf",
    },
  ],
  expat: [
    {
      id: "expat-hi-medical",
      title: "HI Medical",
      fileName: "expat-medical.pdf",
      file: "https://www.hallesche.de/bedingungen-hi-medical-l-pm247u-e.pdf",
    },
    {
      id: "expat-hi-dental",
      title: "HI Dental",
      fileName: "expat-dental.pdf",
      file: "https://www.hallesche.de/bedingungen-hi-dental-l-pm249u-e.pdf",
    },
  ],
};

export const PLAN_ID_TO_DOCUMENT_CATEGORY: Record<
  string,
  PlanDocumentCategory | undefined
> = {
  "hallesche-premium": "premium",
  "hallesche-expat": "expat",
};

export const ALL_PLAN_DOCUMENTS = Object.values(PLAN_DOCUMENTS).flat();

export function getPlanDocumentsByPlanId(planId: string): PlanDocument[] {
  const category = PLAN_ID_TO_DOCUMENT_CATEGORY[planId];
  if (!category) return [];
  return PLAN_DOCUMENTS[category];
}
