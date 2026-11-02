import { cn } from '@/utils/cn'

export interface PageHeaderProps {
  title: string
  description?: string
  actions?: React.ReactNode
  className?: string
}

/** One calm header per page: a title, one line of context, and the page's main action. */
export function PageHeader({ title, description, actions, className }: PageHeaderProps) {
  return (
    <header
      className={cn('flex flex-wrap items-end justify-between gap-x-6 gap-y-3', className)}
    >
      <div className="min-w-0 space-y-1.5">
        <h1 className="text-2xl font-semibold tracking-tight sm:text-[28px]">{title}</h1>
        {description ? (
          <p className="max-w-2xl text-sm text-muted-foreground sm:text-[15px]">{description}</p>
        ) : null}
      </div>
      {actions ? <div className="flex flex-wrap items-center gap-2">{actions}</div> : null}
    </header>
  )
}
