// app/stores/premiumStore.ts
import { create } from "zustand";

type Doc = {
  kurz?: string;
  base64: string;
};

type FormState = {
  title?: string;
  firstName?: string;
  lastName?: string;
  dob?: string;
  gender?: string;
  coverageStart?: string;
  employmentStatus?: string;
  planNameVersion?: string;
  age?: number | string;
  hasSchengenVisa?: "yes" | "no" | "";
};

type PremiumStore = {
  form: FormState;
  selectedPlanId?: string | null;
  premium: number | null;
  documents: Doc[];
  setForm: (patch: Partial<FormState>) => void;
  setSelectedPlan: (planId: string | null) => void;
  setPremium: (val: number | null) => void;
  setDocuments: (docs: Doc[]) => void;
  reset: () => void;
};

export const usePremiumStore = create<PremiumStore>((set) => ({
  form: {},
  selectedPlanId: null,
  premium: null,
  documents: [],
  setForm: (patch) => set((s) => ({ form: { ...s.form, ...patch } })),
  setSelectedPlan: (planId) => set({ selectedPlanId: planId }),
  setPremium: (val) => set({ premium: val }),
  setDocuments: (docs) => set({ documents: docs }),
  reset: () => set({ form: {}, selectedPlanId: null, premium: null, documents: [] }),
}));
