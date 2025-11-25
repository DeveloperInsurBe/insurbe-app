// app/stores/journeyStore.ts
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface JourneyState {
  // Journey data
  employmentStatus: string;
  otherEmployment: string;
  incomeRange: string;
  email: string;
  phone: string;
  selectedCountry: string;
  dob: string; // Added DOB to interface
  
  // Actions
  setEmploymentStatus: (status: string) => void;
  setOtherEmployment: (other: string) => void;
  setIncomeRange: (range: string) => void;
  setEmail: (email: string) => void;
  setPhone: (phone: string) => void;
  setSelectedCountry: (country: string) => void;
  setDob: (dob: string) => void; // Added DOB setter to interface
  setJourneyData: (data: Partial<JourneyState>) => void;
  clearJourneyData: () => void;
}

export const useJourneyStore = create<JourneyState>()(
  persist(
    (set) => ({
      // Initial state
      employmentStatus: '',
      otherEmployment: '',
      incomeRange: '',
      email: '',
      phone: '',
      selectedCountry: '',
      dob: '', // Added DOB initial state

      // Actions
      setEmploymentStatus: (status) => set({ employmentStatus: status }),
      setOtherEmployment: (other) => set({ otherEmployment: other }),
      setIncomeRange: (range) => set({ incomeRange: range }),
      setEmail: (email) => set({ email }),
      setPhone: (phone) => set({ phone }),
      setSelectedCountry: (country) => set({ selectedCountry: country }),
      setDob: (dob) => set({ dob }), // Added DOB setter
      
      setJourneyData: (data) => set((state) => ({ ...state, ...data })),
      
      clearJourneyData: () => set({
        employmentStatus: '',
        otherEmployment: '',
        incomeRange: '',
        email: '',
        phone: '',
        selectedCountry: '',
        dob: '', // Added DOB to clear function
      }),
    }),
    {
      name: 'journey-storage', // localStorage key
    }
  )
);
