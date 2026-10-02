import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App'

import './game/game.css'
import './game/playroom.css'
import './game/mobile-accessibility.css'
import './game/playful-premium.css'
import './game/apple-ui.css'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
