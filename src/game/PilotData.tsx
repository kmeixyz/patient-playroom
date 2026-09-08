import { useEffect, useRef, useState } from 'react'
import {
  getStats,
  resetStats,
  subscribe,
  type GameId,
  type PilotStats,
} from './analytics'
import { gameList } from './gameList'

function minutes(seconds: number) {
  if (seconds < 60) return `${seconds}s`
  return `${Math.floor(seconds / 60)}m ${seconds % 60}s`
}

/**
 * Staff-facing view of the anonymous counters. Deliberately plain and separate
 * from the child's experience, and reachable only from the small footer link.
 */
export function PilotData({ onClose }: { onClose: () => void }) {
  const [stats, setStats] = useState<PilotStats>(getStats)
  const dialog = useRef<HTMLDialogElement>(null)
  const [copyStatus, setCopyStatus] = useState('')
  useEffect(() => { const el=dialog.current;el?.showModal();return()=>el?.close() }, [])

  useEffect(() => subscribe(setStats), [])

  const rows = gameList.map((game) => ({
    id: game.id,
    name: game.name,
    ...(stats.games[game.id as GameId] ?? { starts: 0, seconds: 0, finishes: 0 }),
  }))

  const totalSeconds = rows.reduce((sum, row) => sum + row.seconds, 0)

  return (
    <dialog ref={dialog} className="g-sheet" aria-label="Pilot data" onCancel={onClose}>
      <div className="g-sheet__panel">
        <header className="g-sheet__head">
          <h2>Pilot data on this device</h2>
          <button type="button" className="g-btn g-btn--quiet" onClick={onClose}>
            Close
          </button>
        </header>

        <p className="g-sheet__note">
          Anonymous counts only — no names, no appointment details, no location,
          nothing sent anywhere. Stored on this phone so a pilot can read or clear
          it.
        </p>

        <dl className="g-sheet__summary">
          <div>
            <dt>App opens</dt>
            <dd>{stats.sessions}</dd>
          </div>
          <div>
            <dt>Activity switches</dt>
            <dd>{stats.switches}</dd>
          </div>
          <div>
            <dt>Total time in activities</dt>
            <dd>{minutes(totalSeconds)}</dd>
          </div>
        </dl>

        <table className="g-sheet__table">
          <thead>
            <tr>
              <th scope="col">Activity</th>
              <th scope="col">Opens</th>
              <th scope="col">Time</th>
              <th scope="col">Rounds finished</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr key={row.id}>
                <th scope="row">{row.name}</th>
                <td>{row.starts}</td>
                <td>{minutes(row.seconds)}</td>
                <td>{row.finishes}</td>
              </tr>
            ))}
          </tbody>
        </table>

        <div className="g-sheet__actions">
          <button
            type="button"
            className="g-btn g-btn--quiet"
            onClick={async () => {
              try { await navigator.clipboard.writeText(JSON.stringify(stats, null, 2)); setCopyStatus('Copied.') }
              catch { setCopyStatus('Copy is unavailable in this browser.') }
            }}
          >
            Copy as JSON
          </button>
          <button type="button" className="g-btn g-btn--quiet" onClick={resetStats}>
            Clear data
          </button>
        </div>
        <p role="status">{copyStatus}</p>
      </div>
    </dialog>
  )
}
