import { useRef, useState } from 'react'
import { CreatureShape } from '../creatures'
import { scenes, sceneOrder, type SceneId } from '../scenes'
import { playCue } from '../sound'
import { FoundDots, RoomPicker, SceneStage, TryAgain } from '../ui'

/**
 * Tap anything in the room to see who is hiding there. Nothing is timed, tapping
 * an empty spot does nothing at all, and found friends stay visible.
 */
export function Explore({ onFinish }: { onFinish: () => void }) {
  const [sceneId, setSceneId] = useState<SceneId>('waiting')
  const [found, setFound] = useState<string[]>([])
  const [caption, setCaption] = useState<string | null>(null)
  // Mirrored in a ref so a burst of quick taps can't read a stale list and drop
  // reveals — small hands tap fast.
  const foundRef = useRef<string[]>([])

  const scene = scenes[sceneId]
  const allFound = found.length === scene.hotspots.length

  const changeScene = (next: SceneId) => {
    foundRef.current = []
    setSceneId(next)
    setFound([])
    setCaption(null)
  }

  const reveal = (id: string, label: string) => {
    setCaption(label)
    if (foundRef.current.includes(id)) return

    foundRef.current = [...foundRef.current, id]
    setFound(foundRef.current)

    const done = foundRef.current.length === scene.hotspots.length
    playCue(done ? 'finish' : 'found')
    if (done) onFinish()
  }

  return (
    <div className="g-play">
      <RoomPicker
        current={sceneId}
        onPick={changeScene}
        rooms={sceneOrder.map((id) => ({ id, name: scenes[id].name }))}
      />

      <SceneStage art={scene.art} label={`${scene.name}. Tap things to find hidden friends.`}>
        {scene.hotspots.map((spot) => {
          const isFound = found.includes(spot.id)
          // Keep a revealed friend fully inside the picture even when the object
          // it hides behind sits near an edge.
          const popX = Math.min(374, Math.max(26, spot.popX))
          const popY = Math.min(234, Math.max(26, spot.popY))
          return (
            <g key={spot.id}>
              {isFound ? (
                <g
                  className="g-pop"
                  transform={`translate(${popX - 22} ${popY - 22}) scale(0.44)`}
                >
                  <CreatureShape kind={spot.friend} />
                </g>
              ) : null}
              <circle
                className={`g-hotspot ${isFound ? 'is-found' : ''}`}
                cx={spot.x}
                cy={spot.y}
                r={spot.r}
                role="button"
                tabIndex={0}
                aria-label={
                  isFound ? `${spot.label} — friend found` : `Look at ${spot.label}`
                }
                onClick={() => reveal(spot.id, spot.label)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault()
                    reveal(spot.id, spot.label)
                  }
                }}
              />
            </g>
          )
        })}
      </SceneStage>

      <div className="g-status">
        <FoundDots total={scene.hotspots.length} found={found.length} />
        <p className="g-caption">
          {allFound
            ? 'You found everybody. Nice looking!'
            : (caption ?? 'Tap around the room to find hidden friends.')}
        </p>
      </div>

      {allFound ? (
        <TryAgain label="Hide them again" onClick={() => changeScene(sceneId)} />
      ) : null}
    </div>
  )
}
