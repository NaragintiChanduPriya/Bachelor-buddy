import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Button } from '@/components/ui/button'
import { Field } from '@/components/ui/field'
import { Input } from '@/components/ui/input'
import { MoneyText } from '@/components/MoneyText'
import { moneyStepSchema, type MoneyStepValues } from '../schema'

export interface MoneyStepProps {
  defaultValues: Partial<MoneyStepValues>
  onBack: () => void
  onSubmit: (values: MoneyStepValues) => void
}

export function MoneyStep({ defaultValues, onBack, onSubmit }: MoneyStepProps) {
  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<MoneyStepValues>({
    resolver: zodResolver(moneyStepSchema),
    defaultValues: {
      salary: defaultValues.salary ?? undefined,
      savingsGoal: defaultValues.savingsGoal ?? undefined,
    },
  })

  const salary = watch('salary')
  const goal = watch('savingsGoal')
  const spendable = Number(salary) - Number(goal)
  const showSpendable = Number.isFinite(spendable) && spendable > 0

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6" noValidate>
      <div className="space-y-2">
        <h1 className="text-2xl font-bold tracking-tight">What are you working with?</h1>
        <p className="text-sm text-muted-foreground">
          We split this into category budgets. You can change any of it later.
        </p>
      </div>

      <div className="space-y-4">
        <Field
          label="Monthly salary (take-home)"
          error={errors.salary?.message}
          hint="In rupees, after deductions."
        >
          {({ id, describedBy, invalid }) => (
            <Input
              id={id}
              type="number"
              inputMode="numeric"
              placeholder="40000"
              aria-describedby={describedBy}
              aria-invalid={invalid}
              {...register('salary', { valueAsNumber: true })}
            />
          )}
        </Field>

        <Field
          label="Monthly savings goal"
          error={errors.savingsGoal?.message}
          hint="How much you want to keep aside every month."
        >
          {({ id, describedBy, invalid }) => (
            <Input
              id={id}
              type="number"
              inputMode="numeric"
              placeholder="8000"
              aria-describedby={describedBy}
              aria-invalid={invalid}
              {...register('savingsGoal', { valueAsNumber: true })}
            />
          )}
        </Field>

        {showSpendable ? (
          <div className="rounded-lg border border-border bg-muted/40 p-3 text-sm">
            That leaves <MoneyText amount={spendable} size="sm" tone="primary" /> to spend across
            rent, food, groceries and everything else.
          </div>
        ) : null}
      </div>

      <div className="flex gap-2">
        <Button type="button" variant="outline" onClick={onBack} className="flex-1">
          Back
        </Button>
        <Button type="submit" className="flex-1">
          Continue
        </Button>
      </div>
    </form>
  )
}
