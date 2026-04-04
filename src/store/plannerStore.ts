import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { PlannerState } from '../lib/math';

const DEFAULT_STATE: PlannerState = {
  step: 1,
  tab: 1,

  name: '',
  age: 0,
  retAge: 0,
  lifeE: 85,

  invMode: 'quick',
  invQuick: 0,
  invMF: 0,
  invEQ: 0,
  invPF: 0,
  invDT: 0,
  invGR: 10,
  salaryMonthly: 0,
  salaryGrowth: 7,
  addIncMode: 'quick',
  addIncQuick: 0,
  addIncRental: 0,
  addIncOther: 0,

  expMode: 'quick',
  expQMo: 0,
  expQYr: 0,
  expRent: 0,
  expEMI: 0,
  expGroc: 0,
  expTrav: 0,
  expUtil: 0,
  expEnt: 0,
  expHlth: 0,
  expHH: 0,
  expOMo: 0,
  expHol: 0,
  expIns: 0,
  expGad: 0,
  expClo: 0,
  expCins: 0,
  expDon: 0,
  expRep: 0,
  expOYr: 0,

  sipAmt: 0,
  sipMode: 'none',
  sipFixed: 0,
  sipReturn: 12,
  inflation: 6,

  dep: [],
  phases: [],
  phDep: {},
  phView: 'quick',
  phExpMode: {},
  phOpen: { 0: true },
  phInflAdj: {},

  discDismissed: false,

  kids: [],
  retSipAmt: 0,
  retSipMode: 'none',
  retSipFixed: 0,

  _id: 1,
  _kidId: 1,
};

interface PlannerStore {
  state: PlannerState;
  showErrors: boolean;
  nextRequested: boolean;
  update: (patch: Partial<PlannerState>) => void;
  setShowErrors: (v: boolean) => void;
  requestNext: () => void;
  clearNextRequest: () => void;
  reset: () => void;
}

export const usePlannerStore = create<PlannerStore>()(
  persist(
    (set) => ({
      state: DEFAULT_STATE,
      showErrors: false,
      nextRequested: false,
      update: (patch) => set((s) => ({ state: { ...s.state, ...patch } })),
      setShowErrors: (v) => set({ showErrors: v }),
      requestNext: () => set({ nextRequested: true }),
      clearNextRequest: () => set({ nextRequested: false }),
      reset: () => set({ state: DEFAULT_STATE, showErrors: false }),
    }),
    {
      name: 'corpuscalc-plan-v2',
      partialize: (s) => ({ state: s.state }), // don't persist UI state
    }
  )
);
