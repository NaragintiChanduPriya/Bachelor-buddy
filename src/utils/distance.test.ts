import { describe, expect, it } from 'vitest'
import { bikeMinutes, busMinutes, formatDistance, haversineKm, walkMinutes } from './distance'

const hsr = { lat: 12.9121, lng: 77.6446 }
const bellandur = { lat: 12.9304, lng: 77.6784 }

describe('haversineKm', () => {
  it('matches the real HSR Layout to Bellandur distance', () => {
    // Straight line is roughly 4 km.
    expect(haversineKm(hsr, bellandur)).toBeGreaterThan(3)
    expect(haversineKm(hsr, bellandur)).toBeLessThan(5)
  })

  it('is zero for the same point', () => {
    expect(haversineKm(hsr, hsr)).toBe(0)
  })

  it('is symmetric', () => {
    expect(haversineKm(hsr, bellandur)).toBe(haversineKm(bellandur, hsr))
  })
})

describe('formatDistance', () => {
  it('uses metres below a kilometre', () => {
    expect(formatDistance(0.4)).toBe('400 m')
  })

  it('uses one decimal kilometre above that', () => {
    expect(formatDistance(4.23)).toBe('4.2 km')
  })
})

describe('commute estimates', () => {
  it('scale with distance and keep a sensible floor', () => {
    expect(bikeMinutes(10)).toBeGreaterThan(bikeMinutes(2))
    expect(busMinutes(10)).toBeGreaterThan(bikeMinutes(10))
    expect(walkMinutes(0.1)).toBeGreaterThanOrEqual(2)
  })
})
