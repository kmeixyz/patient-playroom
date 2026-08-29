import { useCallback, useMemo, useRef, useState } from 'react'
import type { KeyboardEvent, PointerEvent } from 'react'
import { CreatureIcon, creatureKinds, type CreatureKind } from '../creatures'
import { playCue } from '../sound'
import { TryAgain } from '../ui'

const CELLS = 4
const SIZE = CELLS * 2 + 1

type Point = { x: number; y: number }

/**
 * Randomised depth-first maze on a small 4x4 cell grid: always solvable, always
 * a little different, and short enough that no child gets stuck in it.
 */
function carve(): boolean[][] {
  const walls = Array.from({ length: SIZE }, () => Array<boolean>(SIZE).fill(true))
  const seen = Array.from({ length: CELLS }, () => Array<boolean>(CELLS).fill(false))
  const stack: Point[] = [{ x: 0, y: 0 }]
  seen[0]![0] = true
  walls[1]![1] = false

  while (stack.length) {
    const cell = stack[stack.length - 1]!
    const neighbours = (
      [
        { x: cell.x + 1, y: cell.y },
        { x: cell.x - 1, y: cell.y },
        { x: cell.x, y: cell.y + 1 },
        { x: cell.x, y: cell.y - 1 },
      ] as Point[]
    ).filter(
      (n) =>
        n.x >= 0 && n.y >= 0 && n.x < CELLS && n.y < CELLS && !seen[n.y]![n.x],
    )

    if (!neighbours.length) {
      stack.pop()
      continue
    }

    const next = neighbours[Math.floor(Math.random() * neighbours.length)]!
    seen[next.y]![next.x] = true
    walls[next.y * 2 + 1]![next.x * 2 + 1] = false
    walls[cell.y + next.y + 1]![cell.x + next.x + 1] = false
    stack.push(next)
  }

  return walls
}

const start: Point = { x: 1, y: 1 }
const goal: Point = { x: SIZE - 2, y: SIZE - 2 }

export function Maze({ onFinish }: { onFinish: () => void }) {
  const [walls, setWalls] = useState(carve)
  const [at, setAt] = useState<Point>(start)
  const [friend, setFriend] = useState<CreatureKind>('dino')
  // A ref, not state: the first pointermove often arrives in the same tick as
  // pointerdown, before a state update would have been applied.
  const dragging = useRef(false)
  const gridRef = useRef<HTMLDivElement>(null)

  const done = at.x === goal.x && at.y === goal.y

  const restart = useCallback(() => {
    setWalls(carve())
    setAt(start)
    setFriend(creatureKinds[Math.floor(Math.random() * creatureKinds.length)]!)
  }, [])

  const stepTo = useCallback(
    (target: Point) => {
      setAt((current) => {
        if (current.x === goal.x && current.y === goal.y) return current

        let cursor = current
        // Walk one tile at a time toward the finger; stop at the first wall.
        for (let i = 0; i < 24; i++) {
          const dx = target.x - cursor.x
          const dy = target.y - cursor.y
          if (!dx && !dy) break

          const tries: Point[] =
            Math.abs(dx) >= Math.abs(dy)
              ? [
                  { x: cursor.x + Math.sign(dx), y: cursor.y },
                  { x: cursor.x, y: cursor.y + Math.sign(dy) },
                ]
              : [
                  { x: cursor.x, y: cursor.y + Math.sign(dy) },
                  { x: cursor.x + Math.sign(dx), y: cursor.y },
                ]

          const move = tries.find(
            (t) =>
              t.x >= 0 &&
              t.y >= 0 &&
              t.x < SIZE &&
              t.y < SIZE &&
              (t.x !== cursor.x || t.y !== cursor.y) &&
              !walls[t.y]![t.x],
          )
          if (!move) break
          cursor = move

          if (cursor.x === goal.x && cursor.y === goal.y) {
            playCue('finish')
            onFinish()
            break
          }
        }
        return cursor
      })
    },
    [walls, onFinish],
  )

  const tileFromPointer = (clientX: number, clientY: number): Point | null => {
    const box = gridRef.current?.getBoundingClientRect()
    if (!box) return null
    const tile = box.width / SIZE
    return {
      x: Math.max(0, Math.min(SIZE - 1, Math.floor((clientX - box.left) / tile))),
      y: Math.max(0, Math.min(SIZE - 1, Math.floor((clientY - box.top) / tile))),
    }
  }

  const onPointerDown = (e: PointerEvent) => {
    dragging.current = true
    try {
      gridRef.current?.setPointerCapture(e.pointerId)
    } catch {
      // Synthetic or already-released pointers: dragging still works.
    }
    const tile = tileFromPointer(e.clientX, e.clientY)
    if (tile) stepTo(tile)
  }

  const onPointerMove = (e: PointerEvent) => {
    if (!dragging.current) return
    const tile = tileFromPointer(e.clientX, e.clientY)
    if (tile) stepTo(tile)
  }

  const onKeyDown = (e: KeyboardEvent) => {
    const deltas: Record<string, Point> = {
      ArrowUp: { x: 0, y: -1 },
      ArrowDown: { x: 0, y: 1 },
      ArrowLeft: { x: -1, y: 0 },
      ArrowRight: { x: 1, y: 0 },
    }
    const delta = deltas[e.key]
    if (!delta) return
    e.preventDefault()
    // Resolved against the live position so held or fast key presses all count.
    setAt((current) => {
      const target = { x: current.x + delta.x, y: current.y + delta.y }
      if (
        target.x < 0 ||
        target.y < 0 ||
        target.x >= SIZE ||
        target.y >= SIZE ||
        walls[target.y]![target.x]
      ) {
        return current
      }
      if (target.x === goal.x && target.y === goal.y) {
        playCue('finish')
        onFinish()
      }
      return target
    })
  }

  const tiles = useMemo(
    () => walls.flatMap((row, y) => row.map((isWall, x) => ({ x, y, isWall }))),
    [walls],
  )

  return (
    <div className="g-play">
      <p className="g-hint">Slide your finger to bring your friend to the flag.</p>

      <div
        ref={gridRef}
        className="g-maze"
        style={{ gridTemplateColumns: `repeat(${SIZE}, 1fr)` }}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={() => {
          dragging.current = false
        }}
        onPointerCancel={() => {
          dragging.current = false
        }}
        onKeyDown={onKeyDown}
        tabIndex={0}
        role="group"
        aria-label="Maze. Use arrow keys or slide your finger to move."
      >
        {tiles.map((tile) => (
          <span
            key={`${tile.x}-${tile.y}`}
            className={`g-maze__tile ${tile.isWall ? 'is-wall' : ''}`}
          />
        ))}

        <span
          className="g-maze__goal"
          aria-hidden="true"
          style={{ gridColumn: goal.x + 1, gridRow: goal.y + 1 }}
        >
          <svg viewBox="0 0 24 24">
            <path d="M7 3v18" stroke="#7d8f99" strokeWidth="2.5" strokeLinecap="round" />
            <path d="M8 4h11l-3 4 3 4H8Z" fill="#ef8b7a" />
          </svg>
        </span>

        <span
          className="g-maze__hero"
          style={{ gridColumn: at.x + 1, gridRow: at.y + 1 }}
        >
          <CreatureIcon kind={friend} size={34} />
        </span>
      </div>

      <div className="g-status">
        <p className="g-caption">
          {done ? 'You made it to the flag!' : 'No rush — there is no timer.'}
        </p>
      </div>

      {done ? <TryAgain label="New maze" onClick={restart} /> : null}
    </div>
  )
}
