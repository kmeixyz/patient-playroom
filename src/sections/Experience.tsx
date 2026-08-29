import { Icon } from '../components/Icon'
import { Section, SubHead } from '../components/Section'
import { experience } from '../content/brief'

export function Experience() {
  return (
    <Section
      id="experience"
      number="06"
      title="Experience & Game Design Direction"
      lead={experience.intro}
    >
      <p className="note note--latitude">
        <Icon name="arrow" className="icon" />
        {experience.latitude}
      </p>

      <SubHead>Core experience and game structure</SubHead>
      <ul className="rules">
        {experience.structure.map((rule) => (
          <li key={rule.slice(0, 24)}>
            <Icon name="check" className="icon" />
            <span>{rule}</span>
          </li>
        ))}
      </ul>

      <SubHead>Illustrative game concepts</SubHead>
      <p className="note">{experience.conceptsNote}</p>
      <div className="concept-grid">
        {experience.concepts.map((c) => (
          <article key={c.concept} className="concept">
            <span className="concept__icon">
              <Icon name={c.icon} className="icon" />
            </span>
            <h4>{c.concept}</h4>
            <p className="concept__interaction">{c.interaction}</p>
            <p className="concept__intent">
              <span>Design intent</span>
              {c.intent}
            </p>
          </article>
        ))}
      </div>

      <SubHead>Representative use scenario</SubHead>
      <ol className="scenario">
        {experience.scenario.map((s, i) => (
          <li key={s.step}>
            <span className="scenario__index">{i + 1}</span>
            <div>
              <strong>{s.step}</strong>
              <p>{s.body}</p>
            </div>
          </li>
        ))}
      </ol>
    </Section>
  )
}
