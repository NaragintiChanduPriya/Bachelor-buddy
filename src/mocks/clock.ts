/**
 * The mock backend has one clock: the 15th of the current real month at 12:30 PM IST.
 * Every fixture date is generated relative to it, so the demo always looks current and
 * "about 70% of the food budget is used by the 15th" is always true.
 */

const IST_OFFSET_MS = 5.5 * 60 * 60 * 1000

let cachedNow: Date | null = null

/** 15th of the current real month, 12:30 PM IST, as a real Date (UTC instant). */
export function mockNow(): Date {
  if (!cachedNow) {
    const real = new Date()
    // Read the real year/month in IST so a late-night UTC run doesn't slip a month.
    const istReal = new Date(real.getTime() + IST_OFFSET_MS)
    const year = istReal.getUTCFullYear()
    const month = istReal.getUTCMonth()
    // 12:30 IST == 07:00 UTC
    cachedNow = new Date(Date.UTC(year, month, 15, 7, 0, 0, 0))
  }
  return new Date(cachedNow)
}

/** Test seam: pin the clock to an exact instant. */
export function __setMockNow(date: Date | null): void {
  cachedNow = date
}

export function nowISO(): string {
  return mockNow().toISOString()
}

const DAY_MS = 86400000

export function daysAgo(days: number, hour = 13, minute = 0): string {
  return shiftDays(-days, hour, minute)
}

export function daysAhead(days: number, hour = 13, minute = 0): string {
  return shiftDays(days, hour, minute)
}

function shiftDays(delta: number, hour: number, minute: number): string {
  const base = mockNow()
  const shifted = new Date(base.getTime() + delta * DAY_MS)
  const ist = new Date(shifted.getTime() + IST_OFFSET_MS)
  const target = Date.UTC(
    ist.getUTCFullYear(),
    ist.getUTCMonth(),
    ist.getUTCDate(),
    hour,
    minute,
    0,
    0,
  )
  return new Date(target - IST_OFFSET_MS).toISOString()
}

export function hoursAgo(hours: number): string {
  return new Date(mockNow().getTime() - hours * 3600000).toISOString()
}

export function minutesAgo(minutes: number): string {
  return new Date(mockNow().getTime() - minutes * 60000).toISOString()
}

/** YYYY-MM for the mock current month. */
export function currentMonthKey(): string {
  const ist = new Date(mockNow().getTime() + IST_OFFSET_MS)
  return `${ist.getUTCFullYear()}-${String(ist.getUTCMonth() + 1).padStart(2, '0')}`
}

/** YYYY-MM offset from the mock current month; -1 is last month. */
export function monthKeyOffset(offset: number): string {
  const ist = new Date(mockNow().getTime() + IST_OFFSET_MS)
  const d = new Date(Date.UTC(ist.getUTCFullYear(), ist.getUTCMonth() + offset, 1))
  return `${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(2, '0')}`
}

export function daysInCurrentMonth(): number {
  const ist = new Date(mockNow().getTime() + IST_OFFSET_MS)
  return new Date(Date.UTC(ist.getUTCFullYear(), ist.getUTCMonth() + 1, 0)).getUTCDate()
}

/** Days remaining after the mock today (the 15th), inclusive of nothing past month end. */
export function daysLeftInMonth(): number {
  return daysInCurrentMonth() - 15
}

export function dayOfMonth(): number {
  return 15
}

/** Hour of the mock clock in IST — 12, used for the time-of-day greeting. */
export function mockHourIST(): number {
  const ist = new Date(mockNow().getTime() + IST_OFFSET_MS)
  return ist.getUTCHours()
}

/** An ISO timestamp on a given day of the mock current month. */
export function dayInCurrentMonth(day: number, hour = 13, minute = 0): string {
  const ist = new Date(mockNow().getTime() + IST_OFFSET_MS)
  const target = Date.UTC(ist.getUTCFullYear(), ist.getUTCMonth(), day, hour, minute, 0, 0)
  return new Date(target - IST_OFFSET_MS).toISOString()
}

/** Days from mock today until the coming Friday (1-7). */
export function daysUntilNextFriday(): number {
  const ist = new Date(mockNow().getTime() + IST_OFFSET_MS)
  const dow = ist.getUTCDay() // 0 Sun .. 5 Fri
  const delta = (5 - dow + 7) % 7
  return delta === 0 ? 7 : delta
}
