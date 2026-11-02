import { useId } from 'react'
import { Label } from './label'
import { cn } from '@/utils/cn'

export interface FieldProps {
  label: string
  error?: string
  hint?: string
  className?: string
  children: (ids: { id: string; describedBy: string | undefined; invalid: boolean }) => React.ReactNode
}

/** Wires a label, hint and error message to a control with the right ARIA attributes. */
export function Field({ label, error, hint, className, children }: FieldProps) {
  const id = useId()
  const hintId = `${id}-hint`
  const errorId = `${id}-error`
  const describedBy = [hint ? hintId : null, error ? errorId : null].filter(Boolean).join(' ')

  return (
    <div className={cn('space-y-1.5', className)}>
      <Label htmlFor={id}>{label}</Label>
      {children({ id, describedBy: describedBy || undefined, invalid: Boolean(error) })}
      {hint && !error ? (
        <p id={hintId} className="text-xs text-muted-foreground">
          {hint}
        </p>
      ) : null}
      {error ? (
        <p id={errorId} role="alert" className="text-xs text-destructive">
          {error}
        </p>
      ) : null}
    </div>
  )
}
