import { useRef, useState } from 'react'
import { makeWords, selectedWord, spaceWords, wordSelection } from '../logic'
import { useGame } from '../useGame'
import { Icon } from '../Icons'
import { playCue } from '../sound'

export function Words() {
  const { paused, finish } = useGame(), [puzzle] = useState(() => makeWords())
  const [start, setStart] = useState<number | null>(null), [found, setFound] = useState<string[]>([])
  const [highlight, setHighlight] = useState<number[]>([]), [hint, setHint] = useState<number | null>(null)
  const [message, setMessage] = useState('Tap the first and last letter of a word.')
  const [focused, setFocused] = useState(0), buttons = useRef<(HTMLButtonElement | null)[]>([])
  const select = (index: number) => {
    if (paused) return
    if (start === null) { setStart(index); setHint(null); setMessage('Now tap the last letter.'); return }
    const word = selectedWord(puzzle, start, index)
    if (word && !found.includes(word)) {
      const next = [...found, word]; setFound(next); setHighlight(old => [...old, ...wordSelection(puzzle, start, index)])
      setMessage(`${word} found. ${next.length} of 5 words.`); playCue('match')
      if (next.length === spaceWords.length) finish('Every word found. Stellar spotting.')
    } else setMessage(word ? 'You already found that one.' : 'Try another line. Words go straight.')
    setStart(null)
  }
  return <div className="puzzle-area">
    <div className="word-list" role="group" aria-label="Words to find">{spaceWords.map(word => <span className={found.includes(word) ? 'found' : ''} key={word}>{found.includes(word) && <Icon name="check" size={16} />} {word}<span className="sr-only">{found.includes(word) ? ', found' : ', not found'}</span></span>)}</div>
    <div className="word-board" role="group" aria-label="Word search grid. Arrow keys move between letters. Enter selects an endpoint.">
      {puzzle.letters.map((letter, i) => <button key={i} ref={el => { buttons.current[i] = el }} tabIndex={focused === i ? 0 : -1}
        className={`${highlight.includes(i) ? 'found' : ''} ${i === start ? 'selected' : ''} ${i === hint ? 'hint' : ''}`}
        aria-label={`Row ${Math.floor(i / puzzle.size) + 1} column ${i % puzzle.size + 1}: ${letter}${highlight.includes(i) ? ', found word' : ''}${i === hint ? ', hint' : ''}`}
        aria-pressed={start === i} onFocus={() => setFocused(i)} onClick={() => select(i)}
        onKeyDown={event => {
          let next = i
          if (event.key === 'ArrowRight' && i % 7 < 6) next++
          else if (event.key === 'ArrowLeft' && i % 7 > 0) next--
          else if (event.key === 'ArrowUp' && i >= 7) next -= 7
          else if (event.key === 'ArrowDown' && i < 42) next += 7
          else if (event.key === 'Home') next = Math.floor(i / 7) * 7
          else if (event.key === 'End') next = Math.floor(i / 7) * 7 + 6
          if (['ArrowRight', 'ArrowLeft', 'ArrowUp', 'ArrowDown', 'Home', 'End'].includes(event.key)) { event.preventDefault(); setFocused(next); buttons.current[next]?.focus() }
        }}>{letter}</button>)}
    </div>
    <p className="control-note" role="status">{message}</p>
    <div className="word-actions"><button className="secondary-button" onClick={() => { const word = spaceWords.find(w => !found.includes(w)); if (word) { const at = puzzle.placements[word]![0]!; setHint(at); setMessage(`${word} starts at row ${Math.floor(at / 7) + 1}, column ${at % 7 + 1}.`) } }}><Icon name="sparkle" /> Hint</button>{start !== null && <button className="text-button" onClick={() => { setStart(null); setMessage('Tap the first and last letter of a word.'); buttons.current[focused]?.focus() }}>Clear selection</button>}</div>
  </div>
}
