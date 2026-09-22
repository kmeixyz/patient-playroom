import { useEffect, useRef, useState } from 'react'
import { CreatureIcon, creatureNames, type CreatureKind } from '../creatures'
import { Icon } from '../Icons'
import { shuffle } from '../logic'
import { playCue } from '../sound'
import { useGame } from '../useGame'
import { FoodArt, foods, type Food } from './playfulArt'

const customers: CreatureKind[] = ['bunny', 'bear', 'dino', 'cat', 'owl', 'duck']
export function CritterCafe() {
  const { paused, finish, report } = useGame()
  const [orders] = useState(() => {
    const menu = shuffle([...foods, ...foods])
    return shuffle(customers).map((friend, i) => ({ friend, food: menu[i]! }))
  })
  const [index, setIndex] = useState(0)
  const [served, setServed] = useState(false)
  const [feedback, setFeedback] = useState('Look at the picture. Tap the matching snack.')
  const locked = useRef(false)
  const order = orders[index]!
  const count = index + Number(served)
  const choices = useRef<(HTMLButtonElement | null)[]>([])
  const nextButton = useRef<HTMLButtonElement>(null)
  const keyboardAction = useRef(false)
  const [showHint, setShowHint] = useState(false)

  useEffect(() => {
    if (!keyboardAction.current) return
    keyboardAction.current = false
    ;(served ? nextButton.current : choices.current[0])?.focus({ preventScroll: true })
  }, [served, index])

  const nextFriend = (fromKeyboard: boolean) => {
    if (paused || !served || !locked.current) return
    if (index === orders.length - 1) { finish('Six happy friends. Lovely serving!'); return }
    keyboardAction.current = fromKeyboard
    setIndex(index + 1); setServed(false); locked.current = false; setShowHint(false)
    setFeedback(`${creatureNames[orders[index + 1]!.friend]} is here! Find their snack.`)
  }

  const serve = (food: Food, fromKeyboard: boolean) => {
    if (paused || locked.current) return
    if (food !== order.food) {
      setShowHint(true)
      setFeedback(`That’s a ${food}. ${creatureNames[order.friend]} would like a ${order.food}. Have another look!`)
      return
    }
    keyboardAction.current = fromKeyboard
    locked.current = true; setServed(true)
    setFeedback(`Yum! Thank you, says ${creatureNames[order.friend]}.`)
    report(`${index + 1} of 6 friends served`)
    playCue(index === orders.length - 1 ? 'finish' : 'match')
  }

  return <div className="cafe-game">
    <div className="mini-game-heading"><div><span className="eyebrow">Your very own Critter Café</span><h2>What would you like?</h2></div><span className="mini-game-count"><Icon name="heart"/>{count} / 6</span></div>
    <div className="cafe-scene">
      <div className="cafe-awning" aria-hidden="true"/>
      <span className="cafe-welcome">Hello, {creatureNames[order.friend]}!</span>
      <div className={`cafe-customer ${served ? 'is-served' : ''}`}>
        <span aria-hidden="true"><CreatureIcon kind={order.friend} size={156}/></span>
        <div className="cafe-order" role="img" aria-label={served ? `${creatureNames[order.friend]} says thank you` : `${creatureNames[order.friend]} wants a ${order.food}`}>
          {served ? <Icon name="heart" size={62} weight="fill"/> : <FoodArt food={order.food}/>}
        </div>
      </div>
      <div className="cafe-counter"><span className="cafe-plate" aria-hidden="true">{served && <FoodArt food={order.food}/>}</span><span>{served ? 'One happy customer!' : 'A little snack. A big smile.'}</span></div>
    </div>
    <div className="snack-options" role="group" aria-label="Choose a snack">{foods.map((food, i) => <button key={food} ref={el => { choices.current[i] = el }} onClick={event => serve(food, event.detail === 0)} aria-disabled={served} aria-label={`Serve ${food}`} className={showHint && food === order.food && !served ? 'snack-hint' : ''}><FoodArt food={food}/><span>{food}</span>{showHint && food === order.food && !served && <small><Icon name="eye" size={16}/> Try this</small>}</button>)}</div>
    <p className="mini-game-feedback" role="status">{feedback}</p>
    <div className="cafe-actions"><button ref={nextButton} className="primary-button" disabled={!served} onClick={event => nextFriend(event.detail === 0)}>{index === orders.length - 1 ? 'All done' : 'Next friend'}<Icon name={index === orders.length - 1 ? 'check' : 'right'}/></button></div>
  </div>
}
