import { useEffect, useRef, useState } from 'react'
import { CreatureIcon, creatureNames, type CreatureKind } from '../creatures'
import { Icon } from '../Icons'
import { shuffle } from '../logic'
import { playCue } from '../sound'
import { useGame } from '../useGame'

const patterns = [[0, 1, 0, 1, 0], [0, 0, 1, 0, 0, 1], [0, 1, 2, 0, 1, 2], [0, 1, 1, 0, 1, 1]]
const cast: CreatureKind[] = ['bunny', 'bear', 'duck', 'cat', 'owl', 'dino']

export function ParadeArt() {
  return <div className="parade-art" aria-hidden="true">{(['bunny', 'bear', 'bunny'] as const).map((friend, i) => <span key={i}><CreatureIcon kind={friend}/></span>)}<span className="parade-question">?</span></div>
}

export function PatternParade() {
  const { paused, finish, report } = useGame()
  const [rounds] = useState(() => patterns.map(pattern => {
    const friends = shuffle(cast).slice(0, 3)
    return { sequence: pattern.map(i => friends[i]!), choices: shuffle(friends) }
  }))
  const [round, setRound] = useState(0)
  const [solved, setSolved] = useState(false)
  const [hint, setHint] = useState(false)
  const [feedback, setFeedback] = useState('Look along the line. Who comes next?')
  const choicesRef = useRef<(HTMLButtonElement | null)[]>([])
  const nextRef = useRef<HTMLButtonElement>(null)
  const keyboardAction = useRef(false)
  const locked = useRef(false)
  const puzzle = rounds[round]!
  const answer = puzzle.sequence[puzzle.sequence.length - 1]!

  useEffect(() => {
    if (!keyboardAction.current) return
    keyboardAction.current = false
    ;(solved ? nextRef.current : choicesRef.current[0])?.focus({ preventScroll: true })
  }, [round, solved])

  const choose = (friend: CreatureKind, keyboard: boolean) => {
    if (paused || locked.current) return
    if (friend !== answer) { setHint(true); setFeedback(`Let’s look together. ${creatureNames[answer]} comes next. Try that friend!`); return }
    locked.current = true; keyboardAction.current = keyboard; setSolved(true)
    setFeedback(`${creatureNames[answer]} fits! Your parade is complete.`)
    report(`${round + 1} of 4 parades completed`); playCue('match')
  }
  const next = (keyboard: boolean) => {
    if (paused || !locked.current || !solved) return
    if (round === rounds.length - 1) { finish('Four happy parades. You found the patterns!', <ParadeArt/>); return }
    keyboardAction.current = keyboard; locked.current = false
    setRound(round + 1); setSolved(false); setHint(false); setFeedback('A new line of friends. Who comes next?')
  }

  return <div className="pattern-game">
    <div className="mini-game-heading"><div><span className="eyebrow">Pattern Parade · {round + 1} of 4</span><h2>Who comes next?</h2></div><span className="mini-game-count"><Icon name="flag"/>{round + Number(solved)} / 4</span></div>
    <div className="parade-scene">
      <p className="parade-direction"><Icon name="right" size={18}/> Follow the friends from left to right</p>
      <ol className="pattern-sequence" aria-label="Picture pattern">{puzzle.sequence.map((friend, i) => <li key={`${round}-${i}`} className={i === puzzle.sequence.length - 1 ? 'pattern-slot' : ''} aria-label={`${i + 1}: ${i === puzzle.sequence.length - 1 && !solved ? 'Who comes next?' : creatureNames[friend]}`}><span aria-hidden="true">{i === puzzle.sequence.length - 1 && !solved ? '?' : <CreatureIcon kind={friend}/>}</span></li>)}</ol>
    </div>
    <p className="mini-game-feedback" role="status">{feedback}</p>
    <div className="picture-choices" role="group" aria-label="Choose the next friend">{puzzle.choices.map((friend, i) => <button key={friend} ref={el => { choicesRef.current[i] = el }} onClick={event => choose(friend, event.detail === 0)} aria-label={`Choose ${creatureNames[friend]}`} aria-disabled={solved} className={hint && friend === answer && !solved ? 'choice-hint' : ''}><span aria-hidden="true"><CreatureIcon kind={friend}/></span><span>{creatureNames[friend]}</span>{hint && friend === answer && !solved && <small><Icon name="eye" size={16}/> Try this</small>}</button>)}</div>
    <div className="garden-actions"><button ref={nextRef} className="primary-button" disabled={!solved} onClick={event => next(event.detail === 0)}>{round === rounds.length - 1 ? 'All done' : 'Next parade'}<Icon name={round === rounds.length - 1 ? 'check' : 'right'}/></button></div>
  </div>
}
