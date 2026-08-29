import { useEffect, useRef, useState } from 'react'
import { CreatureIcon, creatureKinds, creatureNames } from '../creatures'
import { playCue } from '../sound'

const moves = ['bob', 'sway', 'hop', 'nod', 'wiggle', 'turn']

/**
 * The lowest-effort activity in the set: tap a character and it moves for a
 * moment. Motion is slow and small, and nothing flashes.
 */
export function Dance() {
  const [active, setActive] = useState<Record<string, string>>({})
  const timers = useRef<Record<string, number>>({})

  useEffect(
    () => () => {
      Object.values(timers.current).forEach((id) => window.clearTimeout(id))
    },
    [],
  )

  const start = (kind: string, index: number) => {
    if (timers.current[kind]) window.clearTimeout(timers.current[kind])
    const move = moves[index % moves.length]!
    setActive((prev) => ({ ...prev, [kind]: move }))
    playCue('tap')
    timers.current[kind] = window.setTimeout(() => {
      setActive((prev) => {
        const next = { ...prev }
        delete next[kind]
        return next
      })
    }, 2200)
  }

  const allDance = () => creatureKinds.forEach((kind, i) => start(kind, i))

  return (
    <div className="g-play">
      <p className="g-hint">Tap a friend to make them move.</p>

      <div className="g-dance">
        {creatureKinds.map((kind, i) => (
          <button
            key={kind}
            type="button"
            className={`g-dancer ${active[kind] ? `is-${active[kind]}` : ''}`}
            onClick={() => start(kind, i)}
            aria-label={`Make ${creatureNames[kind]} move`}
          >
            <CreatureIcon kind={kind} size={72} />
          </button>
        ))}
      </div>

      <div className="g-status">
        <button type="button" className="g-btn g-btn--quiet" onClick={allDance}>
          Everybody dance
        </button>
      </div>
    </div>
  )
}
