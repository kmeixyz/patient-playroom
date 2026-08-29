import { Icon } from '../components/Icon'
import { Section } from '../components/Section'
import { deliverables } from '../content/brief'

export function Deliverables() {
  return (
    <Section id="deliverables" number="09" title="Suggested Deliverables">
      <div className="deliv-grid">
        {deliverables.groups.map((group) => (
          <div key={group.owner} className={`deliv deliv--${group.tone}`}>
            <h4>{group.owner}</h4>
            <ol>
              {group.items.map((item) => (
                <li key={item.name}>
                  <strong>{item.name}</strong>
                  <p>{item.body}</p>
                </li>
              ))}
            </ol>
          </div>
        ))}
      </div>

      <div className="success">
        <div className="success__tag">
          <Icon name="star" className="icon" />
          Definition of a successful project
        </div>
        <p>{deliverables.success}</p>
      </div>
    </Section>
  )
}
