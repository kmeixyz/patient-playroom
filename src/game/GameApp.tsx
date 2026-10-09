import { useEffect, useRef, useState } from 'react'
import { gameList, type GameEntry } from './gameList'
import { Icon } from './Icons'
import { recordSession } from './analytics'
import { GameSession, type SessionStatus } from './GameSession'
import { PlayroomHelp } from './PlayroomHelp'
import { BubbleArt } from './BubbleArt'
import { ComfortSettings, readComfort, saveComfort, type ComfortPreferences } from './ComfortSettings'
import { ColorLabArt, PebbleArt } from './games/DiscoveryArt'
import { GardenArt } from './games/gardenArt'
import { PostcardArt } from './games/postcardArt'
import { PlanetPostCover } from './games/PlanetPost'
function GameCover({ game }: { game: GameEntry }) {
  if (game.id === 'planetpost') return <PlanetPostCover/>
  if (game.id === 'colors') return <ColorLabArt/>
  if (game.id === 'pebbles') return <PebbleArt/>
  if (game.id === 'bubbles') return <BubbleArt/>
  if (game.id === 'robot') return <img src="/art/robot.webp" alt="" loading="lazy" />
  if (game.id === 'sky') return <img src="/art/sky.webp" alt="" loading="lazy" />
  if (game.id === 'matching') return <div className="cover-cards" aria-hidden="true"><span><Icon name="star" size={44} weight="fill" /></span><span>?</span><span><Icon name="star" size={44} weight="fill" /></span></div>
  if (game.id === 'garden') return <GardenArt/>
  return <PostcardArt decorative/>
}

const shelfOrder = ['robot', 'planetpost', 'sky', 'bubbles', 'matching', 'garden', 'colors', 'postcards', 'pebbles']
const shelf = [...gameList].sort((a, b) => shelfOrder.indexOf(a.id) - shelfOrder.indexOf(b.id))

export function GameApp() {
  const [active, setActive] = useState<GameEntry | null>(null)
  const [inGame, setInGame] = useState(false)
  const [sessionId, setSessionId] = useState(0)
  const [quickStart, setQuickStart] = useState(false)
  const [resumeRequest, setResumeRequest] = useState(0)
  const [sessionStatus, setSessionStatus] = useState<SessionStatus>('ready')
  const [deviceQuiet, setDeviceQuiet] = useState(() => typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches)
  const [preferences, setPreferences] = useState(readComfort)
  const [settingsOpen, setSettingsOpen] = useState(false)
  const [away, setAway] = useState(false)
  const [helpOpen, setHelpOpen] = useState(false)
  const quiet = deviceQuiet || preferences.calm
  const counted = useRef(false)
  const launchControl = useRef<string | null>(null)
  const libraryScroll = useRef(0)
  const mainRef = useRef<HTMLElement>(null)

  useEffect(() => {
    const preference = window.matchMedia('(prefers-reduced-motion: reduce)')
    const sync = () => setDeviceQuiet(preference.matches)
    preference.addEventListener('change', sync)
    return () => preference.removeEventListener('change', sync)
  }, [])
  useEffect(() => { if (!counted.current) { recordSession(); counted.current = true } }, [])
  useEffect(() => {
    document.documentElement.dataset.quiet = String(quiet)
    return () => { delete document.documentElement.dataset.quiet }
  }, [quiet])
  useEffect(() => {
    document.documentElement.dataset.largeText = String(preferences.largeText)
    return () => { delete document.documentElement.dataset.largeText }
  }, [preferences.largeText])
  useEffect(() => {
    document.documentElement.dataset.solid = String(preferences.solid)
    return () => { delete document.documentElement.dataset.solid }
  }, [preferences.solid])
  useEffect(() => {
    if (inGame) return
    const control = !away && launchControl.current ? (document.getElementById(launchControl.current) || document.getElementById('continue-game')) : null
    ;(control || mainRef.current)?.focus({ preventScroll: true })
    window.scrollTo(0, away ? 0 : libraryScroll.current)
  }, [inGame, away])

  const launch = (game: GameEntry, controlId = `game-${game.id}`, immediately = false) => {
    if (active?.id === game.id && sessionStatus === 'playing') { resume(controlId); return }
    libraryScroll.current = window.scrollY
    launchControl.current = controlId
    setSessionStatus('ready')
    setQuickStart(immediately)
    setSessionId(id => id + 1)
    setActive(game)
    setInGame(true)
    setAway(false)
    window.scrollTo(0, 0)
  }
  const home = () => {
    launchControl.current = null
    libraryScroll.current = 0
    setInGame(false)
    setAway(false)
    window.scrollTo(0, 0)
  }
  const leave = () => {
    launchControl.current = null
    libraryScroll.current = 0
    setActive(null)
    setInGame(false)
    setAway(true)
    window.scrollTo(0, 0)
  }
  const resume = (controlId = 'continue-game') => {
    libraryScroll.current = window.scrollY
    launchControl.current = controlId
    setInGame(true)
    setResumeRequest(request => request + 1)
    window.scrollTo(0, 0)
  }
  // Safari does not focus a clicked button automatically; give native dialog
  // restoration an explicit opener for both pointer and keyboard users.
  const openHelp = (trigger: HTMLButtonElement) => {
    trigger.focus({ preventScroll: true })
    setHelpOpen(true)
  }
  const updatePreferences = (next: ComfortPreferences) => { setPreferences(next); saveComfort(next) }

  return <div className={`playroom ${inGame ? 'has-active-game' : ''}`}>
    <a className="skip-link" href="#playroom-main">Skip to {inGame ? 'game' : 'games'}</a>
    <header className="app-header">
      <button className="brand" onClick={home} aria-label="Patient Playroom home"><span className="brand-symbol"><img src="/favicon.svg" alt=""/></span><span>Patient Playroom</span></button>
      <div className="header-actions">
        <button className="icon-button help-button" onClick={event => openHelp(event.currentTarget)} aria-label="Help" aria-haspopup="dialog"><Icon name="info"/><span>Help</span></button>
        <button className="icon-button settings-button" onClick={event => { event.currentTarget.focus({ preventScroll: true }); setSettingsOpen(true) }} aria-label="Settings" aria-haspopup="dialog"><Icon name="settings"/><span>Settings</span></button>
        <button className="appointment-button" onClick={leave}><Icon name="wave"/><span>Bye</span></button>
      </div>
    </header>
    <main id="playroom-main" ref={mainRef} tabIndex={-1} className={inGame ? 'session-main' : 'library-main'}>
      {active && <div hidden={!inGame}><GameSession key={sessionId} game={active} quiet={quiet} visible={inGame} quickStart={quickStart} resumeRequest={resumeRequest} onStatusChange={setSessionStatus} overlayOpen={settingsOpen || helpOpen || !inGame} onBack={() => setInGame(false)}/></div>}
      {away ? <section className="goodbye"><span className="goodbye-icon"><Icon name="wave" size={70}/></span><h1>See you next time!</h1><button className="primary-button" onClick={home}>Back to games <Icon name="right"/></button></section>
      : !inGame && <>
        <h1 className="sr-only">Games</h1>
        {active && sessionStatus === 'playing' && <section className="continue-strip" aria-label="Your current game">
          <span className={`continue-art theme-${active.color}`} aria-hidden="true"><GameCover game={active}/></span>
          <div><h2>{active.name}</h2><p>Your game is paused. Continue to keep playing.</p></div>
          <button id="continue-game" className="primary-button" onClick={() => resume()}><Icon name="play" weight="fill" size={18}/> Continue <span className="sr-only">{active.name}</span></button>
        </section>}
        <section className="games-section" aria-label="Game library">
          <span className="sr-only" role="status">{shelf.length} games</span>
          <div className="game-grid">{shelf.map(game => <button key={game.id} id={`game-${game.id}`} className={`game-card theme-${game.color}`} onClick={() => launch(game, `game-${game.id}`, game.id === 'bubbles')} aria-label={`${active?.id === game.id && sessionStatus === 'playing' ? 'Continue' : 'Play'} ${game.name}`} aria-describedby={`game-hint-${game.id}`}>
            <div className="game-cover" aria-hidden="true"><GameCover game={game}/></div>
            <div className="game-card-copy"><h2>{game.name}</h2><p id={`game-hint-${game.id}`}>{game.hint}</p>{game.id === 'sky' && <div className="card-meta"><span><Icon name="clock" size={13}/>{game.tag}</span></div>}</div><span className="card-open" aria-hidden="true">{active?.id === game.id && sessionStatus === 'playing' ? 'Continue' : 'Play'} <Icon name="right" size={15}/></span>
          </button>)}</div>
        </section>

      </>}
    </main>

    <ComfortSettings open={settingsOpen} onClose={() => setSettingsOpen(false)} preferences={preferences} onChange={updatePreferences} deviceQuiet={deviceQuiet}/>
    <PlayroomHelp open={helpOpen} onClose={() => setHelpOpen(false)}/>
  </div>
}
