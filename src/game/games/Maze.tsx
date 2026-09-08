import { useRef, useState } from 'react'
import { makeMaze, mazeMove, mazePath, same, type Direction, type Point } from '../logic'
import { DirectionPad, useBoardInput } from '../Controls'
import { useGame } from '../useGame'
import { Icon } from '../Icons'
import { playCue } from '../sound'
export function Maze({onFinish}:{onFinish:()=>void}) {
  const {paused}=useGame(), [walls]=useState(()=>makeMaze()),[at,setAt]=useState<Point>({x:1,y:1}),[hint,setHint]=useState<Point|null>(null),[steps,setSteps]=useState(0)
  const position=useRef(at),done=useRef(false),size=walls.length,goal={x:size-2,y:size-2}
  const move=(d:Direction)=>{if(paused||done.current)return;const next=mazeMove(walls,position.current,d);if(same(position.current,next))return;position.current=next;setAt(next);setSteps(n=>n+1);setHint(null);if(same(next,goal)){done.current=true;playCue('finish');onFinish()}}
  const input=useBoardInput(move)
  return <div className="puzzle-area"><div className="puzzle-status"><span><Icon name="flag"/> Find the flag</span><span>{steps} {steps===1?'step':'steps'}</span></div><div className="maze-board" role="group" aria-label="Maze. Use arrow keys to reach the flag." tabIndex={0} {...input} style={{gridTemplateColumns:`repeat(${size},1fr)`}}>{walls.flatMap((row,y)=>row.map((wall,x)=><span key={`${x}-${y}`} data-x={x} data-y={y} data-wall={wall} className={`maze-tile ${wall?'wall':''} ${hint&&same(hint,{x,y})?'hint':''} ${same(at,{x,y})?'player':''}`}>
    {same(at,{x,y})?<Icon name="star" weight="fill" size={23}/>:same(goal,{x,y})?<Icon name="flag" weight="fill" size={23}/>:hint&&same(hint,{x,y})?<Icon name="sparkle" size={17}/>:null}</span>))}</div><div className="board-actions"><DirectionPad onMove={move}/><button className="secondary-button" onClick={()=>setHint(mazePath(walls,position.current,goal)[1]??null)}><Icon name="sparkle"/> Hint</button></div><p className="control-note">Swipe one step, use the arrows, or press W A S D.</p><p className="sr-only" aria-live="polite">Row {at.y}, column {at.x}{hint?`. Next step: row ${hint.y}, column ${hint.x}`:''}</p></div>
}
