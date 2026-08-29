import { useState } from 'react'
import { Icon } from '../components/Icon'
import { Section } from '../components/Section'
import { requirements } from '../content/brief'

export function Requirements() {
  const [openId, setOpenId] = useState(requirements[0]?.id ?? '')

  return (
    <Section
      id="requirements"
      number="07"
      title="Design Considerations & Requirements"
      lead="Three guardrail areas. Requirements are grouped into what the prototype must do and what it must avoid."
    >
      <div className="reqs">
        {requirements.map((group) => {
          const isOpen = openId === group.id
          return (
            <article key={group.id} className={`req ${isOpen ? 'is-open' : ''}`}>
              <button
                type="button"
                className="req__trigger"
                aria-expanded={isOpen}
                aria-controls={`req-${group.id}`}
                onClick={() => setOpenId(isOpen ? '' : group.id)}
              >
                <span>
                  <strong>{group.title}</strong>
                  <small>{group.blurb}</small>
                </span>
                <span className="req__toggle" aria-hidden="true">
                  {isOpen ? '−' : '+'}
                </span>
              </button>

              <div id={`req-${group.id}`} className="req__body" hidden={!isOpen}>
                <div className="req__cols">
                  <div className="req__col req__col--must">
                    <h5>
                      <Icon name="check" className="icon" /> Must do
                    </h5>
                    <ul>
                      {group.must.map((m) => (
                        <li key={m.slice(0, 24)}>{m}</li>
                      ))}
                    </ul>
                  </div>
                  <div className="req__col req__col--avoid">
                    <h5>
                      <Icon name="ban" className="icon" /> Must avoid
                    </h5>
                    <ul>
                      {group.avoid.map((a) => (
                        <li key={a.slice(0, 24)}>{a}</li>
                      ))}
                    </ul>
                  </div>
                </div>

                {group.niceToHave ? (
                  <div className="req__nice">
                    <span>Nice to have, not required</span>
                    {group.niceToHave.map((n) => (
                      <p key={n.slice(0, 24)}>{n}</p>
                    ))}
                  </div>
                ) : null}
              </div>
            </article>
          )
        })}
      </div>
    </Section>
  )
}
