import { Controller, useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { CreditCard } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/utils/cn'
import { availableCards, foodPreferenceOptions } from '../cards'
import { preferencesStepSchema, type PreferencesStepValues } from '../schema'

export interface PreferencesStepProps {
  defaultValues: Partial<PreferencesStepValues>
  submitting: boolean
  onBack: () => void
  onSubmit: (values: PreferencesStepValues) => void
}

export function PreferencesStep({
  defaultValues,
  submitting,
  onBack,
  onSubmit,
}: PreferencesStepProps) {
  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<PreferencesStepValues>({
    resolver: zodResolver(preferencesStepSchema),
    defaultValues: {
      foodPreference: defaultValues.foodPreference,
      cardIds: defaultValues.cardIds ?? [],
    },
  })

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6" noValidate>
      <div className="space-y-2">
        <h1 className="text-2xl font-bold tracking-tight">Last bit</h1>
        <p className="text-sm text-muted-foreground">
          Food preference shapes your meal suggestions. Cards let us find offers you can actually
          use.
        </p>
      </div>

      <fieldset className="space-y-2">
        <legend className="mb-2 text-sm font-medium">What do you eat?</legend>
        <Controller
          control={control}
          name="foodPreference"
          render={({ field }) => (
            <div className="grid gap-2 sm:grid-cols-2">
              {foodPreferenceOptions.map((option) => {
                const selected = field.value === option.value
                return (
                  <label
                    key={option.value}
                    className={cn(
                      'flex cursor-pointer flex-col gap-0.5 rounded-lg border p-3 transition-colors',
                      selected
                        ? 'border-primary bg-primary/5'
                        : 'border-border hover:border-primary/40',
                    )}
                  >
                    <span className="flex items-center gap-2">
                      <input
                        type="radio"
                        className="size-4 accent-[var(--primary)]"
                        value={option.value}
                        checked={selected}
                        onChange={() => field.onChange(option.value)}
                        onBlur={field.onBlur}
                        name={field.name}
                      />
                      <span className="text-sm font-medium">{option.label}</span>
                    </span>
                    <span className="pl-6 text-xs text-muted-foreground">{option.hint}</span>
                  </label>
                )
              })}
            </div>
          )}
        />
        {errors.foodPreference ? (
          <p role="alert" className="text-xs text-destructive">
            {errors.foodPreference.message}
          </p>
        ) : null}
      </fieldset>

      <fieldset className="space-y-2">
        <legend className="mb-2 text-sm font-medium">
          Which cards do you use? <span className="text-muted-foreground">(optional)</span>
        </legend>
        <Controller
          control={control}
          name="cardIds"
          render={({ field }) => (
            <div className="grid gap-2 sm:grid-cols-2">
              {availableCards.map((card) => {
                const checked = field.value.includes(card.id)
                return (
                  <label
                    key={card.id}
                    className={cn(
                      'flex cursor-pointer items-center gap-2 rounded-lg border p-3 transition-colors',
                      checked
                        ? 'border-primary bg-primary/5'
                        : 'border-border hover:border-primary/40',
                    )}
                  >
                    <input
                      type="checkbox"
                      className="size-4 accent-[var(--primary)]"
                      checked={checked}
                      onChange={(event) =>
                        field.onChange(
                          event.target.checked
                            ? [...field.value, card.id]
                            : field.value.filter((id) => id !== card.id),
                        )
                      }
                    />
                    <CreditCard className="size-4 text-muted-foreground" aria-hidden="true" />
                    <span className="text-sm">{card.label}</span>
                  </label>
                )
              })}
            </div>
          )}
        />
      </fieldset>

      <div className="flex gap-2">
        <Button type="button" variant="outline" onClick={onBack} className="flex-1">
          Back
        </Button>
        <Button type="submit" className="flex-1" disabled={submitting}>
          {submitting ? 'Generating your budget…' : 'Create my budget'}
        </Button>
      </div>
    </form>
  )
}
