import { expect, test, type Page } from '@playwright/test'

async function onboardAsDemoUser(page: Page) {
  await page.goto('/')
  await page.getByRole('button', { name: /Use demo user/ }).click()
  await expect(page.getByText('left this month')).toBeVisible({ timeout: 30_000 })
}

test.describe('food', () => {
  test('lists places and filters through the URL', async ({ page }) => {
    await onboardAsDemoUser(page)
    await page.goto('/food')

    await expect(page.getByRole('heading', { name: 'Food', level: 1 })).toBeVisible()
    await expect(page.getByText(/places near your home/)).toBeVisible({ timeout: 30_000 })

    await page.getByRole('tab', { name: 'Mess' }).click()
    await expect(page).toHaveURL(/type=mess/)

    await page.getByLabel('Near').selectOption('office')
    await expect(page).toHaveURL(/near=office/)
    await expect(page.getByText(/places near your office/)).toBeVisible({ timeout: 30_000 })
  })

  test('shows the full delivery fee breakdown and what it saves', async ({ page }) => {
    await onboardAsDemoUser(page)
    // Annapoorna Mess delivers, so the comparison applies.
    await page.goto('/food/food_003')

    await expect(page.getByRole('heading', { name: 'Annapoorna Mess' })).toBeVisible({
      timeout: 30_000,
    })
    await expect(page.getByText('Delivery vs eating here')).toBeVisible()

    // Every fee is itemised, not just a total.
    for (const row of ['Item price on the app', 'Delivery fee', 'Platform fee', 'Packaging fee', 'Taxes']) {
      await expect(page.getByRole('row', { name: new RegExp(row) })).toBeVisible()
    }
    await expect(page.getByText(/Eating here saves/)).toBeVisible()
  })

  test('explains when a place does not deliver', async ({ page }) => {
    await onboardAsDemoUser(page)
    // Office Street Mess is lunch-only and does not deliver.
    await page.goto('/food/food_011')

    await expect(page.getByText(/does not deliver/)).toBeVisible({ timeout: 30_000 })
  })
})

test.describe('ask buddy', () => {
  test('answers a food question with cards and agent badges', async ({ page }) => {
    await onboardAsDemoUser(page)
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
    await onboardAsDemoUser(page)
    await page.goto('/chat')

    await page.locator('#chat-input').fill('How much did I spend on food this month?')
    await page.locator('#chat-input').press('Enter')

    // The fixture targets: 5,250 of 7,500 spent, 2,250 left.
    await expect(page.getByText(/You have spent ₹5,250 on food this month/)).toBeVisible({
      timeout: 30_000,
    })
    await expect(
      page.getByRole('progressbar', { name: 'Food: 70% of budget used' }),
    ).toBeVisible()
  })

  test('falls back helpfully on an unrecognised question', async ({ page }) => {
    await onboardAsDemoUser(page)
    await page.goto('/chat')

    await page.locator('#chat-input').fill('what is the weather today')
    await page.locator('#chat-input').press('Enter')

    await expect(page.getByText(/I can help with four things/)).toBeVisible({ timeout: 30_000 })
  })

  test('opens the same chat in a side sheet from another page', async ({ page }) => {
    await onboardAsDemoUser(page)

    await page.getByRole('button', { name: 'Ask Buddy' }).click()
    const sheet = page.getByRole('dialog', { name: 'Ask Buddy' })
    await expect(sheet).toBeVisible()

    await page.keyboard.press('Escape')
    await expect(sheet).toBeHidden()
  })
})
