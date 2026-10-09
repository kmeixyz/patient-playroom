import { useEffect, useRef, useState } from 'react'
import { memoryDeal, memoryFlip } from '../logic'
import { useGame, useGameDelay } from '../useGame'
import { Icon } from '../Icons'

export function Matching({ onFinish, pairs = 3 }: { onFinish: () => void; pairs?: 3 | 6 }) {
  const { paused, relaxed } = useGame()
  const [state, setState] = useState(() => memoryDeal(Math.random, pairs))
  const live = useRef(state)
  const area = useRef<HTMLDivElement>(null)
  const board = useRef<HTMLDivElement>(null)
  const cards = useRef<(HTMLButtonElement | null)[]>([])
  const tryAgain = useRef<HTMLButtonElement>(null)
  const keyboardFocus = useRef(false)
  const lastCard = useRef(-1)
  const update = (next: typeof state) => { live.current = next; setState(next) }

  useGameDelay(() => update({ ...live.current, open: [] }), state.open.length === 2 && !relaxed ? 900 : null, state.turns)
  useEffect(() => {
    if (paused || !keyboardFocus.current) return
    // Automatic card turning must never pull focus away from navigation or settings.
    if (document.activeElement !== document.body && !area.current?.contains(document.activeElement)) {
      keyboardFocus.current = false
      return
    }
    if (state.open.length === 2) {
      if (relaxed) {
        tryAgain.current?.focus({ preventScroll: true })
        keyboardFocus.current = false
      } else {
        // All cards are temporarily disabled. Keep a focus position until they reopen.
        board.current?.focus({ preventScroll: true })
      }
      return
    }
    keyboardFocus.current = false
    const available = state.deck.map((_, index) => index).filter(index => !state.open.includes(index) && !state.matched.includes(index))
    const next = available.find(index => index > lastCard.current) ?? available[0]
    if (next !== undefined) cards.current[next]?.focus({ preventScroll: true })
  }, [state, paused, relaxed])

  const flip = (index: number, keyboard: boolean) => {
    if (paused) return
    const next = memoryFlip(live.current, index)
    if (next === live.current) return
    keyboardFocus.current = keyboard
    lastCard.current = index
    update(next)
    if (next.matched.length === pairs * 2) onFinish()
  }

  return <div className="puzzle-area" ref={area}>
    <p className="matching-instruction">Tap two cards. Find the same picture on both.</p>
    <div className="puzzle-status"><span><Icon name="cards"/> {state.matched.length / 2} of {pairs} pairs</span><span>{state.turns} turns</span></div>
    <div ref={board} tabIndex={-1} className={`memory-board ${pairs === 3 ? 'memory-board-small' : ''}`} role="group" aria-label="Memory cards">
      {state.deck.map((kind, i) => {
        const matched = state.matched.includes(i), open = matched || state.open.includes(i)
        return <button key={i} ref={el => { cards.current[i] = el }} className={`memory-card ${open ? 'open' : ''} ${matched ? 'matched' : ''}`}
          onClick={event => flip(i, event.detail === 0)} disabled={matched || state.open.includes(i) || state.open.length === 2}
          aria-label={open ? `Card ${i + 1}: ${kind}${matched ? ', matched' : ''}` : `Hidden card ${i + 1}`}>
          <span>{open ? <Icon name={kind} size={40} weight="fill"/> : '?'}</span>{matched && <Icon className="matched-check" name="check" size={15}/>}
        </button>
      })}
    </div>
    <p className="control-note" aria-live="polite">{state.open.length === 2
      ? `${state.deck[state.open[0]!]!} and ${state.deck[state.open[1]!]!}. Different pictures. ${relaxed ? 'Tap Turn them over to try again.' : 'They will turn back over. Try again.'}`
      : state.open.length === 1 ? `${state.deck[state.open[0]!]!} found. Tap another card to look for the same picture.` : 'Choose any card to start.'}</p>
    {relaxed && state.open.length === 2 && <button ref={tryAgain} className="secondary-button memory-try-again" onClick={() => {
      if (paused) return
      keyboardFocus.current = true
      lastCard.current = -1
      update({ ...live.current, open: [] })
    }}>Turn them over <Icon name="restart"/></button>}
  </div>
}
