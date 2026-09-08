import { useRef, useState } from 'react'
import { boardOver, computerMove, placeMark, winner, winningLine, type Mark } from '../logic'
import { useGame, useGameDelay } from '../useGame'
import { playCue } from '../sound'
export function TicTacToe({onFinish}:{onFinish:()=>void}){
  const {paused,finish}=useGame(),[together,setTogether]=useState(false),[board,setBoard]=useState<Mark[]>(Array(9).fill(null)),[turn,setTurn]=useState<'X'|'O'>('X'),[started,setStarted]=useState(false),live=useRef(board)
  const done=boardOver(board),thinking=!together&&turn==='O'&&!done
  const commit=(next:Mark[])=>{live.current=next;setBoard(next);if(boardOver(next)){playCue('finish');const won=winner(next);finish(won?`${won==='X'?'You':together?'Player O':'The app'} made three in a row.`:'A draw. Well matched.');onFinish()}}
  useGameDelay(()=>{const index=computerMove(live.current);if(index!==null){commit(placeMark(live.current,index,'O'));setTurn('X')}},thinking?550:null,board.filter(Boolean).length)
  const place=(index:number)=>{if(paused||thinking||done)return;const next=placeMark(live.current,index,turn);if(next===live.current)return;setStarted(true);playCue('tap');commit(next);setTurn(turn==='X'?'O':'X')}
  const line=winningLine(board)
  return <div className="puzzle-area"><div className="mode-picker" role="group" aria-label="Players"><button aria-pressed={!together} disabled={started} onClick={()=>setTogether(false)}>With the app</button><button aria-pressed={together} disabled={started} onClick={()=>setTogether(true)}>Two players</button></div><p className="turn-label" aria-live="polite">{thinking?'The app is thinking…':together?`Player ${turn}, your turn.`:'Your turn. You are X.'}</p><div className="ttt-board" role="group" aria-label="Three in a row board">{board.map((mark,i)=><button className={`${mark==='O'?'mark-o':''} ${line?.includes(i)?'win':''}`} key={i} aria-label={mark?`Square ${i+1}: ${mark}`:`Empty square ${i+1}`} disabled={!!mark||done||thinking} onClick={()=>place(i)}>{mark}</button>)}</div><p className="control-note">One board. Three in a row. Everyone’s welcome.</p></div>
}
