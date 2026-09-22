import { useEffect, useRef, useState } from 'react'
import { categories, gameList, type Category, type GameEntry } from './gameList'
import { Icon } from './Icons'
import { CreatureIcon } from './creatures'
import { isSoundOn, setSoundOn } from './sound'
import { recordSession } from './analytics'
import { GameSession } from './GameSession'
import { BubbleArt } from './BubbleArt'
import { ComfortSettings, readComfort, saveComfort, type ComfortPreferences } from './ComfortSettings'
import { CafeCover, StudioPortrait } from './games/playfulArt'
import { GardenArt } from './games/gardenArt'
import { PostcardArt } from './games/postcardArt'
function GameCover({ game }: { game: GameEntry }) {
  if (game.id === 'bubbles') return <BubbleArt/>
  if (game.id === 'sky') return <img src="/art/sky.webp" alt="" loading="lazy" />
  if (game.id === 'cafe') return <CafeCover/>
  if (game.id === 'studio') return <div className="studio-cover"><StudioPortrait/></div>
  if (game.id === 'tictactoe') return <div className="cover-ttt" aria-hidden="true">{['X','','O','','X','','O','','X'].map((n,i) => <span key={i}>{n}</span>)}</div>
  if (game.id === 'matching') return <div className="cover-cards" aria-hidden="true"><span><Icon name="star" size={44} weight="fill" /></span><span>?</span><span><Icon name="star" size={44} weight="fill" /></span></div>
  if (game.id === 'maze') return <div className="cover-maze" aria-hidden="true">{[1,1,1,1,1,1,1,0,0,0,1,1,1,0,1,0,1,1,1,0,1,0,0,1,1,0,1,1,0,1,1,0,0,0,0,1].map((n,i) => <span key={i} className={n ? 'wall' : ''}>{i === 7 ? <Icon name="star" size={18}/> : i===34 ? <Icon name="flag" size={18}/> : ''}</span>)}</div>
  if (game.id === 'garden') return <GardenArt/>
  if (game.id === 'postcards') return <PostcardArt decorative/>
  return <div className="cover-friends" aria-hidden="true"><CreatureIcon kind={game.face} size={100}/><CreatureIcon kind={'owl'} size={64}/><Icon name={game.icon} size={40}/></div>
}

const easyGames = new Set(['bubbles', 'matching', 'postcards', 'garden', 'cafe', 'studio'])

export function GameApp() {
  const [category, setCategory] = useState<Category>('All games')
  const [active, setActive] = useState<GameEntry | null>(null)
  const [sound, setSound] = useState(isSoundOn)
  const [deviceQuiet, setDeviceQuiet] = useState(() => typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches)
  const [preferences, setPreferences] = useState(readComfort)
  const [settingsOpen, setSettingsOpen] = useState(false)
  const [away, setAway] = useState(false)
  const [help, setHelp] = useState(false)
  const quiet = deviceQuiet || preferences.calm
  const counted = useRef(false)
  const mainRef = useRef<HTMLElement>(null)
  const lastGame = useRef<string | null>(null)

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
    if (active) return // The game intro owns its focus.
    const card = !away && !help && lastGame.current ? document.getElementById(`game-${lastGame.current}`) : null
    ;(card || mainRef.current)?.focus({ preventScroll: !card })
  }, [active, away, help])

  const launch = (game: GameEntry) => {
    lastGame.current = game.id
    setActive(game); setAway(false); setHelp(false); window.scrollTo(0, 0)
  }
  const home = () => { lastGame.current = null; setActive(null); setAway(false); setHelp(false); window.scrollTo(0, 0) }
  const leave = () => { lastGame.current = null; setActive(null); setAway(true); setSound(false); setSoundOn(false); window.scrollTo(0, 0) }
  const toggleSound = () => { setSoundOn(!sound); setSound(!sound) }
  const updatePreferences = (next: ComfortPreferences) => { setPreferences(next); saveComfort(next) }
  const visible = gameList.filter(g => category === 'All games' || g.category === category)
  const bubbleGame = gameList.find(g => g.id === 'bubbles')!
  const gardenGame = gameList.find(g => g.id === 'garden')!
  const postcardGame = gameList.find(g => g.id === 'postcards')!
  const showHelp = () => { setHelp(true); setActive(null); setAway(false); window.scrollTo(0, 0) }

  return <div className={`playroom ${active ? 'has-active-game' : ''}`}>
    <a className="skip-link" href="#playroom-main">Skip to games</a>
    <header className="app-header">
      <button className="brand" onClick={home} aria-label="Patient Playroom home"><span className="brand-symbol"><Icon name="game" size={27} weight="fill"/></span><span><span className="brand-patient">patient</span><span className="brand-light">playroom</span><span className="brand-dot">.</span></span></button>
      <nav className="top-links" aria-label="Main navigation"><button className={help ? 'selected' : ''} onClick={showHelp}>How it works</button></nav>
      <div className="header-actions">
        <button className={`icon-button sound-button ${sound ? 'is-on' : ''}`} onClick={toggleSound} aria-label={sound ? 'Turn sound off' : 'Turn sound on'} aria-pressed={sound}><Icon name={sound ? 'sound' : 'mute'}/><span>Sound {sound ? 'on' : 'off'}</span></button>
        <button className="icon-button settings-button" onClick={() => setSettingsOpen(true)} aria-label="Play settings" aria-haspopup="dialog"><Icon name="settings"/><span>Play settings</span></button>
        <button className="appointment-button" onClick={leave} aria-label="My appointment"><Icon name="wave"/><span className="appointment-long">My appointment</span><span className="appointment-short">Called?</span></button>
      </div>
    </header>
    <main id="playroom-main" ref={mainRef} tabIndex={-1} className={active ? 'session-main' : 'library-main'}>
      {away ? <section className="goodbye"><span className="goodbye-icon"><Icon name="wave" size={70}/></span><h1>Go do your thing.</h1><p>Your game has stopped. You’re all set for your appointment.</p><button className="primary-button" onClick={() => setAway(false)}>Back to the playroom <Icon name="right"/></button><span>We’ll be here when you’re ready.</span></section>
      : active ? <GameSession key={active.id} game={active} quiet={quiet} overlayOpen={settingsOpen} onLeave={leave} onBack={() => setActive(null)}/>
      : help ? <section className="how-it-works"><span className="eyebrow">Welcome to your little play break</span><h1>A little play.<br/>Whenever you need it.</h1><p>Pick a game, tap Start playing, and have a little fun while you wait.</p><div className="how-grid">{[
        ['tap', 'Start with something simple', 'Try Bubble Pop: tap a bubble and find a friend. Match Club starts with just three pairs.'],
        ['wave', 'Name called? You’re ready.', 'Tap My appointment to stop the game and its sounds right away. You can leave at any time.'],
        ['leaf', 'Get comfortable', 'Sound starts off. Open Play settings for calmer motion or bigger text. Play sitting down, with touch or a keyboard.'],
        ['heart', 'A space just for play', 'No accounts, chat, ads, or purchases. Choose a short break or take your time in puzzles and creative games. Another round only starts when you choose.'],
      ].map(([icon, title, body]) => <article key={title}><Icon name={icon} size={32}/><h2>{title}</h2><p>{body}</p></article>)}</div><button className="primary-button" onClick={() => setHelp(false)}>Find your game <Icon name="right"/></button></section>
      : <>
        <section className="welcome-row">
          <div><span className="eyebrow welcome-eyebrow"><span/> A little brighter, while you wait</span><h1>Make room for <span>play.</span></h1><p>Pick something fun. Take your time. Make it yours.</p></div>
          <div className="welcome-friends" aria-hidden="true"><span><CreatureIcon kind="dino" size={66}/></span><span><CreatureIcon kind="bunny" size={66}/></span><span><CreatureIcon kind="owl" size={66}/></span><Icon name="sparkle" size={24}/></div>
        </section>
        {category === 'All games' && <section className="discovery-grid" aria-label="Featured adventures">
          <article className="garden-feature">
            <div className="garden-feature-copy"><span className="eyebrow"><Icon name="leaf" size={16}/> GROW A LITTLE HAPPINESS</span><h2>Small seeds.<br/>Big smiles.</h2><p>Make a happy little garden.<br/>One flower at a time.</p><button className="primary-button" onClick={() => launch(gardenGame)}>Grow my garden <Icon name="right" size={20}/></button><span className="discovery-detail">Pocket Garden · Every choice works</span></div>
            <div className="garden-feature-art" aria-hidden="true"><GardenArt/></div>
          </article>
          <div className="quick-starts">
            <span className="eyebrow">A little play, your way</span>
            <button className="quick-start quick-bubbles" onClick={() => launch(bubbleGame)}><span className="quick-art" aria-hidden="true"><BubbleArt/></span><span className="quick-copy"><small>JUST TAP & PLAY</small><strong>Pop into happy.</strong><span>Bubble Pop</span></span><Icon name="right" size={20}/></button>
            <button className="quick-start quick-postcards" onClick={() => launch(postcardGame)}><span className="quick-art" aria-hidden="true"><PostcardArt/></span><span className="quick-copy"><small>NEW · A PICTURE PUZZLE</small><strong>A world in pieces.</strong><span>Puzzle Postcards</span></span><Icon name="right" size={20}/></button>
            <p className="discovery-note"><Icon name="heart" size={17}/> {sound ? 'A little sound. A lot of imagination.' : 'Sound off. Imagination on.'}</p>
          </div>
        </section>}
        <section className="games-section" aria-label="Game library">
          <div className="section-heading"><div><h2>Find your kind of fun</h2><p>Something for every little mood.</p></div><span className="library-count" aria-live="polite">{visible.length} games to explore <Icon name="sparkle" size={18}/></span></div>
          <div className="category-row" role="group" aria-label="Filter games">{categories.map((c, i) => <button key={c} className={`category ${category === c ? 'active' : ''}`} aria-pressed={category === c} onClick={() => setCategory(c)}><Icon name={['game', 'planet', 'puzzle', 'leaf', 'users'][i]!}/>{c}</button>)}</div>
          <div className="game-grid">{visible.map(game => <button key={game.id} id={`game-${game.id}`} className={`game-card theme-${game.color}`} onClick={() => launch(game)} aria-label={`Play ${game.name}`} aria-describedby={`game-hint-${game.id}`}>
            <div className="game-cover" aria-hidden="true"><GameCover game={game}/>{game.id === 'garden' && <span className="dimension-label">CREATE</span>}{game.id === 'postcards' && <span className="dimension-label">NEW</span>}{['sky'].includes(game.id) && <span className="dimension-label">3D</span>}</div>
            <div className="game-card-copy"><h3>{game.name}</h3><p id={`game-hint-${game.id}`}>{game.hint}</p><div className="card-meta"><span><Icon name={game.id === 'sky' ? 'clock' : 'leaf'} size={14}/>{game.id === 'sky' ? game.tag : 'No rush'}</span><span>{easyGames.has(game.id) ? 'Easy to start' : game.category === 'Play together' ? '1–2 players' : game.category === '3D adventures' ? 'Adventure' : 'Think & play'}</span></div></div><span className="card-open" aria-hidden="true">Play <Icon name="right" size={16}/></span>
          </button>)}</div>
        </section>
        <aside className="leave-strip"><span className="strip-icon"><Icon name="wave" size={28}/></span><div><h2>Fun on your terms. Leave whenever.</h2><p>Name called? Tap My appointment. We’ll be here next time.</p></div><span className="strip-doodle"><Icon name="heart" size={28}/></span></aside>
      </>}
    </main>
    <footer className="app-footer"><span><Icon name="heart" size={17}/> Made for a brighter wait.</span><div><button className="mobile-help" onClick={showHelp}>How it works</button><span>No ads. No accounts. Just play.</span></div></footer>
    <ComfortSettings open={settingsOpen} onClose={() => setSettingsOpen(false)} preferences={preferences} onChange={updatePreferences} sound={sound} onSound={toggleSound} deviceQuiet={deviceQuiet}/>
  </div>
}
