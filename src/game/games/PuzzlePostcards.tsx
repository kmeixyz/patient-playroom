import { useEffect, useRef, useState, type CSSProperties } from 'react'
import { Icon } from '../Icons'
import { shuffle } from '../logic'
import { playCue } from '../sound'
import { useGame } from '../useGame'
import { piecePosition, PostcardArt, type PieceCount, type PostcardScene } from './postcardArt'

export function PuzzlePostcards({ scene, count }: { scene: PostcardScene; count: PieceCount }) {
  const { paused, finish, report } = useGame()
  const [order] = useState(() => shuffle(Array.from({ length: count }, (_, i) => i)))
  const [placed, setPlaced] = useState<number[]>([])
  const livePlaced = useRef(placed)
  const [selected, setSelected] = useState<number | null>(null)
  const [hint, setHint] = useState(false)
  const [feedback, setFeedback] = useState('Pick a piece below. Then tap a space in your postcard.')
  const pieceRefs = useRef<(HTMLButtonElement | null)[]>([])
  const spaceRefs = useRef<(HTMLButtonElement | null)[]>([])
  const doneRef = useRef<HTMLButtonElement>(null)
  const focusAfterPlace = useRef(false)
  const complete = placed.length === count

  useEffect(() => {
    if (!focusAfterPlace.current) return
    focusAfterPlace.current = false
    if (complete) doneRef.current?.focus({ preventScroll: true })
    else pieceRefs.current[order.find(i => !placed.includes(i))!]?.focus({ preventScroll: true })
  }, [placed, complete, order])

  function select(piece: number, keyboard: boolean) {
    if (paused || livePlaced.current.includes(piece)) return
    setSelected(piece); setHint(false)
    setFeedback(`Piece ${order.indexOf(piece) + 1} selected. Tap a space, or choose Show me where.`)
    if (keyboard) spaceRefs.current[Array.from({ length: count }, (_, i) => i).find(i => !livePlaced.current.includes(i))!]?.focus({ preventScroll: true })
  }
  function place(space: number, keyboard: boolean) {
    if (paused || livePlaced.current.includes(space)) return
    if (selected === null) { setFeedback('First, pick a piece from the tray below.'); return }
    if (selected !== space) { setHint(true); setFeedback(`Try the ${piecePosition(selected, count)} space. Your piece is still ready.`); return }
    const next = [...livePlaced.current, space]
    livePlaced.current = next; focusAfterPlace.current = keyboard
    setPlaced(next); setSelected(null); setHint(false)
    report(`${next.length} of ${count} pieces placed`)
    setFeedback(next.length === count ? 'Your postcard is ready! Take a look at what you made.' : 'That fits! Pick another piece.')
    playCue(next.length === count ? 'finish' : 'match')
  }
  function help() {
    if (paused || selected === null) return
    setHint(true); setFeedback(`Piece ${order.indexOf(selected) + 1} fits in the ${piecePosition(selected, count)} space. Look for “Here”.`)
    spaceRefs.current[selected]?.focus({ preventScroll: true })
  }

  return <div className="postcard-game" style={{ '--piece-columns': count / 2, '--piece-count': count } as CSSProperties}>
    <div className="mini-game-heading"><div><span className="eyebrow">Puzzle Postcards · {scene}</span><h2>{complete ? 'Made by you.' : selected === null ? 'Pick a little piece' : 'Where does it go?'}</h2></div><span className="mini-game-count"><Icon name="puzzle"/>{placed.length} / {count}</span></div>
    <div className="postcard-workspace">
      <figure className="postcard-reference"><PostcardArt scene={scene}/><figcaption>Your picture to follow</figcaption></figure>
      <div className={`postcard-board ${complete ? 'is-complete' : ''}`} role="group" aria-label="Your postcard">{Array.from({ length: count }, (_, i) => <button key={i} ref={el => { spaceRefs.current[i] = el }} onClick={event => place(i, event.detail === 0)} aria-label={`${piecePosition(i, count)} space${placed.includes(i) ? ', filled' : ''}${hint && selected === i ? ', place selected piece here' : ''}`} aria-disabled={placed.includes(i)} tabIndex={placed.includes(i) ? -1 : 0} className={hint && selected === i ? 'postcard-hint' : ''}>
        {placed.includes(i) ? <PostcardArt scene={scene} count={count} piece={i} decorative/> : <><span className="postcard-ghost" aria-hidden="true"><PostcardArt scene={scene} count={count} piece={i} decorative/></span><span className="space-label">{hint && selected === i ? 'Here' : i + 1}</span></>}
      </button>)}</div>
    </div>
    <p className="mini-game-feedback" role="status">{feedback}</p>
    {!complete && <>
      <div className="postcard-tray" role="group" aria-label="Pick a puzzle piece">{order.map((piece, index) => <button key={piece} ref={el => { pieceRefs.current[piece] = el }} onClick={event => select(piece, event.detail === 0)} aria-label={`Piece ${index + 1}, ${piecePosition(piece, count)}${placed.includes(piece) ? ', placed' : ''}`} aria-pressed={selected === piece} aria-disabled={placed.includes(piece)} tabIndex={placed.includes(piece) ? -1 : 0}>
        {placed.includes(piece) ? <span className="piece-placed"><Icon name="check"/><span>Placed</span></span> : <><PostcardArt scene={scene} count={count} piece={piece} decorative/><span className="piece-number">{index + 1}{selected === piece && <Icon name="check" size={15}/>}</span></>}
      </button>)}</div>
      <div className="postcard-actions"><button className="secondary-button" disabled={selected === null} onClick={help}><Icon name="eye"/> Show me where</button><span>Pick a piece → tap a space</span></div>
    </>}
    {complete && <div className="garden-actions"><button ref={doneRef} className="primary-button" onClick={() => { if (!paused) finish('A little puzzle. A lovely postcard.', <PostcardArt scene={scene}/>) }}>All done <Icon name="check"/></button></div>}
  </div>
}
