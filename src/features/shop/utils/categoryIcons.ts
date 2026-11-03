import { Backpack, Footprints, HardHat, Headphones, Layers, Shirt, Umbrella, Watch } from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import type { ProductCategory } from '@/types/product'

/** Icons stand in for product photos — there is no real product imagery anywhere. */
export const productCategoryIcons: Record<ProductCategory, LucideIcon> = {
  shirts: Shirt,
  jeans: Layers,
  formalShoes: Footprints,
  backpacks: Backpack,
  earphones: Headphones,
  watches: Watch,
  raincoats: Umbrella,
  helmets: HardHat,
}
