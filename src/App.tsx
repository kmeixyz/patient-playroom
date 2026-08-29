import { useEffect, useState } from 'react'
import { BriefPage } from './brief/BriefPage'
import { GameApp } from './game/GameApp'

/**
 * Two destinations, no router dependency: the playable prototype at the root and
 * the design brief behind #brief. Section anchors inside the brief use
 * #brief/<section>, so the brief's own in-page links keep working.
 */
function readRoute(): 'game' | 'brief' {
  return window.location.hash.startsWith('#brief') ? 'brief' : 'game'
}

export default function App() {
  const [route, setRoute] = useState(readRoute)

  useEffect(() => {
    const onHashChange = () => setRoute(readRoute())
    window.addEventListener('hashchange', onHashChange)
    return () => window.removeEventListener('hashchange', onHashChange)
  }, [])

  useEffect(() => {
    document.title =
      route === 'brief'
        ? 'Design brief — Pediatric Outpatient Waiting-Room Game'
        : 'Waiting Room Playground'
  }, [route])

  return route === 'brief' ? <BriefPage /> : <GameApp />
}
