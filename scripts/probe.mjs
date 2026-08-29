/**
 * Focused debugging helper: reveals every hidden friend in both rooms and checks
 * that each one is drawn fully inside the picture.
 */
import { spawn } from 'node:child_process'
import { mkdirSync, mkdtempSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'

const BASE = process.argv[2] ?? 'http://localhost:5180'
const OUT = '.shots'
const PORT = 9334
const CHROME = '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome'

mkdirSync(OUT, { recursive: true })

const chrome = spawn(
  CHROME,
  [
    '--headless=old',
    '--disable-gpu',
    '--no-first-run',
    '--no-default-browser-check',
    '--hide-scrollbars',
    `--remote-debugging-port=${PORT}`,
    `--user-data-dir=${mkdtempSync(join(tmpdir(), 'probe-'))}`,
    'about:blank',
  ],
  { stdio: 'ignore' },
)

const sleep = (ms) => new Promise((r) => setTimeout(r, ms))

let wsUrl
for (let i = 0; i < 40 && !wsUrl; i++) {
  try {
    const res = await fetch(`http://127.0.0.1:${PORT}/json/list`)
    wsUrl = (await res.json()).find((t) => t.type === 'page')?.webSocketDebuggerUrl
  } catch {
    // still starting
  }
  if (!wsUrl) await sleep(250)
}

const ws = new WebSocket(wsUrl)
await new Promise((r) => ws.addEventListener('open', r, { once: true }))

let id = 0
const pending = new Map()
ws.addEventListener('message', (e) => {
  const msg = JSON.parse(e.data)
  if (msg.id && pending.has(msg.id)) {
    const { resolve, reject } = pending.get(msg.id)
    pending.delete(msg.id)
    msg.error ? reject(new Error(msg.error.message)) : resolve(msg.result)
  }
})
const send = (method, params = {}) => {
  const n = ++id
  return new Promise((resolve, reject) => {
    pending.set(n, { resolve, reject })
    ws.send(JSON.stringify({ id: n, method, params }))
  })
}
const evaluate = async (expression) => {
  const res = await send('Runtime.evaluate', {
    expression: `(() => { ${expression} })()`,
    returnByValue: true,
  })
  if (res.exceptionDetails) throw new Error(res.exceptionDetails.exception?.description)
  return res.result.value
}
const shot = async (name) => {
  const { data } = await send('Page.captureScreenshot', { format: 'png' })
  writeFileSync(join(OUT, `${name}.png`), Buffer.from(data, 'base64'))
}

await send('Page.enable')
await send('Runtime.enable')
await send('Emulation.setDeviceMetricsOverride', {
  width: 390,
  height: 900,
  deviceScaleFactor: 2,
  mobile: true,
})
await send('Page.navigate', { url: `${BASE}/` })
await sleep(1000)

await evaluate(
  `[...document.querySelectorAll('.g-card')].find((el) => el.textContent.includes('Look around')).click()`,
)
await sleep(400)

for (const room of ['Waiting room', 'Clinic room']) {
  await evaluate(`
    const btn = [...document.querySelectorAll('.g-room')].find((b) => b.textContent === '${room}')
    if (!btn.classList.contains('is-current')) btn.click()
  `)
  await sleep(300)

  const spots = await evaluate(`return document.querySelectorAll('.g-hotspot').length`)
  for (let i = 0; i < spots; i++) {
    await evaluate(`
      document.querySelectorAll('.g-hotspot')[${i}]
        .dispatchEvent(new MouseEvent('click', { bubbles: true }))
    `)
    await sleep(70)
  }
  await sleep(300)

  const report = await evaluate(`
    const svg = document.querySelector('.g-stage__svg')
    const box = svg.getBoundingClientRect()
    const friends = [...document.querySelectorAll('.g-pop')].map((g) => {
      const r = g.getBoundingClientRect()
      return {
        left: Math.round(r.left - box.left),
        top: Math.round(r.top - box.top),
        right: Math.round(box.right - r.right),
        bottom: Math.round(box.bottom - r.bottom),
      }
    })
    return {
      count: friends.length,
      clipped: friends.filter((f) => f.left < 0 || f.top < 0 || f.right < 0 || f.bottom < 0),
      dots: document.querySelectorAll('.g-dot.is-on').length,
      caption: document.querySelector('.g-caption')?.textContent,
    }
  `)
  console.log(`${room}: ${report.count} friends, ${report.dots} dots on`)
  console.log(`  clipped: ${JSON.stringify(report.clipped)}`)
  console.log(`  caption: ${report.caption}`)
  await shot(`probe-${room.split(' ')[0].toLowerCase()}-all-found`)
}

ws.close()
chrome.kill()
