import { Icon } from '../components/Icon'
import { Section, SubHead } from '../components/Section'
import { summary } from '../content/brief'

export function Summary() {
  return (
    <Section
      id="summary"
      number="01"
      title="Executive Summary"
      lead={summary.scope}
    >
      <SubHead>Project goals</SubHead>

      <div className="owner-grid">
        {summary.responsibilities.map((group) => (
          <article key={group.owner} className={`owner owner--${group.tone}`}>
            <h4>{group.owner}</h4>
            {group.items.map((item) => (
              <p key={item}>{item}</p>
            ))}
            {group.assess ? (
              <ul className="assess">
                {group.assess.map((a) => (
                  <li key={a.name}>
                    <span className="assess__name">{a.name}</span>
                    <span className="assess__detail">{a.detail}</span>
                  </li>
                ))}
              </ul>
            ) : null}
          </article>
        ))}
      </div>

      <div className="callout callout--outcome">
        <Icon name="star" className="icon" />
        <p>{summary.outcome}</p>
      </div>
    </Section>
  )
}
