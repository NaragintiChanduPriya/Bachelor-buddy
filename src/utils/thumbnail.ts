import type { CSSProperties } from 'react'

/** Gradient thumbnail derived from a seed — no real brand imagery anywhere. */
export function thumbnailStyle(seed: number): CSSProperties {
  const hue = seed % 360
  return {
    background: `linear-gradient(135deg, oklch(0.72 0.12 ${hue}), oklch(0.58 0.14 ${(hue + 48) % 360}))`,
  }
}

/** Up to two initials, for the text drawn on a gradient thumbnail. */
export function initialsOf(name: string): string {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((word) => word[0])
    .join('')
    .toUpperCase()
}
