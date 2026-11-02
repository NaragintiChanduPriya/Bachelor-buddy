import type { GroceryCatalogItem } from '@/types/grocery'
import type { GroceryListEntry } from '../db'

type PriceRow = [quickCommerce: number, supermarket: number, kirana: number, onlineBulk: number]
type Bulk = [bulkUnit: string, bulkPrice: number, bulkMultiple: number]

function item(
  num: number,
  name: string,
  unit: string,
  category: string,
  [quickCommerce, supermarket, kirana, onlineBulk]: PriceRow,
  bulk: Bulk | null = null,
): GroceryCatalogItem {
  return {
    id: `groc_${String(num).padStart(3, '0')}`,
    name,
    unit,
    category,
    prices: { quickCommerce, supermarket, kirana, onlineBulk },
    bulkUnit: bulk?.[0] ?? null,
    bulkPrice: bulk?.[1] ?? null,
    bulkMultiple: bulk?.[2] ?? null,
  }
}

/**
 * Bangalore 2026 shelf prices for one unit, in the order ZipCart (quick commerce), FreshAisle
 * Supermarket, Sri Lakshmi Kirana, StockUp Wholesale (online bulk). The pattern is deliberate:
 * quick commerce is usually dearest, the kirana wins on fresh produce and loose spices, the
 * bulk store wins on staples and household packs, and the supermarket wins on a few branded
 * packaged goods it discounts — so the cheapest store genuinely changes from item to item.
 */
export const groceryCatalog: GroceryCatalogItem[] = [
  // Rice, flour and dal
  item(1, 'Sona masoori rice', '1 kg', 'Rice, flour & dal', [78, 68, 64, 60], ['5 kg bag', 285, 5]),
  item(2, 'Basmati rice', '1 kg', 'Rice, flour & dal', [145, 124, 120, 112], ['5 kg bag', 525, 5]),
  item(3, 'Ragi flour', '1 kg', 'Rice, flour & dal', [72, 62, 58, 54], ['5 kg bag', 250, 5]),
  item(4, 'Whole wheat atta', '1 kg', 'Rice, flour & dal', [62, 52, 50, 46], ['5 kg bag', 215, 5]),
  item(5, 'Toor dal', '1 kg', 'Rice, flour & dal', [185, 168, 160, 152], ['2 kg pack', 290, 2]),
  item(6, 'Moong dal', '1 kg', 'Rice, flour & dal', [158, 142, 136, 130], ['2 kg pack', 248, 2]),
  item(7, 'Chana dal', '1 kg', 'Rice, flour & dal', [112, 98, 94, 90], ['2 kg pack', 172, 2]),
  item(8, 'Urad dal', '1 kg', 'Rice, flour & dal', [168, 150, 146, 138], ['2 kg pack', 266, 2]),
  item(9, 'Bombay rava', '500 g', 'Rice, flour & dal', [42, 36, 34, 32]),
  item(10, 'Thick poha', '500 g', 'Rice, flour & dal', [44, 38, 35, 33]),
  item(11, 'Roasted vermicelli', '400 g', 'Rice, flour & dal', [48, 40, 42, 38]),

  // Oil, ghee and sweeteners
  item(12, 'Coconut oil', '500 ml', 'Oil, ghee & sugar', [210, 190, 186, 178], ['1 L can', 340, 2]),
  item(13, 'Sunflower oil', '1 L', 'Oil, ghee & sugar', [175, 158, 155, 148], ['5 L can', 705, 5]),
  item(14, 'Cow ghee', '500 ml', 'Oil, ghee & sugar', [345, 312, 325, 305]),
  item(15, 'Sugar', '1 kg', 'Oil, ghee & sugar', [54, 47, 46, 43], ['5 kg bag', 205, 5]),
  item(16, 'Jaggery', '1 kg', 'Oil, ghee & sugar', [92, 80, 72, 76]),
  item(17, 'Iodised salt', '1 kg', 'Oil, ghee & sugar', [30, 26, 25, 24]),

  // Spices and masala
  item(18, 'Sambar powder', '200 g', 'Spices & masala', [92, 80, 76, 78]),
  item(19, 'Rasam powder', '200 g', 'Spices & masala', [88, 76, 72, 74]),
  item(20, 'Turmeric powder', '200 g', 'Spices & masala', [64, 55, 52, 50]),
  item(21, 'Chilli powder', '200 g', 'Spices & masala', [78, 68, 64, 62]),
  item(22, 'Mustard seeds', '100 g', 'Spices & masala', [28, 22, 18, 20]),
  item(23, 'Cumin seeds', '100 g', 'Spices & masala', [72, 62, 58, 56]),
  item(24, 'Tamarind', '250 g', 'Spices & masala', [68, 58, 50, 54]),

  // Coffee and tea
  item(25, 'Filter coffee powder', '500 g', 'Coffee & tea', [310, 285, 270, 262], ['1 kg pack', 505, 2]),
  item(26, 'Tea powder', '500 g', 'Coffee & tea', [285, 238, 262, 240], ['1 kg pack', 465, 2]),
  item(27, 'Malted health drink', '500 g', 'Coffee & tea', [265, 225, 250, 230]),

  // Dairy, batter and eggs
  item(28, 'Toned milk', '500 ml', 'Dairy & batter', [30, 28, 27, 31]),
  item(29, 'Fresh curd', '500 g', 'Dairy & batter', [42, 38, 35, 47]),
  item(30, 'Paneer', '200 g', 'Dairy & batter', [95, 86, 82, 90]),
  item(31, 'Idli & dosa batter', '1 kg', 'Dairy & batter', [85, 75, 65, 84]),
  item(32, 'Table butter', '100 g', 'Dairy & batter', [62, 54, 60, 56]),
  item(33, 'Eggs', '6 pcs', 'Dairy & batter', [58, 52, 48, 55]),

  // Vegetables
  item(34, 'Onion', '1 kg', 'Vegetables', [52, 44, 38, 46]),
  item(35, 'Tomato', '1 kg', 'Vegetables', [48, 40, 32, 42]),
  item(36, 'Potato', '1 kg', 'Vegetables', [46, 38, 34, 41]),
  item(37, 'French beans', '500 g', 'Vegetables', [48, 40, 34, 42]),
  item(38, 'Carrot', '500 g', 'Vegetables', [38, 32, 28, 34]),
  item(39, 'Curry leaves', '1 bunch', 'Vegetables', [12, 10, 5, 13]),
  item(40, 'Coriander', '1 bunch', 'Vegetables', [18, 14, 10, 16]),
  item(41, 'Green chilli', '250 g', 'Vegetables', [30, 24, 20, 26]),
  item(42, 'Ginger', '250 g', 'Vegetables', [42, 36, 30, 34]),
  item(43, 'Garlic', '250 g', 'Vegetables', [78, 68, 60, 62]),
  item(44, 'Lemon', '6 pcs', 'Vegetables', [42, 36, 30, 38]),
  item(45, 'Cucumber', '500 g', 'Vegetables', [34, 28, 24, 30]),
  item(46, 'Capsicum', '500 g', 'Vegetables', [62, 52, 46, 50]),

  // Fruit
  item(47, 'Yelakki bananas', '1 dozen', 'Fruit', [78, 68, 60, 75]),
  item(48, 'Apples', '1 kg', 'Fruit', [220, 185, 180, 175]),
  item(49, 'Papaya', '1 kg', 'Fruit', [58, 48, 40, 50]),

  // Bakery and breakfast
  item(50, 'Sandwich bread', '400 g', 'Bakery & breakfast', [50, 42, 45, 48]),
  item(51, 'Rolled oats', '1 kg', 'Bakery & breakfast', [199, 175, 185, 162], ['2 kg pack', 310, 2]),
  item(52, 'Cornflakes', '500 g', 'Bakery & breakfast', [210, 169, 195, 176]),

  // Snacks
  item(53, 'Marie biscuits', '250 g', 'Snacks', [35, 30, 32, 29], ['Pack of 6', 168, 6]),
  item(54, 'Butter chakli', '200 g', 'Snacks', [72, 62, 55, 60]),
  item(55, 'Bangalore mixture', '400 g', 'Snacks', [120, 104, 95, 100]),
  item(56, 'Instant noodles', 'Pack of 4', 'Snacks', [62, 56, 58, 52], ['3 × 4-packs', 148, 3]),
  item(57, 'Roasted peanuts', '500 g', 'Snacks', [110, 95, 88, 86]),
  item(58, 'Masala khakhra', '200 g', 'Snacks', [85, 66, 75, 68]),

  // Household and toiletries
  item(59, 'Bath soap', 'Pack of 4', 'Household & toiletries', [185, 155, 172, 148], ['3 × 4-packs', 420, 3]),
  item(60, 'Shampoo', '340 ml', 'Household & toiletries', [299, 229, 285, 238]),
  item(61, 'Toothpaste', '150 g', 'Household & toiletries', [115, 89, 108, 95]),
  item(62, 'Detergent powder', '1 kg', 'Household & toiletries', [145, 122, 135, 115], ['4 kg bag', 420, 4]),
  item(63, 'Dishwash liquid', '500 ml', 'Household & toiletries', [115, 96, 105, 92]),
  item(64, 'Floor cleaner', '1 L', 'Household & toiletries', [225, 189, 205, 182]),
  item(65, 'Garbage bags', '30 pcs', 'Household & toiletries', [120, 95, 90, 88]),
  item(66, 'Toilet cleaner', '500 ml', 'Household & toiletries', [110, 92, 99, 88]),
]

/**
 * Arjun's monthly list for a shared flat (vegetarian, so no eggs). At the cheapest mix it
 * lands just under the ₹2,500 groceries budget, and on ZipCart it costs noticeably more.
 */
export const defaultGroceryList: GroceryListEntry[] = [
  { itemId: 'groc_001', quantity: 5 }, // Sona masoori rice
  { itemId: 'groc_005', quantity: 1 }, // Toor dal
  { itemId: 'groc_003', quantity: 1 }, // Ragi flour
  { itemId: 'groc_009', quantity: 1 }, // Bombay rava
  { itemId: 'groc_013', quantity: 1 }, // Sunflower oil
  { itemId: 'groc_012', quantity: 1 }, // Coconut oil
  { itemId: 'groc_025', quantity: 1 }, // Filter coffee powder
  { itemId: 'groc_015', quantity: 1 }, // Sugar
  { itemId: 'groc_029', quantity: 6 }, // Fresh curd
  { itemId: 'groc_031', quantity: 3 }, // Idli & dosa batter
  { itemId: 'groc_034', quantity: 2 }, // Onion
  { itemId: 'groc_035', quantity: 2 }, // Tomato
  { itemId: 'groc_036', quantity: 1 }, // Potato
  { itemId: 'groc_039', quantity: 2 }, // Curry leaves
  { itemId: 'groc_040', quantity: 2 }, // Coriander
  { itemId: 'groc_047', quantity: 2 }, // Yelakki bananas
  { itemId: 'groc_018', quantity: 1 }, // Sambar powder
  { itemId: 'groc_053', quantity: 2 }, // Marie biscuits
  { itemId: 'groc_056', quantity: 1 }, // Instant noodles
  { itemId: 'groc_059', quantity: 1 }, // Bath soap
  { itemId: 'groc_061', quantity: 1 }, // Toothpaste
  { itemId: 'groc_063', quantity: 1 }, // Dishwash liquid
]
