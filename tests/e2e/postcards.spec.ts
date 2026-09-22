import { test, expect, type Page } from '@playwright/test'
import AxeBuilder from '@axe-core/playwright'

async function open(page: Page) {
  await page.goto('/')
  await page.getByRole('button', { name: 'Play Puzzle Postcards', exact: true }).click()
}
async function checkA11y(page: Page) {
  expect((await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa', 'wcag21aa', 'wcag22aa']).analyze()).violations).toEqual([])
}

for (const [scene, count] of [['Ocean hello', 4], ['Moon picnic', 6], ['Treehouse day', 4]] as const) {
  test(`${scene}: assemble ${count} pieces with keyboard, gentle retries, pause, and a keepsake`, async ({ page }) => {
    await page.clock.install()
    await open(page)
    await page.getByRole('button', { name: scene, exact: true }).click()
    if (count === 6) await page.getByRole('button', { name: 'Bigger puzzle 6 pieces' }).click()
    await expect(page.getByRole('button', { name: 'Take my time No countdown' })).toHaveAttribute('aria-pressed', 'true')
    await page.getByRole('button', { name: 'Start playing', exact: true }).click()
    await expect(page.getByRole('timer')).toHaveCount(0)
    for (let i = 0; i < count; i++) {
      const piece = page.locator('.postcard-tray button').filter({ hasNot: page.locator('.piece-placed') }).first()
      const label = (await piece.getAttribute('aria-label'))!
      const position = label.split(', ')[1]!
      await piece.press('Enter')
      if (i === 0) {
        // Board labels provide location information to screen-reader players too.
        const spaces = page.locator('.postcard-board button')
        for (const button of await spaces.all()) {
          if ((await button.getAttribute('aria-label')) !== `${position} space`) { await button.press('Enter'); break }
        }
        await expect(page.getByRole('status')).toContainText(`Try the ${position} space`)
        await expect(piece).toHaveAttribute('aria-pressed', 'true')
        await page.getByRole('button', { name: 'Show me where', exact: true }).click()
        await expect(page.locator('.postcard-hint')).toBeFocused()
        await checkA11y(page)
      }
      const space = page.getByRole('button', { name: new RegExp(`^${position} space`) })
      await space.press('Enter')
      await expect(page.locator('.mini-game-count')).toHaveText(`${i + 1} / ${count}`)
      if (i === 0) {
        await space.dispatchEvent('click')
        await expect(page.locator('.mini-game-count')).toHaveText('1 / ' + count)
        const focused = await page.locator(':focus').getAttribute('aria-label')
        await page.getByRole('button', { name: 'Pause', exact: true }).click()
        await page.clock.fastForward(240000)
        await page.getByRole('button', { name: 'Keep playing', exact: true }).click()
        await expect(page.locator(':focus')).toHaveAttribute('aria-label', focused!)
      }
    }
    await expect(page.getByRole('button', { name: 'All done', exact: true })).toBeFocused()
    await page.clock.fastForward(240000)
    await expect(page.locator('.postcard-board')).toHaveClass(/is-complete/)
    await checkA11y(page)
    await page.getByRole('button', { name: 'All done', exact: true }).press('Enter')
    await expect(page.getByRole('heading', { name: 'A little puzzle. A lovely postcard.' })).toBeVisible()
    await expect(page.locator('.result-art').getByRole('img', { name: scene })).toBeVisible()
    expect(await page.evaluate(() => JSON.parse(localStorage.getItem('mvp.pilot.v1')!).games.postcards.finishes)).toBe(1)
    await checkA11y(page)
  })
}

test('new default pace and bubble completion stay child controlled', async ({ page }) => {
  await page.clock.install(); await page.goto('/')
  await page.getByRole('button', { name: 'Play Bubble Pop', exact: true }).click()
  await expect(page.getByRole('button', { name: 'Take my time No countdown' })).toHaveAttribute('aria-pressed', 'true')
  await page.getByRole('button', { name: 'Start playing', exact: true }).click()
  for (let i = 1; i <= 12; i++) await page.getByRole('button', { name: `Pop bubble ${i}`, exact: true }).click()
  await page.clock.fastForward(240000)
  await expect(page.locator('.bubble-count')).toHaveText('12 / 12')
  await expect(page.getByRole('button', { name: 'All done', exact: true })).toBeVisible()
  await expect(page.locator('.round-result')).toHaveCount(0)
})

test('postcard setup and six-piece board reflow at 320px with large text', async ({ page }) => {
  await page.setViewportSize({ width: 320, height: 800 }); await open(page)
  await page.evaluate(() => { document.documentElement.style.fontSize = '200%' })
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true)
  await page.getByRole('button', { name: 'Bigger puzzle 6 pieces' }).click()
  await page.getByRole('button', { name: 'Start playing', exact: true }).click()
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true)
  expect(await page.locator('.postcard-board button, .postcard-tray button').evaluateAll(nodes => nodes.every(el => {
    const r = el.getBoundingClientRect(); return r.width >= 44 && r.height >= 44
  }))).toBe(true)
  await checkA11y(page)
})
