/**
 * Soft, optional audio. The brief requires sound to be off by default with no
 * sudden loud effects and no assumption that headphones exist, so:
 *  - the preference is not persisted; every open starts silent
 *  - tones are quiet sine waves with an eased attack and release
 *  - the AudioContext is only created after someone turns sound on
 */

type Cue = 'tap' | 'found' | 'match' | 'finish'

const cues: Record<Cue, { notes: number[]; gain: number; step: number }> = {
  tap: { notes: [523.25], gain: 0.05, step: 0 },
  found: { notes: [587.33, 783.99], gain: 0.05, step: 0.11 },
  match: { notes: [523.25, 659.25], gain: 0.05, step: 0.1 },
  finish: { notes: [523.25, 659.25, 783.99], gain: 0.055, step: 0.14 },
}

let enabled = false
let ctx: AudioContext | null = null
let paused = false
const activeNotes = new Set<OscillatorNode>()
export function setAudioPaused(next: boolean) {
  paused = next
  if (next) for (const osc of activeNotes) { try { osc.stop() } catch { /* Already ended. */ } }
}
export function playNote(frequency: number) {
  if (!enabled || paused || activeNotes.size >= 8) return
  try {
    ctx ??= new AudioContext()
    if (ctx.state === 'suspended') void ctx.resume().catch(() => {})
    const oscillator=ctx.createOscillator(),gain=ctx.createGain(),start=ctx.currentTime
    oscillator.frequency.value=frequency
    gain.gain.setValueAtTime(0,start)
    gain.gain.linearRampToValueAtTime(.045,start+.025)
    gain.gain.exponentialRampToValueAtTime(.0001,start+.3)
    oscillator.connect(gain).connect(ctx.destination)
    activeNotes.add(oscillator)
    oscillator.onended=()=>{activeNotes.delete(oscillator);oscillator.disconnect();gain.disconnect()}
    oscillator.start(start);oscillator.stop(start+.32)
  } catch { /* Sound is optional. */ }
}

export function isSoundOn() {
  return enabled
}

export function setSoundOn(next: boolean) {
  enabled = next
  if (!next && ctx) {
    for (const osc of activeNotes) { try { osc.stop() } catch { /* Already ended. */ } }
    void ctx.suspend().catch(() => {})
  }
  if (next) {
    void ctx?.resume().catch(() => {})
  }
}

export function playCue(cue: Cue) {
  if (!enabled || paused || activeNotes.size >= 8) return

  try {
    ctx ??= new AudioContext()
    if (ctx.state === 'suspended') void ctx.resume().catch(() => {})

    const { notes, gain, step } = cues[cue]
    notes.forEach((freq, i) => {
      const start = ctx!.currentTime + i * step
      const osc = ctx!.createOscillator()
      const amp = ctx!.createGain()

      osc.type = 'sine'
      osc.frequency.value = freq

      amp.gain.setValueAtTime(0, start)
      amp.gain.linearRampToValueAtTime(gain, start + 0.04)
      amp.gain.exponentialRampToValueAtTime(0.0001, start + 0.34)

      osc.connect(amp).connect(ctx!.destination)
      activeNotes.add(osc)
      osc.onended = () => { activeNotes.delete(osc); osc.disconnect(); amp.disconnect() }
      osc.start(start)
      osc.stop(start + 0.36)
    })
  } catch {
    // Audio is a nice-to-have; never let it break play.
  }
}
