import { useCallback, useEffect, useRef, useState, type ComponentType, type ReactNode } from 'react'
import { type GameEntry } from './gameList'
import { Icon } from './Icons'
import { RobotRoute } from './games/RobotRoute'
import { PlanetPost, PlanetPostCover } from './games/PlanetPost'
import { Matching } from './games/Matching'
import { PocketGarden } from './games/PocketGarden'
import { PuzzlePostcards } from './games/PuzzlePostcards'
import { PostcardArt, postcardScenes, type PostcardScene, type PieceCount } from './games/postcardArt'
import { GardenArt } from './games/gardenArt'
import { Bubbles } from './games/Bubbles'
import { BubbleArt } from './BubbleArt'
import { ColorLab } from './games/ColorLab'
import { PebbleSort } from './games/PebbleSort'
import { ColorLabArt, PebbleArt } from './games/DiscoveryArt'
import { RoundPace } from './RoundPace'
import { GameContext } from './useGame'
import { RoundClock } from './roundClock'
import { recordStart, recordFinish, recordTime } from './analytics'

type Phase='intro'|'playing'|'paused'|'done'
export type SessionStatus = 'ready' | 'playing' | 'done'
type SessionProps = {
  game: GameEntry; quiet: boolean; onBack: () => void
  overlayOpen?: boolean; visible?: boolean; quickStart?: boolean; resumeRequest?: number
  onStatusChange?: (status: SessionStatus) => void
}
export function GameSession({ game, quiet, onBack, overlayOpen=false, visible=true, quickStart=false, resumeRequest=0, onStatusChange }: SessionProps) {
  const [phase,setPhase]=useState<Phase>('intro'),[seconds,setSeconds]=useState(game.seconds),[message,setMessage]=useState(''),[round,setRound]=useState(0)
  const [ThreeGame,setThreeGame]=useState<ComponentType|null>(null),[loadError,setLoadError]=useState(false)
  const livePhase=useRef<Phase>('intro'),clock=useRef(new RoundClock(game.seconds*1000)),finished=useRef(false),countedTime=useRef(0),focusRef=useRef<HTMLDivElement>(null)
  const [optionsOpen,setOptionsOpen]=useState(false)
  const [confirmRestart, setConfirmRestart] = useState(false)
  const restartRef = useRef<HTMLButtonElement>(null)
  const restartPanel = useRef<HTMLDivElement>(null)
  const restartWasOpen = useRef(false)
  const quickStarted = useRef(false)
  const previousResume = useRef(resumeRequest)
  const previousOverlay = useRef(overlayOpen)
  useEffect(() => { onStatusChange?.(phase === 'intro' ? 'ready' : phase === 'done' ? 'done' : 'playing') }, [phase, onStatusChange])
  useEffect(() => {
    if (confirmRestart) restartPanel.current?.focus()
    else if (restartWasOpen.current && phase === 'paused') restartRef.current?.focus()
    restartWasOpen.current = confirmRestart
  }, [confirmRestart, phase])
  const [matchingPairs,setMatchingPairs]=useState<3|6>(3)
  const [relaxed,setRelaxed]=useState(game.id!=='sky')
  const [postcardScene,setPostcardScene]=useState<PostcardScene>('Ocean hello')
  const [postcardPieces,setPostcardPieces]=useState<PieceCount>(4)
  const resumeTarget=useRef<HTMLElement|null>(null)
  const canRelax=game.id!=='sky'
  const controls=game.id==='matching'&&relaxed?'Tap two cards. Look for the same picture on both. If the pictures are different, tap Turn them over to try again.':game.controls
  const [artwork,setArtwork]=useState<ReactNode>(null)
  const summary=useRef('')
  const report=useCallback((text:string)=>{summary.current=text},[])
  const is3D=game.id==='sky'
  const changePhase=useCallback((next:Phase)=>{livePhase.current=next;setPhase(next)},[])
  const flush=useCallback(()=>{const delta=clock.current.elapsed-countedTime.current;if(delta>=1000){recordTime(game.id,delta/1000);countedTime.current=clock.current.elapsed}},[game.id])
  const finish=useCallback((text?:string,art?:ReactNode)=>{if(finished.current||livePhase.current==='intro'||livePhase.current==='done')return;clock.current.pause(performance.now());finished.current=true;setArtwork(art??null);setMessage(text||'All done!');changePhase('done');recordFinish(game.id);flush()},[changePhase,flush,game.id])
  useEffect(()=>{if(!is3D)return;let cancelled=false;import('./games/ThreeGames').then(module=>{if(!cancelled)setThreeGame(()=>module.ThreeGame)}).catch(()=>{if(!cancelled)setLoadError(true)});return()=>{cancelled=true}},[is3D])
  useEffect(()=>{if(phase!=='playing')return;clock.current.resume(performance.now());const tick=()=>{const elapsed=clock.current.tick(performance.now());if(Number.isFinite(clock.current.limit))setSeconds(Math.max(0,Math.ceil((clock.current.limit-elapsed)/1000)));if(clock.current.done)finish(game.id==='sky'?'You landed. Nice ride.':'Time’s up!')};const interval=setInterval(tick,100);return()=>{clearInterval(interval);clock.current.pause(performance.now());flush()}},[phase,finish,flush,game.id])
  const pause=useCallback(()=>{if(livePhase.current==='playing'){clock.current.pause(performance.now());changePhase('paused')}},[changePhase])
  useEffect(()=>{if(overlayOpen)pause()},[overlayOpen,pause])
  useEffect(()=>{const hidden=()=>{if(document.hidden)pause()};const key=(e:KeyboardEvent)=>{if(e.key==='Escape'&&livePhase.current==='playing'&&!(e.target instanceof Element&&e.target.closest('dialog'))){e.preventDefault();pause()}};window.addEventListener('blur',pause);document.addEventListener('visibilitychange',hidden);window.addEventListener('keydown',key);window.addEventListener('pagehide',pause);return()=>{window.removeEventListener('blur',pause);document.removeEventListener('visibilitychange',hidden);window.removeEventListener('keydown',key);window.removeEventListener('pagehide',pause);clock.current.pause(performance.now());flush()}},[pause,flush])
  useEffect(() => {
    const closedOverlay = previousOverlay.current && !overlayOpen
    previousOverlay.current = overlayOpen
    // Native dialogs restore focus to Help or Settings when they close.
    if (overlayOpen || !visible || closedOverlay) return
    if (phase !== 'playing') {
      focusRef.current?.focus({ preventScroll: true })
      return
    }
    const firstControl = document.querySelector<HTMLElement>('.game-surface [tabindex="0"], .game-surface button:not(:disabled):not([aria-disabled="true"])')
    const previous = resumeTarget.current
    resumeTarget.current = null
    if (previous?.isConnected && !previous.matches(':disabled,[aria-disabled="true"]')) previous.focus()
    else firstControl?.focus()
  }, [phase, overlayOpen, visible])
  const start=useCallback(()=>{setConfirmRestart(false);window.scrollTo(0,0);finished.current=false;setArtwork(null);clock.current=new RoundClock(relaxed?Infinity:game.seconds*1000);countedTime.current=0;setSeconds(game.seconds);setMessage('');summary.current='';resumeTarget.current=null;recordStart(game.id);changePhase('playing')}, [relaxed, game.seconds, game.id, changePhase])
  useEffect(() => {
    if (quickStart && !quickStarted.current) { quickStarted.current = true; start() }
  }, [quickStart, start])
  useEffect(() => {
    if (resumeRequest === previousResume.current || !visible || overlayOpen) return
    previousResume.current = resumeRequest
    if (livePhase.current === 'paused') { setConfirmRestart(false); changePhase('playing') }
  }, [resumeRequest, visible, overlayOpen, changePhase])
  const prepareAgain=()=>{window.scrollTo(0,0);setOptionsOpen(true);setRound(n=>n+1);changePhase('intro')}
  const playAgain=()=>{setRound(n=>n+1);start()}
  const activeGame=()=>{switch(game.id){case'planetpost':return <PlanetPost/>;case'colors':return <ColorLab/>;case'pebbles':return <PebbleSort/>;case'robot':return <RobotRoute/>;case'bubbles':return <Bubbles/>;case'matching':return <Matching pairs={matchingPairs} onFinish={()=>finish(matchingPairs===3?'You found all 3 pairs!':'You found all 6 pairs!')}/>;case'postcards':return <PuzzlePostcards scene={postcardScene} count={postcardPieces}/>;case'garden':return <PocketGarden/>;case'sky':return ThreeGame?<ThreeGame/>:null}}
  return <section className={`session theme-${game.color} ${is3D ? "adventure-session" : ""}`} data-game={game.id}>
    <div className="session-heading"><button className="text-button" onClick={onBack}><Icon name="back"/> All games</button><div><h1>{game.name}</h1></div><button hidden={phase!=="playing"} className="secondary-button pause-button" aria-label="Pause" aria-describedby="pause-help" onClick={pause} disabled={phase!=='playing'}><Icon name="pause"/><span>Pause<small id="pause-help">Help &amp; break</small></span></button></div>
    {phase==='intro'?<div className="round-intro" ref={focusRef} tabIndex={-1}>{is3D||game.id==='robot'?<img className="intro-art" src={`/art/${game.id}.webp`} alt=""/>:game.id==='planetpost'?<div className="intro-picture intro-post"><PlanetPostCover/></div>:game.id==='bubbles'?<div className="intro-bubbles"><BubbleArt/></div>:game.id==='colors'?<div className="intro-picture intro-colors"><ColorLabArt/></div>:game.id==='pebbles'?<div className="intro-picture intro-pebbles"><PebbleArt/></div>:game.id==='garden'?<div className="intro-picture"><GardenArt/></div>:game.id==='postcards'?<div className="intro-picture"><PostcardArt scene={postcardScene}/></div>:<span className="intro-icon"><Icon name={game.icon} size={70}/></span>}<div className="intro-copy"><p className="intro-goal">{game.mission}</p><ol className="play-steps" aria-label="How to play">{game.steps.map(step=><li key={step}>{step}</li>)}</ol><div className="start-block"><button className="primary-button" onClick={start} disabled={is3D&&!ThreeGame}><Icon name="play" weight="fill"/>{is3D&&!ThreeGame?loadError?'Couldn’t load game':'Loading…':'Start playing'}</button><span><Icon name={relaxed?'leaf':'clock'} size={16}/>{relaxed?'No timer. Play as long as you want.':game.tag}</span></div><details className="intro-help"><summary><Icon name="info" size={18}/> More help</summary><p>{controls}</p></details>{canRelax&&<details className="game-options" open={optionsOpen} onToggle={event=>setOptionsOpen(event.currentTarget.open)}><summary><Icon name="settings" size={18}/> Game options</summary><div className="game-options-content">{game.id==='postcards'&&<div className="postcard-setup"><fieldset><legend>Picture</legend><div className="postcard-scenes">{postcardScenes.map(scene=><button key={scene} aria-pressed={postcardScene===scene} onClick={()=>setPostcardScene(scene)}><PostcardArt scene={scene} decorative/><span>{scene}{postcardScene===scene&&<Icon name="check" size={16}/>}</span></button>)}</div></fieldset><fieldset className="matching-level"><legend>Pieces</legend><div>{([4,6] as const).map(count=><button key={count} aria-pressed={postcardPieces===count} onClick={()=>setPostcardPieces(count)}><Icon name="puzzle"/><span><strong>{count} pieces</strong></span>{postcardPieces===count&&<Icon name="check" size={18}/>}</button>)}</div></fieldset></div>}{canRelax&&<RoundPace relaxed={relaxed} onChange={setRelaxed} duration={game.tag}/>}{game.id==='matching'&&<fieldset className="matching-level"><legend>How many cards?</legend><div>{([3,6] as const).map(pairs=><button key={pairs} aria-pressed={matchingPairs===pairs} onClick={()=>setMatchingPairs(pairs)}><Icon name={pairs===3?'heart':'sparkle'}/><span><strong>{pairs * 2} cards</strong></span>{matchingPairs===pairs&&<Icon name="check" size={18}/>}</button>)}</div></fieldset>}</div></details>}{loadError&&<p role="alert">Couldn’t load this game. Choose All games to try another.</p>}</div></div>
    :phase==='done'?<div className="round-result" tabIndex={-1} ref={focusRef}>{artwork?<div className="result-art">{artwork}</div>:<div className="result-icon"><Icon name="check" size={60}/></div>}<h2>{message}</h2>{summary.current&&<strong className="result-summary">{summary.current}</strong>}<div className="result-actions"><button className="primary-button" onClick={playAgain}><Icon name="restart"/> Play again</button></div>{canRelax&&<button className="text-button" onClick={prepareAgain}>Change game options</button>}</div>
    :<GameContext.Provider value={{paused:phase!=='playing',quiet,relaxed,finish,report}}><aside className="game-guide" aria-labelledby="game-guide-title"><h2 id="game-guide-title">How to play</h2><ol className="play-steps" aria-label="How to play">{game.steps.map(step=><li key={step}>{step}</li>)}</ol></aside><div className={`play-shell ${phase==='paused'?'is-paused':''}`}><div className="round-bar" hidden={relaxed}><span>Time left</span>{!relaxed&&<span className="round-time" role="timer" aria-live="off" aria-label={`${seconds} seconds remaining`}><Icon name="clock" size={18}/>{Math.floor(seconds/60)}:{String(seconds%60).padStart(2,'0')}</span>}</div>{!relaxed&&<div className="round-progress" role="progressbar" aria-label="Round time remaining" aria-valuemin={0} aria-valuemax={game.seconds} aria-valuenow={seconds}><span style={{width:`${seconds/game.seconds*100}%`}}/></div>}<div className="game-surface" key={round} inert={phase==='paused'} onFocusCapture={event=>{resumeTarget.current=event.target as HTMLElement}}>{activeGame()}</div>{phase==='paused'&&<div className="pause-overlay" ref={focusRef} tabIndex={-1} role="region" aria-label="Game paused"><span className="pause-icon"><Icon name="pause" size={44}/></span><h2>Your game is paused</h2><p>Your game will wait. Tap Keep playing when you are ready.</p><button className="primary-button" onClick={()=>{setConfirmRestart(false);changePhase('playing')}}><Icon name="play" weight="fill"/> Keep playing</button>{confirmRestart ? <div className="restart-confirm" ref={restartPanel} tabIndex={-1} role="group" aria-label="Start this game over?"><strong>Start this game over?</strong><p>This starts the game from the beginning. Your moves will be cleared.</p><div><button className="secondary-button" onClick={() => { setConfirmRestart(false) }}>Cancel</button><button className="primary-button" onClick={playAgain}>Yes, start over</button></div>{canRelax&&<button className="text-button" onClick={()=>{setConfirmRestart(false);prepareAgain()}}>Choose options first</button>}</div> : <button ref={restartRef} className="secondary-button" onClick={() => setConfirmRestart(true)}><Icon name="restart"/> Start over</button>}{relaxed&&!confirmRestart&&<button className="text-button" onClick={()=>finish('All done!')}><Icon name="check"/> Finish game</button>}</div>}</div></GameContext.Provider>}
  </section>
}
