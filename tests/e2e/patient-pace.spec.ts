import { test, expect } from '@playwright/test'
import AxeBuilder from '@axe-core/playwright'

test('taking my time removes the deadline, retains progress while paused and permits an explicit finish', async ({ page }) => {
  await page.clock.install()
  await page.goto('/')
  await page.getByRole('button', { name: 'Play Bubble Pop', exact: true }).click()
  await page.getByRole('button', { name: 'Take my time No countdown', exact: true }).click()
  await page.getByRole('button', { name: 'Start playing', exact: true }).click()
  await page.getByRole('button', { name: 'Pop bubble 1', exact: true }).click()
  await page.clock.fastForward(240000)
  await expect(page.getByRole('timer')).toHaveCount(0)
  await expect(page.locator('.bubble-count')).toHaveText('1 / 12')
  await page.getByRole('button', { name: 'How to play', exact: true }).click()
  await expect(page.getByRole('region', { name: 'Game paused' })).toBeVisible()
  await expect(page.locator('.pause-instructions')).toContainText('Tap any bubble')
  await page.clock.fastForward(240000)
  await page.getByRole('button', { name: 'Keep playing', exact: true }).click()
  await expect(page.locator('.bubble-count')).toHaveText('1 / 12')
  await page.getByRole('button', { name: 'Finish this round', exact: true }).click()
  await expect(page.locator('.round-result')).toBeVisible()
  await page.clock.fastForward(240000)
  expect(await page.evaluate(() => JSON.parse(localStorage.getItem('mvp.pilot.v1')!).games.bubbles.finishes)).toBe(1)
})

test('cafe thanks stay until the child advances and keyboard focus resumes at the same snack', async ({ page }) => {
  await page.clock.install()
  await page.goto('/')
  await page.getByRole('button', { name: 'Play Critter Café', exact: true }).click()
  await page.getByRole('button', { name: 'Start playing', exact: true }).click()
  const snack = page.getByRole('button', { name: 'Serve strawberry', exact: true })
  await snack.focus()
  await page.getByRole('button', { name: 'Pause', exact: true }).click()
  await page.getByRole('button', { name: 'Keep playing', exact: true }).click()
  await expect(snack).toBeFocused()
  const order = (await page.locator('.cafe-order').getAttribute('aria-label'))!
  const food = order.match(/wants a (\w+)/)![1]
  await page.getByRole('button', { name: `Serve ${food}`, exact: true }).press('Enter')
  await expect(page.getByRole('button', { name: 'Next friend', exact: true })).toBeFocused()
  await page.clock.fastForward(15000)
  await expect(page.locator('.mini-game-count')).toHaveText('1 / 6')
  await expect(page.locator('.cafe-order')).toHaveAttribute('aria-label', /says thank you/)
  await page.keyboard.press('Enter')
  await expect(page.getByRole('button', { name: 'Serve apple', exact: true })).toBeFocused()
  await expect(page.locator('.cafe-order')).toHaveAttribute('aria-label', /wants a/)
})

test('relaxed memory lets a child study a mismatch before turning it back', async ({ page }) => {
  await page.clock.install(); await page.goto('/')
  await page.getByRole('button', { name: 'Play Match Club', exact: true }).click()
  await page.getByRole('button', { name: 'Take my time No countdown', exact: true }).click()
  await page.getByRole('button', { name: 'Start playing', exact: true }).click()
  const cards = page.locator('.memory-card')
  // Three disjoint candidate pairs must either expose a mismatch or solve the board.
  for (let i = 0; i < 6; i += 2) {
    await cards.nth(i).click(); await cards.nth(i + 1).click()
    if (await page.getByRole('button', { name: 'Turn them over' }).count()) {
      await page.clock.fastForward(180000)
      await expect(page.locator('.memory-card.open:not(.matched)')).toHaveCount(2)
      await page.getByRole('button', { name: 'Turn them over' }).click()
      await expect(page.locator('.memory-card.open:not(.matched)')).toHaveCount(0)
      return
    }
  }
  await expect(page.locator('.round-result')).toBeVisible()
})

test('pace and help reflow with 200% text, and all relaxed game states pass automated accessibility checks', async ({ page }) => {
  test.setTimeout(90000)
  await page.goto('/')
  for (const name of ['Bubble Pop', 'Maze Quest', 'Match Club', 'Three in a Row', 'Puzzle Postcards', 'Pocket Garden', 'Critter Café', 'Silly Studio']) {
    await page.getByRole('button', { name: `Play ${name}`, exact: true }).click()
    await page.getByRole('button', { name: 'Take my time No countdown', exact: true }).click()
    await page.getByRole('button', { name: 'Start playing', exact: true }).click()
    expect((await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa', 'wcag21aa', 'wcag22aa']).analyze()).violations).toEqual([])
    await page.getByRole('button', { name: 'How to play', exact: true }).click()
    await page.setViewportSize({ width: 320, height: 800 })
    await page.evaluate(() => { document.documentElement.style.fontSize = '200%' })
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), name).toBe(true)
    const panel = page.getByRole('region', { name: 'Game paused' })
    const clipped = await panel.evaluate(el => {
      const rect = el.getBoundingClientRect()
      return [...el.querySelectorAll('button,p')].some(child => child.getBoundingClientRect().bottom > rect.bottom + 1)
    })
    expect(clipped, `${name} help panel`).toBe(false)
    await page.getByRole('button', { name: 'All games', exact: true }).click()
    await page.evaluate(() => { document.documentElement.style.fontSize = '' })
  }
})
