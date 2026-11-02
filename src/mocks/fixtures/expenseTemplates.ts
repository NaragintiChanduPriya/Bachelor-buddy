import type { BudgetCategoryId } from '@/types/budget'
import type { ExpenseSource } from '@/types/expense'

export interface ExpenseTemplate {
  title: string
  merchant: string | null
  amount: number
  source: ExpenseSource
  note?: string
}

/**
 * Realistic Bangalore line items per category. The generator picks from these until each
 * category reaches its target spend, so the totals in budgetLimits.ts always hold.
 * All brands are invented, except the banks used for card offers elsewhere.
 */
export const expenseTemplates: Record<BudgetCategoryId, ExpenseTemplate[]> = {
  rent: [
    { title: 'Room rent — shared flat', merchant: 'HSR Layout flat', amount: 14000, source: 'recurring' },
  ],
  food: [
    { title: 'Breakfast — idli vada', merchant: 'Sri Ganesh Tiffin Room', amount: 60, source: 'manual' },
    { title: 'Filter coffee', merchant: 'Sri Ganesh Tiffin Room', amount: 20, source: 'manual' },
    { title: 'Lunch — full meals', merchant: 'Annapoorna Mess', amount: 120, source: 'manual' },
    { title: 'Masala dosa', merchant: 'Udupi Corner Darshini', amount: 70, source: 'manual' },
    { title: 'Dinner delivery', merchant: 'FeastDrop', amount: 340, source: 'delivery', note: 'Incl. delivery, platform and packaging fees' },
    { title: 'Late-night biryani delivery', merchant: 'QuickBite', amount: 395, source: 'delivery', note: 'Incl. all fees' },
    { title: 'Office lunch — veg thali', merchant: 'Bellandur Food Court', amount: 150, source: 'manual' },
    { title: 'Evening chai and snacks', merchant: 'Tea Tapri', amount: 45, source: 'manual' },
    { title: 'Weekend brunch', merchant: 'Brew & Bite Cafe', amount: 420, source: 'manual' },
    { title: 'Curd rice and pickle', merchant: 'Annapoorna Mess', amount: 90, source: 'manual' },
    { title: 'Office canteen lunch', merchant: 'Orbit Tech Campus canteen', amount: 110, source: 'manual' },
    { title: 'Chapati sabzi dinner', merchant: 'Namma Mess', amount: 100, source: 'manual' },
  ],
  groceries: [
    { title: 'Monthly rice and dal stock-up', merchant: 'ZipCart', amount: 760, source: 'manual' },
    { title: 'Milk and curd', merchant: 'Local kirana', amount: 140, source: 'manual' },
    { title: 'Vegetables', merchant: 'HSR weekly market', amount: 230, source: 'manual' },
    { title: 'Coffee powder and sugar', merchant: 'FreshMart Supermarket', amount: 290, source: 'manual' },
    { title: 'Toiletries', merchant: 'ZipCart', amount: 260, source: 'manual' },
  ],
  shopping: [
    { title: 'Cotton T-shirt', merchant: 'TrendKart', amount: 449, source: 'manual' },
    { title: 'Phone cable', merchant: 'ShopNest', amount: 251, source: 'manual' },
  ],
  travel: [
    { title: 'BMTC bus pass', merchant: 'BMTC', amount: 600, source: 'recurring' },
    { title: 'Metro card top-up', merchant: 'Namma Metro', amount: 300, source: 'manual' },
    { title: 'Bike taxi to office', merchant: 'ZipRide', amount: 68, source: 'manual' },
    { title: 'Auto to Koramangala', merchant: 'Auto', amount: 90, source: 'manual' },
    { title: 'Petrol', merchant: 'Fuel stop', amount: 250, source: 'manual' },
  ],
  bills: [
    { title: 'Wi-Fi share', merchant: 'Flatmates', amount: 420, source: 'recurring' },
    { title: 'Electricity share', merchant: 'BESCOM', amount: 480, source: 'recurring' },
    { title: 'Mobile recharge', merchant: 'Telecom', amount: 299, source: 'recurring' },
    { title: 'Streaming subscription', merchant: 'StreamNest', amount: 141, source: 'subscription' },
  ],
  misc: [
    { title: 'Cook salary share', merchant: 'Flat cook', amount: 500, source: 'recurring' },
    { title: 'Maid salary share', merchant: 'Flat maid', amount: 300, source: 'recurring' },
    { title: 'Haircut', merchant: 'Style Studio', amount: 120, source: 'manual' },
  ],
  savings: [],
}
