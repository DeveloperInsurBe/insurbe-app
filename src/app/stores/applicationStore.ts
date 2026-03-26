import { create } from "zustand";

interface ApplicationState {
  application: any;

  setApplication: (data: any) => void;

  updateStep: (step: string, data: any) => void;

  clearApplication: () => void;
}

export const useApplicationStore = create<ApplicationState>((set) => ({
  application: null,

  setApplication: (data) => set({ application: data }),

  updateStep: (step, data) =>
  set((state) => ({
    application: {
      ...state.application,
      [step]: {
        ...state.application?.[step],
        ...data,
      },
    },
  })),

  clearApplication: () => set({ application: null }),
}));

