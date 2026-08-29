import { Icon } from '../components/Icon'
import { Section, SubHead } from '../components/Section'
import { purpose } from '../content/brief'

export function Purpose() {
  return (
    <Section
      id="purpose"
      number="04"
      title="Purpose & Intended Benefits"
      lead={purpose.primaryPurpose}
    >
      <div className="beneficiaries">
        {purpose.beneficiaries.map((b) => (
          <div key={b.role} className="beneficiary">
            <Icon name="users" className="icon" />
            <div>
              <span className="beneficiary__role">{b.role}</span>
              <strong>{b.who}</strong>
              <p>{b.detail}</p>
            </div>
          </div>
        ))}
      </div>

      <SubHead>Intended benefits of the app</SubHead>
      <div className="benefit-grid">
        {purpose.benefits.map((b, i) => (
          <article key={b.title} className="benefit">
            <span className="benefit__num">{String(i + 1).padStart(2, '0')}</span>
            <h4>{b.title}</h4>
            <p>{b.body}</p>
          </article>
        ))}
      </div>
    </Section>
  )
}
