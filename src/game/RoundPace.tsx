import { Icon } from './Icons'

export function RoundPace({ relaxed, onChange, duration }: { relaxed: boolean; onChange: (value: boolean) => void; duration: string }) {
  return <fieldset className="round-pace">
    <legend>Choose your pace</legend>
    <div className="pace-choices">
      <button aria-pressed={!relaxed} onClick={() => onChange(false)}>
        <Icon name="clock"/><span><strong>A short break</strong><small>{duration}</small></span>{!relaxed && <Icon name="check" size={18}/>}
      </button>
      <button aria-pressed={relaxed} onClick={() => onChange(true)}>
        <Icon name="leaf"/><span><strong>Take my time</strong><small>No countdown</small></span>{relaxed && <Icon name="check" size={18}/>}
      </button>
    </div>
  </fieldset>
}
