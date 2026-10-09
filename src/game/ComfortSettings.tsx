import { useEffect, useRef } from 'react'
import { Icon } from './Icons'

export type ComfortPreferences = { calm: boolean; largeText: boolean; solid: boolean }
const STORAGE_KEY = 'playroom.comfort.v1'

export function readComfort(): ComfortPreferences {
  try {
    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}')
    return { calm: saved?.calm === true, largeText: saved?.largeText === true, solid: saved?.solid === true }
  } catch { return { calm: false, largeText: false, solid: false } }
}

export function saveComfort(preferences: ComfortPreferences) {
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(preferences)) } catch { /* Play works without storage. */ }
}

export function ComfortSettings({ open, onClose, preferences, onChange, deviceQuiet }: {
  open: boolean; onClose: () => void; preferences: ComfortPreferences
  onChange: (preferences: ComfortPreferences) => void; deviceQuiet: boolean
}) {
  const dialog = useRef<HTMLDialogElement>(null)
  useEffect(() => {
    if (!open) return
    const sheet = dialog.current!
    sheet.showModal()
    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => { sheet.close(); document.body.style.overflow = previousOverflow }
  }, [open])

  return <dialog className="comfort-sheet" ref={dialog} aria-labelledby="comfort-title" onCancel={onClose} onClose={onClose} onKeyDown={event => {
    if (event.key !== 'Tab') return
    const controls = Array.from(event.currentTarget.querySelectorAll<HTMLButtonElement>('button:not(:disabled)'))
    const first = controls[0], last = controls.at(-1)
    if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last?.focus() }
    else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first?.focus() }
  }}>
    <div className="comfort-heading"><h2 id="comfort-title">Settings</h2><button className="icon-button" aria-label="Close settings" onClick={onClose}><Icon name="close"/></button></div>
    <div className="comfort-options">
      <button className="comfort-option" role="switch" aria-checked={preferences.calm || deviceQuiet} disabled={deviceQuiet} onClick={() => onChange({ ...preferences, calm: !preferences.calm })} aria-labelledby="calm-label" aria-describedby="calm-description"><Icon name="leaf"/><span><strong id="calm-label">Calmer motion</strong><small id="calm-description">{deviceQuiet ? 'Your device has asked for less movement.' : 'Make game effects move less.'}</small></span><span className="setting-switch" aria-hidden="true"/></button>
      <button className="comfort-option" role="switch" aria-checked={preferences.largeText} onClick={() => onChange({ ...preferences, largeText: !preferences.largeText })} aria-labelledby="text-label"><Icon name="letters"/><span><strong id="text-label">Bigger text</strong></span><span className="setting-switch" aria-hidden="true"/></button>
      <button className="comfort-option" role="switch" aria-checked={preferences.solid} onClick={() => onChange({ ...preferences, solid: !preferences.solid })} aria-labelledby="solid-label" aria-describedby="solid-description"><Icon name="squares"/><span><strong id="solid-label">Solid backgrounds</strong><small id="solid-description">Make backgrounds solid so words are easier to see.</small></span><span className="setting-switch" aria-hidden="true"/></button>
    </div>
    <button className="primary-button" onClick={onClose}>Done <Icon name="check"/></button>
  </dialog>
}
