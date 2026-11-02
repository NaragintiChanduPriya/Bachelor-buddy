import { apiGet, apiPut } from '../client'
import type { Budget, UpdateBudgetRequest } from '@/types/budget'

export const budgetService = {
  getCurrent: () => apiGet<Budget>('/budget/current'),
  update: (payload: UpdateBudgetRequest) => apiPut<Budget>('/budget/current', payload),
}
