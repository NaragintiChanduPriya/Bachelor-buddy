import { apiDelete, apiGetPaginated, apiPost } from '../client'
import type { BudgetCategory } from '@/types/budget'
import type {
  CreateExpenseRequest,
  CreateExpenseResponse,
  Expense,
  ExpenseFilters,
  ExpenseListResponse,
} from '@/types/expense'
import type { Paginated } from '@/types/api'

export const expenseService = {
  list: async (
    filters: ExpenseFilters,
  ): Promise<Paginated<Expense> & { filteredTotal: number }> => {
    const { data, meta } = await apiGetPaginated<ExpenseListResponse>('/expenses', {
      month: filters.month,
      category: filters.category === 'all' ? undefined : filters.category,
      page: filters.page ?? 1,
      pageSize: filters.pageSize ?? 20,
    })
    return { items: data.expenses, meta, filteredTotal: data.filteredTotal }
  },
  create: (payload: CreateExpenseRequest) =>
    apiPost<CreateExpenseResponse>('/expenses', payload),
  remove: (id: string) => apiDelete<{ id: string; category: BudgetCategory }>(`/expenses/${id}`),
}
