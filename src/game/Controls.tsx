import { useRef } from 'react'
import type { KeyboardEvent, PointerEvent } from 'react'
import { Icon } from './Icons'
import type { Direction } from './logic'
export function keyDirection(key:string):Direction|null{return({ArrowUp:'up',w:'up',W:'up',ArrowDown:'down',s:'down',S:'down',ArrowLeft:'left',a:'left',A:'left',ArrowRight:'right',d:'right',D:'right'}as Record<string,Direction>)[key]??null}
export function DirectionPad({onMove}:{onMove:(direction:Direction)=>void}){return <div className="direction-pad" role="group" aria-label="Direction controls">{(['up','left','down','right']as Direction[]).map(d=><button className={`direction-${d}`} key={d} aria-label={`Move ${d}`} onClick={()=>onMove(d)}><Icon name={d==='left'?'back':d}/></button>)}</div>}
export function useBoardInput(onMove:(d:Direction)=>void){const origin=useRef<{x:number;y:number}|null>(null);return{onKeyDown:(e:KeyboardEvent)=>{const d=keyDirection(e.key);if(d){e.preventDefault();onMove(d)}},onPointerDown:(e:PointerEvent)=>{origin.current={x:e.clientX,y:e.clientY};e.currentTarget.setPointerCapture(e.pointerId)},onPointerUp:(e:PointerEvent)=>{const at=origin.current;origin.current=null;if(!at)return;const dx=e.clientX-at.x,dy=e.clientY-at.y;if(Math.max(Math.abs(dx),Math.abs(dy))<18)return;onMove(Math.abs(dx)>Math.abs(dy)?dx>0?'right':'left':dy>0?'down':'up')},onPointerCancel:()=>{origin.current=null}}}
