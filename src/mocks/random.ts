/**
 * Seeded randomness so generated data (price history, ratings, review counts) is identical
 * on every reload. Random API failure injection deliberately uses Math.random instead, so
 * toggling failures never shifts the seeded data.
 */

/** mulberry32 — small, fast, good enough distribution for fixtures. */
export function createRandom(seed: number): () => number {
  let a = seed >>> 0
  return function next() {
    a = (a + 0x6d2b79f5) >>> 0
    let t = a
    t = Math.imul(t ^ (t >>> 15), t | 1)
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61)
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

/** Stable 32-bit hash of a string, for deriving a seed from an id. */
export function hashSeed(input: string): number {
  let h = 2166136261
  for (let i = 0; i < input.length; i++) {
    h ^= input.charCodeAt(i)
    h = Math.imul(h, 16777619)
  }
  return h >>> 0
}

export function seededFrom(input: string): () => number {
  return createRandom(hashSeed(input))
}

export function randomInt(rand: () => number, min: number, max: number): number {
  return Math.floor(rand() * (max - min + 1)) + min
}

export function randomFloat(rand: () => number, min: number, max: number, decimals = 1): number {
  const value = rand() * (max - min) + min
  const factor = 10 ** decimals
  return Math.round(value * factor) / factor
}

export function pick<T>(rand: () => number, items: readonly T[]): T {
  if (items.length === 0) throw new Error('pick() called with an empty list')
  return items[Math.floor(rand() * items.length)] as T
}

export function pickMany<T>(rand: () => number, items: readonly T[], count: number): T[] {
  const pool = [...items]
  const out: T[] = []
  const n = Math.min(count, pool.length)
  for (let i = 0; i < n; i++) {
    const idx = Math.floor(rand() * pool.length)
    out.push(pool.splice(idx, 1)[0] as T)
  }
  return out
}

export function chance(rand: () => number, probability: number): boolean {
  return rand() < probability
}
