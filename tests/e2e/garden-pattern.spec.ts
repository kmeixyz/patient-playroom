import { test, expect, type Page } from '@playwright/test'
import AxeBuilder from '@axe-core/playwright'

async function start(page: Page, game: string) {
  await page.goto('/')
  await page.getByRole('button', { name: `Play ${game}`, exact: true }).click()
  await page.getByRole('button', { name: 'Take my time No countdown', exact: true }).click()
  await page.getByRole('button', { name: 'Start playing', exact: true }).click()
}
async function accessible(page: Page) {
  expect((await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa', 'wcag21aa', 'wcag22aa']).analyze()).violations).toEqual([])
}

test('garden grows three chosen flowers, keeps keyboard focus and preserves the finished garden', async ({ page }) => {
  await page.clock.install()
  await start(page, 'Pocket Garden')
  for (const [i, flower] of ['Tulip', 'Daisy', 'Starflower'].entries()) {
    await page.getByRole('button', { name: flower, exact: true }).press('Enter')
    const water = page.getByRole('button', { name: 'Water my seed', exact: true })
    await expect(water).toBeFocused()
    await page.clock.fastForward(240000)
    await expect(page.getByRole('heading', { name: 'Give it a drink', exact: true })).toBeVisible()
    await water.press('Enter')
    const sunshine = page.getByRole('button', { name: 'Add sunshine', exact: true })
    await expect(sunshine).toBeFocused()
    await page.getByRole('button', { name: 'Pause', exact: true }).click()
    await page.getByRole('button', { name: 'Keep playing', exact: true }).click()
    await expect(sunshine).toBeFocused()
    await sunshine.press('Enter')
    await expect(page.locator('.mini-game-count')).toHaveText(`${i + 1} / 3`)
    const next = page.getByRole('button', { name: i < 2 ? 'Next flower' : 'All done', exact: true })
    await expect(next).toBeFocused()
    await accessible(page)
    await next.press('Enter')
    if (i < 2) await expect(page.getByRole('button', { name: 'Daisy', exact: true })).toBeFocused()
  }
  await expect(page.getByRole('heading', { name: 'A little garden, grown by you.' })).toBeVisible()
  await expect(page.locator('.result-art').getByRole('img')).toHaveAttribute('aria-label', 'Pot 1: Tulip in bloom. Pot 2: Daisy in bloom. Pot 3: Starflower in bloom')
  await accessible(page)
})

test('the curated menu replaces retired games and new controls reflow at enlarged text', async ({ page }) => {
  await page.goto('/')
  await expect(page.locator('.game-card')).toHaveCount(9)
  await expect(page.getByRole('button', { name: /Play (Beat Garden|Hidden Friends|Pattern Parade)/ })).toHaveCount(0)
  for (const name of ['Pocket Garden', 'Puzzle Postcards']) {
    await start(page, name)
    await page.setViewportSize({ width: 320, height: 800 })
    await page.evaluate(() => { document.documentElement.style.fontSize = '200%' })
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true)
    expect(await page.locator('.picture-choices button, .postcard-tray button').evaluateAll(nodes => nodes.every(el => {
      const rect = el.getBoundingClientRect()
      return rect.width >= 44 && rect.height >= 44 && el.scrollWidth <= el.clientWidth
    }))).toBe(true)
    await accessible(page)
  }
})
