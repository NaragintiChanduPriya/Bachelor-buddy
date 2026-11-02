import type { SavingsByRecommendation, SavingsHistoryPoint } from '@/types/savings'
import type { BudgetCategoryId } from '@/types/budget'
import { daysAgo, monthKeyOffset } from '../clock'
import { formatMonthLabel } from '@/utils/date'

/** Six months of history trending up toward the ₹8,000 goal. */
const rawHistory = [2100, 3400, 4600, 5800, 6900, 7600]

export const savingsHistoryPoints: SavingsHistoryPoint[] = rawHistory.map((saved, index) => {
  const month = monthKeyOffset(index - 6)
  return { month, monthLabel: formatMonthLabel(month), saved, goal: 8000 }
})

/** What the user has saved so far this month, by where the saving came from. */
export const currentMonthSavingsByCategory: Array<{
  category: BudgetCategoryId
  saved: number
}> = [
  { category: 'food', saved: 2250 },
  { category: 'groceries', saved: 820 },
  { category: 'shopping', saved: 1800 },
  { category: 'travel', saved: 870 },
  { category: 'misc', saved: 1080 },
  { category: 'bills', saved: 160 },
]

export const followedRecommendations: SavingsByRecommendation[] = [
  {
    id: 'rec_001',
    title: 'Switched weekday lunch from delivery to Annapoorna Mess',
    agent: 'food',
    saved: 1680,
    followedAt: daysAgo(12),
  },
  {
    id: 'rec_002',
    title: 'One monthly grocery stock-up instead of small quick-commerce orders',
    agent: 'grocery',
    saved: 820,
    followedAt: daysAgo(9),
  },
  {
    id: 'rec_003',
    title: 'Waited for the sale on a pair of jeans',
    agent: 'shopping',
    saved: 700,
    followedAt: daysAgo(6),
  },
  {
    id: 'rec_004',
    title: 'Used the HDFC card offer on an electronics order',
    agent: 'deals',
    saved: 340,
    followedAt: daysAgo(4),
  },
  {
    id: 'rec_005',
    title: 'Bought a BMTC monthly pass instead of daily bike taxis',
    agent: 'budget',
    saved: 870,
    followedAt: daysAgo(14),
  },
]
