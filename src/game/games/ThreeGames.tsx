import { useEffect, useRef, useState } from 'react'
import * as THREE from 'three'
import { advanceSky, makeSky, newOrbit, orbitBonusSlot, popOrbit, skyJump, skyLane } from '../logic'
import { useGame } from '../useGame'
import { useBoardInput } from '../Controls'
import { Icon } from '../Icons'
import { playCue } from '../sound'
import { createAdventureScene } from './adventureScene'

type View = { score: number; gems: number; bumps: number; combo: number; lane: number; air: number; cooldown: number; distance: number; popped: number; bonus: number; slots: number[] }

export function ThreeGame({ kind }: { kind: 'sky' | 'orbit' }) {
  const runtime = useGame(), runtimeRef = useRef(runtime); runtimeRef.current = runtime
  const mount = useRef<HTMLDivElement>(null), targetRefs = useRef<(HTMLButtonElement | null)[]>([])
  const [initialSky] = useState(makeSky), sky = useRef(initialSky), orbit = useRef(newOrbit()), ended = useRef(false)
  const [fallback, setFallback] = useState(false)
  const [view, setView] = useState<View>({ score: 0, gems: 0, bumps: 0, combo: 0, lane: 0, air: 0, cooldown: 0, distance: 0, popped: 0, bonus: 0, slots: [0, 1, 2, 3, 4, 5] })
  const [feedback, setFeedback] = useState(kind === 'sky' ? 'Follow the gems. Your ride, your pace.' : 'Tap a planet to wake up your orbit.')
  const [upcoming, setUpcoming] = useState('')
  const move = (delta: number) => { if (!runtimeRef.current.paused && !ended.current) sky.current = skyLane(sky.current, delta) }
  const jump = () => { if (!runtimeRef.current.paused && !ended.current) sky.current = skyJump(sky.current) }
  const pop = (slot: number) => {
    if (runtimeRef.current.paused || ended.current) return
    const before = orbit.current, next = popOrbit(before, before.slots[slot]!, performance.now())
    if (next === before) return
    orbit.current = next
    setFeedback(next.bonus > before.bonus ? 'Bonus catch! Your orbit is glowing.' : `${next.popped} collected. Keep your orbit going.`)
    runtimeRef.current.report(`${next.popped} planets · ${next.bonus} bonus catches`)
    playCue(next.popped === 18 ? 'finish' : 'found')
    if (next.popped === 18) { ended.current = true; runtimeRef.current.finish('Orbit powered. All 18 planets collected.') }
  }
  const actions = useRef({ move, jump, pop }); actions.current = { move, jump, pop }
  const swipe = useBoardInput(direction => { if (direction === 'left') move(-1); else if (direction === 'right') move(1); else if (direction === 'up') jump() })

  useEffect(() => {
    const key = (event: KeyboardEvent) => {
      // Single-letter shortcuts operate only inside the focused game, as WCAG requires.
      if (runtimeRef.current.paused || event.altKey || event.ctrlKey || event.metaKey || !(event.target instanceof Element) || !event.target.closest('.three-game')) return
      if (kind === 'sky') {
        if (['ArrowLeft', 'a', 'A'].includes(event.key)) { event.preventDefault(); actions.current.move(-1) }
        else if (['ArrowRight', 'd', 'D'].includes(event.key)) { event.preventDefault(); actions.current.move(1) }
        else if (['ArrowUp', 'w', 'W', ' '].includes(event.key) && !(event.target instanceof HTMLButtonElement && event.key === ' ')) { event.preventDefault(); if (!event.repeat) actions.current.jump() }
      } else if (/^[1-6]$/.test(event.key) && !event.repeat) { event.preventDefault(); actions.current.pop(Number(event.key) - 1) }
    }
    window.addEventListener('keydown', key); return () => window.removeEventListener('keydown', key)
  }, [kind])

  useEffect(() => {
    const host = mount.current; if (!host) return
    const world = createAdventureScene(kind, initialSky)
    let renderer: THREE.WebGLRenderer | null = null, graphicsLost = false, frame = 0, alive = true
    let last = performance.now(), lastUI = last, sceneTime = 0, nextItemId = -1
    const resize = () => { world.resize(host.clientWidth, host.clientHeight, runtimeRef.current.quiet); renderer?.setSize(host.clientWidth, host.clientHeight, false) }
    try {
      renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false, powerPreference: 'low-power' })
      renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, window.innerWidth < 760 ? 1.35 : 1.6))
      renderer.outputColorSpace = THREE.SRGBColorSpace; renderer.toneMapping = THREE.ACESFilmicToneMapping; renderer.toneMappingExposure = 1.12
      renderer.domElement.setAttribute('aria-hidden', 'true'); host.prepend(renderer.domElement); resize()
    } catch { setFallback(true) }
    const canvas = renderer?.domElement
    const lost = (event: Event) => { event.preventDefault(); graphicsLost = true; setFallback(true) }
    canvas?.addEventListener('webglcontextlost', lost)
    const observer = new ResizeObserver(resize); observer.observe(host)
    const update = (now: number) => {
      if (!alive) return
      const dt = Math.max(0, Math.min((now - last) / 1000, .1)); last = now
      const { paused, quiet } = runtimeRef.current
      if (!paused && !ended.current) {
        sceneTime += dt
        if (kind === 'sky') {
          const before = sky.current; sky.current = advanceSky(before, dt, 10)
          if (sky.current.gems > before.gems) { playCue('tap'); setFeedback(sky.current.combo >= 4 ? `Gem streak! ${sky.current.combo} in a row.` : 'Gem caught. Looking good!') }
          if (sky.current.bumps > before.bumps) setFeedback('A little bump. You’re still flying!')
          const next = sky.current.items.find(item => !item.hit && item.distance > sky.current.distance)
          if (next && next.id !== nextItemId) { nextItemId = next.id; setUpcoming(`${['Left', 'Center', 'Right'][next.lane + 1]} lane: ${next.kind === 'gem' ? 'gem ahead' : 'block ahead — jump or steer around'}.`) }
        }
        world.update(sky.current, orbit.current, sceneTime, dt, quiet)
      }
      if (renderer && !graphicsLost) {
        renderer.render(world.scene, world.camera)
        if (kind === 'orbit') world.planets.forEach((planet, i) => {
          const target = targetRefs.current[i]; if (!target) return
          const point = planet.position.clone().project(world.camera)
          target.style.left = `${(point.x + 1) * 50}%`; target.style.top = `${(1 - point.y) * 50}%`
        })
      }
      if (now - lastUI > 100) {
        lastUI = now; const s = sky.current, o = orbit.current
        if (kind === 'sky') runtimeRef.current.report(`${s.gems} gems · ${s.score} points`)
        setView({ score: s.score, gems: s.gems, bumps: s.bumps, combo: s.combo, lane: s.lane, air: s.air, cooldown: s.cooldown, distance: s.distance, popped: o.popped, bonus: o.bonus, slots: o.slots })
      }
      frame = requestAnimationFrame(update)
    }
    frame = requestAnimationFrame(update)
    return () => { alive = false; cancelAnimationFrame(frame); observer.disconnect(); canvas?.removeEventListener('webglcontextlost', lost); world.dispose(); renderer?.dispose(); canvas?.remove() }
  }, [kind, initialSky])

  const bonusSlot = orbitBonusSlot(view.popped)
  const multiplier = Math.min(3, Math.floor(Math.max(0, view.combo - 1) / 4) + 1)
  return <div className={`three-game ${kind}-game ${fallback ? 'flat-mode' : ''}`}>
    <div className="three-hud">
      {kind === 'sky' ? <>
        <span className="hud-stat"><Icon name="gem" weight="fill" /><span><strong>{view.gems}</strong> gems</span></span>
        <span className="hud-streak"><Icon name="sparkle" /><span><strong>×{multiplier}</strong> streak</span></span>
        <span className="hud-stat"><span><strong>{view.score}</strong> points</span></span>
      </> : <>
        <span className="hud-stat"><Icon name="planet" /><span><strong>{view.popped}</strong> / 18 planets</span></span>
        <span className="hud-streak"><Icon name="star" weight="fill" /><span><strong>{view.bonus}</strong> bonus catches</span></span>
      </>}
    </div>
    <div className="three-stage" ref={mount} role="group" aria-label={kind === 'sky' ? 'Sky track. Left and right steer. Up or Space jumps.' : 'Orbit field. Tap planets or press keys 1 to 6.'} tabIndex={0}
      {...(kind === 'sky' ? { onPointerDown: swipe.onPointerDown, onPointerUp: swipe.onPointerUp, onPointerCancel: swipe.onPointerCancel } : {})}>
      {kind === 'orbit' && <div className="planet-targets">{view.slots.map((id, i) => <button key={i} ref={el => { targetRefs.current[i] = el }} className={`planet-target planet-${i} ${i === bonusSlot ? 'bonus-target' : ''}`} onClick={() => pop(i)} aria-label={`Pop planet ${i + 1}`} aria-describedby={i === bonusSlot ? 'bonus-description' : undefined} data-planet-id={id} disabled={runtime.paused}><span>{i + 1}</span>{i === bonusSlot && <Icon name="star" size={15} weight="fill" />}</button>)}</div>}
      {kind === 'sky' && fallback && <div className="flat-track" aria-hidden="true"><div className="flat-lanes" />{sky.current.items.filter(item => !item.hit && item.distance - view.distance > 0 && item.distance - view.distance < 65).map(item => <span className={`flat-object ${item.kind}`} key={item.id} style={{ left: `${(item.lane + 1) * 30 + 20}%`, top: `${85 - (item.distance - view.distance) / 65 * 85}%` }}><Icon name={item.kind === 'gem' ? 'gem' : 'squares'} weight="fill" size={27} /></span>)}<span className={`flat-ship ${view.air > 0 ? 'jumping' : ''}`} style={{ left: `${(view.lane + 1) * 30 + 20}%` }}><Icon name="game" size={42} weight="fill" /></span></div>}
      {kind === 'sky' && <div className="lane-labels" aria-hidden="true">{['Left', 'Center', 'Right'].map((label, i) => <span className={view.lane === i - 1 ? 'current' : ''} key={label}>{label}</span>)}</div>}
      {kind === 'orbit' && <div className="orbit-buddy-label" aria-hidden="true"><Icon name="heart" size={15} weight="fill" /> {view.popped < 6 ? 'Let’s light it up!' : view.popped < 12 ? 'You’ve got this!' : 'Almost powered!'}</div>}
    </div>
    {fallback && <p className="graphics-note">3D isn’t available on this device. You’re playing the same game in flat view.</p>}
    <div className="adventure-feedback" role="status" aria-live="polite" aria-atomic="true"><Icon name={kind === 'sky' ? 'gem' : 'sparkle'} size={19} />{feedback}</div>
    {kind === 'sky' ? <>
      <div className="sky-controls"><button className="steer-button" aria-label="Steer left" onClick={() => move(-1)}><Icon name="back" size={25} /><span>Left</span></button><button className="jump-button" aria-disabled={view.cooldown > 0} onClick={jump}><Icon name="up" />{view.air > 0 ? 'Airtime' : view.cooldown > 0 ? 'Landing…' : 'Jump'}<span>Space / ↑</span></button><button className="steer-button" aria-label="Steer right" onClick={() => move(1)}><span>Right</span><Icon name="right" size={25} /></button></div>
      <div className="journey-progress" role="progressbar" aria-label="Flight path completed" aria-valuemin={0} aria-valuemax={750} aria-valuenow={Math.min(750, Math.round(view.distance))}><span style={{ width: `${Math.min(100, view.distance / 7.5)}%` }} /><Icon name="flag" size={18} /></div>
      <div className="journey-stops" aria-hidden="true"><span className={view.distance < 250 ? 'current' : ''}>Cloud gardens</span><span className={view.distance >= 250 && view.distance < 500 ? 'current' : ''}>Island crossing</span><span className={view.distance >= 500 ? 'current' : ''}>Landing</span></div>
      <p className="three-note">{view.bumps} bumps · Bumps never end your ride.</p>
      <p className="sr-only" aria-live="polite">{upcoming} Current lane: {['left', 'center', 'right'][view.lane + 1]}.</p>
    </> : <>
      <div className="orbit-energy" role="progressbar" aria-label="Robot orbit powered" aria-valuemin={0} aria-valuemax={18} aria-valuenow={view.popped}>{Array.from({ length: 18 }, (_, i) => <span key={i} className={i < view.popped ? 'charged' : ''} />)}</div>
      <p className="bonus-description" id="bonus-description"><Icon name="star" size={18} weight="fill" /> Bonus target: planet {bonusSlot + 1}</p>
      <p className="three-note">Tap a numbered planet · Keyboard: Tab + Enter or 1–6.</p>
    </>}
  </div>
}
