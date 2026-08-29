import { Section, SubHead } from '../components/Section'
import { users } from '../content/brief'

export function Users() {
  const primary = users.filter((u) => u.kind === 'primary')
  const secondary = users.filter((u) => u.kind === 'secondary')

  return (
    <Section
      id="users"
      number="05"
      title="Users & Use Context"
      lead="Who the prototype serves, and the assumptions behind each boundary."
    >
      <SubHead>Primary users</SubHead>
      {primary.map((group) => (
        <div key={group.name} className="userblock">
          <h4 className="userblock__name">{group.name}</h4>
          <div className="facet-grid">
            {group.facets.map((facet) => (
              <article key={facet.label ?? facet.points[0]} className="facet">
                {facet.label ? <h5>{facet.label}</h5> : null}
                <ul>
                  {facet.points.map((p) => (
                    <li key={p}>{p}</li>
                  ))}
                </ul>
                {facet.rationale ? (
                  <p className="facet__rationale">
                    <span>Assumption &amp; rationale</span>
                    {facet.rationale}
                  </p>
                ) : null}
              </article>
            ))}
          </div>
        </div>
      ))}

      <SubHead>Secondary users</SubHead>
      <div className="secondary-grid">
        {secondary.map((group) => (
          <article key={group.name} className="secondary">
            <h4>{group.name}</h4>
            <ul>
              {group.facets.flatMap((f) => f.points).map((p) => (
                <li key={p}>{p}</li>
              ))}
            </ul>
          </article>
        ))}
      </div>
    </Section>
  )
}
