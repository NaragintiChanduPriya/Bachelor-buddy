import type { BudgetCategoryId } from './budget'

export interface SavingsByCategory {
  category: BudgetCategoryId
  label: string
  saved: number
  percentOfTotal: number
}

export interface SavingsByRecommendation {
  id: string
  title: string
  agent: string
  saved: number
  followedAt: string
}

export interface MonthlySavings {
  month: string
  monthLabel: string
  saved: number
  goal: number
  percentOfGoal: number
  onTrack: boolean
  projectedByMonthEnd: number
  byCategory: SavingsByCategory[]
  byRecommendation: SavingsByRecommendation[]
  headline: string
}

export interface SavingsHistoryPoint {
  month: string
  monthLabel: string
  saved: number
  goal: number
}

export interface SavingsHistory {
  months: SavingsHistoryPoint[]
  averageSaved: number
  bestMonth: string
  totalSaved: number
  trendPercent: number
  summary: string
}
