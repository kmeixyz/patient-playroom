import { useEffect, useRef, useState } from 'react'
import { CreatureIcon, creatureKinds, creatureNames, type CreatureKind } from '../creatures'
import { playCue } from '../sound'
import { TryAgain } from '../ui'

type Tile = { key: string; kind: CreatureKind }

const PAIRS = 6

function deal(): Tile[] {
  const kinds = [...creatureKinds].sort(() => Math.random() - 0.5).slice(0, PAIRS)
  const tiles = kinds.flatMap((kind) => [
    { key: `${kind}-a`, kind },
    { key: `${kind}-b`, kind },
  ])
  return tiles.sort(() => Math.random() - 0.5)
}

/**
 * Memory pairs with no move counter and no timer. A non-match simply turns back
 * over after a beat; there is no failure state to reach.
 */
export function Matching({ onFinish }: { onFinish: () => void }) {
  const [tiles, setTiles] = useState<Tile[]>(deal)
  const [faceUp, setFaceUp] = useState<string[]>([])
  const [matched, setMatched] = useState<CreatureKind[]>([])
  const timer = useRef<number | null>(null)
  // Refs mirror the flip state so two fast taps are both honoured.
  const faceUpRef = useRef<string[]>([])
  const matchedRef = useRef<CreatureKind[]>([])

  useEffect(() => () => {
    if (timer.current) window.clearTimeout(timer.current)
  }, [])

  const done = matched.length === PAIRS

  const restart = () => {
    if (timer.current) window.clearTimeout(timer.current)
    faceUpRef.current = []
    matchedRef.current = []
    setTiles(deal())
    setFaceUp([])
    setMatched([])
  }

  const clearFaceUp = () => {
    faceUpRef.current = []
    setFaceUp([])
  }

  const flip = (tile: Tile) => {
    if (
      faceUpRef.current.length === 2 ||
      faceUpRef.current.includes(tile.key) ||
      matchedRef.current.includes(tile.kind)
    ) {
      return
    }

    faceUpRef.current = [...faceUpRef.current, tile.key]
    setFaceUp(faceUpRef.current)
    playCue('tap')

    if (faceUpRef.current.length < 2) return

    const [firstKey, secondKey] = faceUpRef.current
    const first = tiles.find((t) => t.key === firstKey)
    const second = tiles.find((t) => t.key === secondKey)

    if (first && second && first.kind === second.kind) {
      matchedRef.current = [...matchedRef.current, first.kind]
      setMatched(matchedRef.current)
      clearFaceUp()

      const done = matchedRef.current.length === PAIRS
      playCue(done ? 'finish' : 'match')
      if (done) onFinish()
      return
    }

    timer.current = window.setTimeout(clearFaceUp, 900)
  }

  return (
    <div className="g-play">
      <p className="g-hint">Tap two cards to find a pair.</p>

      <div className="g-tiles">
        {tiles.map((tile) => {
          const isMatched = matched.includes(tile.kind)
          const isUp = isMatched || faceUp.includes(tile.key)
          return (
            <button
              key={tile.key}
              type="button"
              className={`g-tile ${isUp ? 'is-up' : ''} ${isMatched ? 'is-matched' : ''}`}
              onClick={() => flip(tile)}
              aria-label={isUp ? creatureNames[tile.kind] : 'Hidden card'}
            >
              <span className="g-tile__inner">
                <span className="g-tile__back" aria-hidden="true">
                  <svg viewBox="0 0 40 40">
                    <circle cx="20" cy="20" r="9" fill="rgba(255,255,255,0.55)" />
                    <circle cx="20" cy="20" r="15" fill="none" stroke="rgba(255,255,255,0.4)" strokeWidth="2" />
                  </svg>
                </span>
                <span className="g-tile__front">
                  <CreatureIcon kind={tile.kind} size={54} />
                </span>
              </span>
            </button>
          )
        })}
      </div>

      <div className="g-status">
        <p className="g-caption">
          {done ? 'All the pairs are together!' : `Pairs found: ${matched.length} of ${PAIRS}`}
        </p>
      </div>

      {done ? <TryAgain label="New cards" onClick={restart} /> : null}
    </div>
  )
}
