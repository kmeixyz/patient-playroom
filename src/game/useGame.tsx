import { createContext, useContext, useEffect, useRef } from 'react'
export type GameRuntime={paused:boolean;quiet:boolean;finish:(message?:string)=>void;report:(summary:string)=>void}
export const GameContext=createContext<GameRuntime>({paused:false,quiet:false,finish:()=>{},report:()=>{}})
export const useGame=()=>useContext(GameContext)
/** A pause-aware delay: remaining time is preserved, including across StrictMode cleanup. */
export function useGameDelay(callback:()=>void,delay:number|null,identity:unknown){
  const {paused}=useGame();const fn=useRef(callback);fn.current=callback
  const remaining=useRef(delay??0),key=useRef(identity)
  if(key.current!==identity){key.current=identity;remaining.current=delay??0}
  useEffect(()=>{if(paused||delay===null)return;const start=performance.now();const timer=window.setTimeout(()=>{remaining.current=0;fn.current()},remaining.current);return()=>{clearTimeout(timer);remaining.current=Math.max(0,remaining.current-(performance.now()-start))}},[paused,delay,identity])
}
