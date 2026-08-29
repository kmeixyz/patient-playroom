import { Icon } from '../components/Icon'
import { Section, SubHead } from '../components/Section'
import { background, hypothesis } from '../content/brief'

export function Background() {
  return (
    <Section id="background" number="02" title="Background & Opportunity">
      <div className="prose">
        {background.paragraphs.map((p) => (
          <p key={p.slice(0, 32)}>{p}</p>
        ))}
      </div>

      <SubHead>How the wait escalates</SubHead>
      <ol className="chain">
        {background.chain.map((link, i) => (
          <li key={link.label} className="chain__item">
            <span className="chain__index">{i + 1}</span>
            <span className="chain__label">{link.label}</span>
            <span className="chain__detail">{link.detail}</span>
          </li>
        ))}
      </ol>

      <div className="callout callout--opportunity">
        <Icon name="clock" className="icon" />
        <div>
          <span className="callout__tag">The opportunity</span>
          <p>{background.opportunity}</p>
        </div>
      </div>
    </Section>
  )
}

export function Hypothesis() {
  return (
    <Section id="hypothesis" number="03" title="Design Hypothesis">
      <blockquote className="hypothesis">
        <p>{hypothesis.statement}</p>
      </blockquote>
    </Section>
  )
}
