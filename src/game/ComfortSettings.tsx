import { useEffect, useRef } from 'react'
import { Icon } from './Icons'

export type ComfortPreferences = { calm: boolean; largeText: boolean }
const STORAGE_KEY = 'playroom.comfort.v1'

export function readComfort(): ComfortPreferences {
  try {
    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}')
    return { calm: saved?.calm === true, largeText: saved?.largeText === true }
  } catch { return { calm: false, largeText: false } }
}

export function saveComfort(preferences: ComfortPreferences) {
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(preferences)) } catch { /* Play works without storage. */ }
}

export function ComfortSettings({ open, onClose, preferences, onChange, sound, onSound, deviceQuiet }: {
  open: boolean; onClose: () => void; preferences: ComfortPreferences
  onChange: (preferences: ComfortPreferences) => void; sound: boolean; onSound: () => void; deviceQuiet: boolean
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
    <div className="comfort-heading"><span className="comfort-symbol"><Icon name="settings" size={28}/></span><button className="icon-button" aria-label="Close play settings" onClick={onClose}><Icon name="close"/></button></div>
    <h2 id="comfort-title">Play your way</h2>
    <p>A little more comfortable. A little more you.</p>
    <div className="comfort-options">
      <button className="comfort-option" role="switch" aria-checked={sound} onClick={onSound} aria-labelledby="sound-label" aria-describedby="sound-description"><Icon name={sound ? 'sound' : 'mute'}/><span><strong id="sound-label">Game sounds</strong><small id="sound-description">Every game works with sound off.</small></span><span className="setting-switch" aria-hidden="true"/></button>
      <button className="comfort-option" role="switch" aria-checked={preferences.calm || deviceQuiet} disabled={deviceQuiet} onClick={() => onChange({ ...preferences, calm: !preferences.calm })} aria-labelledby="calm-label" aria-describedby="calm-description"><Icon name="leaf"/><span><strong id="calm-label">Calmer motion</strong><small id="calm-description">{deviceQuiet ? 'On because of your device setting.' : 'Less bouncing and gentler game effects.'}</small></span><span className="setting-switch" aria-hidden="true"/></button>
      <button className="comfort-option" role="switch" aria-checked={preferences.largeText} onClick={() => onChange({ ...preferences, largeText: !preferences.largeText })} aria-labelledby="text-label" aria-describedby="text-description"><Icon name="letters"/><span><strong id="text-label">Bigger text</strong><small id="text-description">A little extra room for reading.</small></span><span className="setting-switch" aria-hidden="true"/></button>
    </div>
    <p className="comfort-note"><Icon name="heart" size={18}/> Your choices stay on this device. Sound starts off each visit.</p>
    <button className="primary-button" onClick={onClose}>Done <Icon name="check"/></button>
  </dialog>
}
