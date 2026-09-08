import { useRef, useState } from 'react'
import { memoryDeal, memoryFlip } from '../logic'
import { useGame, useGameDelay } from '../useGame'
import { Icon } from '../Icons'
import { playCue } from '../sound'
export function Matching({onFinish}:{onFinish:()=>void}) {
  const {paused}=useGame(),[state,setState]=useState(()=>memoryDeal()),live=useRef(state)
  const update=(next:typeof state)=>{live.current=next;setState(next)}
  useGameDelay(()=>update({...live.current,open:[]}),state.open.length===2?900:null,state.turns)
  const flip=(index:number)=>{if(paused)return;const next=memoryFlip(live.current,index);if(next===live.current)return;update(next);playCue(next.matched.length===12?'finish':next.matched.length>state.matched.length?'match':'tap');if(next.matched.length===12)onFinish()}
  return <div className="puzzle-area"><div className="puzzle-status"><span><Icon name="cards"/> {state.matched.length/2} of 6 pairs</span><span>{state.turns} turns</span></div><div className="memory-board" role="group" aria-label="Memory cards">{state.deck.map((kind,i)=>{const matched=state.matched.includes(i),open=matched||state.open.includes(i);return <button key={i} className={`memory-card ${open?'open':''} ${matched?'matched':''}`} onClick={()=>flip(i)} disabled={matched||state.open.includes(i)||state.open.length===2} aria-label={open?`Card ${i+1}: ${kind}${matched?', matched':''}`:`Hidden card ${i+1}`}><span>{open?<Icon name={kind} size={40} weight="fill"/>:'?'}</span>{matched&&<Icon className="matched-check" name="check" size={15}/>}</button>})}</div><p className="control-note" aria-live="polite">{state.open.length===2?`${state.deck[state.open[0]!]!} and ${state.deck[state.open[1]!]!}. Different pair. Take another look.`:state.open.length===1?`${state.deck[state.open[0]!]!} revealed. Choose a second card.`:`${state.matched.length/2} of 6 pairs found. Flip two cards.`}</p></div>
}
