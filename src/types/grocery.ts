export type StoreType = 'quickCommerce' | 'supermarket' | 'kirana' | 'onlineBulk'

export interface GroceryCatalogItem {
  id: string
  name: string
  unit: string
  category: string
  prices: Record<StoreType, number>
  bulkUnit: string | null
  bulkPrice: number | null
  bulkMultiple: number | null
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
  cheapestUnitPrice: number
  lineTotal: number
}

export interface GroceryList {
  id: string
  month: string
  items: GroceryListItem[]
  itemCount: number
  estimatedTotal: number
  updatedAt: string
}

export interface StoreTotal {
  store: StoreType
  label: string
  total: number
  isCheapest: boolean
  differenceFromCheapest: number
}

export interface GroceryCompareRow {
  itemId: string
  name: string
  unit: string
  quantity: number
  prices: Record<StoreType, number>
  cheapestStore: StoreType
  lineTotals: Record<StoreType, number>
}

export interface GroceryComparison {
  month: string
  rows: GroceryCompareRow[]
  storeTotals: StoreTotal[]
  cheapestStore: StoreType
  mixedBasketTotal: number
  bulkSaving: number
  quickCommerceExtra: number
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
