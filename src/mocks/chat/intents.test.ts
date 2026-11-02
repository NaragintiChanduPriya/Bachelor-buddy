import { describe, expect, it } from 'vitest'
import { extractAmount, extractArea, matchIntent } from './intents'

const areas = [
  { id: 'area_marathahalli', name: 'Marathahalli' },
  { id: 'area_hsr', name: 'HSR Layout' },
  { id: 'area_btm', name: 'BTM Layout' },
]

describe('matchIntent', () => {
  // The five scenarios the brief names explicitly.
  it('matches "I have ₹150 and I am hungry near office"', () => {
    expect(matchIntent('I have ₹150 and I am hungry near office')).toBe('foodNearby')
  })

  it('matches "Formal shoes under ₹1,500 for an interview on Friday"', () => {
    expect(matchIntent('Formal shoes under ₹1,500 for an interview on Friday')).toBe(
      'productDeadline',
    )
  })

  it('matches "How much did I spend on food this month?"', () => {
    expect(matchIntent('How much did I spend on food this month?')).toBe('spendOnFood')
  })

  it('matches "Cheapest way to buy groceries this month"', () => {
    expect(matchIntent('Cheapest way to buy groceries this month')).toBe('groceryPlan')
  })

  it('matches "Find a PG under ₹10,000 near Marathahalli"', () => {
    expect(matchIntent('Find a PG under ₹10,000 near Marathahalli')).toBe('homeSearch')
  })

  it('matches budget and savings questions', () => {
    expect(matchIntent('How much money do I have left this month?')).toBe('budgetStatus')
    expect(matchIntent('How much have I saved this month?')).toBe('savingsStatus')
  })

  it('matches offers questions', () => {
    expect(matchIntent('What offers can I use on my card?')).toBe('deals')
  })

  it('falls back when nothing fits', () => {
    expect(matchIntent('what is the weather like')).toBeNull()
    expect(matchIntent('hello')).toBeNull()
    expect(matchIntent('')).toBeNull()
  })

  it('is case insensitive', () => {
    expect(matchIntent('FORMAL SHOES UNDER ₹1500 FOR AN INTERVIEW')).toBe('productDeadline')
  })

  it('does not confuse a food question for a product one', () => {
    expect(matchIntent('I am hungry, cheap lunch near office')).toBe('foodNearby')
  })
})

describe('extractAmount', () => {
  it('reads a rupee amount with a symbol and commas', () => {
    expect(extractAmount('Formal shoes under ₹1,500')).toBe(1500)
  })

  it('reads a bare number', () => {
    expect(extractAmount('I have 150 and I am hungry')).toBe(150)
  })

  it('reads an amount written with rs', () => {
    expect(extractAmount('a PG under Rs 10000')).toBe(10000)
    expect(extractAmount('under rs. 8000 please')).toBe(8000)
  })

  it('returns null when there is no amount', () => {
    expect(extractAmount('I am hungry near office')).toBeNull()
  })

  it('ignores single digits that are not amounts', () => {
    expect(extractAmount('table for 2')).toBeNull()
  })
})

describe('extractArea', () => {
  it('finds an area named in the message', () => {
    expect(extractArea('Find a PG near Marathahalli', areas)?.id).toBe('area_marathahalli')
  })

  it('matches regardless of case', () => {
    expect(extractArea('somewhere in hsr layout', areas)?.id).toBe('area_hsr')
  })

  it('returns null when no area is mentioned', () => {
    expect(extractArea('find me a cheap pg', areas)).toBeNull()
  })
})
