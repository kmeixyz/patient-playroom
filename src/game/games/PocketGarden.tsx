import { useEffect, useRef, useState } from 'react'
import { Icon } from '../Icons'
import { playCue } from '../sound'
import { useGame } from '../useGame'
import { FlowerArt, flowerKinds, GardenArt, type Plant, type FlowerKind } from './gardenArt'

export function PocketGarden() {
  const { paused, finish, report } = useGame()
  const [plants, setPlants] = useState<Plant[]>([])
  const [pot, setPot] = useState(0)
  const [step, setStep] = useState(0)
  const [feedback, setFeedback] = useState('Every flower is a good choice.')
  const actionRef = useRef<HTMLButtonElement>(null)
  const choiceRef = useRef<HTMLButtonElement>(null)
  const keyboardAction = useRef(false)
  const pending = useRef(false)

  useEffect(() => {
    pending.current = false
    if (keyboardAction.current) {
      keyboardAction.current = false
      ;(step === 0 ? choiceRef.current : actionRef.current)?.focus({ preventScroll: true })
    }
  }, [step, pot])

  const grow = (keyboard: boolean, flower?: FlowerKind) => {
    if (paused || pending.current) return
    pending.current = true
    keyboardAction.current = keyboard
    if (step === 3) {
      if (pot === 2) { finish('A little garden, grown by you.', <GardenArt plants={plants}/>); return }
      setPot(pot + 1); setStep(0); setFeedback('One more pot. What will you plant?')
      return
    }
    const next = [...plants]
    next[pot] = { flower: flower ?? plants[pot]!.flower, stage: step + 1 }
    setPlants(next); setStep(step + 1)
    setFeedback(step === 0 ? 'Your seed is tucked in. Let’s give it water.' : step === 1 ? 'A little sprout! Now add some sunshine.' : 'Hello, flower! You helped it grow.')
    if (step === 2) { report(`${pot + 1} of 3 flowers grown`); playCue('match') }
  }

  return <div className="garden-game">
    <div className="mini-game-heading"><div><span className="eyebrow">Your Pocket Garden</span><h2>{['Choose a flower', 'Give it a drink', 'A little sunshine', pot === 2 ? 'Look what you grew!' : 'Your flower is blooming!'][step]}</h2></div><span className="mini-game-count"><Icon name="leaf"/>{pot + Number(step === 3)} / 3</span></div>
    <ol className="garden-steps" aria-label={`Pot ${pot + 1} growing steps`}>{['Plant', 'Water', 'Sunshine', 'Bloom'].map((label, i) => <li key={label} aria-current={i === step ? 'step' : undefined} className={i < step ? 'complete' : ''}><span aria-hidden="true">{i < step ? <Icon name="check" size={16}/> : i + 1}</span>{label}</li>)}</ol>
    <GardenArt plants={plants} active={pot}/>
    <p className="mini-game-feedback" role="status">{feedback}</p>
    {step === 0 ? <div className="picture-choices" role="group" aria-label="Choose your flower">{flowerKinds.map((flower, i) => <button key={flower} ref={i === 0 ? choiceRef : undefined} onClick={event => grow(event.detail === 0, flower)}><FlowerArt flower={flower}/><span>{flower}</span></button>)}</div>
      : <div className="garden-actions"><button key={step} ref={actionRef} className="primary-button" onClick={event => grow(event.detail === 0)}><Icon name={step === 1 ? 'water' : step === 2 ? 'sun' : pot === 2 ? 'check' : 'right'} size={28}/>{step === 1 ? 'Water my seed' : step === 2 ? 'Add sunshine' : pot === 2 ? 'All done' : 'Next flower'}</button></div>}
  </div>
}
