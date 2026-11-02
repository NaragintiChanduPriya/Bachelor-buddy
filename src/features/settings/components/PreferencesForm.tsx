import { Controller, useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { CheckCircle2, CreditCard, IndianRupee, MapPin, Utensils } from 'lucide-react'
import type { User } from '@/types/user'
import type { AreasResponse } from '@/types/meta'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select } from '@/components/ui/select'
import { Field } from '@/components/ui/field'
import { availableCards, foodPreferenceOptions } from '@/features/onboarding/cards'
import { useUpdatePreferences } from '@/hooks/useMe'
import { isApiError } from '@/lib/api/ApiError'
import { settingsSchema, type SettingsValues } from '../schema'
import { cn } from '@/utils/cn'

function valuesFrom(user: User): SettingsValues {
  const p = user.preferences
  return {
    salary: p.salary,
    savingsGoal: p.savingsGoal,
    homeAreaId: p.homeAreaId,
    officeAreaId: p.officeAreaId,
    techParkId: p.techParkId ?? '',
    foodPreference: p.foodPreference,
    cardIds: p.cards.map((c) => c.id),
  }
}

function Section({
  icon: Icon,
  title,
  description,
  children,
}: {
  icon: typeof MapPin
  title: string
  description: string
  children: React.ReactNode
}) {
  return (
    <Card>
      <CardHeader className="pb-4">
        <CardTitle className="flex items-center gap-2 text-base">
          <Icon className="size-4 text-muted-foreground" aria-hidden="true" />
          {title}
        </CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent>{children}</CardContent>
    </Card>
  )
}

export function PreferencesForm({ user, areas }: { user: User; areas: AreasResponse }) {
  const update = useUpdatePreferences()
  const {
    register,
    control,
    handleSubmit,
    reset,
    formState: { errors, isDirty },
  } = useForm<SettingsValues>({
    resolver: zodResolver(settingsSchema),
    defaultValues: valuesFrom(user),
  })

  const onSubmit = (values: SettingsValues) => {
    update.mutate(
      {
        salary: values.salary,
        savingsGoal: values.savingsGoal,
        homeAreaId: values.homeAreaId,
        officeAreaId: values.officeAreaId,
        techParkId: values.techParkId || null,
        foodPreference: values.foodPreference,
        cards: availableCards.filter((card) => values.cardIds.includes(card.id)),
      },
      { onSuccess: (saved) => reset(valuesFrom(saved)) },
    )
  }

  const serverError = update.isError
    ? isApiError(update.error)
      ? update.error.message
      : 'We could not save your changes.'
    : null

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-4">
      <Section
        icon={IndianRupee}
        title="Money"
        description="Changing your salary or goal regenerates your category budgets."
      >
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Monthly take-home salary" error={errors.salary?.message}>
            {({ id, describedBy, invalid }) => (
              <Input
                id={id}
                type="number"
                inputMode="numeric"
                aria-describedby={describedBy}
                aria-invalid={invalid}
                {...register('salary', { valueAsNumber: true })}
              />
            )}
          </Field>
          <Field
            label="Monthly savings goal"
            error={errors.savingsGoal?.message}
            hint="Set aside first; the rest is split across categories."
          >
            {({ id, describedBy, invalid }) => (
              <Input
                id={id}
                type="number"
                inputMode="numeric"
                aria-describedby={describedBy}
                aria-invalid={invalid}
                {...register('savingsGoal', { valueAsNumber: true })}
              />
            )}
          </Field>
        </div>
      </Section>

      <Section
        icon={MapPin}
        title="Places"
        description="Food, rent and commute suggestions are measured from these."
      >
        <div className="grid gap-4 sm:grid-cols-3">
          <Field label="Home area" error={errors.homeAreaId?.message}>
            {({ id, describedBy, invalid }) => (
              <Controller
                control={control}
                name="homeAreaId"
                render={({ field }) => (
                  <Select
                    id={id}
                    aria-describedby={describedBy}
                    aria-invalid={invalid}
                    name={field.name}
                    value={field.value}
                    onValueChange={field.onChange}
                    onBlur={field.onBlur}
                  >
                    {areas.areas.map((area) => (
                      <option key={area.id} value={area.id}>
                        {area.name}
                      </option>
                    ))}
                  </Select>
                )}
              />
            )}
          </Field>
          <Field label="Office area" error={errors.officeAreaId?.message}>
            {({ id, describedBy, invalid }) => (
              <Controller
                control={control}
                name="officeAreaId"
                render={({ field }) => (
                  <Select
                    id={id}
                    aria-describedby={describedBy}
                    aria-invalid={invalid}
                    name={field.name}
                    value={field.value}
                    onValueChange={field.onChange}
                    onBlur={field.onBlur}
                  >
                    {areas.areas.map((area) => (
                      <option key={area.id} value={area.id}>
                        {area.name}
                      </option>
                    ))}
                  </Select>
                )}
              />
            )}
          </Field>
          <Field label="Tech park" error={errors.techParkId?.message}>
            {({ id, describedBy }) => (
              <Controller
                control={control}
                name="techParkId"
                render={({ field }) => (
                  <Select
                    id={id}
                    aria-describedby={describedBy}
                    name={field.name}
                    value={field.value}
                    onValueChange={field.onChange}
                    onBlur={field.onBlur}
                  >
                    <option value="">Not in a tech park</option>
                    {areas.techParks.map((park) => (
                      <option key={park.id} value={park.id}>
                        {park.name} · {park.areaName}
                      </option>
                    ))}
                  </Select>
                )}
              />
            )}
          </Field>
        </div>
      </Section>

      <Section
        icon={Utensils}
        title="Food preference"
        description="Shapes which meals and places your Food agent suggests."
      >
        <Controller
          control={control}
          name="foodPreference"
          render={({ field }) => (
            <fieldset>
              <legend className="sr-only">What do you eat?</legend>
              <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
                {foodPreferenceOptions.map((option) => {
                  const selected = field.value === option.value
                  return (
                    <label
                      key={option.value}
                      className={cn(
                        'flex cursor-pointer flex-col gap-0.5 rounded-lg border p-3 transition-colors has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-ring',
                        selected
                          ? 'border-primary bg-primary/5'
                          : 'border-border hover:border-primary/40',
                      )}
                    >
                      <span className="flex items-center gap-2">
                        <input
                          type="radio"
                          className="size-4 accent-[var(--primary)]"
                          name={field.name}
                          value={option.value}
                          checked={selected}
                          onChange={() => field.onChange(option.value)}
                          onBlur={field.onBlur}
                        />
                        <span className="text-sm font-medium">{option.label}</span>
                      </span>
                      <span className="pl-6 text-xs text-muted-foreground">{option.hint}</span>
                    </label>
                  )
                })}
              </div>
            </fieldset>
          )}
        />
      </Section>

      <Section
        icon={CreditCard}
        title="Your cards"
        description="Your Deals agent only shows offers you can actually use."
      >
        <Controller
          control={control}
          name="cardIds"
          render={({ field }) => (
            <fieldset>
              <legend className="sr-only">Cards you use</legend>
              <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
                {availableCards.map((card) => {
                  const checked = field.value.includes(card.id)
                  return (
                    <label
                      key={card.id}
                      className={cn(
                        'flex cursor-pointer items-center gap-3 rounded-lg border p-3 text-sm transition-colors has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-ring',
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
                        onBlur={field.onBlur}
                      />
                      <span className="min-w-0 font-medium leading-tight">
                        {card.bank}
                        <span className="block text-xs font-normal capitalize text-muted-foreground">
                          {card.type} card
                        </span>
                      </span>
                    </label>
                  )
                })}
              </div>
            </fieldset>
          )}
        />
      </Section>

      {/* Sticky save bar so the action is always reachable on a long form. */}
      <div className="sticky bottom-20 z-20 flex flex-wrap items-center justify-between gap-3 rounded-xl border border-border bg-card/95 p-3 shadow-raised backdrop-blur lg:bottom-4">
        <p aria-live="polite" className="text-sm">
          {serverError ? (
            <span role="alert" className="text-destructive">
              {serverError}
            </span>
          ) : update.isSuccess && !isDirty ? (
            <span className="flex items-center gap-1.5 text-success">
              <CheckCircle2 className="size-4" aria-hidden="true" />
              Saved. Your agents are using the new details.
            </span>
          ) : isDirty ? (
            <span className="text-muted-foreground">You have unsaved changes.</span>
          ) : (
            <span className="text-muted-foreground">Everything is up to date.</span>
          )}
        </p>
        <div className="flex gap-2">
          <Button
            type="button"
            variant="ghost"
            disabled={!isDirty || update.isPending}
            onClick={() => {
              reset(valuesFrom(user))
              update.reset()
            }}
          >
            Discard
          </Button>
          <Button type="submit" disabled={!isDirty || update.isPending}>
            {update.isPending ? 'Saving…' : 'Save changes'}
          </Button>
        </div>
      </div>
    </form>
  )
}
