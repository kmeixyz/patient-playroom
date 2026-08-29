import type { GameId } from './analytics'
import type { CreatureKind } from './creatures'

export type GameEntry = {
  id: GameId
  /** Short, first-grade-readable label. */
  name: string
  /** One-line hint for caregivers; the child does not need to read it. */
  hint: string
  face: CreatureKind
  accent: 'blue' | 'coral' | 'teal' | 'violet' | 'amber' | 'pink'
}

export const gameList: GameEntry[] = [
  {
    id: 'explore',
    name: 'Look around',
    hint: 'Tap things in the room to find hidden friends',
    face: 'owl',
    accent: 'blue',
  },
  {
    id: 'ispy',
    name: 'I spy',
    hint: 'Find five friends hiding in the room',
    face: 'duck',
    accent: 'teal',
  },
  {
    id: 'matching',
    name: 'Find pairs',
    hint: 'Turn over cards and match the pairs',
    face: 'bunny',
    accent: 'pink',
  },
  {
    id: 'tictactoe',
    name: 'Three in a row',
    hint: 'Play with the app or with a grown-up',
    face: 'star',
    accent: 'amber',
  },
  {
    id: 'maze',
    name: 'Maze',
    hint: 'Slide a friend through to the flag',
    face: 'dino',
    accent: 'violet',
  },
  {
    id: 'dance',
    name: 'Silly dance',
    hint: 'Tap a friend to make them move',
    face: 'cat',
    accent: 'coral',
  },
]
