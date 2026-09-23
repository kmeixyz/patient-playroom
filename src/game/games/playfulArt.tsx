import { CreatureShape, type CreatureKind } from '../creatures'

export const foods = ['apple', 'banana', 'strawberry'] as const
export type Food = typeof foods[number]

export function FoodArt({ food }: { food: Food }) {
  return <svg viewBox="0 0 100 100" aria-hidden="true">
    {food === 'apple' && <>
      <path d="M49 30C30 13 10 33 15 57c4 24 17 34 34 26 18 8 30-3 35-27 5-24-14-43-35-26Z" fill="#ee7764" stroke="#994b3e" strokeWidth="3"/>
      <path d="M49 31q-5-13 2-22" fill="none" stroke="#71513d" strokeWidth="5" strokeLinecap="round"/>
      <path d="M53 21Q57 5 76 12 70 28 53 21" fill="#679568"/>
      <path d="M28 37q-9 7-7 19" fill="none" stroke="#ffdad0" strokeWidth="7" strokeLinecap="round"/>
    </>}
    {food === 'banana' && <>
      <path d="M20 18C8 55 38 91 71 78c14-6 20-21 15-37-6 16-15 23-29 20C40 57 32 42 30 22Z" fill="#f6d675" stroke="#927332" strokeWidth="3"/>
      <path d="M25 30Q33 77 72 67" fill="none" stroke="#d5ac4d" strokeWidth="3" strokeLinecap="round"/>
      <path d="m20 18 2-9 9 2-1 11M86 41l-1-7" fill="none" stroke="#71553c" strokeWidth="6" strokeLinecap="round"/>
    </>}
    {food === 'strawberry' && <>
      <path d="M17 40C11 70 41 92 50 93c10-2 39-28 34-52C80 23 22 21 17 40Z" fill="#de6e83" stroke="#994455" strokeWidth="3"/>
      <path d="m50 32-25-8 13-4-2-14 15 12L66 5l-1 15 14 6-26 7Z" fill="#588a5c" stroke="#416844" strokeWidth="2"/>
      {[[31,44],[52,43],[70,45],[39,60],[61,60],[50,76]].map(([x,y]) => <ellipse key={`${x}-${y}`} cx={x} cy={y} rx="2" ry="4" fill="#fff1ce"/>) }
    </>}
  </svg>
}

export const hats = ['sun', 'party', 'crown'] as const
export type Hat = typeof hats[number]
export const hatNames: Record<Hat, string> = { sun: 'Sun hat', party: 'Party hat', crown: 'Crown' }
export const places = ['garden', 'space', 'beach'] as const
export type Place = typeof places[number]
export const placeNames: Record<Place, string> = { garden: 'Flower garden', space: 'Outer space', beach: 'Sunny beach' }

export function HatArt({ hat }: { hat: Hat }) {
  return <svg viewBox="0 0 100 65" aria-hidden="true">
    {hat === 'sun' && <><path d="M25 46 32 16q18-10 36 0l8 30" fill="#f6d482" stroke="#a6813c" strokeWidth="2.5"/><path d="M29 32h43l3 12H26Z" fill="#ee967d"/><ellipse cx="50" cy="47" rx="46" ry="10" fill="#f6d482" stroke="#a6813c" strokeWidth="2.5"/></>}
    {hat === 'party' && <><path d="m18 58 32-51 32 51Z" fill="#9686ce" stroke="#665592" strokeWidth="2.5"/><path d="m30 39 31-14M22 53l49-22" stroke="#e4d9fa" strokeWidth="7"/><circle cx="50" cy="8" r="7" fill="#f3b373"/></>}
    {hat === 'crown' && <><path d="m17 49-6-32 25 13L50 7l15 23 24-13-6 32Z" fill="#f5d475" stroke="#9a7635" strokeWidth="2.5"/><path d="M18 49h64v10H18Z" fill="#e9b653" stroke="#9a7635" strokeWidth="2"/><path d="m50 29 7 9-7 9-7-9Z" fill="#c76c85"/></>}
  </svg>
}

export function StudioPortrait({ friend = 'bunny', hat = 'party', place = 'garden' }: { friend?: CreatureKind; hat?: Hat; place?: Place }) {
  return <svg className="studio-portrait" viewBox="0 0 320 260" role="img" aria-label={`${friend} wearing a ${hatNames[hat].toLowerCase()} in ${placeNames[place].toLowerCase()}`}>
    <rect width="320" height="260" rx="24" fill={place === 'space' ? '#293a65' : place === 'beach' ? '#d8eef1' : '#e7efe2'}/>
    {place === 'garden' && <>
      <path d="M0 189Q80 149 160 182T320 178v82H0Z" fill="#c5dbc0"/>
      {[30,74,250,287].map((x,i) => <g key={x} transform={`translate(${x} ${189+i%2*35})`}><path d="M0 0v27" stroke="#638367" strokeWidth="3"/><path d="M0 19q-16-13-13 0" fill="#749771"/>{[0,72,144,216,288].map(a=><ellipse key={a} cy="-7" rx="5" ry="8" fill={i%2 ? '#fff7dc' : '#e6a3b6'} transform={`rotate(${a})`}/>)}<circle r="4" fill="#bf863b"/></g>)}
      <circle cx="267" cy="46" r="21" fill="#f5da88"/>
    </>}
    {place === 'space' && <>
      {[[28,46],[74,106],[264,80],[279,196],[36,172],[221,28]].map(([x,y])=><path key={`${x}-${y}`} d={`M${x} ${y-7}v14m-7-7h14`} stroke="#f5dc9e" strokeWidth="3" strokeLinecap="round"/>)}
      <ellipse cx="258" cy="139" rx="35" ry="10" fill="none" stroke="#afabde" strokeWidth="4" transform="rotate(-25 258 139)"/><circle cx="258" cy="139" r="18" fill="#d3b6db"/>
      <path d="M0 250q150-75 320 0v10H0Z" fill="#52618c"/>
    </>}
    {place === 'beach' && <>
      <circle cx="261" cy="46" r="24" fill="#efd286"/><path d="M0 161q40-12 80 0t80 0t80 0t80 0v99H0Z" fill="#8bc8d0"/><path d="M0 199q140-27 320 6v55H0Z" fill="#f1dfb6"/>
      <path d="M40 153V90m-28 8q28-51 56 0Z" fill="#e9a08e" stroke="#9d6d59" strokeWidth="3"/>
      <path d="m261 217 9-13 4 17 14 6-17 5-7 12-4-17-13-4Z" fill="#d18e69"/>
    </>}
    <ellipse cx="160" cy="226" rx="66" ry="10" fill={place === 'space' ? '#192a514d' : '#547c5226'}/>
    <g transform="translate(90 87) scale(1.4)"><CreatureShape kind={friend}/></g>
    <svg x="108" y={friend === 'bunny' ? 56 : 67} width="105" height="68" viewBox="0 0 100 65"><HatArt hat={hat}/></svg>
  </svg>
}

export function CafeCover() {
  return <div className="cafe-cover" aria-hidden="true"><span className="cafe-cover-friend"><svg viewBox="0 0 100 100"><CreatureShape kind="bear"/></svg></span><span className="cafe-cover-order"><FoodArt food="strawberry"/></span><span className="cafe-cover-plate"><FoodArt food="strawberry"/></span></div>
}
