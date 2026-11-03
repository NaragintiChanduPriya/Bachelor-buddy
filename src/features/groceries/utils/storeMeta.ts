import { ShoppingBasket, Store, Warehouse, Zap } from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import type { StoreType } from '@/types/grocery'

interface StoreKindMeta {
  kind: string
  note: string
  icon: LucideIcon
  iconClassName: string
}

/** Display-only description of each store type. Store names and prices come from the API. */
export const storeKindMeta: Record<StoreType, StoreKindMeta> = {
  quickCommerce: {
    kind: 'Quick commerce',
    note: 'Fast delivery, small top-up orders',
    icon: Zap,
    iconClassName: 'bg-violet-500/10 text-violet-600 dark:text-violet-400',
  },
  supermarket: {
    kind: 'Supermarket',
    note: 'Weekly offers on packaged goods',
    icon: ShoppingBasket,
    iconClassName: 'bg-sky-500/10 text-sky-600 dark:text-sky-400',
  },
  kirana: {
    kind: 'Local kirana',
    note: 'Walkable, best for fresh produce',
    icon: Store,
    iconClassName: 'bg-amber-500/10 text-amber-700 dark:text-amber-400',
  },
  onlineBulk: {
    kind: 'Online bulk',
    note: 'One monthly delivery, bulk packs',
    icon: Warehouse,
    iconClassName: 'bg-lime-500/10 text-lime-700 dark:text-lime-400',
  },
}
