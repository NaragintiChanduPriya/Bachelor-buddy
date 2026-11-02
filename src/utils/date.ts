const IST = 'Asia/Kolkata'

const dayMonth = new Intl.DateTimeFormat('en-IN', {
  day: 'numeric',
  month: 'short',
  timeZone: IST,
})
const dayMonthYear = new Intl.DateTimeFormat('en-IN', {
  day: 'numeric',
  month: 'short',
  year: 'numeric',
  timeZone: IST,
})
const timeOnly = new Intl.DateTimeFormat('en-IN', {
  hour: 'numeric',
  minute: '2-digit',
  hour12: true,
  timeZone: IST,
})
const monthYear = new Intl.DateTimeFormat('en-IN', {
  month: 'long',
  year: 'numeric',
  timeZone: IST,
})
const weekday = new Intl.DateTimeFormat('en-IN', { weekday: 'long', timeZone: IST })
const monthShort = new Intl.DateTimeFormat('en-IN', { month: 'short', timeZone: IST })

export function formatDate(iso: string): string {
  return dayMonth.format(new Date(iso))
}

export function formatFullDate(iso: string): string {
  return dayMonthYear.format(new Date(iso))
}

export function formatTime(iso: string): string {
  return timeOnly.format(new Date(iso))
}

export function formatDateTime(iso: string): string {
  return `${dayMonth.format(new Date(iso))}, ${timeOnly.format(new Date(iso))}`
}

export function formatWeekday(iso: string): string {
  return weekday.format(new Date(iso))
}

/** "October 2026" from an ISO date or a YYYY-MM key. */
export function formatMonthLabel(monthKeyOrIso: string): string {
  const iso = /^\d{4}-\d{2}$/.test(monthKeyOrIso) ? `${monthKeyOrIso}-01` : monthKeyOrIso
  return monthYear.format(new Date(iso))
}

/** "Oct" from an ISO date or a YYYY-MM key, for chart axes. */
export function formatMonthShort(monthKeyOrIso: string): string {
  const iso = /^\d{4}-\d{2}$/.test(monthKeyOrIso) ? `${monthKeyOrIso}-15` : monthKeyOrIso
  return monthShort.format(new Date(iso))
}

/** Relative time against a caller-supplied "now" so mock time stays deterministic. */
export function formatRelative(iso: string, now: Date = new Date()): string {
  const diffMs = now.getTime() - new Date(iso).getTime()
  const diffMin = Math.floor(diffMs / 60000)
  if (diffMin < 1) return 'just now'
  if (diffMin < 60) return `${diffMin}m ago`
  const diffHr = Math.floor(diffMin / 60)
  if (diffHr < 24) return `${diffHr}h ago`
  const diffDay = Math.floor(diffHr / 24)
  if (diffDay === 1) return 'yesterday'
  if (diffDay < 7) return `${diffDay}d ago`
  return formatDate(iso)
}

export function isSameDay(a: string, b: string): boolean {
  return toISTDateKey(a) === toISTDateKey(b)
}

/** YYYY-MM-DD in IST. */
export function toISTDateKey(iso: string | Date): string {
  const d = typeof iso === 'string' ? new Date(iso) : iso
  const parts = new Intl.DateTimeFormat('en-CA', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    timeZone: IST,
  }).format(d)
  return parts
}

/** YYYY-MM in IST. */
export function toMonthKey(iso: string | Date): string {
  return toISTDateKey(iso).slice(0, 7)
}

export function greetingForHour(hour: number): string {
  if (hour < 5) return 'Still up'
  if (hour < 12) return 'Good morning'
  if (hour < 17) return 'Good afternoon'
  if (hour < 21) return 'Good evening'
  return 'Good night'
}
