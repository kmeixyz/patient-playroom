import { useEffect, useRef, useState, type KeyboardEvent } from 'react'
import { Icon } from '../Icons'
import { keyDirection } from '../Controls'
import type { Direction } from '../logic'
import { playCue } from '../sound'
import { useGame, useGameDelay } from '../useGame'
import { makeRobotBoard, robotHint, robotStep, robotWon, ROBOT_COMMAND_LIMIT, type RobotPosition } from './robotRouteLogic'
import './robot-route.css'

const directionIcon = (direction: Direction) => direction === 'left' ? 'back' : direction
type Run = RobotPosition & { step: number; status: 'planning' | 'running' | 'stopped' | 'blocked'; id: number }

export function RobotRoute() {
  const { paused, finish, report } = useGame()
  const [board] = useState(makeRobotBoard)
  const [program, setProgram] = useState<Direction[]>([])
  const [run, setRun] = useState<Run>({ at: board.start, collected: 0, step: 0, status: 'planning', id: 0 })
  const [notice, setNotice] = useState('Add arrows, then run your route. Collect all three stars and reach the dock.')
  const [attempts, setAttempts] = useState(0)
  const workspace = useRef<HTMLDivElement>(null)
  const mobileStop = useRef<HTMLButtonElement>(null)
  const queue = useRef<HTMLOListElement>(null)
  const done = useRef(false)
  const running = run.status === 'running'
  const count = board.stars.filter((_, i) => (run.collected & (1 << i)) !== 0).length

  useEffect(() => { report(`${count} of 3 stars collected · ${attempts} ${attempts === 1 ? 'test run' : 'test runs'}`) }, [count, attempts, report])
  useEffect(() => {
    if (running && window.matchMedia('(max-width: 760px)').matches) {
      workspace.current?.scrollIntoView({ block: 'start', behavior: 'instant' })
      mobileStop.current?.focus({ preventScroll: true })
    }
  }, [running])

  function stop() {
    setRun(previous => ({ ...previous, status: 'stopped' }))
    setNotice('Test stopped. Edit your arrows and run again from the start.')
  }

  function edit(next: Direction[], message = 'Route updated. Each run starts at the robot’s starting tile.') {
    if (paused || running || done.current) return
    setProgram(next)
    setRun(previous => ({ at: board.start, collected: 0, step: 0, status: 'planning', id: previous.id + 1 }))
    setNotice(message)
  }

  function add(direction: Direction) {
    if (program.length >= ROBOT_COMMAND_LIMIT) {
      setNotice('All 20 command slots are full. Remove an arrow or use Hint to tidy your route.')
      return
    }
    edit([...program, direction], `Step ${program.length + 1}: ${direction}. Ready to add another arrow.`)
  }

  function remove(index: number) {
    edit(program.filter((_, i) => i !== index), `Removed step ${index + 1}.`)
    requestAnimationFrame(() => {
      const buttons = queue.current?.querySelectorAll<HTMLButtonElement>('button')
      if (buttons?.length) buttons[Math.min(index, buttons.length - 1)]?.focus()
      else workspace.current?.focus()
    })
  }

  function start() {
    if (paused || running || !program.length || done.current) return
    setAttempts(value => value + 1)
    setRun(previous => ({ at: board.start, collected: 0, step: 0, status: 'running', id: previous.id + 1 }))
    setNotice('Robot on the move. Watch the highlighted command.')
  }

  function hint() {
    const next = robotHint(board, program)
    edit(next.program, next.repaired ? 'I adjusted the end of your route and added a helpful step.' : next.program.length > program.length ? `Hint added: ${next.program.at(-1)}. Keep building, or run your route.` : 'Your route is ready! Press Run route.')
  }

  useGameDelay(() => {
    if (done.current || paused || !running) return
    const direction = program[run.step]!
    const next = robotStep(board, run, direction)
    if (!next) {
      setRun(previous => ({ ...previous, status: 'blocked' }))
      setNotice(`Step ${run.step + 1} goes into a block or off the map. Remove that arrow, or tap Hint to fix the route.`)
      return
    }
    const step = run.step + 1
    if (robotWon(board, next)) {
      done.current = true
      report(`All 3 stars collected · ${step} steps · ${attempts} ${attempts === 1 ? 'test run' : 'test runs'}`)
      playCue('finish')
      finish('All stars aboard. Robot home!')
      return
    }
    playCue(next.collected !== run.collected ? 'found' : 'tap')
    const stopped = step >= program.length
    setRun(previous => ({ ...previous, ...next, step, status: stopped ? 'stopped' : 'running' }))
    const stars = board.stars.filter((_, i) => next.collected & (1 << i)).length
    setNotice(stopped ? `${stars} of 3 stars. ${stars === 3 ? 'Add a route to the dock.' : 'Add more arrows to collect the remaining stars and reach the dock.'} Every test starts from the beginning.` : `Step ${step}: ${direction}. Row ${Math.floor(next.at / board.size) + 1}, column ${next.at % board.size + 1}. ${stars} of 3 stars.`)
  }, running ? 550 : null, `${run.id}:${run.step}`)

  function keyboard(event: KeyboardEvent) {
    if (event.altKey || event.ctrlKey || event.metaKey || paused || running) return
    const direction = keyDirection(event.key)
    if (direction) { event.preventDefault(); add(direction) }
  }

  return <div className="robot-workspace" ref={workspace} role="group" aria-label="Robot Route workspace. Arrow keys or W A S D add commands." tabIndex={0} onKeyDown={keyboard}>
    <div className="robot-map-panel">
      <div className="robot-map-heading"><span><Icon name="robot"/> Mission: bring the stars home</span><strong aria-label={`${count} of 3 stars collected`}><Icon name="star" weight="fill"/>{count} / 3</strong></div>
      {running && <div className="robot-mobile-run"><span>Running step {run.step + 1} of {program.length}</span><button ref={mobileStop} className="secondary-button" onClick={stop}>Stop robot</button></div>}
      <div className="robot-board-wrap">
        <table className="robot-board" aria-label="Route map. Rows run top to bottom; columns run left to right."><tbody>
          {Array.from({ length: board.size }, (_, y) => <tr key={y}>{Array.from({ length: board.size }, (_, x) => {
            const at = y * board.size + x, wall = board.walls.includes(at), star = board.stars.indexOf(at)
            const collected = star >= 0 && !!(run.collected & (1 << star)), robot = at === run.at, dock = at === board.dock
            const label = `Row ${y + 1}, column ${x + 1}: ${robot ? 'robot, ' : ''}${wall ? 'blocked' : dock ? 'dock' : star >= 0 ? collected ? 'star collected' : 'star' : at === board.start ? 'start' : 'open'}`
            return <td key={x} aria-label={label} data-cell={at} data-robot={robot || undefined} data-wall={wall || undefined} data-star={star >= 0 || undefined} data-dock={dock || undefined} className={`${wall ? 'robot-wall' : ''} ${dock ? 'robot-dock' : ''} ${star >= 0 ? 'robot-star' : ''} ${collected ? 'collected' : ''} ${robot ? 'robot-here' : ''}`}>
              <div>{robot ? <Icon name="robot" size={38} weight="fill"/> : wall ? <Icon name="close" size={22}/> : dock ? <Icon name="home" size={28} weight="fill"/> : star >= 0 ? <Icon name={collected ? 'check' : 'star'} size={29} weight="fill"/> : at === board.start ? <span className="robot-start-dot"/> : null}<span className="robot-coordinate" aria-hidden="true">{y + 1},{x + 1}</span></div>
            </td>
          })}</tr>)}
        </tbody></table>
      </div>
      <div className="robot-legend" aria-hidden="true"><span><Icon name="robot"/> Robot</span><span><Icon name="star" weight="fill"/> Stars</span><span><Icon name="home" weight="fill"/> Dock</span><span><Icon name="close"/> Block</span></div>
    </div>
    <div className="robot-program-panel">
      <div className="robot-program-heading"><h2>Your route</h2><span>{program.length} / {ROBOT_COMMAND_LIMIT} steps</span></div>
      <p className="robot-instruction">Add an arrow for each tile. Tap a queued arrow to remove it.</p>
      <div className="robot-add" role="group" aria-label="Add a direction">{(['up', 'right', 'down', 'left'] as Direction[]).map(direction => <button key={direction} onClick={() => add(direction)} disabled={running || program.length >= ROBOT_COMMAND_LIMIT} aria-label={`Add ${direction}`}><Icon name={directionIcon(direction)} size={25}/><span>{direction}</span></button>)}</div>
      <ol className="robot-queue" ref={queue} aria-label="Queued commands">{Array.from({ length: ROBOT_COMMAND_LIMIT }, (_, index) => <li key={index} aria-hidden={index >= program.length ? true : undefined}>{program[index] ? <button onClick={() => remove(index)} disabled={running} aria-label={`Remove step ${index + 1}: ${program[index]}`} aria-current={running && run.step === index ? 'step' : undefined} className={`${index < run.step ? 'executed' : ''} ${run.status === 'blocked' && index === run.step ? 'blocked' : ''}`}><span>{index + 1}</span><Icon name={directionIcon(program[index]!)} size={23}/></button> : <span className="robot-empty-slot">{index + 1}</span>}</li>)}</ol>
      <div className="robot-edit-actions"><button className="text-button" disabled={running || !program.length} onClick={() => edit(program.slice(0, -1), 'Last arrow removed.')}><Icon name="restart" size={18}/> Undo</button><button className="text-button" disabled={running || !program.length} onClick={() => edit([], 'Fresh route. Add your first arrow.')}>Clear</button><button className="secondary-button" disabled={running} onClick={hint}><Icon name="sparkle" size={18}/> Hint</button></div>
      <button className="primary-button robot-run" disabled={!program.length} onClick={running ? stop : start}><Icon name={running ? 'pause' : 'play'} weight="fill"/>{running ? 'Stop test' : 'Run route'}</button>
      <p className={`robot-notice ${run.status === 'blocked' ? 'needs-edit' : ''}`} role="status" aria-live="polite" aria-atomic="true">{notice}</p>
      <p className="robot-keyboard"><Icon name="keyboard" size={18}/> Arrow keys or W A S D add steps.</p>
    </div>
  </div>
}
