export type StoreType = 'quickCommerce' | 'supermarket' | 'kirana' | 'onlineBulk'

export interface GroceryCatalogItem {
  id: string
  name: string
  unit: string
  category: string
  /** Price of one `unit` at each store type, in rupees. */
  prices: Record<StoreType, number>
  /** Online-bulk pack, e.g. "5 kg bag", covering `bulkMultiple` units for `bulkPrice`. */
  bulkUnit: string | null
  bulkPrice: number | null
  bulkMultiple: number | null
}

export interface GroceryCatalogFilters {
  q?: string
  category?: string
}

export interface GroceryListItem {
  id: string
  itemId: string
  name: string
  unit: string
  category: string
  quantity: number
  cheapestStore: StoreType
  cheapestStoreLabel: string
  /** Effective price of one unit at the cheapest store, bulk packs included. */
  cheapestUnitPrice: number
  /** What this line costs at its cheapest store. */
  lineTotal: number
  /** True when the cheapest line uses online-bulk packs. */
  bulkApplied: boolean
}

export interface GroceryList {
  id: string
  month: string
  items: GroceryListItem[]
  itemCount: number
  /** Sum of every line at its cheapest store — the same figure as `mixedBasketTotal`. */
  estimatedTotal: number
  updatedAt: string
}

export interface StoreTotal {
  store: StoreType
  label: string
  total: number
  isCheapest: boolean
  differenceFromCheapest: number
  /** How many lines on the list are cheapest at this store. */
  cheapestItemCount: number
}

export interface GroceryCompareRow {
  itemId: string
  name: string
  unit: string
  category: string
  quantity: number
  prices: Record<StoreType, number>
  cheapestStore: StoreType
  lineTotals: Record<StoreType, number>
  /** True when the online-bulk line total uses bulk packs. */
  bulkApplied: boolean
}

export interface GroceryComparison {
  month: string
  itemCount: number
  rows: GroceryCompareRow[]
  /** One entry per store type, always in the same column order. */
  storeTotals: StoreTotal[]
  /** The single store whose whole-list total is lowest. */
  cheapestStore: StoreType
  cheapestStoreLabel: string
  /** Every line bought at its own cheapest store. */
  mixedBasketTotal: number
  /** Whole list from ZipCart (small orders) minus whole list from the online-bulk store. */
  bulkSaving: number
  /** Whole list from ZipCart minus the mixed basket. */
  quickCommerceExtra: number
  /** Cheapest single store minus the mixed basket: what splitting the list saves. */
  splitSaving: number
}

export interface GroceryPlanSummary {
  month: string
  itemCount: number
  estimatedTotal: number
  cheapestStoreLabel: string
  bulkSaving: number
}

export interface UpdateGroceryListRequest {
  items: Array<{ itemId: string; quantity: number }>
}
