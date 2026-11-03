import { Controller, useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Button } from '@/components/ui/button'
import { Field } from '@/components/ui/field'
import { Select } from '@/components/ui/select'
import { Skeleton } from '@/components/ui/skeleton'
import { ErrorState } from '@/components/ErrorState'
import { useAreas } from '@/hooks/useAreas'
import { areasStepSchema, type AreasStepValues } from '../schema'

export interface AreasStepProps {
  defaultValues: Partial<AreasStepValues>
  onBack: () => void
  onSubmit: (values: AreasStepValues) => void
}

/** Area and tech park options come from GET /meta/areas — never hard-coded in the component. */
export function AreasStep({ defaultValues, onBack, onSubmit }: AreasStepProps) {
  const { data, isPending, isError, error, refetch } = useAreas()
  const {
    control,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<AreasStepValues>({
    resolver: zodResolver(areasStepSchema),
    defaultValues: {
      homeAreaId: defaultValues.homeAreaId ?? '',
      officeAreaId: defaultValues.officeAreaId ?? '',
      techParkId: defaultValues.techParkId ?? null,
    },
  })

  const officeAreaId = watch('officeAreaId')
  const parksInOfficeArea = data?.techParks.filter((p) => p.areaId === officeAreaId) ?? []
  const parkOptions = parksInOfficeArea.length > 0 ? parksInOfficeArea : (data?.techParks ?? [])

  if (isError) {
    return (
      <div className="space-y-4">
        <ErrorState error={error} onRetry={() => void refetch()} />
        <Button variant="outline" onClick={onBack}>
          Back
        </Button>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6" noValidate>
      <div className="space-y-2">
        <h1 className="text-2xl font-bold tracking-tight">Where are you based?</h1>
        <p className="text-sm text-muted-foreground">
          We use this to find food, homes and commutes near you.
        </p>
      </div>

      {isPending ? (
        <div className="space-y-4">
          <Skeleton className="h-16 w-full" />
          <Skeleton className="h-16 w-full" />
          <Skeleton className="h-16 w-full" />
        </div>
      ) : (
        <div className="space-y-4">
          <Field label="Where do you live?" error={errors.homeAreaId?.message}>
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
                    <option value="">Choose an area</option>
                    {data.areas.map((area) => (
                      <option key={area.id} value={area.id}>
                        {area.name}
                      </option>
                    ))}
                  </Select>
                )}
              />
            )}
          </Field>

          <Field label="Where do you work?" error={errors.officeAreaId?.message}>
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
                    <option value="">Choose an area</option>
                    {data.areas.map((area) => (
                      <option key={area.id} value={area.id}>
                        {area.name}
                      </option>
                    ))}
                  </Select>
                )}
              />
            )}
          </Field>

          <Field
            label="Tech park (optional)"
            error={errors.techParkId?.message}
            hint="Helps us estimate your commute."
          >
            {({ id, describedBy }) => (
              <Controller
                control={control}
                name="techParkId"
                render={({ field }) => (
                  <Select
                    id={id}
                    aria-describedby={describedBy}
                    name={field.name}
                    value={field.value ?? ''}
                    onValueChange={(value) => field.onChange(value === '' ? null : value)}
                    onBlur={field.onBlur}
                  >
                    <option value="">Not applicable</option>
                    {parkOptions.map((park) => (
                      <option key={park.id} value={park.id}>
                        {park.name} — {park.areaName}
                      </option>
                    ))}
                  </Select>
                )}
              />
            )}
          </Field>
        </div>
      )}

      <div className="flex items-center justify-between gap-2">
        <Button type="button" variant="outline" onClick={onBack}>
          Back
        </Button>
        <Button type="submit" disabled={isPending}>
          Continue
        </Button>
      </div>
    </form>
  )
}
