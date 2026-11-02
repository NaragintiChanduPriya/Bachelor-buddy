import { afterEach, describe, expect, it } from 'vitest'
import {
  __setMockNow,
  currentMonthKey,
  dayInCurrentMonth,
  dayOfMonth,
  daysAgo,
  daysAhead,
  daysInCurrentMonth,
  daysLeftInMonth,
  daysUntilNextFriday,
  mockHourIST,
  mockNow,
  monthKeyOffset,
} from './clock'

afterEach(() => {
  __setMockNow(null)
})

describe('mockNow', () => {
  it('is the 15th of the current real month at 12:30 PM IST', () => {
    const now = mockNow()
    const ist = new Date(now.getTime() + 5.5 * 3600000)
    expect(ist.getUTCDate()).toBe(15)
    expect(ist.getUTCHours()).toBe(12)
    expect(ist.getUTCMinutes()).toBe(30)
  })

  it('returns the same instant on repeated calls', () => {
    expect(mockNow().getTime()).toBe(mockNow().getTime())
  })

  it('does not hand out a reference callers can mutate', () => {
    const first = mockNow()
    first.setFullYear(1999)
    expect(mockNow().getFullYear()).not.toBe(1999)
  })
})

describe('date helpers', () => {
  it('daysAgo and daysAhead move in the right direction', () => {
    expect(new Date(daysAgo(5)).getTime()).toBeLessThan(mockNow().getTime())
    expect(new Date(daysAhead(5)).getTime()).toBeGreaterThan(mockNow().getTime())
  })

  it('reports the mock day of month and hour', () => {
    expect(dayOfMonth()).toBe(15)
    expect(mockHourIST()).toBe(12)
  })

  it('computes days left from the 15th', () => {
    expect(daysLeftInMonth()).toBe(daysInCurrentMonth() - 15)
  })

  it('formats month keys as YYYY-MM', () => {
    expect(currentMonthKey()).toMatch(/^\d{4}-\d{2}$/)
    expect(monthKeyOffset(0)).toBe(currentMonthKey())
  })

  it('walks back across a year boundary', () => {
    __setMockNow(new Date(Date.UTC(2026, 0, 15, 7, 0, 0)))
    expect(currentMonthKey()).toBe('2026-01')
    expect(monthKeyOffset(-1)).toBe('2025-12')
    expect(monthKeyOffset(-6)).toBe('2025-07')
  })

  it('keeps generated days inside the mock month', () => {
    const iso = dayInCurrentMonth(3)
    expect(iso.slice(0, 7)).toBe(currentMonthKey())
  })

  it('finds a Friday between 1 and 7 days out', () => {
    const delta = daysUntilNextFriday()
    expect(delta).toBeGreaterThanOrEqual(1)
    expect(delta).toBeLessThanOrEqual(7)
    const friday = new Date(mockNow().getTime() + delta * 86400000 + 5.5 * 3600000)
    expect(friday.getUTCDay()).toBe(5)
  })
})
