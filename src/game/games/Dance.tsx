import { useEffect, useRef, useState } from 'react'
import { CreatureIcon } from '../creatures'
import { Icon } from '../Icons'
import { playNote } from '../sound'
import { useGame } from '../useGame'
const notes=[{label:'Bass',key:'1',note:130.81,icon:'music',kind:'cat'},{label:'Chime',key:'2',note:329.63,icon:'sparkle',kind:'bunny'},{label:'Pop',key:'3',note:392,icon:'heart',kind:'dino'},{label:'Glow',key:'4',note:523.25,icon:'star',kind:'owl'}]as const
export function Dance(){const{paused}=useGame(),[taps,setTaps]=useState(0),[selected,setSelected]=useState<number|null>(null),[beat,setBeat]=useState(0),action=useRef((_i:number)=>{})
  const tap=(i:number)=>{if(paused)return;setSelected(i);setBeat(n=>n+1);setTaps(n=>n+1);playNote(notes[i]!.note)};action.current=tap
  useEffect(()=>{const key=(e:KeyboardEvent)=>{if(e.altKey||e.ctrlKey||e.metaKey||e.repeat)return;const i=Number(e.key)-1;if(i>=0&&i<4){e.preventDefault();action.current(i)}};window.addEventListener('keydown',key);return()=>window.removeEventListener('keydown',key)},[])
  return <div className="puzzle-area beat-area"><div className="beat-friends" aria-hidden="true">{notes.map((n,i)=><span key={`${i}-${selected===i?beat:0}`} className={selected===i?'dancing':''}><CreatureIcon kind={n.kind} size={90}/></span>)}</div><h2>Make your own kind of music.</h2><p>Sound off? Your friends still feel the beat.</p><div className="beat-pads" role="group" aria-label="Music pads">{notes.map((n,i)=><button key={n.key} className={`beat-pad beat-${i} ${selected===i?'selected':''}`} onClick={()=>tap(i)} aria-label={`Play ${n.label}, key ${n.key}`}><Icon name={n.icon} size={38} weight="fill"/><strong>{n.label}</strong><span>{n.key}</span></button>)}</div><p className="control-note" aria-live="polite">{taps} beats, all yours.</p></div>
}
