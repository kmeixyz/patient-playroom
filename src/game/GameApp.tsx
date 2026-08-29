import { useEffect, useRef, useState } from 'react'
import {
  recordFinish,
  recordSession,
  recordStart,
  recordTime,
  type GameId,
} from './analytics'
import { CreatureIcon } from './creatures'
import { Dance } from './games/Dance'
import { Explore } from './games/Explore'
import { ISpy } from './games/ISpy'
import { Matching } from './games/Matching'
import { Maze } from './games/Maze'
import { TicTacToe } from './games/TicTacToe'
import { gameList } from './gameList'
import { PilotData } from './PilotData'
import { isSoundOn, setSoundOn } from './sound'

export function GameApp() {
  const [active, setActive] = useState<GameId | null>(null)
  const [sound, setSound] = useState(isSoundOn)
  const [showData, setShowData] = useState(false)
  const startedAt = useRef<number | null>(null)

  useEffect(() => {
    recordSession()
  }, [])

  // Time is only counted while an activity is open, and is flushed when the
  // child leaves it, switches, or closes the tab.
  useEffect(() => {
    if (!active) return
    startedAt.current = Date.now()
    recordStart(active)

    const flush = () => {
      if (startedAt.current === null) return
      recordTime(active, (Date.now() - startedAt.current) / 1000)
      startedAt.current = null
    }

    window.addEventListener('pagehide', flush)
    return () => {
      flush()
      window.removeEventListener('pagehide', flush)
    }
  }, [active])

  const toggleSound = () => {
    const next = !sound
    setSoundOn(next)
    setSound(next)
  }

  const entry = gameList.find((game) => game.id === active)
  const finish = () => {
    if (active) recordFinish(active)
  }

  return (
    <div className="g-app">
      <header className="g-top">
        {active ? (
          <button
            type="button"
            className="g-back"
            onClick={() => setActive(null)}
            aria-label="Back to all games"
          >
            <svg viewBox="0 0 24 24" aria-hidden="true">
              <path
                d="M19 12H6m5-6-6 6 6 6"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.4"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
            <span>Games</span>
          </button>
        ) : (
          <span className="g-brand">
            <span className="g-brand__mark" aria-hidden="true" />
            <span className="g-brand__long">Waiting Room Playground</span>
            <span className="g-brand__short">Playground</span>
          </span>
        )}

        <h1 className="g-top__title">{entry ? entry.name : ''}</h1>

        <button
          type="button"
          className={`g-sound ${sound ? 'is-on' : ''}`}
          onClick={toggleSound}
          aria-pressed={sound}
          aria-label={sound ? 'Turn sound off' : 'Turn sound on'}
        >
          <svg viewBox="0 0 24 24" aria-hidden="true">
            <path
              d="M5 9.5h3l4-3.5v12l-4-3.5H5Z"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinejoin="round"
            />
            {sound ? (
              <path
                d="M16 9a4.5 4.5 0 0 1 0 6"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
              />
            ) : (
              <path
                d="m16 9.5 5 5m0-5-5 5"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
              />
            )}
          </svg>
        </button>
      </header>

      <main className="g-main">
        {active === null ? (
          <>
            <p className="g-welcome">Pick something to play.</p>
            <div className="g-menu">
              {gameList.map((game) => (
                <button
                  key={game.id}
                  type="button"
                  className={`g-card g-card--${game.accent}`}
                  onClick={() => setActive(game.id)}
                >
                  <span className="g-card__face">
                    <CreatureIcon kind={game.face} size={64} />
                  </span>
                  <span className="g-card__name">{game.name}</span>
                  <span className="g-card__hint">{game.hint}</span>
                </button>
              ))}
            </div>
            <p className="g-leave">
              You can stop any time. Nothing is saved about you.
            </p>
          </>
        ) : active === 'explore' ? (
          <Explore onFinish={finish} />
        ) : active === 'ispy' ? (
          <ISpy onFinish={finish} />
        ) : active === 'matching' ? (
          <Matching onFinish={finish} />
        ) : active === 'tictactoe' ? (
          <TicTacToe onFinish={finish} />
        ) : active === 'maze' ? (
          <Maze onFinish={finish} />
        ) : (
          <Dance />
        )}
      </main>

      <footer className="g-foot">
        <a href="#brief-overview">Design brief</a>
        <button type="button" onClick={() => setShowData(true)}>
          Pilot data
        </button>
      </footer>

      {showData ? <PilotData onClose={() => setShowData(false)} /> : null}
    </div>
  )
}
