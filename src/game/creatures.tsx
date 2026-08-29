/**
 * One small cast of characters shared by every game, drawn as inline SVG so the
 * prototype ships with no image downloads (the brief asks for low data use and
 * for play to survive a brief connection loss).
 *
 * Shapes differ as much as colors do, so nothing depends on color vision.
 */

export type CreatureKind =
  | 'bear'
  | 'bunny'
  | 'cat'
  | 'owl'
  | 'fish'
  | 'dino'
  | 'duck'
  | 'star'

export const creatureKinds: CreatureKind[] = [
  'bear',
  'bunny',
  'cat',
  'owl',
  'fish',
  'dino',
  'duck',
  'star',
]

export const creatureNames: Record<CreatureKind, string> = {
  bear: 'Bear',
  bunny: 'Bunny',
  cat: 'Cat',
  owl: 'Owl',
  fish: 'Fish',
  dino: 'Dino',
  duck: 'Duck',
  star: 'Star',
}

const colors: Record<CreatureKind, { body: string; trim: string }> = {
  bear: { body: '#b98a5e', trim: '#8d6743' },
  bunny: { body: '#f0a6b8', trim: '#d2798e' },
  cat: { body: '#f4a261', trim: '#d07d3c' },
  owl: { body: '#8f86d8', trim: '#6a61b8' },
  fish: { body: '#4cb7c9', trim: '#2f8fa1' },
  dino: { body: '#6fbf8b', trim: '#4b9668' },
  duck: { body: '#f2c94c', trim: '#d3a521' },
  star: { body: '#f2994a', trim: '#d97c2b' },
}

function Face({ cx = 50, cy = 56, wide = 12 }: { cx?: number; cy?: number; wide?: number }) {
  return (
    <g fill="#2b2b3a">
      <circle cx={cx - wide} cy={cy} r="4" />
      <circle cx={cx + wide} cy={cy} r="4" />
      <path
        d={`M${cx - 7} ${cy + 10} q7 6 14 0`}
        fill="none"
        stroke="#2b2b3a"
        strokeWidth="3"
        strokeLinecap="round"
      />
    </g>
  )
}

export function CreatureShape({
  kind,
  color,
}: {
  kind: CreatureKind
  color?: string
}) {
  const c = colors[kind]
  const body = color ?? c.body
  const trim = c.trim

  switch (kind) {
    case 'bear':
      return (
        <g>
          <circle cx="27" cy="26" r="12" fill={trim} />
          <circle cx="73" cy="26" r="12" fill={trim} />
          <circle cx="50" cy="55" r="34" fill={body} />
          <ellipse cx="50" cy="68" rx="13" ry="10" fill="#fbeee2" />
          <circle cx="50" cy="63" r="3.5" fill="#2b2b3a" />
          <Face cy={50} wide={13} />
        </g>
      )
    case 'bunny':
      return (
        <g>
          <ellipse cx="36" cy="20" rx="8" ry="19" fill={body} />
          <ellipse cx="64" cy="20" rx="8" ry="19" fill={body} />
          <ellipse cx="36" cy="21" rx="4" ry="13" fill="#ffd7e2" />
          <ellipse cx="64" cy="21" rx="4" ry="13" fill="#ffd7e2" />
          <circle cx="50" cy="60" r="30" fill={body} />
          <circle cx="34" cy="66" r="6" fill="#ffd0dd" />
          <circle cx="66" cy="66" r="6" fill="#ffd0dd" />
          <Face cy={56} wide={11} />
        </g>
      )
    case 'cat':
      return (
        <g>
          <path d="M24 34 26 12l18 12Z" fill={trim} />
          <path d="M76 34 74 12 56 24Z" fill={trim} />
          <circle cx="50" cy="58" r="32" fill={body} />
          <g stroke={trim} strokeWidth="2.5" strokeLinecap="round">
            <path d="M20 60h12M20 68h12M80 60H68M80 68H68" />
          </g>
          <Face cy={54} wide={12} />
        </g>
      )
    case 'owl':
      return (
        <g>
          <path d="M28 26 34 12l10 10Z" fill={trim} />
          <path d="M72 26 66 12 56 22Z" fill={trim} />
          <ellipse cx="50" cy="58" rx="31" ry="34" fill={body} />
          <ellipse cx="24" cy="60" rx="8" ry="20" fill={trim} />
          <ellipse cx="76" cy="60" rx="8" ry="20" fill={trim} />
          <circle cx="38" cy="50" r="12" fill="#fff8e7" />
          <circle cx="62" cy="50" r="12" fill="#fff8e7" />
          <circle cx="38" cy="50" r="5" fill="#2b2b3a" />
          <circle cx="62" cy="50" r="5" fill="#2b2b3a" />
          <path d="M50 60 44 68h12Z" fill="#f2994a" />
        </g>
      )
    case 'fish':
      return (
        <g>
          <path d="M18 50 4 32v36Z" fill={trim} />
          <ellipse cx="54" cy="50" rx="38" ry="27" fill={body} />
          <path d="M52 23q10-12 18-6-6 8-4 14Z" fill={trim} />
          <circle cx="74" cy="44" r="5.5" fill="#fff" />
          <circle cx="75" cy="44" r="3" fill="#2b2b3a" />
          <path
            d="M70 60q8 5 14 0"
            fill="none"
            stroke="#2b2b3a"
            strokeWidth="3"
            strokeLinecap="round"
          />
          <circle cx="40" cy="42" r="5" fill={trim} opacity="0.5" />
          <circle cx="34" cy="58" r="4" fill={trim} opacity="0.5" />
        </g>
      )
    case 'dino':
      return (
        <g>
          <path
            d="M50 16 58 28H42Zm-14 6 6 10H30Zm28 0 6 10H64Z"
            fill={trim}
          />
          <ellipse cx="50" cy="60" rx="32" ry="31" fill={body} />
          <ellipse cx="50" cy="72" rx="16" ry="11" fill="#e8f7ec" />
          <Face cy={54} wide={12} />
        </g>
      )
    case 'duck':
      return (
        <g>
          <ellipse cx="46" cy="66" rx="32" ry="24" fill={body} />
          <circle cx="66" cy="38" r="19" fill={body} />
          <path d="M84 36q12 2 10 8-8 4-12 0Z" fill="#f2994a" />
          <circle cx="70" cy="34" r="4" fill="#2b2b3a" />
          <path d="M20 60q-12 6-4 12" fill="none" stroke={trim} strokeWidth="4" />
          <ellipse cx="40" cy="66" rx="12" ry="9" fill={trim} opacity="0.35" />
        </g>
      )
    case 'star':
      return (
        <g>
          <path
            d="M50 10 62 40l32 3-24 21 7 31-27-16-27 16 7-31L6 43l32-3Z"
            fill={body}
            stroke={trim}
            strokeWidth="3"
          />
          <Face cy={52} wide={10} />
        </g>
      )
  }
}

export function CreatureIcon({
  kind,
  size = 64,
  color,
  className,
}: {
  kind: CreatureKind
  size?: number
  color?: string
  className?: string
}) {
  return (
    <svg
      viewBox="0 0 100 100"
      width={size}
      height={size}
      className={className}
      role="img"
      aria-label={creatureNames[kind]}
    >
      <CreatureShape kind={kind} color={color} />
    </svg>
  )
}
