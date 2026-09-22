import { test, expect } from '@playwright/test'
import AxeBuilder from '@axe-core/playwright'

async function startBubbles(page: import('@playwright/test').Page) {
  await page.goto('/')
  await page.getByRole('button', { name: 'Play Bubble Pop', exact: true }).click()
  await page.getByRole('button', { name: 'Start playing', exact: true }).click()
}

test('bubble pop supports keyboard play, ignores repeat pops, and completes once', async ({ page }) => {
  await startBubbles(page)
  const first = page.getByRole('button', { name: 'Pop bubble 1', exact: true })
  await expect(first).toBeFocused()
  await page.keyboard.press('Enter')
  await expect(page.getByRole('button', { name: 'Pop bubble 2', exact: true })).toBeFocused()
  await expect(page.locator('.bubble-count')).toHaveText('1 / 12')
  await page.getByRole('button', { name: 'Bubble 1: bunny found', exact: true }).dispatchEvent('click')
  await expect(page.locator('.bubble-count')).toHaveText('1 / 12')
  for (let i = 2; i <= 12; i++) await page.keyboard.press('Enter')
  await expect(page.getByRole('heading', { name: 'Pop, pop, hooray! You found every friend.' })).toBeVisible()
  const count = await page.evaluate(() => JSON.parse(localStorage.getItem('mvp.pilot.v1')!).games.bubbles.finishes)
  expect(count).toBe(1)
  await page.getByRole('button', { name: 'All games', exact: true }).first().click()
  await expect(page.getByRole('button', { name: 'Play Bubble Pop', exact: true })).toBeFocused()
})

test('comfort dialog pauses play, holds focus, persists choices and respects device motion', async ({ page }) => {
  await startBubbles(page)
  await page.getByRole('button', { name: 'Pop bubble 1', exact: true }).click()
  await page.getByRole('button', { name: 'Play settings', exact: true }).click()
  const dialog = page.getByRole('dialog', { name: 'Play your way' })
  await expect(dialog).toBeVisible()
  await expect(page.locator('.game-surface')).toHaveAttribute('inert', '')
  await page.getByRole('switch', { name: 'Calmer motion', exact: true }).click()
  await page.getByRole('switch', { name: 'Bigger text', exact: true }).click()
  await expect(page.locator('html')).toHaveAttribute('data-quiet', 'true')
  await expect(page.locator('html')).toHaveAttribute('data-large-text', 'true')
  const results = await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa', 'wcag21aa', 'wcag22aa']).analyze()
  expect(results.violations).toEqual([])
  await page.getByRole('button', { name: 'Done', exact: true }).focus()
  await page.keyboard.press('Tab')
  await expect(page.getByRole('button', { name: 'Close play settings' })).toBeFocused()
  await page.keyboard.press('Escape')
  await expect(dialog).not.toBeVisible()
  await expect(page.getByRole('region', { name: 'Game paused' })).toBeVisible()
  await page.getByRole('button', { name: 'Keep playing' }).click()
  await expect(page.locator('.bubble-count')).toHaveText('1 / 12')
  await expect(page.getByRole('button', { name: 'Pop bubble 2', exact: true })).toBeFocused()
  await page.reload()
  await expect(page.locator('html')).toHaveAttribute('data-large-text', 'true')
  await expect(page.locator('html')).toHaveAttribute('data-quiet', 'true')
  await page.getByRole('button', { name: 'Play settings', exact: true }).click()
  await page.getByRole('switch', { name: 'Calmer motion', exact: true }).click()
  await page.emulateMedia({ reducedMotion: 'reduce' })
  await expect(page.getByRole('switch', { name: 'Calmer motion', exact: true })).toBeChecked()
  await expect(page.getByRole('switch', { name: 'Calmer motion', exact: true })).toBeDisabled()
  await page.emulateMedia({ reducedMotion: 'no-preference' })
  await expect(page.locator('html')).toHaveAttribute('data-quiet', 'false')
})

test('matching starts with a small board and offers an explicit bigger board', async ({ page }) => {
  await page.goto('/')
  await page.getByRole('button', { name: 'Play Match Club', exact: true }).click()
  await expect(page.getByRole('button', { name: 'Little match 3 pairs' })).toHaveAttribute('aria-pressed', 'true')
  await page.getByRole('button', { name: 'Start playing', exact: true }).click()
  await expect(page.locator('.memory-card')).toHaveCount(6)
  await page.getByRole('button', { name: 'All games', exact: true }).click()
  await page.getByRole('button', { name: 'Play Match Club', exact: true }).click()
  await page.getByRole('button', { name: 'Big match 6 pairs' }).click()
  await page.getByRole('button', { name: 'Start playing', exact: true }).click()
  await expect(page.locator('.memory-card')).toHaveCount(12)
})

test('bigger text reflows at 320px and preferences work without storage', async ({ page }) => {
  await page.setViewportSize({ width: 320, height: 800 })
  await page.addInitScript(() => {
    Storage.prototype.setItem = () => { throw new Error('Storage unavailable') }
    Storage.prototype.getItem = () => { throw new Error('Storage unavailable') }
  })
  await page.goto('/')
  await page.getByRole('button', { name: 'Play settings', exact: true }).click()
  await page.getByRole('switch', { name: 'Bigger text', exact: true }).click()
  await page.getByRole('switch', { name: 'Calmer motion', exact: true }).click()
  await page.getByRole('button', { name: 'Done', exact: true }).click()
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true)
  await page.getByRole('button', { name: 'Play Bubble Pop', exact: true }).click()
  await page.getByRole('button', { name: 'Start playing', exact: true }).click()
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true)
  await page.getByRole('button', { name: 'Pop bubble 1', exact: true }).click()
  await expect(page.locator('.bubble-count')).toHaveText('1 / 12')
})

test('new game introductions reflow with double-size text on a narrow phone', async ({ page }) => {
  await page.setViewportSize({ width: 320, height: 800 })
  await page.goto('/')
  await page.evaluate(() => { document.documentElement.style.fontSize = '200%' })
  for (const name of ['Bubble Pop', 'Match Club']) {
    await page.getByRole('button', { name: `Play ${name}`, exact: true }).click()
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), `${name} introduction`).toBe(true)
    const clipped = await page.locator('.round-intro button').evaluateAll(buttons => buttons.filter(button => {
      const bounds = button.getBoundingClientRect(), frame = button.closest('.round-intro')!.getBoundingClientRect()
      return bounds.left < frame.left || bounds.right > frame.right
    }).map(button => button.textContent))
    expect(clipped, `${name} setup controls remain inside their card`).toEqual([])
    await page.screenshot({ path: `artifacts/large-text-intro-${name.toLowerCase().replaceAll(' ', '-')}.png`, fullPage: true })
    await page.getByRole('button', { name: 'All games', exact: true }).click()
  }
})
