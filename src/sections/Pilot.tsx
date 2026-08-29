import { Section } from '../components/Section'
import { pilot } from '../content/brief'

export function Pilot() {
  return (
    <Section
      id="pilot"
      number="08"
      title="Pilot Questions & Measures"
      lead={pilot.intro}
    >
      <div className="table-wrap">
        <table className="table">
          <thead>
            <tr>
              <th scope="col">Pilot dimension</th>
              <th scope="col">Question</th>
              <th scope="col">Example evidence</th>
            </tr>
          </thead>
          <tbody>
            {pilot.rows.map((row) => (
              <tr key={row.dimension}>
                <th scope="row">{row.dimension}</th>
                <td className="table__question">{row.question}</td>
                <td>{row.evidence}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Section>
  )
}
