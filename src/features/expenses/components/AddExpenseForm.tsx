import { Controller, useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Button } from '@/components/ui/button'
import { Field } from '@/components/ui/field'
import { Input } from '@/components/ui/input'
import { Select } from '@/components/ui/select'
import { isApiError } from '@/lib/api/ApiError'
import { categoryIds, categoryLabels } from '@/utils/categories'
import { expenseFormSchema, type ExpenseFormValues } from '../schema'
import { useCreateExpense } from '../hooks/useExpenses'

export interface AddExpenseFormProps {
  onSuccess?: () => void
  onCancel?: () => void
}

export function AddExpenseForm({ onSuccess, onCancel }: AddExpenseFormProps) {
  const createExpense = useCreateExpense()
  const {
    register,
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<ExpenseFormValues>({
    resolver: zodResolver(expenseFormSchema),
    defaultValues: { category: 'food' },
  })

  const onSubmit = (values: ExpenseFormValues) => {
    createExpense.mutate(
      {
        category: values.category,
        title: values.title,
        amount: values.amount,
        merchant: values.merchant || null,
        note: values.note || null,
      },
      {
        onSuccess: () => {
          reset({ category: values.category, title: '', merchant: '', note: '' })
          onSuccess?.()
        },
      },
    )
  }

  const serverError = createExpense.isError
    ? isApiError(createExpense.error)
      ? createExpense.error.message
      : 'We could not save that expense.'
    : null

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
      <Field label="Category" error={errors.category?.message}>
        {({ id, describedBy, invalid }) => (
          <Controller
            control={control}
            name="category"
            render={({ field }) => (
              <Select
                id={id}
                aria-describedby={describedBy}
                aria-invalid={invalid}
                name={field.name}
                value={field.value ?? ''}
                onValueChange={field.onChange}
                onBlur={field.onBlur}
              >
                {categoryIds.map((key) => (
                  <option key={key} value={key}>
                    {categoryLabels[key]}
                  </option>
                ))}
              </Select>
            )}
          />
        )}
      </Field>

      <Field label="What was it?" error={errors.title?.message}>
        {({ id, describedBy, invalid }) => (
          <Input
            id={id}
            placeholder="Lunch at the mess"
            aria-describedby={describedBy}
            aria-invalid={invalid}
            {...register('title')}
          />
        )}
      </Field>

      <Field label="Amount" error={errors.amount?.message} hint="In whole rupees.">
        {({ id, describedBy, invalid }) => (
          <Input
            id={id}
            type="number"
            inputMode="numeric"
            placeholder="120"
            aria-describedby={describedBy}
            aria-invalid={invalid}
            {...register('amount', { valueAsNumber: true })}
          />
        )}
      </Field>

      <Field label="Where? (optional)" error={errors.merchant?.message}>
        {({ id, describedBy, invalid }) => (
          <Input
            id={id}
            placeholder="Annapoorna Mess"
            aria-describedby={describedBy}
            aria-invalid={invalid}
            {...register('merchant')}
          />
        )}
      </Field>

      {serverError ? (
        <p role="alert" className="rounded-lg bg-destructive/10 p-3 text-sm text-destructive">
          {serverError}
        </p>
      ) : null}

      <div className="flex justify-end gap-2 pt-2">
        {onCancel ? (
          <Button type="button" variant="outline" onClick={onCancel}>
            Cancel
          </Button>
        ) : null}
        <Button type="submit" disabled={createExpense.isPending}>
          {createExpense.isPending ? 'Saving…' : 'Add expense'}
        </Button>
      </div>
    </form>
  )
}
