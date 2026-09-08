import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App'

import './game/game.css'
import '@fontsource-variable/nunito-sans'
import '@fontsource-variable/fredoka'
import './game/playroom.css'
import './game/mobile-accessibility.css'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
