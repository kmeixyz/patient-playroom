import { useRef, useState } from 'react'
import { canSlide, newMerge, slideBoard, spawnTile, type Direction } from '../logic'
import { DirectionPad, useBoardInput } from '../Controls'
import { useGame } from '../useGame'
import { Icon } from '../Icons'
import { playCue } from '../sound'
export function Merge(){
  const {paused,finish}=useGame(),[board,setBoard]=useState(()=>newMerge()),[score,setScore]=useState(0),[previous,setPrevious]=useState<{board:number[];score:number}|null>(null),live=useRef({board,score}),[stuck,setStuck]=useState(false)
  const move=(direction:Direction)=>{if(paused)return;const current=live.current;const result=slideBoard(current.board,direction);if(!result.moved)return;setPrevious(current);const next={board:spawnTile(result.board),score:current.score+result.score};live.current=next;setBoard(next.board);setScore(next.score);playCue(result.score?'match':'tap');if(next.board.some(n=>n>=128)){finish('You made 128. That’s a wrap.');return}setStuck(!canSlide(next.board))}
  const input=useBoardInput(move)
  const undo=()=>{if(!previous||paused)return;live.current=previous;setBoard(previous.board);setScore(previous.score);setPrevious(null);setStuck(false)}
  return <div className="puzzle-area"><div className="puzzle-status"><span><Icon name="squares"/> Make 128</span><span>{score} points</span></div><div className="merge-board" role="group" aria-label="Number board. Use arrow keys to slide." tabIndex={0} {...input}>{board.map((n,i)=><span role="img" key={i} className={`merge-tile value-${n}`} aria-label={`Row ${Math.floor(i/4)+1} column ${i%4+1}: ${n||'empty'}`}>{n||''}</span>)}</div><div className="board-actions"><DirectionPad onMove={move}/><button className="secondary-button" onClick={undo} disabled={!previous}><Icon name="restart"/> Undo</button></div><p className="control-note" aria-live="polite">{stuck?'No moves left. Undo your last move or wrap up.':'Matching numbers combine once per move.'}</p>{stuck&&<button className="secondary-button" onClick={()=>finish(`Your biggest tile was ${Math.max(...board)}.`)}>Wrap up this round</button>}</div>
}
