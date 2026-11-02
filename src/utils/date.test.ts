import { describe, expect, it } from 'vitest'
import {
  formatMonthLabel,
  formatRelative,
  greetingForHour,
  isSameDay,
  toISTDateKey,
  toMonthKey,
} from './date'

describe('toISTDateKey', () => {
  it('reports the IST calendar day, not the UTC one', () => {
    // 2026-03-10T20:00Z is already 2026-03-11 in IST.
    expect(toISTDateKey('2026-03-10T20:00:00.000Z')).toBe('2026-03-11')
  })
})

describe('toMonthKey', () => {
  it('returns YYYY-MM', () => {
    expect(toMonthKey('2026-10-15T07:00:00.000Z')).toBe('2026-10')
  })
})

describe('formatMonthLabel', () => {
  it('accepts a month key', () => {
    expect(formatMonthLabel('2026-10')).toBe('October 2026')
  })

  it('accepts a full ISO date', () => {
    expect(formatMonthLabel('2026-10-15T07:00:00.000Z')).toBe('October 2026')
  })
})

describe('formatRelative', () => {
  const now = new Date('2026-10-15T07:00:00.000Z')

  it('describes recent times', () => {
    expect(formatRelative('2026-10-15T06:59:30.000Z', now)).toBe('just now')
    expect(formatRelative('2026-10-15T06:30:00.000Z', now)).toBe('30m ago')
    expect(formatRelative('2026-10-15T04:00:00.000Z', now)).toBe('3h ago')
    expect(formatRelative('2026-10-14T07:00:00.000Z', now)).toBe('yesterday')
    expect(formatRelative('2026-10-12T07:00:00.000Z', now)).toBe('3d ago')
  })

  it('does not round a partial unit up to the next one', () => {
    // 90 minutes is still "1h ago", not "2h ago".
    expect(formatRelative('2026-10-15T05:30:00.000Z', now)).toBe('1h ago')
    // 47 hours is still yesterday, not 2 days.
    expect(formatRelative('2026-10-13T08:00:00.000Z', now)).toBe('yesterday')
  })

  it('falls back to a date beyond a week', () => {
    expect(formatRelative('2026-10-01T07:00:00.000Z', now)).toMatch(/Oct/)
  })
})

describe('isSameDay', () => {
  it('compares in IST', () => {
    expect(isSameDay('2026-10-15T01:00:00.000Z', '2026-10-15T18:00:00.000Z')).toBe(true)
    expect(isSameDay('2026-10-15T20:00:00.000Z', '2026-10-15T01:00:00.000Z')).toBe(false)
  })
})

describe('greetingForHour', () => {
  it('matches the time of day', () => {
    expect(greetingForHour(8)).toBe('Good morning')
    expect(greetingForHour(12)).toBe('Good afternoon')
    expect(greetingForHour(19)).toBe('Good evening')
    expect(greetingForHour(22)).toBe('Good night')
    expect(greetingForHour(3)).toBe('Still up')
  })
})
