import { apiGet, apiPost, apiPut } from '../client'
import type { Budget } from '@/types/budget'
import type { User, UserPreferences } from '@/types/user'

export interface OnboardingPayload {
  salary: number
  savingsGoal: number
  homeAreaId: string
  officeAreaId: string
  techParkId: string | null
  foodPreference: UserPreferences['foodPreference']
  cards: UserPreferences['cards']
}

export interface OnboardingResult {
  user: User
  budget: Budget
}

export const userService = {
  getMe: () => apiGet<User>('/me'),
  completeOnboarding: (payload: OnboardingPayload) =>
    apiPost<OnboardingResult>('/onboarding', payload),
  updatePreferences: (payload: Partial<OnboardingPayload>) =>
    apiPut<User>('/me/preferences', payload),
}
