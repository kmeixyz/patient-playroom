import { useEffect, useRef, useState } from 'react'
import { Icon } from '../Icons'
import { useGame } from '../useGame'
import { movePebble, pebbleKinds, sortHint, sortedJars, sortPuzzles, type Jars } from './discoveryLogic'

export function PebbleSort() {
  const { paused, finish, report } = useGame()
  const [puzzle, setPuzzle] = useState(0)
  const [history, setHistory] = useState<Jars[]>([sortPuzzles[0]!.jars])
  const [selected, setSelected] = useState<number | null>(null)
  const [hint, setHint] = useState<[number, number] | null>(null)
  const [notice, setNotice] = useState('Tap a jar, then another to move its top pebble.')
  const jars = history[history.length - 1]!
  const done = sortedJars(jars)
  const completeButton = useRef<HTMLButtonElement>(null)
  useEffect(() => { if (done) completeButton.current?.focus({ preventScroll: true }) }, [done])
  useEffect(() => { report(done ? 'All 3 shapes sorted' : `${history.length - 1} pebble moves`) }, [done, history.length, report])
  const choose = (index: number) => {
    if (paused || done) return
    if (selected === index) { setSelected(null); setHint(null); setNotice('No jar selected. Tap a jar to pick its top pebble.'); return }
    if (selected === null) {
      if (!jars[index]!.length) { setNotice('Empty jar. Choose one with a pebble.'); return }
      setSelected(index); setNotice(`Jar ${index + 1} selected. Choose an empty jar or one with the same shape on top.`); return
    }
    const next = movePebble(jars, selected, index)
    if (!next) { setNotice('Choose an empty jar or the same shape, with room for one more. Tap your jar again to cancel.'); return }
    setHistory([...history, next]); setSelected(null); setHint(null)
    const solved = sortedJars(next)
    setNotice(solved ? 'All sorted!' : `Pebble moved from jar ${selected + 1} to jar ${index + 1}.`)
  }
  const reset = (index: number) => {
    setPuzzle(index); setHistory([sortPuzzles[index]!.jars]); setSelected(null); setHint(null)
    setNotice('Tap a jar to start.')
  }
  const help = () => {
    const next = sortHint(jars)
    setSelected(null); setHint(next)
    setNotice(next ? `Try moving the top pebble from jar ${next[0] + 1} to jar ${next[1] + 1}.` : 'Tap Undo or Start fresh to try again.')
  }
  return <div className="discovery-game pebble-game">
    <div className="mini-game-heading"><div><h2>Sort the shapes</h2></div><span className="mini-game-count">{history.length - 1} {history.length === 2 ? 'move' : 'moves'}</span></div>
    <p className="discovery-instruction">Put all pebbles with the same shape together. Each jar holds 3 pebbles.</p>
    <div className="puzzle-picker" role="group" aria-label="Choose a pebble puzzle">{sortPuzzles.map((entry,index) => <button key={entry.name} aria-pressed={index === puzzle} onClick={() => reset(index)}>{entry.name}</button>)}</div>
    <div className="pebble-jars" role="group" aria-label="Pebble jars">{jars.map((jar,index) => <button key={index} className={`pebble-jar ${hint?.includes(index) ? 'hinted' : ''}`} aria-pressed={selected === index} aria-label={`Jar ${index + 1}: ${jar.length ? jar.map(pebble => pebbleKinds[pebble].name).join(', ') + ', bottom to top' : 'empty'}`} onClick={() => choose(index)} disabled={done || paused}><span className="jar-vessel">{jar.map((pebble, position) => <span key={position} className="pebble" style={{ background: pebbleKinds[pebble].color }} aria-hidden="true">{pebbleKinds[pebble].symbol}</span>)}</span><strong>Jar {index + 1}</strong>{hint?.includes(index) && <small>{hint[0] === index ? 'From here' : 'To here'}</small>}</button>)}</div>
    <p className="discovery-feedback" role="status">{notice}</p>
    <div className="discovery-actions"><button className="secondary-button" disabled={history.length < 2 || paused} onClick={() => {setHistory(history.slice(0,-1));setSelected(null);setHint(null);setNotice('Move undone.')}}><Icon name="restart" size={18}/> Undo</button><button className="text-button" onClick={() => reset(puzzle)}>Start fresh</button><button className="secondary-button" disabled={done || paused} onClick={help}><Icon name="sparkle" size={18}/> Hint</button></div>
    {done && <button ref={completeButton} className="primary-button discovery-complete" onClick={() => finish('All sorted!')}><Icon name="check"/> All done</button>}
  </div>
}
