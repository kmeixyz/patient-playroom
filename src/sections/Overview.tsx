import { Icon } from '../components/Icon'
import { anchorId, meta, sections } from '../content/brief'

export function Overview() {
  const anchor = anchorId('overview')

  return (
    <section id={anchor} className="hero" aria-labelledby={`${anchor}-title`}>
      <div className="hero__blobs" aria-hidden="true">
        <span className="blob blob--a" />
        <span className="blob blob--b" />
        <span className="blob blob--c" />
      </div>

      <p className="hero__status">
        <span className="dot" aria-hidden="true" />
        {meta.status} · Design brief
      </p>

      <h1 id={`${anchor}-title`} className="hero__title">
        {meta.title}
      </h1>

      <p className="hero__purpose">
        <strong>Purpose:</strong> {meta.purpose}
      </p>

      <p className="hero__cta-row">
        <a className="cta" href="#play">
          <Icon name="phone" className="icon" />
          Open the playable prototype
        </a>
        <a className="cta cta--ghost" href="#brief-pilot">
          See pilot measures
        </a>
      </p>

      <div className="hero__facts">
        {meta.facts.map((f) => (
          <div key={f.label} className="fact">
            <span className="fact__label">{f.label}</span>
            <span className="fact__value">{f.value}</span>
            {f.note ? <span className="fact__note">{f.note}</span> : null}
          </div>
        ))}
      </div>

      <div className="challenge">
        <div className="challenge__tag">
          <Icon name="heart" className="icon" />
          Design challenge
        </div>
        <p>{meta.challenge}</p>
      </div>

      <div className="hero__jump">
        <span>Jump to</span>
        <div className="hero__chips">
          {sections.slice(1).map((s) => (
            <a key={s.id} href={`#${anchorId(s.id)}`} className="chip">
              {s.title}
            </a>
          ))}
        </div>
      </div>
    </section>
  )
}
