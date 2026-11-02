import type { MenuItem } from '@/types/food'

/** Menu building blocks, reused across listings with per-place price offsets. */
export interface MenuTemplate {
  name: string
  basePrice: number
  veg: boolean
  popular?: boolean
}

export const darshiniMenu: MenuTemplate[] = [
  { name: 'Idli (2 pcs)', basePrice: 40, veg: true, popular: true },
  { name: 'Vada (2 pcs)', basePrice: 45, veg: true },
  { name: 'Idli Vada combo', basePrice: 60, veg: true, popular: true },
  { name: 'Masala Dosa', basePrice: 70, veg: true, popular: true },
  { name: 'Plain Dosa', basePrice: 55, veg: true },
  { name: 'Rava Idli', basePrice: 50, veg: true },
  { name: 'Khara Bath', basePrice: 45, veg: true },
  { name: 'Kesari Bath', basePrice: 40, veg: true },
  { name: 'Filter Coffee', basePrice: 20, veg: true, popular: true },
  { name: 'Masala Tea', basePrice: 15, veg: true },
]

export const messMenu: MenuTemplate[] = [
  { name: 'Full Meals (unlimited rice)', basePrice: 120, veg: true, popular: true },
  { name: 'Mini Meals', basePrice: 90, veg: true, popular: true },
  { name: 'Chapati Meals (3 chapati + sabzi)', basePrice: 100, veg: true },
  { name: 'Curd Rice', basePrice: 60, veg: true },
  { name: 'Bisi Bele Bath', basePrice: 80, veg: true },
  { name: 'Ragi Mudde with Saaru', basePrice: 95, veg: true, popular: true },
  { name: 'Extra Palya', basePrice: 30, veg: true },
]

export const messNonVegMenu: MenuTemplate[] = [
  { name: 'Full Meals (veg)', basePrice: 120, veg: true, popular: true },
  { name: 'Chicken Curry Meals', basePrice: 180, veg: false, popular: true },
  { name: 'Egg Curry Meals', basePrice: 140, veg: false },
  { name: 'Fish Fry Meals', basePrice: 210, veg: false },
  { name: 'Chapati Meals', basePrice: 100, veg: true },
]

export const tiffinMenu: MenuTemplate[] = [
  { name: 'Monthly lunch plan (26 meals)', basePrice: 2800, veg: true, popular: true },
  { name: 'Monthly dinner plan (26 meals)', basePrice: 2600, veg: true },
  { name: 'Lunch + dinner plan', basePrice: 4900, veg: true, popular: true },
  { name: 'Single trial meal', basePrice: 110, veg: true },
  { name: 'Weekend add-on (8 meals)', basePrice: 850, veg: true },
]

export const restaurantMenu: MenuTemplate[] = [
  { name: 'Veg Thali', basePrice: 180, veg: true, popular: true },
  { name: 'Paneer Butter Masala', basePrice: 220, veg: true, popular: true },
  { name: 'Veg Biryani', basePrice: 190, veg: true },
  { name: 'Butter Naan', basePrice: 50, veg: true },
  { name: 'Gobi Manchurian', basePrice: 160, veg: true },
  { name: 'Fried Rice', basePrice: 150, veg: true },
  { name: 'Lassi', basePrice: 70, veg: true },
]

export const cafeMenu: MenuTemplate[] = [
  { name: 'Veg Sandwich', basePrice: 140, veg: true, popular: true },
  { name: 'Cold Coffee', basePrice: 130, veg: true, popular: true },
  { name: 'Pasta Arrabiata', basePrice: 220, veg: true },
  { name: 'Cappuccino', basePrice: 150, veg: true },
  { name: 'Chocolate Brownie', basePrice: 110, veg: true },
]

export function buildMenu(
  templates: MenuTemplate[],
  listingId: string,
  priceOffset: number,
): MenuItem[] {
  return templates.map((item, index) => ({
    id: `${listingId}_item_${String(index + 1).padStart(2, '0')}`,
    name: item.name,
    price: Math.max(10, Math.round((item.basePrice + priceOffset) / 5) * 5),
    veg: item.veg,
    popular: item.popular ?? false,
  }))
}
