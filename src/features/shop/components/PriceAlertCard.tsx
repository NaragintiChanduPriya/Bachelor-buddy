import { useState } from 'react'
import { BellPlus, BellRing, Trash2 } from 'lucide-react'
import type { ProductDetail } from '@/types/product'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Field } from '@/components/ui/field'
import { MoneyText } from '@/components/MoneyText'
import { isApiError } from '@/lib/api/ApiError'
import { useRemovePriceAlert, useSetPriceAlert } from '../hooks/useProducts'

/** Set, move or remove the one price alert a product can have. The server validates too. */
export function PriceAlertCard({ product }: { product: ProductDetail }) {
  const setAlert = useSetPriceAlert(product.id)
  const removeAlert = useRemovePriceAlert(product.id)
  const [value, setValue] = useState('')
  const [clientError, setClientError] = useState<string | null>(null)

  const submit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const target = Number(value)
    if (!value || !Number.isInteger(target) || target <= 0) {
      setClientError('Enter a target price in whole rupees.')
      return
    }
    if (target >= product.lowestPrice) {
      setClientError('Pick a target below today’s lowest price — at that price you can buy now.')
      return
    }
    setClientError(null)
    setAlert.mutate(target, { onSuccess: () => setValue('') })
  }

  const serverError = setAlert.isError
    ? isApiError(setAlert.error)
      ? setAlert.error.message
      : 'We could not save that alert.'
    : null

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-base">
          {product.hasAlert ? (
            <BellRing className="size-4 text-muted-foreground" aria-hidden="true" />
          ) : (
            <BellPlus className="size-4 text-muted-foreground" aria-hidden="true" />
          )}
          Price alert
        </CardTitle>
        <CardDescription>
          Your Shopping agent watches all three platforms and tells you when it drops.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {product.hasAlert && product.alertTargetPrice !== null ? (
          <div className="flex flex-wrap items-center justify-between gap-2 rounded-lg border border-primary/25 bg-primary/5 px-3 py-2.5 text-sm">
            <span>
              Alerting at <MoneyText amount={product.alertTargetPrice} size="sm" className="font-semibold" />
            </span>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => removeAlert.mutate()}
              disabled={removeAlert.isPending}
            >
              <Trash2 aria-hidden="true" />
              {removeAlert.isPending ? 'Removing…' : 'Remove'}
            </Button>
          </div>
        ) : null}

        <form onSubmit={submit} noValidate className="flex flex-wrap items-end gap-2">
          <Field
            label={product.hasAlert ? 'Move the target to' : 'Tell me when it drops to'}
            error={clientError ?? serverError ?? undefined}
            className="min-w-[160px] flex-1"
          >
            {({ id, describedBy, invalid }) => (
              <Input
                id={id}
                type="number"
                inputMode="numeric"
                min={1}
                placeholder={`Below ${product.lowestPrice}`}
                value={value}
                onChange={(event) => {
                  setValue(event.target.value)
                  setClientError(null)
                }}
                aria-describedby={describedBy}
                aria-invalid={invalid}
              />
            )}
          </Field>
          <Button type="submit" disabled={setAlert.isPending}>
            {setAlert.isPending ? 'Saving…' : product.hasAlert ? 'Update alert' : 'Set alert'}
          </Button>
        </form>

        {setAlert.isSuccess ? (
          <p aria-live="polite" className="text-sm text-success">
            Alert saved. You will get a notification when it hits your price.
          </p>
        ) : null}
      </CardContent>
    </Card>
  )
}
