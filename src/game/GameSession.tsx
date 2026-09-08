import { useCallback, useEffect, useRef, useState, type ComponentType } from 'react'
import { type GameEntry } from './gameList'
import { Icon } from './Icons'
import { Maze } from './games/Maze'
import { Matching } from './games/Matching'
import { TicTacToe } from './games/TicTacToe'
import { Explore } from './games/Explore'
import { ISpy } from './games/ISpy'
import { Dance } from './games/Dance'
import { Merge } from './games/Merge'
import { Words } from './games/Words'
import { GameContext } from './useGame'
import { RoundClock } from './roundClock'
import { recordStart, recordFinish, recordTime } from './analytics'
import { setAudioPaused } from './sound'

type Phase='intro'|'playing'|'paused'|'done'
export function GameSession({ game, quiet, onBack, onLeave, overlayOpen=false }: {game: GameEntry; quiet: boolean; onLeave:()=>void; onBack:()=>void;overlayOpen?:boolean}) {
  const [phase,setPhase]=useState<Phase>('intro'),[seconds,setSeconds]=useState(game.seconds),[message,setMessage]=useState(''),[round,setRound]=useState(0)
  const [ThreeGame,setThreeGame]=useState<ComponentType<{kind:'sky'|'orbit'}>|null>(null),[loadError,setLoadError]=useState(false)
  const livePhase=useRef<Phase>('intro'),clock=useRef(new RoundClock(game.seconds*1000)),finished=useRef(false),countedTime=useRef(0),focusRef=useRef<HTMLDivElement>(null)
  const summary=useRef('')
  const report=useCallback((text:string)=>{summary.current=text},[])
  const is3D=game.id==='sky'||game.id==='orbit'
  const changePhase=useCallback((next:Phase)=>{livePhase.current=next;setPhase(next)},[])
  const flush=useCallback(()=>{const delta=clock.current.elapsed-countedTime.current;if(delta>=1000){recordTime(game.id,delta/1000);countedTime.current=clock.current.elapsed}},[game.id])
  const finish=useCallback((text?:string)=>{if(finished.current||livePhase.current==='intro'||livePhase.current==='done')return;clock.current.pause(performance.now());finished.current=true;setMessage(text||'A little adventure, complete.');changePhase('done');recordFinish(game.id);flush()},[changePhase,flush,game.id])
  useEffect(()=>{if(!is3D)return;let cancelled=false;import('./games/ThreeGames').then(module=>{if(!cancelled)setThreeGame(()=>module.ThreeGame)}).catch(()=>{if(!cancelled)setLoadError(true)});return()=>{cancelled=true}},[is3D])
  useEffect(()=>{setAudioPaused(phase!=='playing');return()=>setAudioPaused(true)},[phase])
  useEffect(()=>{if(phase!=='playing')return;clock.current.resume(performance.now());const tick=()=>{const elapsed=clock.current.tick(performance.now());setSeconds(Math.max(0,Math.ceil((clock.current.limit-elapsed)/1000)));if(clock.current.done)finish(game.id==='sky'?'You landed. Nice ride.':game.id==='dance'?'That’s your mini jam. Nicely played.':'That’s a wrap. Thanks for playing.')};const interval=setInterval(tick,100);return()=>{clearInterval(interval);clock.current.pause(performance.now());flush()}},[phase,finish,flush,game.id])
  const pause=useCallback(()=>{if(livePhase.current==='playing'){clock.current.pause(performance.now());changePhase('paused')}},[changePhase])
  useEffect(()=>{if(overlayOpen)pause()},[overlayOpen,pause])
  useEffect(()=>{const hidden=()=>{if(document.hidden)pause()};const key=(e:KeyboardEvent)=>{if(e.key==='Escape'&&livePhase.current==='playing'&&!(e.target instanceof Element&&e.target.closest('dialog'))){e.preventDefault();pause()}};window.addEventListener('blur',pause);document.addEventListener('visibilitychange',hidden);window.addEventListener('keydown',key);window.addEventListener('pagehide',pause);return()=>{window.removeEventListener('blur',pause);document.removeEventListener('visibilitychange',hidden);window.removeEventListener('keydown',key);window.removeEventListener('pagehide',pause);clock.current.pause(performance.now());flush()}},[pause,flush])
  useEffect(()=>{if(phase!=='playing')focusRef.current?.focus({preventScroll:true});else {const el=document.querySelector<HTMLElement>('.game-surface [tabindex="0"], .game-surface button:not(:disabled)');el?.focus()}},[phase])
  const start=()=>{finished.current=false;clock.current=new RoundClock(game.seconds*1000);countedTime.current=0;setSeconds(game.seconds);setMessage('');summary.current='';recordStart(game.id);changePhase('playing')}
  const prepareAgain=()=>{setRound(n=>n+1);changePhase('intro')}
  const activeGame=()=>{switch(game.id){case'maze':return <Maze onFinish={()=>finish('You found your way. Quest complete.')}/>;case'matching':return <Matching onFinish={()=>finish('All six pairs. A perfect match.')}/>;case'tictactoe':return <TicTacToe onFinish={()=>finish()}/>;case'merge':return <Merge/>;case'words':return <Words/>;case'explore':return <Explore onFinish={()=>finish('Every friend found. Nice exploring.')}/>;case'ispy':return <ISpy onFinish={()=>finish('All five friends found. Great eyes.')}/>;case'dance':return <Dance/>;case'sky':case'orbit':return ThreeGame?<ThreeGame kind={game.id}/>:null}}
  return <section className={`session theme-${game.color} ${is3D ? "adventure-session" : ""}`} data-game={game.id}>
    <div className="session-heading"><button className="text-button" onClick={onBack}><Icon name="back"/> All games</button><div><h1>{game.name}</h1><span>{game.category}</span></div><button hidden={phase!=="playing"} className="secondary-button pause-button" onClick={pause} disabled={phase!=='playing'}><Icon name="pause"/> Pause</button></div>
    {phase==='intro'?<div className="round-intro" ref={focusRef} tabIndex={-1}>{is3D?<img className="intro-art" src={`/art/${game.id}.webp`} alt=""/>:<span className="intro-icon"><Icon name={game.icon} size={70}/></span>}<div className="intro-copy"><h2>{game.id==='sky'?'Ready for a little airtime?':game.id==='orbit'?'Your universe is waiting.':'A little challenge, your way.'}</h2><p>{game.mission}</p><div className="intro-controls"><Icon name="tap"/><p>{game.controls}</p></div><div className="round-limit"><Icon name="clock"/> {game.tag} · Leave anytime</div><button className="primary-button" onClick={start} disabled={is3D&&!ThreeGame}><Icon name="play" weight="fill"/>{is3D&&!ThreeGame?loadError?'Adventure couldn’t load':'Getting your adventure ready…':'Start playing'}</button>{loadError&&<p role="alert">This 3D adventure couldn’t load. Go back and try one of the puzzles.</p>}<p className="intro-footnote">No streaks. No pressure. Your appointment comes first.</p></div></div>
    :phase==='done'?<div className="round-result" tabIndex={-1} ref={focusRef}><div className="result-icon"><Icon name="check" size={60}/></div><h2>{message}</h2>{summary.current&&<strong className="result-summary">{summary.current}</strong>}<p>A good moment to look up and check for your name.</p><div className="result-actions"><button className="primary-button" onClick={onLeave}><Icon name="wave"/> I’m heading out</button><button className="secondary-button" onClick={onBack}>All games <Icon name="right"/></button></div><button className="text-button" onClick={prepareAgain}>Still waiting? Set up another round</button></div>
    :<GameContext.Provider value={{paused:phase!=='playing',quiet,finish,report}}><div className="play-shell"><div className="round-bar"><span><Icon name={game.icon}/> One little adventure</span><span className="round-time" role="timer" aria-live="off" aria-label={`${seconds} seconds remaining`}><Icon name="clock" size={18}/>{Math.floor(seconds/60)}:{String(seconds%60).padStart(2,'0')}</span></div><div className="round-progress" role="progressbar" aria-label="Round time remaining" aria-valuemin={0} aria-valuemax={game.seconds} aria-valuenow={seconds}><span style={{width:`${seconds/game.seconds*100}%`}}/></div><div className="game-surface" key={round} inert={phase==='paused'}>{activeGame()}</div>{phase==='paused'&&<div className="pause-overlay" ref={focusRef} tabIndex={-1} role="region" aria-label="Game paused"><span className="pause-icon"><Icon name="pause" size={44}/></span><h2>Take your time.</h2><p>Your game and its clock are paused.</p><button className="primary-button" onClick={()=>changePhase('playing')}><Icon name="play" weight="fill"/> Keep playing</button><button className="secondary-button" onClick={onLeave}><Icon name="wave"/> My appointment</button></div>}</div><p className="session-reminder"><Icon name="wave" size={18}/> Name called? Tap <button onClick={onLeave}>My appointment</button> to stop right away.</p></GameContext.Provider>}
  </section>
}
