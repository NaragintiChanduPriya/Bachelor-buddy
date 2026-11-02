import { describe, expect, it } from 'vitest'
import { compareDelivery, deliveryPlatformNames } from './delivery'
import { generateFoodListings } from '../fixtures/generateFood'

const listings = generateFoodListings()
const mess = listings.find((l) => l.id === 'food_003')!

describe('compareDelivery', () => {
  const comparison = compareDelivery(mess, undefined, 4)

  it('quotes every delivery platform', () => {
    expect(comparison.deliveryOptions).toHaveLength(deliveryPlatformNames.length)
    expect(comparison.deliveryOptions.map((o) => o.platform).sort()).toEqual(
      [...deliveryPlatformNames].sort(),
    )
  })

  it('makes each bill add up to its own total', () => {
    for (const option of comparison.deliveryOptions) {
      const parts =
        option.itemPrice +
        option.deliveryFee +
        option.platformFee +
        option.packagingFee +
        option.taxes
      expect(parts, option.platform).toBe(option.total)
    }
  })

  it('uses whole rupees throughout', () => {
    for (const option of comparison.deliveryOptions) {
      for (const [key, value] of Object.entries(option)) {
        if (typeof value === 'number') {
          expect(Number.isInteger(value), `${option.platform}.${key}`).toBe(true)
        }
      }
    }
  })

  it('returns the cheapest platform first', () => {
    const totals = comparison.deliveryOptions.map((o) => o.total)
    expect([...totals].sort((a, b) => a - b)).toEqual(totals)
    expect(comparison.cheapestDelivery.total).toBe(Math.min(...totals))
  })

  it('shows delivery costing more than eating there', () => {
    expect(comparison.cheapestDelivery.total).toBeGreaterThan(comparison.dineInPrice)
    expect(comparison.amountSaved).toBeGreaterThan(0)
    expect(comparison.amountSaved).toBe(
      comparison.cheapestDelivery.total - comparison.dineInPrice,
    )
  })

  it('marks the item up above the in-person price', () => {
    for (const option of comparison.deliveryOptions) {
      expect(option.itemPrice).toBeGreaterThan(comparison.dineInPrice)
    }
  })

  it('charges more to deliver further', () => {
    const near = compareDelivery(mess, undefined, 1)
    const far = compareDelivery(mess, undefined, 9)
    expect(far.cheapestDelivery.deliveryFee).toBeGreaterThan(near.cheapestDelivery.deliveryFee)
  })

  it('does not charge distance fees within the first two kilometres', () => {
    const atOne = compareDelivery(mess, undefined, 1)
    const atTwo = compareDelivery(mess, undefined, 2)
    expect(atOne.cheapestDelivery.deliveryFee).toBe(atTwo.cheapestDelivery.deliveryFee)
  })

  it('projects the monthly saving over weekday meals', () => {
    expect(comparison.monthlySavingIfSwitched).toBe(comparison.amountSaved * 22)
  })

  it('picks the named dish when one is given', () => {
    const dish = mess.menu[2]!
    const result = compareDelivery(mess, dish.name, 4)
    expect(result.dish).toBe(dish.name)
    expect(result.dineInPrice).toBe(dish.price)
  })

  it('matches the dish name regardless of case', () => {
    const dish = mess.menu[1]!
    expect(compareDelivery(mess, dish.name.toUpperCase(), 4).dish).toBe(dish.name)
  })

  it('falls back to a popular main when the dish is unknown', () => {
    const result = compareDelivery(mess, 'Something not on the menu', 4)
    expect(mess.menu.map((m) => m.name)).toContain(result.dish)
  })

  it('never recommends a monthly plan as the compared dish', () => {
    const tiffin = listings.find((l) => l.type === 'tiffin')!
    expect(compareDelivery(tiffin, undefined, 4).dish.startsWith('Monthly')).toBe(false)
  })

  it('reports the saving as a percentage of the delivery bill', () => {
    expect(comparison.percentSaved).toBe(
      Math.round((comparison.amountSaved / comparison.cheapestDelivery.total) * 100),
    )
    expect(comparison.percentSaved).toBeGreaterThan(0)
    expect(comparison.percentSaved).toBeLessThan(100)
  })
})
