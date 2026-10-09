import { Icon } from './Icons'

export function RoundPace({ relaxed, onChange, duration }: { relaxed: boolean; onChange: (value: boolean) => void; duration: string }) {
  return <fieldset className="round-pace">
    <legend>Timer</legend>
    <div className="pace-choices">
      <button aria-label="No timer" aria-describedby="no-timer-help" aria-pressed={relaxed} onClick={() => onChange(true)}>
        <Icon name="leaf"/><span><strong>No timer</strong><small id="no-timer-help">Play as long as you want.</small></span>{relaxed && <Icon name="check" size={18}/>}
      </button>
      <button aria-pressed={!relaxed} onClick={() => onChange(false)}>
        <Icon name="clock"/><span><strong>Timer on</strong><small>{duration}</small></span>{!relaxed && <Icon name="check" size={18}/>}
      </button>
    </div>
  </fieldset>
}
