import { useRef, useState } from 'react'
import { CreatureIcon, creatureNames } from '../creatures'
import { Icon } from '../Icons'
import { playCue } from '../sound'
import { useGame } from '../useGame'
import { HatArt, hats, hatNames, places, placeNames, StudioPortrait, type Hat, type Place } from './playfulArt'

const friends = ['bunny', 'bear', 'dino'] as const
const steps = ['Pick a friend', 'Add a hat', 'Choose a place']
export function SillyStudio() {
  const { paused, finish, report } = useGame()
  const [friend, setFriend] = useState<typeof friends[number]>('bunny')
  const [hat, setHat] = useState<Hat>('sun')
  const [place, setPlace] = useState<Place>('garden')
  const [step, setStep] = useState(0)
  const [ready, setReady] = useState(false)
  const [message, setMessage] = useState('Start with a friend. Every choice is a good one.')
  const heading = useRef<HTMLHeadingElement>(null)
  const changingStep = useRef(false)
  const move = (next: number) => {
    if (paused || changingStep.current) return
    // Avoid a rapid double activation skipping a whole creative step.
    changingStep.current = true
    setStep(next)
    requestAnimationFrame(() => { changingStep.current = false; heading.current?.focus({ preventScroll: true }) })
  }
  const choose = (action: () => void, description: string) => {
    if (paused) return
    action(); setMessage(description); playCue('tap')
  }
  const showPortrait = () => {
    if (paused) return
    report(`${creatureNames[friend]} · ${hatNames[hat]} · ${placeNames[place]}`)
    setReady(true); setMessage('Made by you. A one-of-a-kind little friend!'); playCue('found')
    requestAnimationFrame(() => heading.current?.focus({ preventScroll: true }))
  }

  return <div className="studio-game">
    <div className="mini-game-heading"><div><span className="eyebrow">Silly Studio</span><h2 ref={heading} tabIndex={-1}>{ready ? `Meet your ${friend}!` : steps[step]}</h2></div><span className="mini-game-count">{ready ? <Icon name="heart"/> : `${step + 1} of 3`}</span></div>
    {!ready && <ol className="studio-steps" aria-label="Your portrait steps">{['Friend', 'Hat', 'Place'].map((label, i) => <li key={label} aria-current={i === step ? 'step' : undefined}><span aria-hidden="true">{i < step ? <Icon name="check" size={16}/> : i + 1}</span>{label}</li>)}</ol>}
    <div className={`studio-frame ${ready ? 'portrait-ready' : ''}`}><StudioPortrait friend={friend} hat={hat} place={place}/>{ready && <span className="portrait-caption"><Icon name="sparkle" size={18}/> Made by you</span>}</div>
    {!ready && <>
      <div className="studio-options" role="group" aria-label={steps[step]}>
        {step === 0 && friends.map(kind => <button key={kind} aria-pressed={kind === friend} aria-label={creatureNames[kind]} onClick={() => choose(() => setFriend(kind), `${creatureNames[kind]} is ready to dress up.`)}><span aria-hidden="true"><CreatureIcon kind={kind} size={55}/></span><span>{creatureNames[kind]}</span>{kind === friend && <Icon name="check" size={16}/>}</button>)}
        {step === 1 && hats.map(value => <button key={value} aria-pressed={value === hat} aria-label={hatNames[value]} onClick={() => choose(() => setHat(value), `${hatNames[value]}. Looking good!`)}><HatArt hat={value}/><span>{hatNames[value]}</span>{value === hat && <Icon name="check" size={16}/>}</button>)}
        {step === 2 && places.map(value => <button key={value} aria-pressed={value === place} aria-label={placeNames[value]} onClick={() => choose(() => setPlace(value), `Off to ${placeNames[value].toLowerCase()}!`)}><span className={`place-swatch place-${value}`} aria-hidden="true"><Icon name={value === 'space' ? 'planet' : value === 'beach' ? 'star' : 'leaf'} size={30}/></span><span>{placeNames[value]}</span>{value === place && <Icon name="check" size={16}/>}</button>)}
      </div>
      <div className="studio-actions">{step > 0 && <button className="secondary-button" onClick={() => move(step - 1)}><Icon name="back"/> Back</button>}<button className="primary-button" onClick={step === 2 ? showPortrait : () => move(step + 1)}>{step === 2 ? 'Meet my friend' : 'Next'}<Icon name={step === 2 ? 'sparkle' : 'right'}/></button></div>
    </>}
    {ready && <div className="studio-actions"><button className="secondary-button" onClick={() => { if (!paused) { setReady(false); move(0) } }}>Change it up</button><button className="primary-button" onClick={() => { if (!paused) finish('A little imagination. A wonderful new friend.', <StudioPortrait friend={friend} hat={hat} place={place}/>) }}>All done <Icon name="check"/></button></div>}
    <p className="mini-game-feedback" role="status">{message}</p>
  </div>
}
