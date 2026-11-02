import type { ProductCategory, ProductSort } from '@/types/product'

/**
 * Display labels for product categories. Lives outside src/mocks/ so the Shop UI can render
 * category chips; the mock backend imports this, not the other way round.
 */
export const productCategoryLabels: Record<ProductCategory, string> = {
  shirts: 'Shirts',
  jeans: 'Jeans',
  formalShoes: 'Formal shoes',
  backpacks: 'Backpacks',
  earphones: 'Earphones',
  watches: 'Watches',
  raincoats: 'Raincoats',
  helmets: 'Helmets',
}

export const productCategoryIds = Object.keys(productCategoryLabels) as ProductCategory[]

export const productSorts: Array<{ value: ProductSort; label: string }> = [
  { value: 'price', label: 'Lowest price' },
  { value: 'discount', label: 'Biggest discount' },
  { value: 'rating', label: 'Best rated' },
]

/** Fixed platform order, so each platform keeps the same chart colour everywhere. */
export const shoppingPlatforms = ['ShopNest', 'TrendKart', 'StyleBay'] as const
