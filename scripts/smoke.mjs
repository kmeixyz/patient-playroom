// Renders the game and the brief once with react-dom/server to catch runtime
// errors and confirm the key content is present. Run: node scripts/smoke.mjs
import { build } from 'esbuild'
import { createRequire } from 'node:module'
import { renderToString } from 'react-dom/server'
import { createElement } from 'react'

const require = createRequire(import.meta.url)

const result = await build({
  stdin: {
    contents: `
      export { GameApp } from './src/game/GameApp'
      export { BriefPage } from './src/brief/BriefPage'
    `,
    resolveDir: process.cwd(),
    loader: 'ts',
  },
  bundle: true,
  write: false,
  format: 'cjs',
  jsx: 'automatic',
  platform: 'node',
  external: ['react', 'react-dom'],
  loader: { '.css': 'empty' },
})

const module = { exports: {} }
new Function('require', 'module', 'exports', result.outputFiles[0].text)(
  require,
  module,
  module.exports,
)

const checks = [
  {
    name: 'game',
    html: renderToString(createElement(module.exports.GameApp)),
    expect: [
      'Patient Playroom home',
      'Make room for',
      'Sky Dash',
      'Orbit Pop',
      'Match Club',
      'Three in a Row',
      'Maze Quest',
      'Beat Garden',
      'Turn sound on',
      'Design brief',
    ],
  },
  {
    name: 'brief',
    html: renderToString(createElement(module.exports.BriefPage)),
    expect: [
      'Pediatric Outpatient Waiting-Room Game',
      'Executive Summary',
      'Design Hypothesis',
      'Pilot Questions &amp; Measures',
      'Definition of a successful project',
      'id="brief-summary"',
    ],
  },
]

let failed = false
for (const check of checks) {
  const missing = check.expect.filter((needle) => !check.html.includes(needle))
  if (missing.length) {
    failed = true
    console.error(`[${check.name}] missing from output:`, missing)
  } else {
    console.log(
      `[${check.name}] rendered ${check.html.length} chars; ${check.expect.length} checks passed.`,
    )
  }
}

process.exit(failed ? 1 : 0)
