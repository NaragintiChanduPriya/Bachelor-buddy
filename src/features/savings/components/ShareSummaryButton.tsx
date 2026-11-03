import { useState } from 'react'
import { Check, Download } from 'lucide-react'
import type { MonthlySavings } from '@/types/savings'
import { Button } from '@/components/ui/button'
import { downloadSavingsCard } from '../utils/exportSavingsPng'

/** Exports this month's savings as a shareable 1200 × 630 PNG. */
export function ShareSummaryButton({ savings, name }: { savings: MonthlySavings; name: string }) {
  const [status, setStatus] = useState<'idle' | 'working' | 'done' | 'error'>('idle')

  const download = async () => {
    setStatus('working')
    try {
      await downloadSavingsCard({
        name,
        monthLabel: savings.monthLabel,
        saved: savings.saved,
        goal: savings.goal,
        percentOfGoal: savings.percentOfGoal,
        headline: savings.headline,
        topSources: savings.byCategory.map((c) => ({ label: c.label, saved: c.saved })),
      })
      setStatus('done')
      setTimeout(() => setStatus('idle'), 2500)
    } catch {
      setStatus('error')
    }
  }

  return (
    <div className="flex flex-col items-end gap-1">
      <Button variant="outline" onClick={() => void download()} disabled={status === 'working'}>
        {status === 'done' ? <Check aria-hidden="true" /> : <Download aria-hidden="true" />}
        {status === 'working' ? 'Preparing…' : status === 'done' ? 'Downloaded' : 'Download summary'}
      </Button>
      <span aria-live="polite" className="text-xs text-destructive">
        {status === 'error' ? 'Could not create the image. Try again.' : ''}
      </span>
    </div>
  )
}
