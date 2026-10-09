import { useEffect, useRef, useState } from 'react'
import { Icon } from '../Icons'
import { useGame } from '../useGame'
import { colorRecipes, mixColor, pigments, sameMix, type Drops } from './discoveryLogic'

export function ColorLab() {
  const { paused, finish, report } = useGame()
  const [round, setRound] = useState(0)
  const [collection, setCollection] = useState<number[]>([])
  const [history, setHistory] = useState<Drops[]>([[0, 0, 0]])
  const [hint, setHint] = useState(false)
  const [offset] = useState(() => Math.random() < .5 ? 0 : 3)
  const firstPigment = useRef<HTMLButtonElement>(null)
  useEffect(() => {
    if (round > 0) firstPigment.current?.focus({ preventScroll: true })
  }, [round])
  const drops = history[history.length - 1]!
  const targetIndex = offset + round
  const target = colorRecipes[targetIndex]!
  const matched = sameMix(drops, target.drops)
  const total = drops.reduce((a, b) => a + b, 0)
  const add = (index: number) => {
    if (paused || total >= 6) return
    const next: Drops = [...drops]
    next[index]++
    setHistory([...history, next])
  }
  const save = () => {
    if (paused || !matched) return
    const next = [...collection, targetIndex]
    setCollection(next)
    report(`${next.length} of 3 colors discovered`)
    if (next.length === 3) {
      finish('Your colors!', <div className="color-collection">{next.map(index => <div key={index}><span style={{ background: colorRecipes[index]!.color }}/><strong>{colorRecipes[index]!.name}</strong></div>)}</div>)
    } else {
      setRound(round + 1); setHistory([[0, 0, 0]]); setHint(false)
    }
  }
  return <div className="discovery-game color-game">
    <div className="mini-game-heading"><div><h2>Mix {target.name.toLowerCase()}</h2></div><span className="mini-game-count">{collection.length} / 3</span></div>
    <p className="discovery-instruction">Tap a paint below to add one drop. Make your mix look like the color on the left.</p>
    <div className="mix-workbench">
      <div className="mix-sample"><span className="mix-disc" style={{ background: target.color }}/><strong>{target.name}</strong><span>Match this color</span></div>
      <span className="mix-equals" aria-hidden="true">=</span>
      <div className="mix-sample"><span className="mix-disc your-mix" style={{ background: mixColor(drops) }}><span aria-hidden="true">{total ? drops.flatMap((count, index) => Array.from({length:count}, () => pigments[index]!.symbol)).join(' ') : '+'}</span></span><strong>Your mix</strong><span>{total} {total === 1 ? 'drop' : 'drops'} added</span></div>
    </div>
    <div className="pigment-tray" role="group" aria-label="Add paint drops">{pigments.map((pigment, index) => <button ref={index === 0 ? firstPigment : undefined} key={pigment.name} disabled={total >= 6 || paused} onClick={() => add(index)} aria-label={`Add ${pigment.name.toLowerCase()} drop`}><span className="pigment-dot" style={{background:pigment.color}} aria-hidden="true">{pigment.symbol}</span><strong>{pigment.name}</strong><span>{drops[index]} added</span></button>)}</div>
    <p className="discovery-feedback" role="status">{matched ? `Color matched! Tap Save color.` : total >= 6 ? 'Your dish has 6 drops. Tap Undo to remove one, or Clear mix to start again.' : total ? `${drops[0]} rose, ${drops[1]} yellow, ${drops[2]} blue. Add paint or tap Show recipe.` : 'Tap a paint to add a drop.'}</p>
    {hint && <p className="mix-recipe">To make {target.name}, add: {target.drops.map((count, index) => count ? `${count} ${pigments[index]!.name.toLowerCase()}` : null).filter(Boolean).join(' + ')}.</p>}
    <div className="discovery-actions"><button className="secondary-button" disabled={history.length < 2 || paused} onClick={() => setHistory(history.slice(0,-1))}><Icon name="restart" size={18}/> Undo</button><button className="text-button" disabled={!total || paused} onClick={() => setHistory([[0,0,0]])}>Clear mix</button><button className="secondary-button" aria-expanded={hint} onClick={() => setHint(!hint)}><Icon name="eye" size={18}/>{hint ? 'Hide recipe' : 'Show recipe'}</button></div>
    <button className="primary-button discovery-complete" disabled={!matched || paused} onClick={save}>Save color<Icon name="right" size={18}/></button>
  </div>
}
