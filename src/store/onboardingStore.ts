import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { FoodPreference, SavedCard } from '@/types/user'

export interface OnboardingDraft {
  salary: number | null
  savingsGoal: number | null
  homeAreaId: string
  officeAreaId: string
  techParkId: string | null
  foodPreference: FoodPreference | null
  cards: SavedCard[]
}

interface OnboardingState {
  step: number
  draft: OnboardingDraft
  setStep: (step: number) => void
  next: () => void
  back: () => void
  patch: (values: Partial<OnboardingDraft>) => void
  reset: () => void
}

export const TOTAL_STEPS = 4

const emptyDraft: OnboardingDraft = {
  salary: null,
  savingsGoal: null,
  homeAreaId: '',
  officeAreaId: '',
  techParkId: null,
  foodPreference: null,
  cards: [],
}

/** Progress is persisted so a refresh mid-signup does not lose what was typed. */
export const useOnboardingStore = create<OnboardingState>()(
  persist(
    (set) => ({
      step: 0,
      draft: emptyDraft,
      setStep: (step) => set({ step }),
      next: () => set((s) => ({ step: Math.min(s.step + 1, TOTAL_STEPS) })),
      back: () => set((s) => ({ step: Math.max(s.step - 1, 0) })),
      patch: (values) => set((s) => ({ draft: { ...s.draft, ...values } })),
      reset: () => set({ step: 0, draft: emptyDraft }),
    }),
    {
      name: 'bb-onboarding',
      // Persist what was typed, but not which step they were on: restoring the step would
      // drop a returning user into the middle of a form with no visible way back to the start.
      partialize: (s) => ({ draft: s.draft }),
    },
  ),
)
