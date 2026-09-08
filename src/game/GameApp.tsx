import { useEffect, useRef, useState } from 'react'
import { categories, gameList, type Category, type GameEntry } from './gameList'
import { Icon } from './Icons'
import { CreatureIcon } from './creatures'
import { isSoundOn, setSoundOn } from './sound'
import { recordSession } from './analytics'
import { GameSession } from './GameSession'
import { PilotData } from './PilotData'

function GameCover({ game }: { game: GameEntry }) {
  if (game.id === 'sky' || game.id === 'orbit') return <img src={`/art/${game.id}.webp`} alt="" loading="lazy" />
  if (game.id === 'merge') return <div className="cover-merge" aria-hidden="true">{[2,4,8,16,32,64].map(n => <span key={n}>{n}</span>)}</div>
  if (game.id === 'tictactoe') return <div className="cover-ttt" aria-hidden="true">{['X','','O','','X','','O','','X'].map((n,i) => <span key={i}>{n}</span>)}</div>
  if (game.id === 'matching') return <div className="cover-cards" aria-hidden="true"><span><Icon name="star" size={44} weight="fill" /></span><span>?</span><span><Icon name="star" size={44} weight="fill" /></span></div>
  if (game.id === 'maze') return <div className="cover-maze" aria-hidden="true">{[1,1,1,1,1,1,1,0,0,0,1,1,1,0,1,0,1,1,1,0,1,0,0,1,1,0,1,1,0,1,1,0,0,0,0,1].map((n,i) => <span key={i} className={n ? 'wall' : ''}>{i === 7 ? <Icon name="star" size={18}/> : i===34 ? <Icon name="flag" size={18}/> : ''}</span>)}</div>
  if (game.id === 'words') return <div className="cover-words" aria-hidden="true">{'MOONASTARSKY'.split('').map((n,i)=><span className={i<4?'marked':''} key={i}>{n}</span>)}</div>
  if (game.id === 'dance') return <div className="cover-beats" aria-hidden="true">{['music','heart','star','sparkle'].map(n=><span key={n}><Icon name={n} size={34} weight="fill" /></span>)}</div>
  return <div className="cover-friends" aria-hidden="true"><CreatureIcon kind={game.face} size={100}/><CreatureIcon kind={game.id === 'explore' ? 'bunny' : 'owl'} size={64}/><Icon name={game.icon} size={40}/></div>
}

export function GameApp() {
  const [category, setCategory] = useState<Category>('All games')
  const [active, setActive] = useState<GameEntry | null>(null)
  const [sound, setSound] = useState(isSoundOn)
  const [quiet, setQuiet] = useState(() => typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches)
  const [showData, setShowData] = useState(false)
  const [away, setAway] = useState(false)
  const [help, setHelp] = useState(false)
  const counted = useRef(false)
  const mainRef = useRef<HTMLElement>(null)
  useEffect(() => { if (!counted.current) { recordSession(); counted.current = true } }, [])
  useEffect(() => { document.documentElement.dataset.quiet = String(quiet); return () => { delete document.documentElement.dataset.quiet } }, [quiet])
  useEffect(() => { mainRef.current?.focus({ preventScroll: true }) }, [active, away])
  const launch = (game: GameEntry) => { setActive(game); setAway(false); window.scrollTo(0,0) }
  const home = () => {setActive(null);setAway(false);setHelp(false)}
  const leave = () => { setActive(null); setAway(true); setSound(false); setSoundOn(false); window.scrollTo(0,0) }
  const toggleSound = () => { setSoundOn(!sound); setSound(!sound) }
  const visible = gameList.filter(g => category === 'All games' || g.category === category)
  return <div className="playroom">
    <a className="skip-link" href="#playroom-main">Skip to games</a>
    <header className="app-header">
      <button className="brand" onClick={home} aria-label="Patient Playroom home"><span className="brand-symbol"><Icon name="game" size={29} weight="fill" /></span><span><span className="brand-patient">patient</span><span className="brand-light">playroom</span><span className="brand-dot">.</span></span></button>
      <nav className="top-links" aria-label="Main navigation"><button className={!help ? 'selected' : ''} onClick={home}>The playroom</button><button className={help ? 'selected' : ''} onClick={() => {setHelp(!help);setActive(null);setAway(false)}}>How it works</button></nav>
      <div className="header-actions"><button className={`icon-button sound-button ${sound?'is-on':''}`} onClick={toggleSound} aria-label={sound?'Turn sound off':'Turn sound on'} aria-pressed={sound}><Icon name={sound?'sound':'mute'}/><span>Sound {sound?'on':'off'}</span></button><button className={`icon-button ${quiet?'is-on':''}`} onClick={() => setQuiet(!quiet)} aria-label="Less motion" aria-pressed={quiet}><Icon name="leaf"/><span>Less motion</span></button><button className="appointment-button" onClick={leave} aria-label="My appointment"><Icon name="wave"/><span className="appointment-long">My appointment</span><span className="appointment-short">Called?</span></button></div>
    </header>
    <main id="playroom-main" ref={mainRef} tabIndex={-1} className={active?'session-main':'library-main'}>
      {away ? <section className="goodbye"><span className="goodbye-icon"><Icon name="wave" size={70}/></span><h1>Go do your thing.</h1><p>Your game has stopped. You’re all set for your appointment.</p><button className="primary-button" onClick={() => setAway(false)}>Back to the playroom <Icon name="right"/></button><span>We’ll be here when you’re ready.</span></section>
      : active ? <GameSession key={active.id} game={active} quiet={quiet} overlayOpen={showData} onLeave={leave} onBack={() => setActive(null)}/>
      : help ? <section className="how-it-works"><h1>A little play.<br/>Whenever you need it.</h1><p>Pick a game, play a short round, and leave whenever you’re called.</p><div className="how-grid">{[['clock','Short by design','Every round ends within one to three minutes of active play. No automatic next round.'],['wave','Your appointment comes first','Tap My appointment to stop instantly. No countdown to leave and no progress to protect.'],['leaf','Play your way','Sound starts off. Less motion keeps effects calm. Every game works while seated, with touch or a keyboard.'],['heart','Just you and the game','No accounts, chat, ads, purchases, or public scores. Anonymous play counters stay on this device.']].map(([icon,title,body])=><article key={title}><Icon name={icon} size={32}/><h2>{title}</h2><p>{body}</p></article>)}</div><button className="primary-button" onClick={()=>setHelp(false)}>Find your game <Icon name="right"/></button></section>
      : <>
        <section className="welcome-row"><div><h1>Make room for <span>play<svg viewBox="0 0 170 15" aria-hidden="true"><path d="M4 9Q80 0 165 8M40 13Q100 7 145 11"/></svg></span>.</h1><p>A little adventure while you wait. What’s your mood?</p></div><div className="no-pressure"><Icon name="heart" size={20} weight="fill"/><span>Small games. Big good vibes.<br/><strong>Always okay to stop.</strong></span></div></section>
        <div className="category-row" role="group" aria-label="Filter games">{categories.map((c,i)=><button key={c} className={`category ${category===c?'active':''}`} aria-pressed={category===c} onClick={()=>setCategory(c)}><Icon name={['game','planet','puzzle','leaf','users'][i]!}/>{c}{c==='3D adventures'?<span className="new-dot"/>:null}</button>)}</div>
        {category==='All games' && <section className="featured-grid" aria-label="Featured adventures"><article className="feature-card feature-sky"><img src="/art/sky.webp" alt="A mint hoverboard on a floating track above the clouds" fetchPriority="high"/><div className="feature-shade"/><div className="feature-content"><h2>Sky Dash</h2><p>Your next adventure<br/>is up in the clouds.</p><button className="feature-play" onClick={()=>launch(gameList[0]!)}><Icon name="play" size={19} weight="fill"/> Let’s fly <span>75 sec</span></button></div><span className="feature-corner">A tiny escape <Icon name="sparkle" size={16}/></span></article><article className="feature-card feature-orbit"><img src="/art/orbit.webp" alt="A headphone-wearing robot among colorful planets"/><div className="feature-shade"/><div className="feature-content"><h2>Orbit Pop</h2><p>A whole universe.<br/>One little minute.</p><button className="feature-play" onClick={()=>launch(gameList[1]!)}><Icon name="play" size={19} weight="fill"/> Let’s pop <span>60 sec</span></button></div></article></section>}
        <section className="games-section" aria-label="Game library"><div className="section-heading"><h2>{category==='All games'?'Find your kind of fun':category}</h2><span>{visible.length} little adventures <Icon name="sparkle" size={18}/></span></div><div className="game-grid">{visible.map(game=><button key={game.id} className={`game-card theme-${game.color}`} onClick={()=>launch(game)} aria-label={`Play ${game.name}`}><div className="game-cover"><GameCover game={game}/>{['sky','orbit'].includes(game.id)&&<span className="dimension-label">3D</span>}<span className="card-play"><Icon name="play" weight="fill"/></span></div><div className="game-card-copy"><h3>{game.name}</h3><p>{game.hint}</p><div className="card-meta"><span><Icon name="clock" size={15}/>{game.tag}</span><span>{game.category==='Chill zone'?'Easygoing':game.category==='Play together'?'1–2 players':game.category==='3D adventures'?'Adventure':'Brain teaser'}</span></div></div></button>)}</div></section>
        <aside className="leave-strip"><span className="strip-icon"><Icon name="wave" size={30}/></span><div><h2>Name called? You’re good to go.</h2><p>Every game is a little moment, not a commitment. Stop anytime.</p></div><span className="strip-doodle"><Icon name="heart" size={31}/></span></aside>
      </>}
    </main>
    <footer className="app-footer"><span><Icon name="heart" size={17}/> Made for a brighter wait.</span><div><a href="#brief">Design brief</a><button onClick={()=>setShowData(true)}>Pilot data</button><button className="mobile-help" onClick={()=>{setHelp(true);setActive(null);setAway(false)}}>How it works</button><span>No ads. No accounts. Just play.</span></div></footer>
    {showData && <PilotData onClose={()=>setShowData(false)}/>}
  </div>
}
