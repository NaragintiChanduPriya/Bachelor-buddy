import { describe, expect, it } from 'vitest'
import { formatINR, formatINRCompact, formatINRPlain, formatPercent } from './currency'

describe('formatINR', () => {
  it('formats with the Indian digit grouping', () => {
    expect(formatINR(123450)).toBe('₹1,23,450')
    expect(formatINR(40000)).toBe('₹40,000')
    expect(formatINR(1800)).toBe('₹1,800')
  })

  it('shows no paise', () => {
    expect(formatINR(1499.6)).toBe('₹1,500')
    expect(formatINR(0)).toBe('₹0')
  })

  it('handles negative amounts', () => {
    expect(formatINR(-1500)).toBe('-₹1,500')
  })
})

describe('formatINRPlain', () => {
  it('omits the currency symbol', () => {
    expect(formatINRPlain(123450)).toBe('1,23,450')
  })
})

describe('formatINRCompact', () => {
  it('uses k for thousands and L for lakhs', () => {
    expect(formatINRCompact(8200)).toBe('₹8.2k')
    expect(formatINRCompact(1500)).toBe('₹1.5k')
    expect(formatINRCompact(140000)).toBe('₹1.4L')
    expect(formatINRCompact(450)).toBe('₹450')
  })
})

describe('formatPercent', () => {
  it('rounds to whole percents', () => {
    expect(formatPercent(69.6)).toBe('70%')
  })
})
