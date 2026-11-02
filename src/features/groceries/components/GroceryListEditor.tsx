import { useMemo, useState } from 'react'
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion'
import {
  CircleCheck,
  ListChecks,
  LoaderCircle,
  Minus,
  Plus,
  Save,
  ShoppingCart,
  Trash,
  Undo2,
} from 'lucide-react'
import type { GroceryCatalogItem, GroceryList, GroceryListItem } from '@/types/grocery'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { MoneyText } from '@/components/MoneyText'
import { EmptyState } from '@/components/EmptyState'
import { isApiError } from '@/lib/api/ApiError'
import { useUpdateGroceryList } from '../hooks/useGroceries'
import { AddGroceryItemsDialog } from './AddGroceryItemsDialog'
import { formatDate } from '@/utils/date'
import { cn } from '@/utils/cn'

/** UI bounds for the stepper; the server enforces the same range. */
const MIN_QUANTITY = 1
const MAX_QUANTITY = 50

interface DraftLine {
  itemId: string
  name: string
  unit: string
  category: string
  quantity: number
}

function toDraftLine(item: GroceryListItem): DraftLine {
  return {
    itemId: item.itemId,
    name: item.name,
    unit: item.unit,
    category: item.category,
    quantity: item.quantity,
  }
}

function sameAsServer(lines: DraftLine[], items: GroceryListItem[]): boolean {
  return (
    lines.length === items.length &&
    lines.every((line, i) => line.itemId === items[i]?.itemId && line.quantity === items[i]?.quantity)
  )
}

/** Groups lines by category, keeping the order categories first appear in. */
function groupByCategory(lines: DraftLine[]): Array<[string, DraftLine[]]> {
  const groups = new Map<string, DraftLine[]>()
  for (const line of lines) groups.set(line.category, [...(groups.get(line.category) ?? []), line])
  return [...groups.entries()]
}

function QuantityStepper({
  name,
  value,
  disabled,
  onChange,
}: {
  name: string
  value: number
  disabled: boolean
  onChange: (value: number) => void
}) {
  const buttonClass =
    'flex size-8 items-center justify-center text-muted-foreground transition-colors hover:bg-accent hover:text-accent-foreground disabled:pointer-events-none disabled:opacity-40'

  return (
    <div
      role="group"
      aria-label={`Quantity of ${name}`}
      className="flex items-center overflow-hidden rounded-lg border border-border bg-card"
    >
      <button
        type="button"
        className={buttonClass}
        aria-label={`Decrease quantity of ${name}`}
        disabled={disabled || value <= MIN_QUANTITY}
        onClick={() => onChange(value - 1)}
      >
        <Minus className="size-3.5" aria-hidden="true" />
      </button>
      <span className="w-8 text-center text-sm font-semibold tabular" aria-live="polite">
        {value}
      </span>
      <button
        type="button"
        className={buttonClass}
        aria-label={`Increase quantity of ${name}`}
        disabled={disabled || value >= MAX_QUANTITY}
        onClick={() => onChange(value + 1)}
      >
        <Plus className="size-3.5" aria-hidden="true" />
      </button>
    </div>
  )
}

export interface GroceryListEditorProps {
  list: GroceryList
  className?: string
}

/**
 * The editable monthly list. Edits stay local until "Save list", because only the server can
 * price a changed line — the UI never multiplies prices itself.
 */
export function GroceryListEditor({ list, className }: GroceryListEditorProps) {
  const [draft, setDraft] = useState<DraftLine[] | null>(null)
  const [pickerOpen, setPickerOpen] = useState(false)
  const update = useUpdateGroceryList()
  const reduceMotion = useReducedMotion()

  const lines = draft ?? list.items.map(toDraftLine)
  const dirty = draft !== null && !sameAsServer(draft, list.items)
  const serverById = useMemo(
    () => new Map(list.items.map((item) => [item.itemId, item])),
    [list.items],
  )
  const onListIds = useMemo(() => new Set(lines.map((line) => line.itemId)), [lines])
  const groups = groupByCategory(lines)

  const edit = (change: (current: DraftLine[]) => DraftLine[]) => {
    if (update.isError) update.reset()
    setDraft((prev) => change(prev ?? list.items.map(toDraftLine)))
  }

  const setQuantity = (itemId: string, quantity: number) =>
    edit((current) =>
      current.map((line) =>
        line.itemId === itemId
          ? { ...line, quantity: Math.min(MAX_QUANTITY, Math.max(MIN_QUANTITY, quantity)) }
          : line,
      ),
    )

  const remove = (itemId: string) =>
    edit((current) => current.filter((line) => line.itemId !== itemId))

  const add = (item: GroceryCatalogItem) =>
    edit((current) =>
      current.some((line) => line.itemId === item.id)
        ? current
        : [
            ...current,
            { itemId: item.id, name: item.name, unit: item.unit, category: item.category, quantity: 1 },
          ],
    )

  const save = () => {
    update.mutate(
      { items: lines.map(({ itemId, quantity }) => ({ itemId, quantity })) },
      { onSuccess: () => setDraft(null) },
    )
  }

  const discard = () => {
    setDraft(null)
    update.reset()
  }

  const serverError = update.isError
    ? isApiError(update.error)
      ? update.error.message
      : 'We could not save your list. Please try again.'
    : null

  return (
    <Card className={className}>
      <CardHeader className="pb-3">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="space-y-1">
            <CardTitle className="flex items-center gap-2 text-base">
              <ListChecks className="size-4 text-muted-foreground" aria-hidden="true" />
              Your smart monthly list
            </CardTitle>
            <CardDescription>
              {list.itemCount} {list.itemCount === 1 ? 'item' : 'items'} · updated{' '}
              {formatDate(list.updatedAt)}
            </CardDescription>
          </div>
          <Button size="sm" variant="outline" onClick={() => setPickerOpen(true)}>
            <Plus aria-hidden="true" />
            Add items
          </Button>
        </div>
        <p aria-live="polite" className="min-h-0 text-xs">
          {update.isSuccess && !dirty ? (
            <span className="inline-flex items-center gap-1 text-success">
              <CircleCheck className="size-3.5" aria-hidden="true" />
              List saved — prices refreshed across all four stores.
            </span>
          ) : null}
        </p>
      </CardHeader>

      <CardContent className="space-y-4">
        {lines.length === 0 ? (
          <EmptyState
            icon={ShoppingCart}
            title="Your list is empty"
            description="Add the staples you buy every month and your Grocery agent will find the cheapest way to buy them."
            actionLabel="Add items"
            onAction={() => setPickerOpen(true)}
          />
        ) : (
          <div className="space-y-5">
            {groups.map(([category, categoryLines]) => (
              <section key={category} aria-label={category} className="space-y-1">
                <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  {category}
                </h3>
                <ul className="divide-y divide-border">
                  <AnimatePresence initial={false}>
                    {categoryLines.map((line) => {
                      const server = serverById.get(line.itemId)
                      const priced = server !== undefined && server.quantity === line.quantity

                      return (
                        <motion.li
                          key={line.itemId}
                          layout={!reduceMotion}
                          initial={reduceMotion ? false : { opacity: 0, y: -6 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={reduceMotion ? { opacity: 0 } : { opacity: 0, x: 16 }}
                          transition={{ duration: reduceMotion ? 0 : 0.18 }}
                          className="flex flex-wrap items-center gap-x-3 gap-y-2 py-2.5"
                        >
                          <div className="min-w-0 flex-1 basis-40">
                            <p className="truncate text-sm font-medium">{line.name}</p>
                            <p className="flex flex-wrap items-center gap-x-1.5 text-xs text-muted-foreground">
                              <span>{line.unit}</span>
                              <span aria-hidden="true">·</span>
                              {priced ? (
                                <>
                                  <span>Cheapest at {server.cheapestStoreLabel}</span>
                                  {server.bulkApplied ? (
                                    <Badge variant="muted" className="px-1.5 py-0 text-[10px]">
                                      Bulk pack
                                    </Badge>
                                  ) : null}
                                </>
                              ) : (
                                <span className="text-warning">Prices update when you save</span>
                              )}
                            </p>
                          </div>

                          <div className="ml-auto flex items-center gap-2">
                            <QuantityStepper
                              name={line.name}
                              value={line.quantity}
                              disabled={update.isPending}
                              onChange={(quantity) => setQuantity(line.itemId, quantity)}
                            />
                            <span className="w-16 text-right">
                              {priced ? (
                                <MoneyText amount={server.lineTotal} size="sm" className="font-semibold" />
                              ) : (
                                <span className="text-sm text-muted-foreground" aria-label="Not priced yet">
                                  —
                                </span>
                              )}
                            </span>
                            <Button
                              type="button"
                              variant="ghost"
                              size="icon"
                              className="size-8 text-muted-foreground hover:text-destructive"
                              disabled={update.isPending}
                              onClick={() => remove(line.itemId)}
                              aria-label={`Remove ${line.name} from your list`}
                            >
                              <Trash aria-hidden="true" />
                            </Button>
                          </div>
                        </motion.li>
                      )
                    })}
                  </AnimatePresence>
                </ul>
              </section>
            ))}
          </div>
        )}

        {list.items.length > 0 ? (
          <div className="flex items-center justify-between gap-3 rounded-lg bg-muted/50 px-4 py-3 text-sm">
            <span>
              <span className="font-medium">Estimated at the cheapest mix</span>
              {dirty ? (
                <span className="block text-xs text-muted-foreground">
                  Before your unsaved changes
                </span>
              ) : null}
            </span>
            <MoneyText amount={list.estimatedTotal} size="lg" tone="primary" />
          </div>
        ) : null}

        {serverError ? (
          <p role="alert" className="rounded-lg bg-destructive/10 p-3 text-sm text-destructive">
            {serverError}
          </p>
        ) : null}

        {dirty ? (
          <div
            role="region"
            aria-label="Unsaved changes"
            className={cn(
              'sticky bottom-20 z-10 flex flex-wrap items-center justify-between gap-3 rounded-xl border border-primary/30 bg-card/95 p-3 shadow-lg backdrop-blur lg:bottom-4',
            )}
          >
            <p className="text-sm">
              <span className="font-semibold">Unsaved changes</span>
              <span className="text-muted-foreground">
                {' '}
                · {lines.length} {lines.length === 1 ? 'item' : 'items'}
              </span>
            </p>
            <div className="flex gap-2">
              <Button variant="ghost" size="sm" onClick={discard} disabled={update.isPending}>
                <Undo2 aria-hidden="true" />
                Discard
              </Button>
              <Button size="sm" onClick={save} disabled={update.isPending}>
                {update.isPending ? (
                  <LoaderCircle className="animate-spin" aria-hidden="true" />
                ) : (
                  <Save aria-hidden="true" />
                )}
                {update.isPending ? 'Saving…' : 'Save list'}
              </Button>
            </div>
          </div>
        ) : null}
      </CardContent>

      <AddGroceryItemsDialog
        open={pickerOpen}
        onOpenChange={setPickerOpen}
        onListIds={onListIds}
        onAdd={add}
      />
    </Card>
  )
}
