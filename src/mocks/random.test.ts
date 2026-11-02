import { describe, expect, it } from 'vitest'
import { chance, createRandom, hashSeed, pick, pickMany, randomFloat, randomInt, seededFrom } from './random'

describe('createRandom', () => {
  it('produces the same sequence for the same seed', () => {
    const a = createRandom(42)
    const b = createRandom(42)
    const seqA = Array.from({ length: 10 }, a)
    const seqB = Array.from({ length: 10 }, b)
    expect(seqA).toEqual(seqB)
  })

  it('produces different sequences for different seeds', () => {
    const a = Array.from({ length: 5 }, createRandom(1))
    const b = Array.from({ length: 5 }, createRandom(2))
    expect(a).not.toEqual(b)
  })

  it('stays inside [0, 1)', () => {
    const rand = createRandom(7)
    for (let i = 0; i < 500; i++) {
      const v = rand()
      expect(v).toBeGreaterThanOrEqual(0)
      expect(v).toBeLessThan(1)
    }
  })
})

describe('hashSeed', () => {
  it('is stable for the same string', () => {
    expect(hashSeed('prod_007')).toBe(hashSeed('prod_007'))
  })

  it('differs across strings', () => {
    expect(hashSeed('prod_007')).not.toBe(hashSeed('prod_008'))
  })
})

describe('helpers', () => {
  it('randomInt respects the inclusive bounds', () => {
    const rand = createRandom(3)
    for (let i = 0; i < 200; i++) {
      const v = randomInt(rand, 5, 9)
      expect(v).toBeGreaterThanOrEqual(5)
      expect(v).toBeLessThanOrEqual(9)
      expect(Number.isInteger(v)).toBe(true)
    }
  })

  it('randomFloat rounds to the requested decimals', () => {
    const v = randomFloat(createRandom(9), 3, 5, 1)
    expect(v).toBe(Math.round(v * 10) / 10)
  })

  it('pick returns a member of the list', () => {
    const items = ['a', 'b', 'c'] as const
    expect(items).toContain(pick(createRandom(11), items))
  })

  it('pick throws on an empty list rather than returning undefined', () => {
    expect(() => pick(createRandom(1), [])).toThrow()
  })

  it('pickMany returns distinct items and never more than exist', () => {
    const items = ['a', 'b', 'c', 'd']
    const got = pickMany(createRandom(5), items, 3)
    expect(got).toHaveLength(3)
    expect(new Set(got).size).toBe(3)
    expect(pickMany(createRandom(5), items, 99)).toHaveLength(4)
  })

  it('chance is deterministic for a seed', () => {
    expect(chance(createRandom(2), 0.5)).toBe(chance(createRandom(2), 0.5))
  })

  it('seededFrom derives a generator from a string id', () => {
    const a = Array.from({ length: 5 }, seededFrom('prod_007'))
    const b = Array.from({ length: 5 }, seededFrom('prod_007'))
    expect(a).toEqual(b)
  })
})
