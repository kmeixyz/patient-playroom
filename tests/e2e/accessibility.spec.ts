import { test, expect } from '@playwright/test'
import AxeBuilder from '@axe-core/playwright'
import fs from 'node:fs/promises'

const games = ['Sky Dash', 'Orbit Pop', 'Maze Quest', 'Match Club', 'Merge 128', 'Three in a Row', 'Word Scout', 'Hidden Friends', 'Room Explorer', 'Beat Garden']
const tags = ['wcag2a', 'wcag2aa', 'wcag21aa', 'wcag22aa']

test('WCAG 2.2 AA scans every intro, active game and pause screen', async ({ page }, info) => {
  test.setTimeout(180000)
  const report: { game: string; state: string; violations: unknown[] }[] = [], errors: string[] = []
  page.on('pageerror', error => errors.push(error.message))
  await page.goto('/')
  for (const game of games) {
    await page.getByRole('button', { name: `Play ${game}`, exact: true }).click()
    for (const state of ['intro', 'playing', 'paused']) {
      if (state === 'playing') await page.getByRole('button', { name: 'Start playing', exact: true }).click()
      if (state === 'paused') await page.getByRole('button', { name: 'Pause', exact: true }).click()
      const result = await new AxeBuilder({ page }).withTags(tags).analyze()
      report.push({ game, state, violations: result.violations.map(v => ({ id: v.id, impact: v.impact, nodes: v.nodes.map(n => ({ target: n.target, message: n.failureSummary })) })) })
      if (state === 'playing') {
        await fs.mkdir('artifacts', { recursive: true })
        await page.screenshot({ path: `artifacts/audit-${info.project.name}-${game.toLowerCase().replaceAll(' ', '-')}.png`, fullPage: true })
      }
    }
    await page.getByRole('button', { name: 'All games', exact: true }).click()
  }
  await fs.writeFile(`artifacts/wcag-${info.project.name}.json`, JSON.stringify({ errors, report }, null, 2))
  expect(errors).toEqual([])
  expect(report.filter(r => r.violations.length)).toEqual([])
})

test('all games reflow on a 320px phone and with enlarged spaced text', async ({ page }) => {
  test.setTimeout(90000)
  await page.setViewportSize({ width: 320, height: 800 }); await page.goto('/')
  for (const game of games) {
    await page.getByRole('button', { name: `Play ${game}`, exact: true }).click()
    await page.getByRole('button', { name: 'Start playing', exact: true }).click()
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), `${game} at 320px`).toBe(true)
    const smallTargets = await page.locator('.game-surface button, .game-surface [role="button"]').evaluateAll(elements => elements.filter(el => {
      const rect = el.getBoundingClientRect(), style = getComputedStyle(el)
      return style.display !== 'none' && style.visibility !== 'hidden' && rect.width > 0 && (rect.width < 24 || rect.height < 24)
    }).map(el => el.getAttribute('aria-label') || el.textContent))
    expect(smallTargets, `${game} 24px minimum targets`).toEqual([])
    await page.evaluate(() => { document.documentElement.style.fontSize = '200%' })
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), `${game} at 200% text`).toBe(true)
    await page.evaluate(() => { document.documentElement.style.fontSize = ''; const style = document.createElement('style'); style.id = 'text-spacing-test'; style.textContent = 'p,button,span,h1,h2,h3{letter-spacing:.12em!important;word-spacing:.16em!important;line-height:1.5!important}p{margin-bottom:2em!important}'; document.head.append(style) })
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), `${game} text spacing`).toBe(true)
    await page.evaluate(() => document.getElementById('text-spacing-test')?.remove())
    await page.getByRole('button', { name: 'All games', exact: true }).click()
  }
})

test('removed controls stay absent and motion follows the device while open', async ({ page }) => {
  await page.goto('/#brief')
  await expect(page.getByRole('heading', { name: /Make room for/ })).toBeVisible()
  await expect(page.getByRole('link', { name: 'Design brief' })).toHaveCount(0)
  await expect(page.getByRole('button', { name: 'Pilot data' })).toHaveCount(0)
  await expect(page.getByRole('button', { name: 'Less motion' })).toHaveCount(0)
  await page.emulateMedia({ reducedMotion: 'reduce' }); await expect(page.locator('html')).toHaveAttribute('data-quiet', 'true')
  await page.emulateMedia({ reducedMotion: 'no-preference' }); await expect(page.locator('html')).toHaveAttribute('data-quiet', 'false')
})

test('word search uses arrow navigation and announces selections', async ({ page }) => {
  await page.goto('/'); await page.getByRole('button', { name: 'Play Word Scout', exact: true }).click(); await page.getByRole('button', { name: 'Start playing', exact: true }).click()
  await expect(page.locator('.word-board button[tabindex="0"]')).toHaveCount(1)
  await page.locator('.word-board button').first().focus(); await page.keyboard.press('ArrowRight'); await page.keyboard.press('ArrowDown')
  await expect(page.locator('.word-board button').nth(8)).toBeFocused(); await page.keyboard.press('Enter')
  await expect(page.locator('.word-board button').nth(8)).toHaveAttribute('aria-pressed', 'true')
  expect((await new AxeBuilder({ page }).withTags(tags).analyze()).violations).toEqual([])
})

test('single-key shortcuts are inactive outside the focused game', async ({ page }) => {
  await page.goto('/'); await page.getByRole('button', { name: 'Play Beat Garden', exact: true }).click(); await page.getByRole('button', { name: 'Start playing', exact: true }).click()
  await page.getByRole('button', { name: 'Turn sound on', exact: true }).focus(); await page.keyboard.press('1')
  await expect(page.getByText('0 beats, all yours.', { exact: true })).toBeVisible()
  await page.getByRole('button', { name: 'All games', exact: true }).click(); await page.getByRole('button', { name: 'Play Orbit Pop', exact: true }).click(); await page.getByRole('button', { name: 'Start playing', exact: true }).click()
  await page.getByRole('button', { name: 'Turn sound on', exact: true }).focus(); await page.keyboard.press('1')
  await expect(page.locator('.three-hud')).toContainText('0 / 18 planets')
})
