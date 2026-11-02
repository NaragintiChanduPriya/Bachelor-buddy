import { useMemo, useState } from 'react'
import { Check, PackageSearch, Plus, Search } from 'lucide-react'
import type { GroceryCatalogItem } from '@/types/grocery'
import { Modal } from '@/components/ui/modal'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { EmptyState } from '@/components/EmptyState'
import { ErrorState } from '@/components/ErrorState'
import { useGroceryCatalog } from '../hooks/useGroceries'

export interface AddGroceryItemsDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  /** Item ids already on the list, shown as added. */
  onListIds: Set<string>
  onAdd: (item: GroceryCatalogItem) => void
}

/** Searchable catalog picker. Adding stays local until the list is saved. */
export function AddGroceryItemsDialog({
  open,
  onOpenChange,
  onListIds,
  onAdd,
}: AddGroceryItemsDialogProps) {
  const catalog = useGroceryCatalog(open)
  const [query, setQuery] = useState('')

  const groups = useMemo(() => {
    const needle = query.trim().toLowerCase()
    const matches = (catalog.data ?? []).filter(
      (item) =>
        !needle ||
        item.name.toLowerCase().includes(needle) ||
        item.category.toLowerCase().includes(needle),
    )
    const byCategory = new Map<string, GroceryCatalogItem[]>()
    for (const item of matches) {
      byCategory.set(item.category, [...(byCategory.get(item.category) ?? []), item])
    }
    return [...byCategory.entries()]
  }, [catalog.data, query])

  return (
    <Modal
      open={open}
      onOpenChange={onOpenChange}
      title="Add to your monthly list"
      description="Pick from the catalog. Every store's price is compared once you save."
      className="sm:max-w-lg"
    >
      <div className="space-y-4">
        <div className="relative">
          <label htmlFor="grocery-search" className="sr-only">
            Search groceries
          </label>
          <Search
            className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"
            aria-hidden="true"
          />
          <Input
            id="grocery-search"
            type="search"
            placeholder="Search rice, dal, curd, soap…"
            className="pl-9"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
          />
        </div>

        <div className="max-h-[55dvh] overflow-y-auto pr-1">
          {catalog.data ? (
            groups.length === 0 ? (
              <EmptyState
                icon={PackageSearch}
                title="Nothing matches that"
                description="Try a shorter word, like “dal” or “oil”."
              />
            ) : (
              <div className="space-y-5">
                {groups.map(([category, items]) => (
                  <section key={category} aria-label={category} className="space-y-2">
                    <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                      {category}
                    </h3>
                    <ul className="divide-y divide-border rounded-lg border border-border">
                      {items.map((item) => {
                        const added = onListIds.has(item.id)
                        return (
                          <li
                            key={item.id}
                            className="flex items-center justify-between gap-3 px-3 py-2"
                          >
                            <span className="min-w-0">
                              <span className="block truncate text-sm font-medium">
                                {item.name}
                              </span>
                              <span className="block text-xs text-muted-foreground">
                                {item.unit}
                                {item.bulkUnit ? ` · bulk pack ${item.bulkUnit}` : ''}
                              </span>
                            </span>
                            <Button
                              type="button"
                              size="sm"
                              variant={added ? 'ghost' : 'outline'}
                              disabled={added}
                              onClick={() => onAdd(item)}
                              aria-label={
                                added ? `${item.name} is on your list` : `Add ${item.name}`
                              }
                            >
                              {added ? (
                                <>
                                  <Check aria-hidden="true" />
                                  Added
                                </>
                              ) : (
                                <>
                                  <Plus aria-hidden="true" />
                                  Add
                                </>
                              )}
                            </Button>
                          </li>
                        )
                      })}
                    </ul>
                  </section>
                ))}
              </div>
            )
          ) : catalog.isError ? (
            <ErrorState
              error={catalog.error}
              title="We could not load the catalog"
              onRetry={() => void catalog.refetch()}
            />
          ) : (
            <div className="space-y-2" role="status" aria-label="Loading catalog">
              {Array.from({ length: 6 }).map((_, i) => (
                <Skeleton key={i} className="h-12 rounded-lg" />
              ))}
            </div>
          )}
        </div>

        <div className="flex justify-end">
          <Button type="button" onClick={() => onOpenChange(false)}>
            Done
          </Button>
        </div>
      </div>
    </Modal>
  )
}
