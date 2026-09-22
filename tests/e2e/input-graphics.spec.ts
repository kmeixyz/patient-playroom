import { test, expect } from '@playwright/test'

test.beforeEach(async ({ page }) => { await page.goto('/') })

test('a real board swipe moves exactly one maze step', async ({ page, context }, info) => {
  await page.getByRole('button', { name: 'Play Maze Quest', exact: true }).click()
  await page.getByRole('button', { name: 'Start playing', exact: true }).click()
  const board = page.locator('.maze-board')
  await board.scrollIntoViewIfNeeded()
  const canRight = await page.locator('.maze-tile[data-x="2"][data-y="1"]').getAttribute('data-wall') === 'false'
  const box = (await board.boundingBox())!
  const x = box.x + box.width / 2, y = box.y + box.height / 2
  const endX = x + (canRight ? 80 : 0), endY = y + (canRight ? 0 : 80)
  if (info.project.name === 'mobile') {
    const cdp = await context.newCDPSession(page)
    await cdp.send('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: [{ x, y }] })
    await cdp.send('Input.dispatchTouchEvent', { type: 'touchMove', touchPoints: [{ x: endX, y: endY }] })
    await cdp.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] })
    await cdp.detach()
  } else {
    await page.mouse.move(x, y)
    await page.mouse.down()
    await page.mouse.move(endX, endY, { steps: 5 })
    await page.mouse.up()
  }
  await expect(page.locator('.maze-tile.player')).toHaveAttribute('data-x', canRight ? '2' : '1')
  await expect(page.locator('.maze-tile.player')).toHaveAttribute('data-y', canRight ? '1' : '2')
  await expect(page.locator('.puzzle-status')).toContainText('1 step')
  await board.click({ position: { x: box.width / 2, y: box.height / 2 } })
  await expect(page.locator('.puzzle-status')).toContainText('1 step')
})

test('losing the live WebGL context preserves progress in the playable fallback', async ({ page }) => {
  await page.getByRole('button', { name: 'Play Sky Dash', exact: true }).click()
  await page.getByRole('button', { name: 'Start playing', exact: true }).click()
  await page.getByRole('button', { name: 'Steer right', exact: true }).click()
  await expect(page.locator('.lane-labels .current')).toHaveText('Right')
  const lost = await page.locator('canvas').evaluate(canvas => {
    for (const contextType of ['webgl2', 'webgl'] as const) {
      const extension = (canvas as HTMLCanvasElement).getContext(contextType)?.getExtension('WEBGL_lose_context')
      if (extension) { extension.loseContext(); return true }
    }
    return false
  })
  test.skip(!lost, 'The browser did not expose WEBGL_lose_context for this run.')
  await expect(page.getByText(/same game in flat view/)).toBeVisible()
  await expect(page.locator('.lane-labels .current')).toHaveText('Right')
  await page.getByRole('button', { name: 'Steer left', exact: true }).click()
  await expect(page.locator('.lane-labels .current')).toHaveText('Center')
  await expect(page.getByRole('button', { name: 'Jump', exact: false })).toBeVisible()
})
