import { apiGet } from '../client'
import type { MonthlySavings, SavingsHistory } from '@/types/savings'

export const savingsService = {
  getMonthly: (month?: string) =>
    apiGet<MonthlySavings>('/savings/monthly', month ? { month } : undefined),
  getHistory: (months = 6) => apiGet<SavingsHistory>('/savings/history', { months }),
}
