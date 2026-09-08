/** Pure game rules. Randomness is injectable so invariants can be tested across seeds. */
export type RNG = () => number
export type Point = { x: number; y: number }
export type Direction = 'up' | 'down' | 'left' | 'right'
export const deltas: Record<Direction, Point> = { up: {x:0,y:-1}, down:{x:0,y:1}, left:{x:-1,y:0}, right:{x:1,y:0} }
export function seeded(seed: number): RNG { let t = seed >>> 0; return () => { t += 0x6D2B79F5; let n = Math.imul(t ^ t >>> 15, 1 | t); n ^= n + Math.imul(n ^ n >>> 7, 61 | n); return ((n ^ n >>> 14) >>> 0) / 4294967296 } }
export function shuffle<T>(items: readonly T[], rng: RNG = Math.random): T[] { const a=[...items]; for(let i=a.length-1;i>0;i--){const j=Math.floor(rng()*(i+1));[a[i],a[j]]=[a[j]!,a[i]!]}return a }
export const same = (a: Point,b: Point) => a.x===b.x && a.y===b.y
export function makeMaze(cells=5,rng: RNG=Math.random) {
  const size=cells*2+1, walls=Array.from({length:size},()=>Array<boolean>(size).fill(true))
  const stack:Point[]=[{x:1,y:1}];walls[1]![1]=false
  while(stack.length){ const at=stack[stack.length-1]!; const options=Object.values(deltas).map(d=>({x:at.x+d.x*2,y:at.y+d.y*2})).filter(p=>p.x>0&&p.y>0&&p.x<size-1&&p.y<size-1&&walls[p.y]![p.x]); if(!options.length){stack.pop();continue}const next=options[Math.floor(rng()*options.length)]!;walls[(at.y+next.y)/2]![(at.x+next.x)/2]=false;walls[next.y]![next.x]=false;stack.push(next) }
  return walls
}
export function mazeMove(walls:boolean[][],at:Point,direction:Direction):Point {const d=deltas[direction],next={x:at.x+d.x,y:at.y+d.y};return walls[next.y]?.[next.x]===false?next:at}
export function mazePath(walls:boolean[][],from:Point,to:Point):Point[]{const queue=[from],previous=new Map<string,Point|null>([[`${from.x},${from.y}`,null]]);let head=0;while(head<queue.length){const at=queue[head++]!;if(same(at,to)){const path:Point[]=[];let cursor:Point|null=at;while(cursor){path.unshift(cursor);cursor=previous.get(`${cursor.x},${cursor.y}`)??null}return path}for(const d of Object.keys(deltas) as Direction[]){const next=mazeMove(walls,at,d);const key=`${next.x},${next.y}`;if(!previous.has(key)){previous.set(key,at);queue.push(next)}}}return []}

export type Mark = 'X' | 'O' | null
export const lines = [[0,1,2],[3,4,5],[6,7,8],[0,3,6],[1,4,7],[2,5,8],[0,4,8],[2,4,6]]
export function winningLine(board:Mark[]):number[]|null {return lines.find(([a,b,c])=>board[a!] && board[a!]===board[b!] && board[a!]===board[c!])??null}
export function winner(board:Mark[]):Mark {const line=winningLine(board);return line?board[line[0]!]!:null}
export function boardOver(board:Mark[]){return !!winner(board)||board.every(Boolean)}
export function placeMark(board:Mark[],index:number,mark:Exclude<Mark,null>):Mark[]{if(index<0||index>8||board[index]||boardOver(board))return board;const next=[...board];next[index]=mark;return next}
export function computerMove(board:Mark[],rng:RNG=Math.random):number|null {if(boardOver(board))return null;const empty=board.map((v,i)=>v===null?i:-1).filter(i=>i>=0);for(const mark of ['O','X'] as const){const win=empty.find(i=>winner(placeMark(board,i,mark))===mark);if(win!==undefined)return win}if(!board[4])return 4;return empty[Math.floor(rng()*empty.length)]!}

export type MemoryState={deck:string[];open:number[];matched:number[];turns:number}
export function memoryDeal(rng:RNG=Math.random):MemoryState{return{deck:shuffle(['star','heart','planet','leaf','music','gem'].flatMap(k=>[k,k]),rng),open:[],matched:[],turns:0}}
export function memoryFlip(state:MemoryState,index:number):MemoryState {if(index<0||index>=state.deck.length||state.open.length>=2||state.open.includes(index)||state.matched.includes(index))return state;const open=[...state.open,index];if(open.length===1)return{...state,open};if(state.deck[open[0]!]===state.deck[index])return{...state,open:[],matched:[...state.matched,...open],turns:state.turns+1};return{...state,open,turns:state.turns+1}}

export function mergeLine(values:number[]):{line:number[];score:number}{const packed=values.filter(Boolean),line:number[]=[];let score=0;for(let i=0;i<packed.length;i++){if(packed[i]===packed[i+1]){const n=packed[i]!*2;line.push(n);score+=n;i++}else line.push(packed[i]!)}while(line.length<values.length)line.push(0);return{line,score}}
export function slideBoard(board:number[],direction:Direction){const next=[...board];let score=0;for(let n=0;n<4;n++){const indices=Array.from({length:4},(_,i)=>direction==='left'?n*4+i:direction==='right'?n*4+3-i:direction==='up'?i*4+n:(3-i)*4+n);const merged=mergeLine(indices.map(i=>board[i]!));score+=merged.score;indices.forEach((index,i)=>{next[index]=merged.line[i]!})}return{board:next,score,moved:next.some((v,i)=>v!==board[i])}}
export function spawnTile(board:number[],rng:RNG=Math.random){const empty=board.map((n,i)=>n===0?i:-1).filter(i=>i>=0);if(!empty.length)return board;const next=[...board];next[empty[Math.floor(rng()*empty.length)]!]=rng()<.9?2:4;return next}
export function canSlide(board:number[]){return(['up','down','left','right']as Direction[]).some(d=>slideBoard(board,d).moved)}
export function newMerge(rng:RNG=Math.random){return spawnTile(spawnTile(Array(16).fill(0),rng),rng)}

export const spaceWords=['MOON','STAR','ORBIT','COMET','MARS']
export type WordPuzzle={size:number;letters:string[];placements:Record<string,number[]>}
export function makeWords(rng:RNG=Math.random):WordPuzzle {const size=7,letters=Array<string>(size*size).fill(''),placements:Record<string,number[]>={};const vectors=[[-1,-1],[-1,0],[-1,1],[0,-1],[0,1],[1,-1],[1,0],[1,1]];for(const word of [...spaceWords].sort((a,b)=>b.length-a.length)){const options:number[][]=[];for(let y=0;y<size;y++)for(let x=0;x<size;x++)for(const[dx,dy]of vectors){const cells=Array.from(word,(_,i)=>({x:x+dx!*i,y:y+dy!*i}));if(cells.every((p,i)=>p.x>=0&&p.y>=0&&p.x<size&&p.y<size&&(!letters[p.y*size+p.x]||letters[p.y*size+p.x]===word[i])))options.push(cells.map(p=>p.y*size+p.x))}if(!options.length)throw new Error('Word puzzle cannot place all words');const indices=options[Math.floor(rng()*options.length)]!;indices.forEach((n,i)=>letters[n]=word[i]!);placements[word]=indices}return{size,letters:letters.map(l=>l||'ABCDEFGHIJKLMNOPQRSTUVWXYZ'[Math.floor(rng()*26)]!),placements}}
export function wordSelection(puzzle:WordPuzzle,from:number,to:number):number[]{const size=puzzle.size;if(from<0||to<0||from>=size*size||to>=size*size)return[];const x1=from%size,y1=Math.floor(from/size),x2=to%size,y2=Math.floor(to/size);const dx=x2-x1,dy=y2-y1;if(dx!==0&&dy!==0&&Math.abs(dx)!==Math.abs(dy))return[];return Array.from({length:Math.max(Math.abs(dx),Math.abs(dy))+1},(_,i)=>(y1+Math.sign(dy)*i)*size+x1+Math.sign(dx)*i)}
export function selectedWord(puzzle:WordPuzzle,from:number,to:number):string|null{const text=wordSelection(puzzle,from,to).map(i=>puzzle.letters[i]).join('');return spaceWords.find(word=>word===text||word===text.split('').reverse().join(''))??null}

export type SkyItem={id:number;lane:number;distance:number;kind:'gem'|'block';hit:boolean}
export type SkyState={distance:number;lane:number;score:number;gems:number;bumps:number;combo:number;air:number;cooldown:number;items:SkyItem[]}
export function makeSky(rng:RNG=Math.random):SkyState {const items:SkyItem[]=[];for(let row=0;row<110;row++){const lane=Math.floor(rng()*3)-1;items.push({id:row*2,lane,distance:16+row*9,kind:'gem',hit:false});if(row%3===2)items.push({id:row*2+1,lane:lane===1?-1:lane+1,distance:16+row*9,kind:'block',hit:false})}return{distance:0,lane:0,score:0,gems:0,bumps:0,combo:0,air:0,cooldown:0,items}}
export function skyLane(state:SkyState,d:number):SkyState{return{...state,lane:Math.max(-1,Math.min(1,state.lane+d))}}
export function skyJump(state:SkyState):SkyState{return state.cooldown>0?state:{...state,air:.8,cooldown:1.15}}
export function advanceSky(state:SkyState,dt:number,speed=10):SkyState {if(!Number.isFinite(dt)||dt<=0)return state;const next={...state,distance:state.distance+dt*speed,air:Math.max(0,state.air-dt),cooldown:Math.max(0,state.cooldown-dt)};next.items=state.items.map(item=>{if(item.hit||item.distance<=state.distance||item.distance>next.distance||item.lane!==state.lane)return item;if(item.kind==='gem'){next.gems++;next.combo++;next.score+=10*Math.min(3,Math.floor((next.combo-1)/4)+1)}else {const hitAt=(item.distance-state.distance)/speed;if(state.air-hitAt<=.12){next.bumps++;next.combo=0}}return{...item,hit:true}});return next}
export type OrbitState={popped:number;bonus:number;slots:number[];lastPop:number;lastSlot:number}
export const orbitBonusSlot=(popped:number)=>(popped*5+2)%6
export function newOrbit():OrbitState{return{popped:0,bonus:0,slots:[0,1,2,3,4,5],lastPop:-Infinity,lastSlot:-1}}
export function popOrbit(state:OrbitState,id:number,now:number):OrbitState{const slot=state.slots.indexOf(id);if(slot===-1||state.popped>=18||!Number.isFinite(now)||(slot===state.lastSlot&&now-state.lastPop<150))return state;const slots=[...state.slots];slots[slot]=6+state.popped;return{popped:state.popped+1,bonus:state.bonus+(slot===orbitBonusSlot(state.popped)?1:0),slots,lastPop:now,lastSlot:slot}}
