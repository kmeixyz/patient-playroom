import { useEffect, useRef, useState, type CSSProperties } from 'react'
import { Icon } from '../Icons'
import { useGame } from '../useGame'
import { usePipeDrag } from './usePipeDrag'
import { PostMail } from './PostMail'
import { pipeShape, portNames, ports, postHint, postPuzzles, rotatePipe, swapPipes, tracePost, type PipeBoard, type PipeHint } from './planetPostLogic'
import './planet-post.css'

/** Functional diagram: the same connections appear on the cover and playable tiles. */
function PipeGlyph({ openings }: { openings: number }) {
  const ends = [[50, 0], [100, 50], [50, 100], [0, 50]]
  const points = ports.flatMap((port, index) => openings & port ? [ends[index]!] : [])
  const d = points.map(([x, y], index) => `${index === 0 ? 'M' : 'L'}${x} ${y}${index === 0 ? ' Q50 50' : ''}`).join(' ')
  // A quadratic curve joins bends; straight pieces pass through the same center.
  const path = points.length === 2 ? `M${points[0]![0]} ${points[0]![1]} Q50 50 ${points[1]![0]} ${points[1]![1]}` : d
  return <svg viewBox="0 0 100 100" aria-hidden="true" className="post-pipe-glyph"><path d={path} className="post-pipe-edge"/><path d={path} className="post-pipe-core"/><path d={path} className="post-pipe-shine"/></svg>
}

export function PlanetPostCover() {
  return <div className="post-cover" aria-hidden="true"><div className="post-cover-route">{[10, 12, 0, 3, 9, 0, 6, 10, 10].map((openings, index) => <span key={index}>{openings ? <PipeGlyph openings={openings}/> : <Icon name="star" size={24}/>}</span>)}</div><span className="post-cover-stamp"><Icon name="planet" size={38}/></span></div>
}

export function PlanetPost() {
  const { paused, quiet, report, finish } = useGame()
  const [puzzleIndex, setPuzzleIndex] = useState(0)
  const puzzle = postPuzzles[puzzleIndex]!
  const [history, setHistory] = useState<PipeBoard[]>([puzzle.initial])
  const [mode, setMode] = useState<'rotate' | 'swap'>('rotate')
  const [selected, setSelected] = useState<number | null>(null)
  const [hint, setHint] = useState<PipeHint | null>(null)
  const [notice, setNotice] = useState('Tap a pipe to rotate it, or drag it onto another pipe to swap.')
  const [delivering, setDelivering] = useState(false)
  const [delivered, setDelivered] = useState(false)
  const [stamps, setStamps] = useState<number[]>([])
  const board = history[history.length - 1]!
  const route = tracePost(board, puzzle)
  const busy = delivering || delivered
  const sendButton = useRef<HTMLButtonElement>(null)
  const nextButton = useRef<HTMLButtonElement>(null)
  const rotateButton = useRef<HTMLButtonElement>(null)
  const boardRef = useRef<HTMLDivElement>(null)
  const resetFocus = useRef(false)
  const wasConnected = useRef(false)
  const location = (at: number) => `row ${Math.floor(at / puzzle.size) + 1}, column ${at % puzzle.size + 1}`

  useEffect(() => {
    report(`${stamps.length} of 3 planet deliveries`)
  }, [stamps.length, report])
  useEffect(() => {
    if (route.connected && !wasConnected.current && !paused) sendButton.current?.focus({ preventScroll: true })
    wasConnected.current = route.connected
  }, [route.connected, paused])
  useEffect(() => { if (delivered && !paused) nextButton.current?.focus({ preventScroll: true }) }, [delivered, paused])
  useEffect(() => {
    if (resetFocus.current && !paused) { resetFocus.current = false; rotateButton.current?.focus({ preventScroll: true }) }
  }, [history, paused])
  useEffect(() => { if (delivering && !paused) boardRef.current?.focus({ preventScroll: true }) }, [delivering, paused])

  const arrive = () => {
    setDelivering(false); setDelivered(true); setStamps(previous => previous.includes(puzzleIndex) ? previous : [...previous, puzzleIndex])
    setNotice('Mail delivered!');
  }
  const commit = (next: PipeBoard, message: string) => {
    setHistory(previous => [...previous, next]); setSelected(null); setHint(null)
    const connected = tracePost(next, puzzle).connected
    setNotice(connected ? 'Connected! Tap Send mail.' : message)
  }
  const pipeDrag = usePipeDrag({
    boardRef, enabled: !paused && !busy, boardKey: board,
    onTap: at => choose(at),
    onSwap: (from, to) => {
      setMode('rotate')
      commit(swapPipes(board, from, to), `Swapped pipes at ${location(from)} and ${location(to)}.`)
    },
  })
  const choose = (at: number) => {
    if (paused || busy || board[at]?.fixed) return
    if (mode === 'rotate') { commit(rotatePipe(board, at), `Pipe at ${location(at)} turned clockwise.`); return }
    if (selected === at) { setSelected(null); setNotice('Pipe released. Choose any two pipes to swap.'); return }
    if (selected === null) { setSelected(at); setNotice(`Pipe at ${location(at)} selected. Tap another pipe to swap.`); return }
    commit(swapPipes(board, selected, at), `Swapped pipes at ${location(selected)} and ${location(at)}.`)
  }
  const reset = (index: number) => {
    if (paused || delivering) return
    pipeDrag.cancel()
    setPuzzleIndex(index); setHistory([postPuzzles[index]!.initial]); setSelected(null); setHint(null); setDelivered(false); setMode('rotate')
    setNotice(index === 0 ? 'Tap a pipe to rotate it, or drag it onto another pipe to swap.' : 'Tap to turn a pipe. Drag to swap two pipes.')
    resetFocus.current = true
  }
  const showHint = () => {
    if (paused || busy) return
    const next = postHint(board, puzzle)
    setHint(next); setSelected(null)
    if (!next) { setNotice('The route is ready. Send your mail!'); return }
    setMode(next.kind)
    setNotice(next.kind === 'rotate' ? `Turn the highlighted pipe at ${location(next.at)} clockwise once.` : `Swap the highlighted pipes at ${location(next.from)} and ${location(next.to)}.`)
  }
  const send = () => {
    if (paused || busy) return
    if (!route.connected) { setNotice('Follow the lit pipes from the post office. Turn or swap the next pipe to join them up.'); return }
    setSelected(null); setHint(null)
    if (quiet) arrive()
    else { setNotice('Your mail is on its way.'); setDelivering(true) }
  }

  return <div className="discovery-game post-game">
    <div className="mini-game-heading"><div><h2>{puzzle.name}</h2></div><span className="mini-game-count">{stamps.length} / 3 delivered</span></div>
    <div className="puzzle-picker" role="group" aria-label="Choose a mail route">{postPuzzles.map((entry, index) => <button key={entry.name} disabled={paused || delivering} aria-pressed={index === puzzleIndex} onClick={() => reset(index)}>{entry.name}{stamps.includes(index) && <Icon name="check" size={16}/>}</button>)}</div>
    <p className="discovery-instruction">Make a path from <strong>Start</strong> to <strong>Planet</strong>. Tap a pipe to turn it. To move two pipes, choose Swap and tap both.</p>
    <div className="post-tools" role="group" aria-label="Pipe action"><button ref={rotateButton} className="secondary-button" aria-pressed={mode === 'rotate'} disabled={paused || busy} onClick={() => { setMode('rotate'); setSelected(null); setHint(null); setNotice('Tap a pipe to turn it clockwise.'); }}><Icon name="restart"/> Rotate</button><button className="secondary-button" aria-pressed={mode === 'swap'} disabled={paused || busy} onClick={() => { setMode('swap'); setSelected(null); setHint(null); setNotice('Tap one pipe, then a second pipe to swap their places.'); }}><Icon name="swap"/> Swap</button></div>
    <div className="post-map"><div className="post-map-key"><span><Icon name="mail" size={18}/> Start</span><span><Icon name="planet" size={18}/> Planet</span></div>
      <div ref={boardRef} className="post-board" role="group" tabIndex={0} aria-label={`${puzzle.name}, ${puzzle.size} by ${puzzle.size} pipe board`} style={{ '--post-size': puzzle.size } as CSSProperties}>
        {board.map((pipe, at) => {
          if (!pipe) return <span className="post-space" key={at} aria-hidden="true">·</span>
          const active = route.path.includes(at), highlighted = hint?.kind === 'rotate' ? hint.at === at : hint?.kind === 'swap' && (hint.from === at || hint.to === at)
          const destination = at === puzzle.end, start = at === puzzle.start
          const className = `post-tile ${active ? 'post-connected' : ''} ${highlighted ? 'post-hinted' : ''} ${pipe.fixed ? 'post-fixed' : ''} ${destination ? 'post-destination' : ''} ${pipeDrag.drag?.from === at ? 'post-drag-source' : ''} ${pipeDrag.drag?.to === at ? 'post-drop-target' : ''}`
          const connections = ports.flatMap((port, index) => pipe.openings & port ? [portNames[index]] : []).join(' and ')
          const content = <><PipeGlyph openings={pipe.openings}/>{pipe.fixed && <span className="post-endpoint"><Icon name={start ? 'mail' : 'planet'} size={20}/><span>{start ? 'Start' : 'Planet'}</span></span>}{highlighted && <span className="post-hint-dot" aria-hidden="true">!</span>}</>
          return pipe.fixed ? <div key={at} className={className} role="img" aria-label={`${start ? 'Start: post office' : 'Destination: planet'}, ${location(at)}, fixed pipe, connects ${connections}`}>{content}</div> : <button key={at} className={className} data-post-index={at} disabled={paused || busy} aria-pressed={selected === at} aria-label={`${location(at)}, ${pipeShape(pipe.openings)}, connects ${connections}${active ? ', connected to start' : ''}${highlighted ? ', hint' : ''}`} onPointerDown={event => pipeDrag.begin(event, at)} onPointerMove={pipeDrag.move} onPointerUp={pipeDrag.end} onPointerCancel={pipeDrag.interrupted} onLostPointerCapture={pipeDrag.interrupted} onClick={event => { if (pipeDrag.allowClick(event)) choose(at) }} onDragStart={event => event.preventDefault()} onContextMenu={event => event.preventDefault()}>{content}</button>
        })}
        {delivering && <PostMail route={route.path} size={puzzle.size} onArrive={arrive}/>}
      </div>
      {pipeDrag.drag && board[pipeDrag.drag.from] && <div className="post-drag-ghost" aria-hidden="true" style={{ left: pipeDrag.drag.x, top: pipeDrag.drag.y, width: pipeDrag.drag.size, height: pipeDrag.drag.size }}><PipeGlyph openings={board[pipeDrag.drag.from]!.openings}/></div>}
    </div>
    <p className="discovery-feedback" role="status">{notice}</p>
    <div className="discovery-actions"><button className="secondary-button" disabled={history.length < 2 || paused || busy} onClick={() => { setHistory(history.slice(0, -1)); setSelected(null); setHint(null); setNotice('Move undone.'); }}><Icon name="restart" size={18}/> Undo</button><button className="text-button" disabled={paused || delivering} onClick={() => reset(puzzleIndex)}>Start fresh</button><button className="secondary-button" disabled={paused || busy || route.connected} onClick={showHint}><Icon name="sparkle" size={18}/> Hint</button></div>
    {!delivered ? <button ref={sendButton} className="primary-button discovery-complete" disabled={paused || delivering} onClick={send}><Icon name="mail"/> {delivering ? 'Delivering…' : 'Send mail'}</button> : <div className="post-success"><strong><Icon name="check"/> Delivered to {puzzle.name.split(' ')[0]}!</strong>{stamps.length < 3 && <button ref={nextButton} className="primary-button" disabled={paused} onClick={() => reset(postPuzzles.findIndex((_, index) => !stamps.includes(index)))}>Next delivery</button>}<button ref={stamps.length === 3 ? nextButton : undefined} className={stamps.length === 3 ? 'primary-button' : 'secondary-button'} disabled={paused} onClick={() => finish(stamps.length === 3 ? 'All 3 deliveries made!' : 'Mail delivered!')}>All done</button></div>}
  </div>
}
