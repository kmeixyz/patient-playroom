import { MobileNav, SideNav } from '../components/SideNav'
import { Background, Hypothesis } from '../sections/Background'
import { Deliverables } from '../sections/Deliverables'
import { Experience } from '../sections/Experience'
import { Overview } from '../sections/Overview'
import { Pilot } from '../sections/Pilot'
import { Purpose } from '../sections/Purpose'
import { Requirements } from '../sections/Requirements'
import { Summary } from '../sections/Summary'
import { Users } from '../sections/Users'

export function BriefPage() {
  return (
    <div className="app">
      <a className="skip" href="#brief-summary">
        Skip to the brief
      </a>
      <SideNav />
      <MobileNav />

      <main className="main">
        <Overview />
        <Summary />
        <Background />
        <Hypothesis />
        <Purpose />
        <Users />
        <Experience />
        <Requirements />
        <Pilot />
        <Deliverables />

        <footer className="footer">
          <p>
            Pediatric Outpatient Waiting-Room Game — draft design brief for team
            alignment. Content mirrors the source brief; visual treatment is a
            working draft.
          </p>
        </footer>
      </main>
    </div>
  )
}
