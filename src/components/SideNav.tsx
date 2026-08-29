import { anchorId, sections } from '../content/brief'
import { useActiveSection } from '../hooks/useActiveSection'

const anchors = sections.map((s) => anchorId(s.id))

export function SideNav() {
  const active = useActiveSection(anchors)

  return (
    <nav className="sidenav" aria-label="Brief sections">
      <div className="sidenav__brand">
        <span className="sidenav__mark" aria-hidden="true" />
        <span>
          <strong>MVP</strong>
          <small>Medical Virtual Playground</small>
        </span>
      </div>

      <ol className="sidenav__list">
        {sections.map((s) => {
          const anchor = anchorId(s.id)
          return (
            <li key={s.id}>
              <a
                href={`#${anchor}`}
                className={active === anchor ? 'is-active' : undefined}
                aria-current={active === anchor ? 'true' : undefined}
              >
                <span className="sidenav__num">{s.number}</span>
                <span className="sidenav__label">{s.title}</span>
              </a>
            </li>
          )
        })}
      </ol>

      <a className="sidenav__play" href="#play">
        Open the prototype
      </a>
    </nav>
  )
}

export function MobileNav() {
  const active = useActiveSection(anchors)

  return (
    <div className="mobilenav">
      <div className="mobilenav__brand">
        <span className="sidenav__mark" aria-hidden="true" />
        <strong>MVP Design Brief</strong>
        <a className="mobilenav__play" href="#play">
          Play
        </a>
      </div>
      <div className="mobilenav__scroller">
        {sections.map((s) => {
          const anchor = anchorId(s.id)
          return (
            <a
              key={s.id}
              href={`#${anchor}`}
              className={active === anchor ? 'is-active' : undefined}
            >
              {s.title}
            </a>
          )
        })}
      </div>
    </div>
  )
}
