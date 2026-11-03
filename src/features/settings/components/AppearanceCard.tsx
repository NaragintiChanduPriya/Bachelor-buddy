import { Monitor, Moon, Palette, Sun } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { useUiStore, type Theme } from '@/store/uiStore'
import { cn } from '@/utils/cn'

const options: Array<{ value: Theme; label: string; icon: typeof Sun }> = [
  { value: 'light', label: 'Light', icon: Sun },
  { value: 'dark', label: 'Dark', icon: Moon },
  { value: 'system', label: 'System', icon: Monitor },
]

export function AppearanceCard() {
  const theme = useUiStore((s) => s.theme)
  const setTheme = useUiStore((s) => s.setTheme)

  return (
    <Card>
      <CardHeader className="pb-4">
        <CardTitle className="flex items-center gap-2 text-base">
          <Palette className="size-4 text-muted-foreground" aria-hidden="true" />
          Appearance
        </CardTitle>
        <CardDescription>System follows your device setting.</CardDescription>
      </CardHeader>
      <CardContent>
        <fieldset>
          <legend className="sr-only">Theme</legend>
          <div className="grid grid-cols-3 gap-2">
            {options.map((option) => {
              const Icon = option.icon
              const selected = theme === option.value
              return (
                <label
                  key={option.value}
                  className={cn(
                    'flex cursor-pointer flex-col items-center gap-2 rounded-lg border p-3 text-sm font-medium transition-colors has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-ring',
                    selected
                      ? 'border-primary bg-primary/5 text-primary'
                      : 'border-border text-muted-foreground hover:border-primary/40 hover:text-foreground',
                  )}
                >
                  <input
                    type="radio"
                    name="theme"
                    value={option.value}
                    checked={selected}
                    onChange={() => setTheme(option.value)}
                    className="sr-only"
                  />
                  <Icon className="size-5" aria-hidden="true" />
                  {option.label}
                </label>
              )
            })}
          </div>
        </fieldset>
      </CardContent>
    </Card>
  )
}
