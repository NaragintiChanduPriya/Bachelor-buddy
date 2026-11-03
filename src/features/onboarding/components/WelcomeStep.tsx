import { PiggyBank, Sparkles, UtensilsCrossed, Wallet2 } from 'lucide-react'
import { Button } from '@/components/ui/button'

const highlights = [
  { icon: Wallet2, text: 'Splits your salary into a budget that fits your life' },
  { icon: UtensilsCrossed, text: 'Finds the cheapest good meals near home and office' },
  { icon: Sparkles, text: 'Compares prices and card offers before you buy' },
  { icon: PiggyBank, text: 'Shows exactly how much you saved each month' },
]

export function WelcomeStep({ onNext }: { onNext: () => void }) {
  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">Spend less on everything</h1>
        <p className="text-muted-foreground">
          A team of agents watches your budget, compares prices and tells you the cheapest good
          option — so you do not have to check five apps for every purchase.
        </p>
      </div>

      <ul className="space-y-3">
        {highlights.map(({ icon: Icon, text }) => (
          <li key={text} className="flex items-start gap-3">
            <span className="mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-lg bg-primary/10">
              <Icon className="size-4 text-primary" aria-hidden="true" />
            </span>
            <span className="text-sm">{text}</span>
          </li>
        ))}
      </ul>

      <div className="flex justify-end">
        <Button onClick={onNext}>Get started</Button>
      </div>

      <p className="text-center text-xs text-muted-foreground">Takes about a minute.</p>
    </div>
  )
}
