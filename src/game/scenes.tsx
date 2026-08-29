import type { ReactNode } from 'react'
import type { CreatureKind } from './creatures'

/**
 * Illustrated stand-ins for the 3rd floor waiting room and a generic clinic
 * room. Everything is drawn in a 400x260 viewBox, so hotspot coordinates below
 * line up with the artwork at any screen size. No photographs, logos, or brand
 * assets are used — those need approval before they can appear.
 */

export type SceneId = 'waiting' | 'clinic'

export type Hotspot = {
  id: string
  /** Spoken by screen readers and shown as a caption after a tap. */
  label: string
  /** Touch target center and radius, in viewBox units. */
  x: number
  y: number
  r: number
  /** Who is hiding there, and where they pop up. */
  friend: CreatureKind
  popX: number
  popY: number
}

export type Scene = {
  id: SceneId
  name: string
  art: ReactNode
  hotspots: Hotspot[]
  /** Candidate hiding places for the I Spy round. */
  spyPositions: { x: number; y: number }[]
}

const Sky = ({ x, y, w, h }: { x: number; y: number; w: number; h: number }) => (
  <g>
    <rect x={x} y={y} width={w} height={h} rx="6" fill="#cdeafc" />
    <circle cx={x + w * 0.75} cy={y + h * 0.28} r="9" fill="#ffe9a8" />
    <ellipse cx={x + w * 0.35} cy={y + h * 0.55} rx="16" ry="8" fill="#ffffff" />
    <ellipse cx={x + w * 0.52} cy={y + h * 0.62} rx="11" ry="6" fill="#ffffff" />
    <rect
      x={x}
      y={y}
      width={w}
      height={h}
      rx="6"
      fill="none"
      stroke="#e6d7c3"
      strokeWidth="5"
    />
    <path
      d={`M${x + w / 2} ${y}v${h}M${x} ${y + h / 2}h${w}`}
      stroke="#e6d7c3"
      strokeWidth="4"
    />
  </g>
)

const waitingArt = (
  <g>
    <rect x="0" y="0" width="400" height="176" fill="#f4ece1" />
    <rect x="0" y="176" width="400" height="84" fill="#e7d9c6" />
    <rect x="0" y="172" width="400" height="8" fill="#d9c7ae" />

    {/* wainscot stripe */}
    <rect x="0" y="140" width="400" height="6" fill="#e9dcc9" />

    <Sky x={26} y={30} w={86} h={66} />

    {/* wall clock */}
    <circle cx="200" cy="46" r="19" fill="#ffffff" stroke="#c9b79c" strokeWidth="4" />
    <path
      d="M200 46V34M200 46l9 6"
      stroke="#5c6b7a"
      strokeWidth="3"
      strokeLinecap="round"
    />

    {/* cheerful poster */}
    <rect x="140" y="86" width="52" height="40" rx="4" fill="#fdf6ea" stroke="#e3d3ba" strokeWidth="3" />
    <path d="M148 118l10-14 8 10 7-8 11 12Z" fill="#9fd8b4" />
    <circle cx="176" cy="96" r="5" fill="#ffd166" />

    {/* fish tank */}
    <rect x="286" y="58" width="72" height="46" rx="6" fill="#cdeef2" stroke="#9fd0d8" strokeWidth="3" />
    <rect x="286" y="96" width="72" height="8" fill="#e4d3b0" />
    <rect x="298" y="104" width="48" height="10" rx="3" fill="#b9a184" />
    <path d="M300 78q8-6 16 0-8 6-16 0Z" fill="#f2994a" />
    <path d="M330 68q8-6 16 0-8 6-16 0Z" fill="#5ab6c9" />

    {/* door */}
    <rect x="292" y="118" width="62" height="58" rx="4" fill="#d8bf9e" stroke="#bfa27d" strokeWidth="3" />
    <circle cx="302" cy="150" r="3.5" fill="#8d7350" />

    {/* bookshelf */}
    <rect x="222" y="126" width="56" height="50" rx="4" fill="#c9a97f" />
    <rect x="226" y="132" width="48" height="6" fill="#a98a63" />
    <rect x="226" y="152" width="48" height="6" fill="#a98a63" />
    <g>
      <rect x="230" y="138" width="7" height="14" fill="#ef8b7a" />
      <rect x="239" y="140" width="7" height="12" fill="#7fb8e8" />
      <rect x="248" y="137" width="7" height="15" fill="#9fd8b4" />
      <rect x="232" y="158" width="7" height="14" fill="#f5c86b" />
      <rect x="241" y="160" width="7" height="12" fill="#b3a4e0" />
    </g>

    {/* chair row */}
    <g>
      {[30, 96, 162].map((x) => (
        <g key={x}>
          <rect x={x} y={124} width={54} height={30} rx="8" fill="#7fa8d4" />
          <rect x={x + 4} y={150} width={46} height={16} rx="6" fill="#6b93bd" />
          <rect x={x + 6} y={164} width="7" height="16" rx="3" fill="#5c6b7a" />
          <rect x={x + 41} y={164} width="7" height="16" rx="3" fill="#5c6b7a" />
        </g>
      ))}
    </g>

    {/* rug */}
    <ellipse cx="230" cy="222" rx="86" ry="26" fill="#f0d6cd" />
    <ellipse cx="230" cy="222" rx="60" ry="17" fill="#e8c3b7" />

    {/* toy chest */}
    <rect x="58" y="196" width="66" height="38" rx="6" fill="#e9a06c" />
    <rect x="58" y="196" width="66" height="12" rx="6" fill="#d98b56" />
    <rect x="86" y="204" width="10" height="8" rx="2" fill="#8d5a31" />

    {/* potted plant */}
    <path d="M362 190q-14-24 2-42 16 18 2 42Z" fill="#7fc79b" />
    <path d="M372 190q10-18 24-22-6 16-18 22Z" fill="#69b587" />
    <path d="M352 190h34l-5 26h-24Z" fill="#c98f6a" />
  </g>
)

const clinicArt = (
  <g>
    <rect x="0" y="0" width="400" height="176" fill="#eef2f4" />
    <rect x="0" y="176" width="400" height="84" fill="#dfe6ea" />
    <rect x="0" y="172" width="400" height="8" fill="#cdd8de" />
    <rect x="0" y="140" width="400" height="6" fill="#e4ebee" />

    <Sky x={24} y={26} w={80} h={60} />

    {/* growth chart */}
    <rect x="196" y="26" width="34" height="106" rx="4" fill="#fdfaf3" stroke="#d7e0e5" strokeWidth="3" />
    <g stroke="#9fb4c0" strokeWidth="2">
      <path d="M200 44h14M200 60h20M200 76h14M200 92h20M200 108h14" />
    </g>
    <circle cx="213" cy="34" r="4" fill="#ef8b7a" />

    {/* blood pressure cuff */}
    <rect x="250" y="42" width="30" height="22" rx="5" fill="#8fb9e0" />
    <path d="M265 64q-4 14 8 18" fill="none" stroke="#a9c6dc" strokeWidth="4" />

    {/* cabinet */}
    <rect x="244" y="118" width="84" height="60" rx="5" fill="#cfd9de" stroke="#b6c4cb" strokeWidth="3" />
    <path d="M244 148h84" stroke="#b6c4cb" strokeWidth="3" />
    <rect x="262" y="128" width="20" height="6" rx="3" fill="#93a5ae" />
    <rect x="262" y="158" width="20" height="6" rx="3" fill="#93a5ae" />

    {/* sink */}
    <rect x="340" y="126" width="48" height="16" rx="5" fill="#e7edf0" stroke="#c3cfd6" strokeWidth="3" />
    <path d="M364 126v-14h12" fill="none" stroke="#a9bac3" strokeWidth="4" />
    <rect x="346" y="142" width="36" height="34" fill="#d3dde2" />

    {/* exam table */}
    <rect x="34" y="126" width="132" height="26" rx="8" fill="#9ec8dc" />
    <rect x="34" y="120" width="132" height="10" rx="5" fill="#fdfaf3" />
    <rect x="140" y="106" width="26" height="20" rx="6" fill="#8fb9d4" />
    <rect x="44" y="152" width="10" height="26" rx="4" fill="#7d8f99" />
    <rect x="146" y="152" width="10" height="26" rx="4" fill="#7d8f99" />

    {/* rolling stool */}
    <circle cx="196" cy="158" r="15" fill="#8f86d8" />
    <rect x="192" y="170" width="8" height="14" fill="#7d8f99" />
    <path d="M182 190h28" stroke="#7d8f99" strokeWidth="5" strokeLinecap="round" />

    {/* bandage box */}
    <rect x="292" y="96" width="34" height="20" rx="4" fill="#f7d9c4" stroke="#e0bda4" strokeWidth="2" />
    <path d="M305 100v12M299 106h12" stroke="#ef8b7a" strokeWidth="3" strokeLinecap="round" />

    {/* floor mat */}
    <ellipse cx="120" cy="220" rx="82" ry="24" fill="#e5edf1" />

    {/* toy bin */}
    <rect x="252" y="196" width="62" height="36" rx="6" fill="#9fd8b4" />
    <rect x="252" y="196" width="62" height="11" rx="6" fill="#84c69d" />

    {/* plant */}
    <path d="M356 194q-12-22 2-38 14 16 2 38Z" fill="#7fc79b" />
    <path d="M346 194h30l-4 24h-22Z" fill="#a9bac3" />
  </g>
)

export const scenes: Record<SceneId, Scene> = {
  waiting: {
    id: 'waiting',
    name: 'Waiting room',
    art: waitingArt,
    hotspots: [
      { id: 'window', label: 'The window', x: 69, y: 63, r: 34, friend: 'duck', popX: 69, popY: 20 },
      { id: 'clock', label: 'The clock', x: 200, y: 46, r: 26, friend: 'star', popX: 172, popY: 20 },
      { id: 'tank', label: 'The fish tank', x: 322, y: 80, r: 34, friend: 'fish', popX: 322, popY: 30 },
      { id: 'shelf', label: 'The bookshelf', x: 250, y: 150, r: 30, friend: 'owl', popX: 250, popY: 108 },
      { id: 'chair', label: 'The blue chairs', x: 123, y: 140, r: 30, friend: 'cat', popX: 123, popY: 100 },
      { id: 'chest', label: 'The toy chest', x: 91, y: 214, r: 32, friend: 'dino', popX: 91, popY: 172 },
      { id: 'plant', label: 'The plant', x: 369, y: 190, r: 28, friend: 'bunny', popX: 369, popY: 146 },
      { id: 'door', label: 'The door', x: 323, y: 147, r: 28, friend: 'bear', popX: 323, popY: 110 },
    ],
    spyPositions: [
      { x: 44, y: 116 },
      { x: 178, y: 190 },
      { x: 238, y: 200 },
      { x: 292, y: 190 },
      { x: 140, y: 60 },
      { x: 352, y: 122 },
      { x: 210, y: 118 },
      { x: 118, y: 186 },
    ],
  },
  clinic: {
    id: 'clinic',
    name: 'Clinic room',
    art: clinicArt,
    hotspots: [
      { id: 'window', label: 'The window', x: 64, y: 56, r: 32, friend: 'duck', popX: 64, popY: 16 },
      { id: 'chart', label: 'The growth chart', x: 213, y: 80, r: 26, friend: 'star', popX: 213, popY: 16 },
      { id: 'cuff', label: 'The arm cuff', x: 265, y: 54, r: 24, friend: 'bunny', popX: 265, popY: 18 },
      { id: 'table', label: 'The exam table', x: 100, y: 138, r: 34, friend: 'bear', popX: 100, popY: 92 },
      { id: 'cabinet', label: 'The cabinet drawer', x: 286, y: 148, r: 32, friend: 'owl', popX: 286, popY: 104 },
      { id: 'sink', label: 'The sink', x: 364, y: 134, r: 26, friend: 'fish', popX: 364, popY: 100 },
      { id: 'stool', label: 'The rolling stool', x: 196, y: 158, r: 26, friend: 'cat', popX: 196, popY: 120 },
      { id: 'bin', label: 'The toy bin', x: 283, y: 214, r: 30, friend: 'dino', popX: 283, popY: 172 },
    ],
    spyPositions: [
      { x: 40, y: 190 },
      { x: 120, y: 196 },
      { x: 176, y: 208 },
      { x: 232, y: 190 },
      { x: 330, y: 194 },
      { x: 150, y: 100 },
      { x: 108, y: 60 },
      { x: 330, y: 70 },
    ],
  },
}

export const sceneOrder: SceneId[] = ['waiting', 'clinic']
