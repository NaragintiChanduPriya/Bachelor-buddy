import { http } from 'msw'
import type { FoodPreference, SavedCard, User } from '@/types/user'
import { db, persistDb } from '../db'
import { buildBudget } from '../calc/budget'
import { findArea, findTechPark } from '../fixtures/areas'
import { ok, notFound, validationError, withMockBehaviour } from '../http'

interface OnboardingBody {
  salary?: number
  savingsGoal?: number
  homeAreaId?: string
  officeAreaId?: string
  techParkId?: string | null
  foodPreference?: FoodPreference
  cards?: SavedCard[]
}

const foodPreferences: FoodPreference[] = ['veg', 'nonVeg', 'eggetarian', 'vegan']

/** Server-side validation, mirroring what FastAPI + pydantic will enforce. */
function validateOnboarding(body: OnboardingBody): string | null {
  if (!Number.isInteger(body.salary) || (body.salary ?? 0) < 5000) {
    return 'Enter a monthly salary of at least ₹5,000 in whole rupees.'
  }
  if (!Number.isInteger(body.savingsGoal) || (body.savingsGoal ?? 0) < 0) {
    return 'Enter a savings goal in whole rupees.'
  }
  if ((body.savingsGoal ?? 0) >= (body.salary ?? 0)) {
    return 'Your savings goal must be less than your salary.'
  }
  if (!body.homeAreaId || !findArea(body.homeAreaId)) return 'Choose a valid home area.'
  if (!body.officeAreaId || !findArea(body.officeAreaId)) return 'Choose a valid office area.'
  if (body.techParkId && !findTechPark(body.techParkId)) return 'Choose a valid tech park.'
  if (!body.foodPreference || !foodPreferences.includes(body.foodPreference)) {
    return 'Choose a food preference.'
  }
  return null
}

/**
 * Splits a salary into category limits, scaling the demo user's proportions. Savings takes the
 * user's stated goal first; what remains is distributed across the spending categories.
 */
function generateLimits(salary: number, savingsGoal: number) {
  const spendable = salary - savingsGoal
  const weights = {
    rent: 0.4375,
    food: 0.2344,
    groceries: 0.0781,
    shopping: 0.0781,
    travel: 0.0625,
    bills: 0.0469,
    misc: 0.0625,
  }

  const limits = {
    rent: Math.round((spendable * weights.rent) / 100) * 100,
    food: Math.round((spendable * weights.food) / 100) * 100,
    groceries: Math.round((spendable * weights.groceries) / 100) * 100,
    shopping: Math.round((spendable * weights.shopping) / 100) * 100,
    travel: Math.round((spendable * weights.travel) / 100) * 100,
    bills: Math.round((spendable * weights.bills) / 100) * 100,
    misc: 0,
    savings: savingsGoal,
  }

  // Rounding leaves a remainder; misc absorbs it so the limits total the salary exactly.
  const assigned = Object.values(limits).reduce((t, v) => t + v, 0)
  limits.misc = salary - assigned
  return limits
}

export const userHandlers = [
  http.post('*/onboarding', async ({ request }) => {
    const failure = await withMockBehaviour()
    if (failure) return failure

    const body = (await request.json()) as OnboardingBody
    const error = validateOnboarding(body)
    if (error) return validationError(error)

    const homeArea = findArea(body.homeAreaId!)!
    const officeArea = findArea(body.officeAreaId!)!
    const techPark = body.techParkId ? findTechPark(body.techParkId) : undefined

    const user: User = {
      ...db.user,
      onboarded: true,
      preferences: {
        salary: body.salary!,
        savingsGoal: body.savingsGoal!,
        homeAreaId: homeArea.id,
        homeAreaName: homeArea.name,
        officeAreaId: officeArea.id,
        officeAreaName: officeArea.name,
        techParkId: techPark?.id ?? null,
        techParkName: techPark?.name ?? null,
        foodPreference: body.foodPreference!,
        cards: body.cards?.length ? body.cards : db.user.preferences.cards,
      },
    }

    db.user = user
    db.budgetLimits = generateLimits(user.preferences.salary, user.preferences.savingsGoal)
    persistDb()

    const budget = buildBudget(
      db.budgetMonth,
      user.preferences.salary,
      db.budgetLimits,
      db.expenses,
    )
    return ok({ user, budget })
  }),

  http.get('*/me', async () => {
    const failure = await withMockBehaviour()
    if (failure) return failure
    if (!db.user) return notFound('User')
    return ok(db.user)
  }),

  http.put('*/me/preferences', async ({ request }) => {
    const failure = await withMockBehaviour()
    if (failure) return failure

    const body = (await request.json()) as OnboardingBody
    const merged: OnboardingBody = {
      salary: body.salary ?? db.user.preferences.salary,
      savingsGoal: body.savingsGoal ?? db.user.preferences.savingsGoal,
      homeAreaId: body.homeAreaId ?? db.user.preferences.homeAreaId,
      officeAreaId: body.officeAreaId ?? db.user.preferences.officeAreaId,
      techParkId: body.techParkId === undefined ? db.user.preferences.techParkId : body.techParkId,
      foodPreference: body.foodPreference ?? db.user.preferences.foodPreference,
      cards: body.cards ?? db.user.preferences.cards,
    }

    const error = validateOnboarding(merged)
    if (error) return validationError(error)

    const homeArea = findArea(merged.homeAreaId!)!
    const officeArea = findArea(merged.officeAreaId!)!
    const techPark = merged.techParkId ? findTechPark(merged.techParkId) : undefined
    const salaryChanged = merged.salary !== db.user.preferences.salary
    const goalChanged = merged.savingsGoal !== db.user.preferences.savingsGoal

    db.user = {
      ...db.user,
      preferences: {
        salary: merged.salary!,
        savingsGoal: merged.savingsGoal!,
        homeAreaId: homeArea.id,
        homeAreaName: homeArea.name,
        officeAreaId: officeArea.id,
        officeAreaName: officeArea.name,
        techParkId: techPark?.id ?? null,
        techParkName: techPark?.name ?? null,
        foodPreference: merged.foodPreference!,
        cards: merged.cards!,
      },
    }

    // A new salary or goal invalidates the old split, so regenerate the limits.
    if (salaryChanged || goalChanged) {
      db.budgetLimits = generateLimits(merged.salary!, merged.savingsGoal!)
    }
    persistDb()
    return ok(db.user)
  }),
]
