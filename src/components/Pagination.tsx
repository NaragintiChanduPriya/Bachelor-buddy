import { ChevronLeft, ChevronRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/utils/cn'

export interface PaginationProps {
  page: number
  pageSize: number
  total: number
  onPageChange: (page: number) => void
  className?: string
}

/** Previous / next pager for the server-paginated lists. Renders nothing for a single page. */
export function Pagination({ page, pageSize, total, onPageChange, className }: PaginationProps) {
  const pageCount = Math.max(1, Math.ceil(total / Math.max(1, pageSize)))
  if (pageCount <= 1) return null

  return (
    <nav
      aria-label="Pagination"
      className={cn('flex items-center justify-between gap-3 pt-2', className)}
    >
      <Button
        variant="outline"
        size="sm"
        disabled={page <= 1}
        onClick={() => onPageChange(page - 1)}
      >
        <ChevronLeft aria-hidden="true" />
        Previous
      </Button>
      <p className="text-sm text-muted-foreground">
        Page <span className="tabular font-medium text-foreground">{page}</span> of{' '}
        <span className="tabular">{pageCount}</span>
      </p>
      <Button
        variant="outline"
        size="sm"
        disabled={page >= pageCount}
        onClick={() => onPageChange(page + 1)}
      >
        Next
        <ChevronRight aria-hidden="true" />
      </Button>
    </nav>
  )
}
