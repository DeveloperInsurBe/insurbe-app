// app/stores/journeyStore.ts
import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

export interface Product {
  id: string;
  name: string;
  provider: string;
  description: string;
  features: string[];
  tariffIds?: string[];
  documentCount?: number;
  loading: boolean;
}

interface JourneyState {
  employmentStatus: string;
  otherEmployment: string;
  incomeRange: string;
  actualIncome: number | null;
  email: string;
  phone: string;
  selectedCountry: string;
  dob: string;
  hasChildren: boolean | null;

  availableProducts: Product[];

  // ✅ FIX: store full product instead of string
  selectedPlan: Product | null;

  setEmploymentStatus: (status: string) => void;
  setOtherEmployment: (other: string) => void;
  setIncomeRange: (range: string) => void;
  setActualIncome: (income: number | null) => void;
  setEmail: (email: string) => void;
  setPhone: (phone: string) => void;
  setSelectedCountry: (country: string) => void;
  setDob: (dob: string) => void;
  setHasChildren: (hasChildren: boolean | null) => void;

  setAvailableProducts: (products: Product[]) => void;

  // ✅ FIX: accept Product
  setSelectedPlan: (plan: Product | null) => void;

  setJourneyData: (data: Partial<JourneyState>) => void;
  clearJourneyData: () => void;
}

export const useJourneyStore = create<JourneyState>()(
  persist(
    (set) => ({
      employmentStatus: "",
      otherEmployment: "",
      incomeRange: "",
      actualIncome: null,
      email: "",
      phone: "",
      selectedCountry: "",
      dob: "",
      hasChildren: null,

      availableProducts: [],
      selectedPlan: null,

      setEmploymentStatus: (status) => set({ employmentStatus: status }),
      setOtherEmployment: (other) => set({ otherEmployment: other }),
      setIncomeRange: (range) => set({ incomeRange: range }),
      setActualIncome: (income) => set({ actualIncome: income }),
      setEmail: (email) => set({ email }),
      setPhone: (phone) => set({ phone }),
      setSelectedCountry: (country) => set({ selectedCountry: country }),
      setDob: (dob) => set({ dob }),
      setHasChildren: (hasChildren) => set({ hasChildren }),

      setAvailableProducts: (products) => set({ availableProducts: products }),

      // ✅ store full plan
      setSelectedPlan: (plan) => set({ selectedPlan: plan }),

      setJourneyData: (data) =>
        set((state) => ({
          ...state,
          ...data,
        })),

      clearJourneyData: () =>
        set({
          employmentStatus: "",
          otherEmployment: "",
          incomeRange: "",
          actualIncome: null,
          email: "",
          phone: "",
          selectedCountry: "",
          dob: "",
          hasChildren: null,
          availableProducts: [],
          selectedPlan: null,
        }),
    }),
    {
      name: "journey-storage",
      storage: createJSONStorage(() => ({
        getItem: (name) => {
          const str = localStorage.getItem(name);
          return str ? JSON.parse(str) : null;
        },
        setItem: (name, value) => {
          try {
            const str = JSON.stringify(value);

            if (str.length > 5000000) {
              console.warn(
                "Data too large for localStorage, skipping persist"
              );
              return;
            }

            localStorage.setItem(name, str);
          } catch (e) {
            console.error("Failed to save to localStorage:", e);
          }
        },
        removeItem: (name) => localStorage.removeItem(name),
      })),
    }
  )
);