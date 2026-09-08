import { build } from 'esbuild'
import { createRequire } from 'node:module'
import { renderToString } from 'react-dom/server'
import { createElement } from 'react'
const require = createRequire(import.meta.url)
const result = await build({ stdin: { contents: "export { GameApp } from './src/game/GameApp'", resolveDir: process.cwd(), loader: 'ts' }, bundle: true, write: false, format: 'cjs', jsx: 'automatic', platform: 'node', external: ['react', 'react-dom'], loader: { '.css': 'empty' } })
const module = { exports: {} }
new Function('require', 'module', 'exports', result.outputFiles[0].text)(require, module, module.exports)
const html = renderToString(createElement(module.exports.GameApp))
const required = ['Patient Playroom home', 'Make room for', 'Sky Dash', 'Orbit Pop', 'Match Club', 'Three in a Row', 'Maze Quest', 'Beat Garden', 'Turn sound on', 'My appointment']
const missing = required.filter(text => !html.includes(text))
const removed = ['Design brief', 'Pilot data', 'Less motion'].filter(text => html.includes(text))
if (missing.length || removed.length) { console.error({ missing, removed }); process.exit(1) }
console.log(`Game library rendered: ${required.length} content checks; removed controls absent.`)
