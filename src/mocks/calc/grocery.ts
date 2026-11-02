import type {
  GroceryCatalogItem,
  GroceryCompareRow,
  GroceryComparison,
  GroceryList,
  GroceryListItem,
  GroceryPlanSummary,
  StoreTotal,
  StoreType,
} from '@/types/grocery'

/**
 * Grocery money math, the logic the real backend will reimplement. Definitions:
 *
 * - Line total at a store: quantity × that store's unit price. At the online-bulk store only,
 *   whole bulk packs replace units — floor(quantity / bulkMultiple) packs at bulkPrice, plus
 *   the remainder at the unit price — whenever that comes out cheaper.
 * - Mixed basket: every line bought at its own cheapest store, summed.
 * - Quick-commerce extra: the whole list on ZipCart minus the mixed basket — the price of
 *   convenience.
 * - Bulk saving: the whole list on ZipCart (several small top-up orders) minus the whole list
 *   in one online-bulk stock-up. Never negative.
 * - Split saving: the cheapest single store minus the mixed basket — what splitting the list
 *   across stores adds on top of choosing the best single store.
 */

/** Column order everywhere the stores are listed. */
export const STORE_ORDER: StoreType[] = ['quickCommerce', 'supermarket', 'kirana', 'onlineBulk']

/** Invented store names, one per store type. */
export const storeLabels: Record<StoreType, string> = {
  quickCommerce: 'ZipCart',
  supermarket: 'FreshAisle Supermarket',
  kirana: 'Sri Lakshmi Kirana',
  onlineBulk: 'StockUp Wholesale',
}

/**
 * When two stores tie, prefer the one nearest home: the kirana is a walk, the supermarket a
 * short ride, and the two delivery options come last.
 */
const TIE_ORDER: StoreType[] = ['kirana', 'supermarket', 'onlineBulk', 'quickCommerce']

export interface GroceryEntry {
  itemId: string
  quantity: number
}

export interface LineCost {
  total: number
  bulkApplied: boolean
}

/** What `quantity` units of an item cost at one store. */
export function lineCostAt(item: GroceryCatalogItem, store: StoreType, quantity: number): LineCost {
  const unitTotal = item.prices[store] * quantity

  if (
    store === 'onlineBulk' &&
    item.bulkPrice !== null &&
    item.bulkMultiple !== null &&
    item.bulkMultiple > 1 &&
    quantity >= item.bulkMultiple
  ) {
    const packs = Math.floor(quantity / item.bulkMultiple)
    const loose = quantity % item.bulkMultiple
    const bulkTotal = packs * item.bulkPrice + loose * item.prices[store]
    if (bulkTotal < unitTotal) return { total: bulkTotal, bulkApplied: true }
  }

  return { total: unitTotal, bulkApplied: false }
}

export function lineTotalsFor(
  item: GroceryCatalogItem,
  quantity: number,
): Record<StoreType, number> {
  return {
    quickCommerce: lineCostAt(item, 'quickCommerce', quantity).total,
    supermarket: lineCostAt(item, 'supermarket', quantity).total,
    kirana: lineCostAt(item, 'kirana', quantity).total,
    onlineBulk: lineCostAt(item, 'onlineBulk', quantity).total,
  }
}

/** Lowest value wins; ties go to the store earliest in TIE_ORDER. */
export function cheapestOf(totals: Record<StoreType, number>): StoreType {
  return TIE_ORDER.reduce((best, store) => (totals[store] < totals[best] ? store : best))
}

/** Pairs each entry with its catalog item, skipping ids the catalog no longer has. */
function resolveEntries(entries: GroceryEntry[], catalog: GroceryCatalogItem[]) {
  const byId = new Map(catalog.map((item) => [item.id, item]))
  return entries.flatMap((entry) => {
    const item = byId.get(entry.itemId)
    return item && entry.quantity > 0 ? [{ item, quantity: entry.quantity }] : []
  })
}

export function buildCompareRow(item: GroceryCatalogItem, quantity: number): GroceryCompareRow {
  const lineTotals = lineTotalsFor(item, quantity)
  return {
    itemId: item.id,
    name: item.name,
    unit: item.unit,
    category: item.category,
    quantity,
    prices: { ...item.prices },
    cheapestStore: cheapestOf(lineTotals),
    lineTotals,
    bulkApplied: lineCostAt(item, 'onlineBulk', quantity).bulkApplied,
  }
}

/** List line ids are derived from the item id, so they stay stable across saves. */
export function listLineId(itemId: string): string {
  return `gli_${itemId.replace(/^groc_/, '')}`
}

export function buildGroceryList(
  entries: GroceryEntry[],
  catalog: GroceryCatalogItem[],
  month: string,
  updatedAt: string,
): GroceryList {
  const items: GroceryListItem[] = resolveEntries(entries, catalog).map(({ item, quantity }) => {
    const row = buildCompareRow(item, quantity)
    const lineTotal = row.lineTotals[row.cheapestStore]
    return {
      id: listLineId(item.id),
      itemId: item.id,
      name: item.name,
      unit: item.unit,
      category: item.category,
      quantity,
      cheapestStore: row.cheapestStore,
      cheapestStoreLabel: storeLabels[row.cheapestStore],
      cheapestUnitPrice: Math.round(lineTotal / quantity),
      lineTotal,
      bulkApplied: row.cheapestStore === 'onlineBulk' && row.bulkApplied,
    }
  })

  return {
    id: `glist_${month.replace('-', '')}`,
    month,
    items,
    itemCount: items.length,
    estimatedTotal: items.reduce((sum, line) => sum + line.lineTotal, 0),
    updatedAt,
  }
}

export function buildStoreTotals(rows: GroceryCompareRow[]): StoreTotal[] {
  const totals = Object.fromEntries(
    STORE_ORDER.map((store) => [store, rows.reduce((sum, row) => sum + row.lineTotals[store], 0)]),
  ) as Record<StoreType, number>
  const cheapest = cheapestOf(totals)

  return STORE_ORDER.map((store) => ({
    store,
    label: storeLabels[store],
    total: totals[store],
    isCheapest: store === cheapest,
    differenceFromCheapest: totals[store] - totals[cheapest],
    cheapestItemCount: rows.filter((row) => row.cheapestStore === store).length,
  }))
}

export function buildGroceryComparison(
  entries: GroceryEntry[],
  catalog: GroceryCatalogItem[],
  month: string,
): GroceryComparison {
  const rows = resolveEntries(entries, catalog).map(({ item, quantity }) =>
    buildCompareRow(item, quantity),
  )
  const storeTotals = buildStoreTotals(rows)
  const totalAt = (store: StoreType) => storeTotals.find((t) => t.store === store)?.total ?? 0
  const cheapest = storeTotals.find((t) => t.isCheapest) ?? storeTotals[0]!

  const mixedBasketTotal = rows.reduce((sum, row) => sum + row.lineTotals[row.cheapestStore], 0)

  return {
    month,
    itemCount: rows.length,
    rows,
    storeTotals,
    cheapestStore: cheapest.store,
    cheapestStoreLabel: cheapest.label,
    mixedBasketTotal,
    bulkSaving: Math.max(0, totalAt('quickCommerce') - totalAt('onlineBulk')),
    quickCommerceExtra: Math.max(0, totalAt('quickCommerce') - mixedBasketTotal),
    splitSaving: Math.max(0, cheapest.total - mixedBasketTotal),
  }
}

export function toGroceryPlanSummary(comparison: GroceryComparison): GroceryPlanSummary {
  return {
    month: comparison.month,
    itemCount: comparison.itemCount,
    estimatedTotal: comparison.mixedBasketTotal,
    cheapestStoreLabel: comparison.cheapestStoreLabel,
    bulkSaving: comparison.bulkSaving,
  }
}

export const MAX_LIST_LINES = 80
export const MIN_QUANTITY = 1
export const MAX_QUANTITY = 50

/** Server-side validation for PUT /groceries/list. Returns an error message or null. */
export function validateGroceryEntries(
  entries: unknown,
  catalog: GroceryCatalogItem[],
): string | null {
  if (!Array.isArray(entries)) return 'Send the list as an array of items.'
  if (entries.length > MAX_LIST_LINES) {
    return `A monthly list can hold at most ${MAX_LIST_LINES} items.`
  }

  const known = new Map(catalog.map((item) => [item.id, item]))
  const seen = new Set<string>()

  for (const entry of entries as Array<Partial<GroceryEntry> | null>) {
    const itemId = entry?.itemId
    if (typeof itemId !== 'string' || !known.has(itemId)) {
      return `Unknown grocery item "${String(itemId)}".`
    }
    if (seen.has(itemId)) {
      return `${known.get(itemId)!.name} is on the list twice. Combine them into one line.`
    }
    seen.add(itemId)

    const quantity = entry?.quantity
    if (
      typeof quantity !== 'number' ||
      !Number.isInteger(quantity) ||
      quantity < MIN_QUANTITY ||
      quantity > MAX_QUANTITY
    ) {
      return `Quantity for ${known.get(itemId)!.name} must be a whole number from ${MIN_QUANTITY} to ${MAX_QUANTITY}.`
    }
  }

  return null
}
