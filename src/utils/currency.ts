const inr = new Intl.NumberFormat('en-IN', {
  style: 'currency',
  currency: 'INR',
  maximumFractionDigits: 0,
  minimumFractionDigits: 0,
})

const inrPlain = new Intl.NumberFormat('en-IN', { maximumFractionDigits: 0 })

/** The single place rupee amounts become strings. Money is always integer rupees. */
export function formatINR(amount: number): string {
  return inr.format(Math.round(amount))
}

/** Digits only, for places that render their own rupee sign. */
export function formatINRPlain(amount: number): string {
  return inrPlain.format(Math.round(amount))
}

/** Compact form for charts and tight cards: ₹8.2k, ₹1.4L. */
export function formatINRCompact(amount: number): string {
  const value = Math.round(amount)
  const abs = Math.abs(value)
  if (abs >= 100000) return `₹${(value / 100000).toFixed(abs >= 1000000 ? 0 : 1)}L`
  if (abs >= 1000) return `₹${(value / 1000).toFixed(abs >= 10000 ? 0 : 1)}k`
  return `₹${value}`
}

export function formatPercent(value: number): string {
  return `${Math.round(value)}%`
}
