import { expect, test, type Page } from '@playwright/test'

/**
 * Signs up as Arjun through the real four-step onboarding, leaving the browser on the
 * dashboard. Each test gets a fresh context, so this runs per test.
 */
async function onboardAsArjun(page: Page) {
  await page.goto('/onboarding')
  await page.getByRole('button', { name: 'Get started' }).click()
  await page.getByLabel(/Monthly salary/).fill('40000')
  await page.getByLabel(/savings goal/i).fill('8000')
  await page.getByRole('button', { name: 'Continue' }).click()
  await page.getByLabel('Where do you live?').click()
  await page.getByRole('option', { name: 'HSR Layout', exact: true }).click()
  await page.getByLabel('Where do you work?').click()
  await page.getByRole('option', { name: 'Bellandur', exact: true }).click()
  await page.getByRole('button', { name: 'Continue' }).click()
  await page
    .getByRole('radio', { name: /Vegetarian/ })
    .first()
    .check()
  await page.getByRole('button', { name: /Create my budget/ }).click()
  await expect(page.getByText('left this month')).toBeVisible({ timeout: 30_000 })
}

test.describe('food', () => {
  test('lists places and filters through the URL', async ({ page }) => {
    await onboardAsArjun(page)
    await page.goto('/food')

    await expect(page.getByRole('heading', { name: 'Food', level: 1 })).toBeVisible()
    await expect(page.getByText(/places near your home/)).toBeVisible({ timeout: 30_000 })

    await page.getByRole('tab', { name: 'Mess' }).click()
    await expect(page).toHaveURL(/type=mess/)

    await page.getByLabel('Near').click()
    await page.getByRole('option', { name: 'Near my office' }).click()
    await expect(page).toHaveURL(/near=office/)
    await expect(page.getByText(/places near your office/)).toBeVisible({ timeout: 30_000 })
  })

  test('shows the full delivery fee breakdown and what it saves', async ({ page }) => {
    await onboardAsArjun(page)
    // Annapoorna Mess delivers, so the comparison applies.
    await page.goto('/food/food_003')

    await expect(page.getByRole('heading', { name: 'Annapoorna Mess' })).toBeVisible({
      timeout: 30_000,
    })
    await expect(page.getByText('Delivery vs eating here')).toBeVisible()

    // Every fee is itemised, not just a total.
    for (const row of [
      'Item price on the app',
      'Delivery fee',
      'Platform fee',
      'Packaging fee',
      'Taxes',
    ]) {
      await expect(page.getByRole('row', { name: new RegExp(row) })).toBeVisible()
    }
    await expect(page.getByText(/Eating here saves/)).toBeVisible()
  })

  test('explains when a place does not deliver', async ({ page }) => {
    await onboardAsArjun(page)
    // Office Street Mess is lunch-only and does not deliver.
    await page.goto('/food/food_011')

    await expect(page.getByText(/does not deliver/)).toBeVisible({ timeout: 30_000 })
  })
})

test.describe('ask buddy', () => {
  test('answers a food question with cards and agent badges', async ({ page }) => {
    await onboardAsArjun(page)
    await page.goto('/chat')

    await page.getByRole('button', { name: 'I have ₹150 and I am hungry near office' }).click()

    await expect(page.getByText('Agents used:')).toBeVisible({ timeout: 30_000 })

    // Scope to the transcript: "Food" also appears in the sidebar nav.
    const conversation = page.locator('ul[aria-label="Conversation"]')
    await expect(conversation.getByText('Concierge')).toBeVisible()
    await expect(conversation.getByText('Food', { exact: true })).toBeVisible()
    await expect(conversation.locator('article').first()).toBeVisible()
  })

  test('quotes the same food spend the budget page shows', async ({ page }) => {
    await onboardAsArjun(page)
    await page.goto('/chat')

    await page.locator('#chat-input').fill('How much did I spend on food this month?')
    await page.locator('#chat-input').press('Enter')

    // The fixture targets: 5,250 of 7,500 spent, 2,250 left.
    await expect(page.getByText(/You have spent ₹5,250 on food this month/)).toBeVisible({
      timeout: 30_000,
    })
    await expect(page.getByRole('progressbar', { name: 'Food: 70% of budget used' })).toBeVisible()
  })

  test('falls back helpfully on an unrecognised question', async ({ page }) => {
    await onboardAsArjun(page)
    await page.goto('/chat')

    await page.locator('#chat-input').fill('what is the weather today')
    await page.locator('#chat-input').press('Enter')

    await expect(page.getByText(/I can help with four things/)).toBeVisible({ timeout: 30_000 })
  })

  test('reaches Ask Buddy from the sidebar', async ({ page }) => {
    await onboardAsArjun(page)

    await page
      .getByRole('navigation', { name: 'Main' })
      .getByRole('link', { name: 'Ask Buddy' })
      .click()
    await expect(page).toHaveURL(/\/chat$/)
    await expect(page.getByRole('heading', { name: 'Ask Buddy', level: 1 })).toBeVisible()
  })
})
