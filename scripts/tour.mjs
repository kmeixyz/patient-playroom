/**
 * Scripted play-through of the prototype in headless Chrome via the DevTools
 * Protocol. Verifies the things a unit test cannot: that a phone-sized viewport
 * has no horizontal overflow, that taps actually reveal friends, flip cards,
 * move in the maze, and that engagement counters increment.
 *
 * Usage: node scripts/tour.mjs [baseUrl] [outDir]
 */
import { spawn } from 'node:child_process'
import { mkdirSync, writeFileSync } from 'node:fs'
import { mkdtempSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'

const BASE = process.argv[2] ?? 'http://localhost:5180'
const OUT = process.argv[3] ?? '.shots'
const CHROME = '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome'
const PORT = 9333

mkdirSync(OUT, { recursive: true })

const chrome = spawn(
  CHROME,
  [
    '--headless=old',
    '--disable-gpu',
    '--no-first-run',
    '--no-default-browser-check',
    '--disable-extensions',
    '--disable-sync',
    '--hide-scrollbars',
    `--remote-debugging-port=${PORT}`,
    `--user-data-dir=${mkdtempSync(join(tmpdir(), 'tour-'))}`,
    'about:blank',
  ],
  { stdio: 'ignore' },
)

const sleep = (ms) => new Promise((r) => setTimeout(r, ms))

async function targetUrl() {
  for (let i = 0; i < 40; i++) {
    try {
      const res = await fetch(`http://127.0.0.1:${PORT}/json/list`)
      const targets = await res.json()
      const page = targets.find((t) => t.type === 'page')
      if (page?.webSocketDebuggerUrl) return page.webSocketDebuggerUrl
    } catch {
      // Chrome is still starting.
    }
    await sleep(250)
  }
  throw new Error('Chrome DevTools endpoint never came up')
}

class Client {
  constructor(ws) {
    this.ws = ws
    this.id = 0
    this.pending = new Map()
    this.events = []
    ws.addEventListener('message', (e) => {
      const msg = JSON.parse(e.data)
      if (msg.id && this.pending.has(msg.id)) {
        const { resolve, reject } = this.pending.get(msg.id)
        this.pending.delete(msg.id)
        msg.error ? reject(new Error(msg.error.message)) : resolve(msg.result)
      } else if (msg.method) {
        this.events.push(msg)
      }
    })
  }

  send(method, params = {}) {
    const id = ++this.id
    return new Promise((resolve, reject) => {
      this.pending.set(id, { resolve, reject })
      this.ws.send(JSON.stringify({ id, method, params }))
    })
  }

  async evaluate(expression) {
    const res = await this.send('Runtime.evaluate', {
      expression: `(() => { ${expression} })()`,
      returnByValue: true,
      awaitPromise: true,
    })
    if (res.exceptionDetails) {
      throw new Error(res.exceptionDetails.exception?.description ?? 'eval failed')
    }
    return res.result.value
  }

  async shot(name) {
    const { data } = await this.send('Page.captureScreenshot', { format: 'png' })
    writeFileSync(join(OUT, `${name}.png`), Buffer.from(data, 'base64'))
  }
}

const results = []
const check = (label, ok, detail = '') => {
  results.push({ label, ok, detail })
  console.log(`${ok ? 'PASS' : 'FAIL'}  ${label}${detail ? ` — ${detail}` : ''}`)
}

const wsUrl = await targetUrl()
const ws = new WebSocket(wsUrl)
await new Promise((r) => ws.addEventListener('open', r, { once: true }))
const cdp = new Client(ws)

await cdp.send('Page.enable')
await cdp.send('Runtime.enable')
await cdp.send('Log.enable')
await cdp.send('Console.enable')

async function viewport(width, height, mobile = true) {
  await cdp.send('Emulation.setDeviceMetricsOverride', {
    width,
    height,
    deviceScaleFactor: 2,
    mobile,
  })
}

async function goto(url) {
  await cdp.send('Page.navigate', { url })
  await sleep(900)
}

const consoleErrors = () =>
  cdp.events
    .filter((e) => e.method === 'Log.entryAdded' && e.params.entry.level === 'error')
    .map((e) => e.params.entry.text)

// ---------------------------------------------------------------- phone menu
await viewport(390, 844)
await goto(`${BASE}/`)
await cdp.shot('01-menu')

const overflow = await cdp.evaluate(`
  const d = document.documentElement
  return { scroll: d.scrollWidth, client: d.clientWidth }
`)
check(
  'no horizontal overflow at 390px',
  overflow.scroll <= overflow.client + 1,
  `scrollWidth ${overflow.scroll} vs clientWidth ${overflow.client}`,
)

const targets = await cdp.evaluate(`
  const small = [...document.querySelectorAll('button, [role=button]')]
    .map((el) => el.getBoundingClientRect())
    .filter((r) => r.width > 0 && (r.width < 44 || r.height < 44))
  return small.length
`)
check('every visible control is at least 44px', targets === 0, `${targets} too small`)

// ------------------------------------------------------------- look around
await cdp.evaluate(`
  [...document.querySelectorAll('.g-card')]
    .find((el) => el.textContent.includes('Look around')).click()
`)
await sleep(400)
// Deliberately fired back-to-back: children tap fast, and no reveal should be lost.
await cdp.evaluate(`
  const spots = [...document.querySelectorAll('.g-hotspot')]
  spots.slice(0, 3).forEach((s) => s.dispatchEvent(new MouseEvent('click', { bubbles: true })))
`)
await sleep(500)
const explore = await cdp.evaluate(`
  return {
    found: document.querySelectorAll('.g-dot.is-on').length,
    friends: document.querySelectorAll('.g-pop').length,
    caption: document.querySelector('.g-caption')?.textContent,
  }
`)
check(
  'tapping the room reveals hidden friends',
  explore.found === 3 && explore.friends === 3,
  `${explore.found} dots, ${explore.friends} friends, caption "${explore.caption}"`,
)
await cdp.shot('02-explore')

// ------------------------------------------------------------------ i spy
await cdp.evaluate(`document.querySelector('.g-back').click()`)
await sleep(300)
await cdp.evaluate(`
  [...document.querySelectorAll('.g-card')].find((el) => el.textContent.includes('I spy')).click()
`)
await sleep(400)
await cdp.evaluate(`document.querySelector('.g-btn--quiet').click()`)
await sleep(300)
const spy = await cdp.evaluate(`
  const before = document.querySelectorAll('.g-target.is-found').length
  document.querySelectorAll('.g-spy .g-hotspot')[0]
    .dispatchEvent(new MouseEvent('click', { bubbles: true }))
  return { before, targets: document.querySelectorAll('.g-target').length,
           hint: !!document.querySelector('.g-spy__ring') }
`)
await sleep(300)
const spyAfter = await cdp.evaluate(
  `return document.querySelectorAll('.g-target.is-found').length`,
)
check(
  'i spy hides five friends, help points at one, taps mark them found',
  spy.targets === 5 && spy.hint && spyAfter === 1,
  `${spy.targets} targets, hint ${spy.hint}, found ${spyAfter}`,
)
await cdp.shot('03-ispy')

// --------------------------------------------------------------- find pairs
await cdp.evaluate(`document.querySelector('.g-back').click()`)
await sleep(300)
await cdp.evaluate(`
  [...document.querySelectorAll('.g-card')].find((el) => el.textContent.includes('Find pairs')).click()
`)
await sleep(400)
const tileCount = await cdp.evaluate(`
  document.querySelectorAll('.g-tile')[0].click()
  return document.querySelectorAll('.g-tile').length
`)
await sleep(300)
const oneUp = await cdp.evaluate(`return document.querySelectorAll('.g-tile.is-up').length`)
await cdp.evaluate(`document.querySelectorAll('.g-tile')[1].click()`)
await sleep(300)
const twoUp = await cdp.evaluate(`
  return document.querySelectorAll('.g-tile.is-up, .g-tile.is-matched').length
`)
check(
  'twelve cards deal and flip face up on tap',
  tileCount === 12 && oneUp === 1 && twoUp === 2,
  `${tileCount} cards, ${oneUp} up after one tap, ${twoUp} after two`,
)
await cdp.shot('04-pairs')

// ------------------------------------------------------------ three in a row
await cdp.evaluate(`document.querySelector('.g-back').click()`)
await sleep(300)
await cdp.evaluate(`
  [...document.querySelectorAll('.g-card')].find((el) => el.textContent.includes('Three in a row')).click()
`)
await sleep(400)
await cdp.evaluate(`document.querySelectorAll('.g-cell')[4].click()`)
await sleep(1100)
const ttt = await cdp.evaluate(`
  return {
    stars: document.querySelectorAll('.g-mark--star').length,
    hearts: document.querySelectorAll('.g-mark--heart').length,
    caption: document.querySelector('.g-caption')?.textContent,
  }
`)
check(
  'the app answers a move without pressure wording',
  ttt.stars === 1 && ttt.hearts === 1 && !/lose|lost|wrong/i.test(ttt.caption ?? ''),
  `stars ${ttt.stars}, hearts ${ttt.hearts}, caption "${ttt.caption}"`,
)
await cdp.shot('05-tictactoe')

// Two players, played out to a win: the wording must stay warm and the winning
// line must be marked.
await cdp.evaluate(`
  [...document.querySelectorAll('.g-room')].find((b) => b.textContent === 'Two players').click()
`)
await sleep(300)
for (const cell of [0, 3, 1, 4, 2]) {
  await cdp.evaluate(`document.querySelectorAll('.g-cell')[${cell}].click()`)
  await sleep(150)
}
const win = await cdp.evaluate(`
  return {
    caption: document.querySelector('.g-caption')?.textContent,
    winCells: document.querySelectorAll('.g-cell.is-win').length,
  }
`)
check(
  'a win is announced kindly and the line is highlighted',
  win.winCells === 3 && /three in a row/i.test(win.caption ?? '') &&
    !/lose|lost|fail/i.test(win.caption ?? ''),
  `${win.winCells} cells, caption "${win.caption}"`,
)
await cdp.shot('05b-tictactoe-win')

// ------------------------------------------------------------------- maze
await cdp.evaluate(`document.querySelector('.g-back').click()`)
await sleep(300)
await cdp.evaluate(`
  [...document.querySelectorAll('.g-card')].find((el) => el.textContent.trim().startsWith('Maze')).click()
`)
await sleep(400)
const heroAt = () =>
  cdp.evaluate(`
    const hero = document.querySelector('.g-maze__hero')
    return hero.style.gridColumn + ',' + hero.style.gridRow
  `)

const mazeStart = await heroAt()
const walls = await cdp.evaluate(
  `return document.querySelectorAll('.g-maze__tile.is-wall').length`,
)
for (const key of ['ArrowRight', 'ArrowDown', 'ArrowRight', 'ArrowDown', 'ArrowRight']) {
  await cdp.evaluate(`
    const grid = document.querySelector('.g-maze')
    grid.focus()
    grid.dispatchEvent(new KeyboardEvent('keydown', { key: '${key}', bubbles: true }))
  `)
  await sleep(90)
}
const afterKeys = await heroAt()
check(
  'the maze is walled and the character moves with keys',
  walls > 10 && afterKeys !== mazeStart,
  `${walls} walls, ${mazeStart} -> ${afterKeys}`,
)

// Sliding a finger is the primary control, so exercise it the same way a touch
// screen would: pointerdown, then a run of pointermove events that follow the
// real corridor away from wherever the character currently stands.
const dragFrom = await heroAt()
const path = await cdp.evaluate(`
  const tiles = [...document.querySelectorAll('.g-maze__tile')]
  const size = Math.sqrt(tiles.length)
  const wall = (x, y) => tiles[y * size + x].className.includes('is-wall')
  const hero = document.querySelector('.g-maze__hero')
  const startX = Number(hero.style.gridColumn) - 1
  const startY = Number(hero.style.gridRow) - 1

  // Breadth-first search for the farthest tile the character can reach.
  const key = (x, y) => x + ',' + y
  const prev = new Map([[key(startX, startY), null]])
  const queue = [[startX, startY]]
  let last = [startX, startY]
  while (queue.length) {
    const [x, y] = queue.shift()
    last = [x, y]
    for (const [dx, dy] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) {
      const nx = x + dx
      const ny = y + dy
      if (nx < 0 || ny < 0 || nx >= size || ny >= size) continue
      if (wall(nx, ny) || prev.has(key(nx, ny))) continue
      prev.set(key(nx, ny), [x, y])
      queue.push([nx, ny])
    }
  }

  const route = []
  for (let step = last; step; step = prev.get(key(step[0], step[1]))) route.unshift(step)
  window.__dragPath = route
  return { size, route }
`)
check(
  'the maze offers a route of several tiles from where the character stands',
  path.route.length > 3,
  `${path.route.length} tiles`,
)

await cdp.evaluate(`
  const grid = document.querySelector('.g-maze')
  const box = grid.getBoundingClientRect()
  const tile = box.width / ${path.size}
  const [tx, ty] = window.__dragPath[0]
  grid.dispatchEvent(new PointerEvent('pointerdown', {
    bubbles: true, pointerId: 1, pointerType: 'touch', isPrimary: true,
    clientX: box.left + tile * (tx + 0.5), clientY: box.top + tile * (ty + 0.5),
  }))
`)
let everInWall = false
for (let i = 1; i < path.route.length; i++) {
  const inWall = await cdp.evaluate(`
    const grid = document.querySelector('.g-maze')
    const box = grid.getBoundingClientRect()
    const tile = box.width / ${path.size}
    const [tx, ty] = window.__dragPath[${i}]
    grid.dispatchEvent(new PointerEvent('pointermove', {
      bubbles: true, pointerId: 1, pointerType: 'touch', isPrimary: true,
      clientX: box.left + tile * (tx + 0.5), clientY: box.top + tile * (ty + 0.5),
    }))
    const tiles = [...document.querySelectorAll('.g-maze__tile')]
    const hero = document.querySelector('.g-maze__hero')
    const hx = Number(hero.style.gridColumn) - 1
    const hy = Number(hero.style.gridRow) - 1
    return tiles[hy * ${path.size} + hx].className.includes('is-wall')
  `)
  if (inWall) everInWall = true
  await sleep(45)
}
const dragTo = await heroAt()
check(
  'sliding a finger walks the character along the corridor, never into a wall',
  dragTo !== dragFrom && !everInWall,
  `${dragFrom} -> ${dragTo}, entered a wall: ${everInWall}`,
)
await cdp.shot('06-maze')

// ------------------------------------------------------------------ dance
await cdp.evaluate(`document.querySelector('.g-back').click()`)
await sleep(300)
await cdp.evaluate(`
  [...document.querySelectorAll('.g-card')].find((el) => el.textContent.includes('Silly dance')).click()
`)
await sleep(400)
const dancers = await cdp.evaluate(`
  const dancers = [...document.querySelectorAll('.g-dancer')]
  dancers[0].click()
  return dancers.length
`)
await sleep(250)
const danceClass = await cdp.evaluate(
  `return document.querySelectorAll('.g-dancer')[0].className`,
)
check(
  'tapping a friend starts a movement',
  dancers === 8 && /is-\w/.test(danceClass),
  `${dancers} friends, class "${danceClass}"`,
)
await cdp.shot('07-dance')

// -------------------------------------------------------------- sound + data
const soundBefore = await cdp.evaluate(`
  const btn = document.querySelector('.g-sound')
  const before = btn.getAttribute('aria-pressed')
  btn.click()
  return before
`)
await sleep(250)
const soundAfter = await cdp.evaluate(
  `return document.querySelector('.g-sound').getAttribute('aria-pressed')`,
)
check(
  'sound starts off and can be turned on',
  soundBefore === 'false' && soundAfter === 'true',
  `${soundBefore} -> ${soundAfter}`,
)

await cdp.evaluate(`
  [...document.querySelectorAll('.g-foot button')].find((b) => b.textContent.includes('Pilot data')).click()
`)
await sleep(400)
const pilot = await cdp.evaluate(`
  const rows = [...document.querySelectorAll('.g-sheet__table tbody tr')]
  const opens = rows.map((r) => Number(r.children[1].textContent))
  const stored = JSON.parse(localStorage.getItem('mvp.pilot.v1') ?? '{}')
  return {
    rows: rows.length,
    started: opens.filter((n) => n > 0).length,
    keys: Object.keys(stored),
    json: JSON.stringify(stored),
  }
`)
check(
  'engagement counters recorded for every activity opened',
  pilot.rows === 6 && pilot.started === 6,
  `${pilot.started} of ${pilot.rows} activities have opens`,
)
check(
  'stored data contains no identifiers',
  !/name|dob|birth|patient|mrn|lat|lon|email/i.test(pilot.json),
  pilot.json.slice(0, 120),
)
await cdp.shot('08-pilot-data')

// ------------------------------------------------------------------- brief
await goto(`${BASE}/#brief-overview`)
const briefPhone = await cdp.evaluate(`
  const d = document.documentElement
  return { scroll: d.scrollWidth, client: d.clientWidth,
           hasNav: !!document.querySelector('.mobilenav'),
           title: document.querySelector('.hero__title')?.textContent }
`)
check(
  'brief has no horizontal overflow at 390px',
  briefPhone.scroll <= briefPhone.client + 1,
  `scrollWidth ${briefPhone.scroll} vs clientWidth ${briefPhone.client}`,
)
await cdp.shot('09-brief-phone')

await viewport(1280, 900, false)
await goto(`${BASE}/#brief-overview`)
await cdp.shot('10-brief-desktop')
const desktop = await cdp.evaluate(`
  const d = document.documentElement
  return { scroll: d.scrollWidth, client: d.clientWidth,
           sidenav: !!document.querySelector('.sidenav') }
`)
check('brief fits at desktop width', desktop.scroll <= desktop.client + 1,
  `scrollWidth ${desktop.scroll} vs clientWidth ${desktop.client}`)

// back to the game from the brief
await cdp.evaluate(`document.querySelector('.sidenav__play').click()`)
await sleep(600)
const backToGame = await cdp.evaluate(
  `return !!document.querySelector('.g-menu')`,
)
check('brief links back into the prototype', backToGame === true)

await viewport(390, 844)
await goto(`${BASE}/`)
await cdp.shot('11-menu-final')

const errors = consoleErrors()
check('no console errors during the tour', errors.length === 0, errors.join(' | '))

ws.close()
chrome.kill()

const failed = results.filter((r) => !r.ok)
console.log(`\n${results.length - failed.length}/${results.length} checks passed`)
process.exit(failed.length ? 1 : 0)
