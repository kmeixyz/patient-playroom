import type { ReactNode } from 'react'
import { CreatureIcon, creatureKinds } from './creatures'
import type { SceneId } from './scenes'

/** The illustrated room, with interactive layers drawn on top in the same units. */
export function SceneStage({
  art,
  label,
  children,
}: {
  art: ReactNode
  label: string
  children?: ReactNode
}) {
  return (
    <div className="g-stage">
      <svg viewBox="0 0 400 260" className="g-stage__svg" role="img" aria-label={label}>
        {art}
        {children}
      </svg>
    </div>
  )
}

export function RoomPicker({
  rooms,
  current,
  onPick,
}: {
  rooms: { id: SceneId; name: string }[]
  current: SceneId
  onPick: (id: SceneId) => void
}) {
  return (
    <div className="g-rooms" role="group" aria-label="Choose a room">
      {rooms.map((room) => (
        <button
          key={room.id}
          type="button"
          className={`g-room ${current === room.id ? 'is-current' : ''}`}
          aria-pressed={current === room.id}
          onClick={() => onPick(room.id)}
        >
          {room.name}
        </button>
      ))}
    </div>
  )
}

/** Progress as plain dots: shows how much is left without implying a score. */
export function FoundDots({ total, found }: { total: number; found: number }) {
  return (
    <div className="g-dots" aria-label={`${found} of ${total} found`}>
      {Array.from({ length: total }, (_, i) => (
        <span key={i} className={`g-dot ${i < found ? 'is-on' : ''}`} />
      ))}
    </div>
  )
}

export function TryAgain({
  label,
  onClick,
}: {
  label: string
  onClick: () => void
}) {
  return (
    <div className="g-again">
      <div className="g-again__friends" aria-hidden="true">
        {creatureKinds.slice(0, 4).map((kind, i) => (
          <span key={kind} className="g-bobber" style={{ animationDelay: `${i * 0.18}s` }}>
            <CreatureIcon kind={kind} size={40} />
          </span>
        ))}
      </div>
      <button type="button" className="g-btn g-btn--primary" onClick={onClick}>
        {label}
      </button>
    </div>
  )
}
