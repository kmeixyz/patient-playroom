export const ports = [1, 2, 4, 8] as const // North, east, south, west.
export const portNames = ['up', 'right', 'down', 'left'] as const
export type Pipe = { openings: number; fixed: boolean }
export type PipeBoard = (Pipe | null)[]
type PostPuzzle = { name: string; size: number; start: number; end: number; entry: number; exit: number; solved: PipeBoard; initial: PipeBoard }
export type PipeHint = { kind: 'rotate'; at: number } | { kind: 'swap'; from: number; to: number }

const rotatePorts = (mask: number) => ((mask << 1) & 15) | (mask >> 3)
export const pipeShape = (mask: number) => mask === 5 || mask === 10 ? 'straight' : 'bend'
const oppositePort = (port: number) => ((port << 2) | (port >> 2)) & 15

function neighbor(index: number, port: number, size: number): number | null {
  const row = Math.floor(index / size), column = index % size
  if (port === 1 && row > 0) return index - size
  if (port === 2 && column < size - 1) return index + 1
  if (port === 4 && row < size - 1) return index + size
  if (port === 8 && column > 0) return index - 1
  return null
}

function direction(from: number, to: number, size: number) {
  const port = ports.find(port => neighbor(from, port, size) === to)
  if (!port) throw new Error('Planet Post routes must use neighboring tiles.')
  return port
}

function makePuzzle(name: string, size: number, route: number[], entry: number, exit: number, swaps: [number, number][]): PostPuzzle {
  const solved: PipeBoard = Array(size * size).fill(null)
  route.forEach((at, index) => {
    const incoming = index === 0 ? entry : direction(at, route[index - 1]!, size)
    const outgoing = index === route.length - 1 ? exit : direction(at, route[index + 1]!, size)
    solved[at] = { openings: incoming | outgoing, fixed: index === 0 || index === route.length - 1 }
  })
  let initial = solved.map((pipe, index) => {
    if (!pipe || pipe.fixed) return pipe
    let openings = pipe.openings
    for (let turn = 0; turn < index % 3 + 1; turn++) openings = rotatePorts(openings)
    return { ...pipe, openings }
  })
  for (const [from, to] of swaps) initial = swapPipes(initial, from, to)
  return { name, size, start: route[0]!, end: route[route.length - 1]!, entry, exit, solved, initial }
}

export function rotatePipe(board: PipeBoard, at: number): PipeBoard {
  const pipe = board[at]
  if (!pipe || pipe.fixed) return board
  return board.map((piece, index) => index === at ? { ...pipe, openings: rotatePorts(pipe.openings) } : piece)
}

export function swapPipes(board: PipeBoard, from: number, to: number): PipeBoard {
  if (from === to || !board[from] || !board[to] || board[from]!.fixed || board[to]!.fixed) return board
  return board.map((pipe, index) => index === from ? board[to]! : index === to ? board[from]! : pipe)
}

/** Follow reciprocal connections; an open edge, gap, or loop cannot deliver mail. */
export function tracePost(board: PipeBoard, puzzle: Pick<PostPuzzle, 'size' | 'start' | 'end' | 'entry' | 'exit'>) {
  const path: number[] = []
  let at = puzzle.start, incoming = puzzle.entry
  while (!path.includes(at)) {
    const pipe = board[at]
    if (!pipe || !(pipe.openings & incoming)) break
    path.push(at)
    const outgoing = ports.filter(port => port !== incoming && (pipe.openings & port))
    if (outgoing.length !== 1) break
    if (at === puzzle.end) return { path, connected: outgoing[0] === puzzle.exit }
    const next = neighbor(at, outgoing[0]!, puzzle.size)
    if (next === null) break
    at = next
    incoming = oppositePort(outgoing[0]!)
  }
  return { path, connected: false }
}

/** Repair one position toward the authored solution without disturbing an earlier repair. */
export function postHint(board: PipeBoard, puzzle: PostPuzzle): PipeHint | null {
  if (tracePost(board, puzzle).connected) return null
  const at = board.findIndex((pipe, index) => pipe && !pipe.fixed && pipe.openings !== puzzle.solved[index]!.openings)
  if (at < 0) return null
  const target = puzzle.solved[at]!
  if (pipeShape(board[at]!.openings) === pipeShape(target.openings)) return { kind: 'rotate', at }
  const to = board.findIndex((pipe, index) => index > at && pipe && !pipe.fixed && pipeShape(pipe.openings) === pipeShape(target.openings) && pipeShape(pipe.openings) !== pipeShape(puzzle.solved[index]!.openings))
  return to < 0 ? null : { kind: 'swap', from: at, to }
}

export const postPuzzles: PostPuzzle[] = [
  makePuzzle('Moon mail', 4, [0, 1, 2, 6, 10, 11, 15], 8, 2, []),
  makePuzzle('Saturn shuffle', 4, [0, 4, 8, 9, 5, 1, 2, 3, 7, 11, 15, 14, 13, 12], 1, 8, [[4, 8], [2, 9]]),
  makePuzzle('Neptune detour', 5, [0, 1, 6, 5, 10, 15, 16, 11, 12, 7, 2, 3, 8, 13, 18, 17, 22, 23, 24], 8, 2, [[1, 10], [8, 16], [7, 18]]),
]
