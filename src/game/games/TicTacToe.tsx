import { useEffect, useRef, useState } from 'react'
import { playCue } from '../sound'

type Mark = 'star' | 'heart' | null
type Mode = 'app' | 'together'

const LINES = [
  [0, 1, 2],
  [3, 4, 5],
  [6, 7, 8],
  [0, 3, 6],
  [1, 4, 7],
  [2, 5, 8],
  [0, 4, 8],
  [2, 4, 6],
]

function winningLine(board: Mark[]): number[] | null {
  for (const line of LINES) {
    const [a, b, c] = line as [number, number, number]
    if (board[a] && board[a] === board[b] && board[a] === board[c]) return line
  }
  return null
}

function openCells(board: Mark[]) {
  return board.reduce<number[]>((acc, cell, i) => (cell ? acc : [...acc, i]), [])
}

function findLine(board: Mark[], mark: Mark): number | null {
  for (const line of LINES) {
    const cells = line.map((i) => board[i])
    const owned = cells.filter((c) => c === mark).length
    const emptyIndex = line.find((i) => !board[i])
    if (owned === 2 && emptyIndex !== undefined) return emptyIndex
  }
  return null
}

/**
 * The app plays a deliberately imperfect, varied game: it takes a win or a block
 * only some of the time, so a child can win often and the board feels different
 * between rounds. Outcomes are phrased warmly and never as a loss.
 */
function appMove(board: Mark[]): number {
  const open = openCells(board)
  const pick = (i: number | null) => (i !== null && open.includes(i) ? i : null)

  const roll = Math.random()
  const win = roll < 0.55 ? pick(findLine(board, 'heart')) : null
  const block = !win && roll < 0.75 ? pick(findLine(board, 'star')) : null
  const center = !win && !block && roll < 0.45 ? pick(4) : null

  return win ?? block ?? center ?? open[Math.floor(Math.random() * open.length)]!
}

const emptyBoard: Mark[] = Array(9).fill(null)

export function TicTacToe({ onFinish }: { onFinish: () => void }) {
  const [mode, setMode] = useState<Mode>('app')
  const [board, setBoard] = useState<Mark[]>(emptyBoard)
  const [turn, setTurn] = useState<Mark>('star')
  const [thinking, setThinking] = useState(false)
  const timer = useRef<number | null>(null)

  useEffect(() => () => {
    if (timer.current) window.clearTimeout(timer.current)
  }, [])

  const line = winningLine(board)
  const full = openCells(board).length === 0
  const over = Boolean(line) || full

  const reset = (nextMode: Mode = mode) => {
    if (timer.current) window.clearTimeout(timer.current)
    setMode(nextMode)
    setBoard(emptyBoard)
    setTurn('star')
    setThinking(false)
  }

  const place = (index: number) => {
    if (board[index] || over || thinking) return

    const next = [...board]
    next[index] = turn
    setBoard(next)
    playCue('tap')

    const nextLine = winningLine(next)
    if (nextLine) {
      playCue('finish')
      onFinish()
      return
    }
    if (openCells(next).length === 0) {
      onFinish()
      return
    }

    if (mode === 'together') {
      setTurn(turn === 'star' ? 'heart' : 'star')
      return
    }

    setThinking(true)
    timer.current = window.setTimeout(() => {
      const after = [...next]
      after[appMove(after)] = 'heart'
      setBoard(after)
      setThinking(false)
      if (winningLine(after) || openCells(after).length === 0) {
        playCue('finish')
        onFinish()
      }
    }, 650)
  }

  const message = () => {
    if (line) {
      const winner = board[line[0]!]
      if (mode === 'together') {
        return winner === 'star' ? 'Stars got three in a row!' : 'Hearts got three in a row!'
      }
      return winner === 'star' ? 'You got three in a row!' : 'I got three that time. Play again?'
    }
    if (full) return 'The board is full. Want another round?'
    if (thinking) return 'My turn…'
    if (mode === 'together') return turn === 'star' ? 'Stars go next.' : 'Hearts go next.'
    return 'Your turn — tap a square.'
  }

  return (
    <div className="g-play">
      <div className="g-rooms" role="group" aria-label="Who is playing">
        <button
          type="button"
          className={`g-room ${mode === 'app' ? 'is-current' : ''}`}
          aria-pressed={mode === 'app'}
          onClick={() => reset('app')}
        >
          Play with me
        </button>
        <button
          type="button"
          className={`g-room ${mode === 'together' ? 'is-current' : ''}`}
          aria-pressed={mode === 'together'}
          onClick={() => reset('together')}
        >
          Two players
        </button>
      </div>

      <div className="g-ttt" role="group" aria-label="Tic tac toe board">
        {board.map((mark, i) => (
          <button
            key={i}
            type="button"
            className={`g-cell ${line?.includes(i) ? 'is-win' : ''}`}
            onClick={() => place(i)}
            disabled={Boolean(mark) || over || thinking}
            aria-label={
              mark === 'star'
                ? 'Star'
                : mark === 'heart'
                  ? 'Heart'
                  : `Empty square ${i + 1}`
            }
          >
            {mark === 'star' ? (
              <svg viewBox="0 0 100 100" aria-hidden="true" className="g-mark g-mark--star">
                <path d="M50 12 62 40l30 3-22 20 6 29-26-15-26 15 6-29L8 43l30-3Z" />
              </svg>
            ) : mark === 'heart' ? (
              <svg viewBox="0 0 100 100" aria-hidden="true" className="g-mark g-mark--heart">
                <path d="M50 84S14 62 14 38a20 20 0 0 1 36-11 20 20 0 0 1 36 11c0 24-36 46-36 46Z" />
              </svg>
            ) : null}
          </button>
        ))}
      </div>

      <div className="g-status">
        <p className="g-caption">{message()}</p>
        <button type="button" className="g-btn g-btn--quiet" onClick={() => reset()}>
          New game
        </button>
      </div>
    </div>
  )
}
