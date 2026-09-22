import { useRef, useState } from 'react'
import { CreatureIcon, type CreatureKind } from '../creatures'
import { Icon } from '../Icons'
import { playCue } from '../sound'
import { useGame, useGameDelay } from '../useGame'

const friends: CreatureKind[] = ['bunny', 'dino', 'cat', 'owl', 'duck', 'bear', 'fish', 'star', 'bunny', 'dino', 'cat', 'duck']

/** Stationary, generous targets: no chasing, missed taps, or color-matching rules. */
export function Bubbles() {
  const { paused, finish, report } = useGame()
  const [popped, setPopped] = useState<number[]>([])
  const live = useRef(popped)
  const buttons = useRef<(HTMLButtonElement | null)[]>([])
  const complete = popped.length === friends.length
  useGameDelay(() => finish('Pop, pop, hooray! You found every friend.'), complete ? 900 : null, complete)

  const pop = (index: number) => {
    if (paused || live.current.includes(index)) return
    const next = [...live.current, index]
    live.current = next
    setPopped(next)
    report(`${next.length} happy bubbles popped`)
    playCue(next.length === friends.length ? 'finish' : 'tap')
    // Keep keyboard users moving through the board without returning to its beginning.
    const nextIndex = friends.findIndex((_, i) => i > index && !next.includes(i))
    const remaining = nextIndex < 0 ? friends.findIndex((_, i) => !next.includes(i)) : nextIndex
    if (remaining >= 0) buttons.current[remaining]?.focus({ preventScroll: true })
  }

  return <div className="bubble-game">
    <div className="bubble-game-heading"><div><span className="eyebrow">A little pop of happy</span><h2>Who’s in the bubbles?</h2><p>Tap each bubble to find a friend.</p></div><span className="bubble-count"><Icon name="sparkle"/>{popped.length} / {friends.length}</span></div>
    <div className="bubble-board" role="group" aria-label="Bubbles to pop">
      {friends.map((friend, index) => {
        const found = popped.includes(index)
        return <button key={index} ref={el => { buttons.current[index] = el }} className={`pop-bubble bubble-color-${index % 4} ${found ? 'is-popped' : ''}`} aria-label={found ? `Bubble ${index + 1}: ${friend} found` : `Pop bubble ${index + 1}`} aria-disabled={found} tabIndex={found ? -1 : 0} onClick={() => pop(index)}>
          <span className="bubble-friend" aria-hidden="true"><CreatureIcon kind={friend} size={76}/></span>
          <span className="bubble-shell" aria-hidden="true"><span className="bubble-face"/></span>
          {found && <span className="bubble-found" aria-hidden="true"><Icon name="check" size={16}/></span>}
        </button>
      })}
    </div>
    <p className="bubble-feedback" role="status">{complete ? 'You found everyone! Hello, friends.' : popped.length ? `${popped.length} ${popped.length === 1 ? 'friend found' : 'friends found'}. Every bubble has a surprise!` : 'Big bubbles. Little friends. Pop any one!'}</p>
  </div>
}
