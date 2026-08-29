import type { ReactNode } from 'react'
import { anchorId } from '../content/brief'

type SectionProps = {
  id: string
  number: string
  title: string
  lead?: string
  children: ReactNode
}

export function Section({ id, number, title, lead, children }: SectionProps) {
  const anchor = anchorId(id)

  return (
    <section id={anchor} className="section" aria-labelledby={`${anchor}-title`}>
      <header className="section__head">
        <span className="section__num">{number}</span>
        <h2 id={`${anchor}-title`}>{title}</h2>
      </header>
      {lead ? <p className="section__lead">{lead}</p> : null}
      {children}
    </section>
  )
}

export function SubHead({ children }: { children: ReactNode }) {
  return <h3 className="subhead">{children}</h3>
}
