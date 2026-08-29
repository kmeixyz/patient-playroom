import { useCallback, useMemo, useRef, useState } from 'react'
import {
  CreatureIcon,
  CreatureShape,
  creatureKinds,
  creatureNames,
  type CreatureKind,
} from '../creatures'
import { scenes, sceneOrder, type SceneId } from '../scenes'
import { playCue } from '../sound'
import { RoomPicker, SceneStage, TryAgain } from '../ui'

type Hidden = { kind: CreatureKind; x: number; y: number }

const ROUND_SIZE = 5

function shuffle<T>(items: T[]): T[] {
  const copy = [...items]
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[copy[i], copy[j]] = [copy[j]!, copy[i]!]
  }
  return copy
}

function hide(sceneId: SceneId): Hidden[] {
  const spots = shuffle(scenes[sceneId].spyPositions).slice(0, ROUND_SIZE)
  const kinds = shuffle(creatureKinds).slice(0, ROUND_SIZE)
  return spots.map((spot, i) => ({ kind: kinds[i]!, x: spot.x, y: spot.y }))
}

/**
 * A short find-the-object round. Wrong taps do nothing, and a Help button will
 * point at something still hiding, so a child can never get stuck.
 */
export function ISpy({ onFinish }: { onFinish: () => void }) {
  const [sceneId, setSceneId] = useState<SceneId>('waiting')
  const [hidden, setHidden] = useState<Hidden[]>(() => hide('waiting'))
  const [found, setFound] = useState<CreatureKind[]>([])
  const [hint, setHint] = useState<CreatureKind | null>(null)
  const foundRef = useRef<CreatureKind[]>([])

  const scene = scenes[sceneId]
  const remaining = useMemo(
    () => hidden.filter((h) => !found.includes(h.kind)),
    [hidden, found],
  )
  const done = remaining.length === 0

  const newRound = useCallback((next: SceneId) => {
    foundRef.current = []
    setSceneId(next)
    setHidden(hide(next))
    setFound([])
    setHint(null)
  }, [])

  const pick = (kind: CreatureKind) => {
    if (foundRef.current.includes(kind)) return

    foundRef.current = [...foundRef.current, kind]
    setFound(foundRef.current)
    setHint(null)

    const done = foundRef.current.length === hidden.length
    playCue(done ? 'finish' : 'found')
    if (done) onFinish()
  }

  return (
    <div className="g-play">
      <RoomPicker
        current={sceneId}
        onPick={newRound}
        rooms={sceneOrder.map((id) => ({ id, name: scenes[id].name }))}
      />

      <div className="g-targets" aria-label="Find these friends">
        {hidden.map((h) => {
          const isFound = found.includes(h.kind)
          return (
            <div
              key={h.kind}
              className={`g-target ${isFound ? 'is-found' : ''}`}
              aria-label={`${creatureNames[h.kind]}${isFound ? ', found' : ''}`}
            >
              <CreatureIcon kind={h.kind} size={34} />
              {isFound ? (
                <svg className="g-target__check" viewBox="0 0 24 24" aria-hidden="true">
                  <path
                    d="m5 12.5 4.5 4.5L19 7"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="3.4"
                    strokeLinecap="round"
                  />
                </svg>
              ) : null}
            </div>
          )
        })}
      </div>

      <SceneStage art={scene.art} label={`Find the hidden friends in the ${scene.name}.`}>
        {hidden.map((h) => {
          const isFound = found.includes(h.kind)
          return (
            <g
              key={h.kind}
              className={`g-spy ${isFound ? 'is-found' : ''} ${hint === h.kind ? 'is-hinted' : ''}`}
            >
              {hint === h.kind && !isFound ? (
                <circle className="g-spy__ring" cx={h.x} cy={h.y} r="26" />
              ) : null}
              <g transform={`translate(${h.x - 15} ${h.y - 15}) scale(0.3)`}>
                <CreatureShape kind={h.kind} />
              </g>
              <circle
                className="g-hotspot g-hotspot--bare"
                cx={h.x}
                cy={h.y}
                r="24"
                role="button"
                tabIndex={0}
                aria-label={`${creatureNames[h.kind]}${isFound ? ', already found' : ''}`}
                onClick={() => pick(h.kind)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault()
                    pick(h.kind)
                  }
                }}
              />
            </g>
          )
        })}
      </SceneStage>

      <div className="g-status">
        <p className="g-caption">
          {done
            ? 'That was all of them. Great eyes!'
            : `Still hiding: ${remaining.length}`}
        </p>
        {!done ? (
          <button
            type="button"
            className="g-btn g-btn--quiet"
            onClick={() => setHint(remaining[0]!.kind)}
          >
            Help me
          </button>
        ) : null}
      </div>

      {done ? (
        <TryAgain label="Hide them again" onClick={() => newRound(sceneId)} />
      ) : null}
    </div>
  )
}
