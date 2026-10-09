import { useCallback, useEffect, useRef, useState, type MouseEvent, type PointerEvent, type RefObject } from 'react'

type DragPreview = { from: number; to: number | null; x: number; y: number; size: number }
type Gesture = DragPreview & { id: number; startX: number; startY: number; dragging: boolean; capture: HTMLButtonElement }

/** Pointer capture keeps mouse and touch swaps on the board, even across tile gaps. */
export function usePipeDrag({ boardRef, enabled, boardKey, onSwap, onTap }: {
  boardRef: RefObject<HTMLDivElement | null>
  enabled: boolean
  boardKey: unknown
  onSwap: (from: number, to: number) => void
  onTap: (at: number) => void
}) {
  const gesture = useRef<Gesture | null>(null)
  const suppressClick = useRef(false)
  const [drag, setDrag] = useState<DragPreview | null>(null)

  const release = useCallback(() => {
    const current = gesture.current
    gesture.current = null
    if (current?.capture.hasPointerCapture(current.id)) current.capture.releasePointerCapture(current.id)
  }, [])
  const cancel = useCallback(() => {
    if (gesture.current) suppressClick.current = true
    release()
    setDrag(null)
  }, [release])
  useEffect(() => { cancel() }, [enabled, boardKey, cancel])
  useEffect(() => release, [release])

  const targetAt = (x: number, y: number, from: number) => {
    const target = document.elementFromPoint(x, y)?.closest<HTMLButtonElement>('button[data-post-index]')
    if (!target || !boardRef.current?.contains(target) || target.disabled) return null
    const to = Number(target.dataset.postIndex)
    return Number.isInteger(to) && to !== from ? to : null
  }
  const begin = (event: PointerEvent<HTMLButtonElement>, from: number) => {
    if (!enabled || !event.isPrimary || event.button !== 0 || gesture.current) return
    suppressClick.current = false
    const capture = event.currentTarget
    gesture.current = { id: event.pointerId, from, to: null, startX: event.clientX, startY: event.clientY, x: event.clientX, y: event.clientY, size: capture.getBoundingClientRect().width, dragging: false, capture }
    capture.setPointerCapture(event.pointerId)
  }
  const move = (event: PointerEvent<HTMLButtonElement>) => {
    const current = gesture.current
    if (!current || current.id !== event.pointerId || !enabled) return
    if (!current.dragging && Math.hypot(event.clientX - current.startX, event.clientY - current.startY) < 8) return
    current.dragging = true
    suppressClick.current = true
    current.x = event.clientX; current.y = event.clientY
    current.to = targetAt(event.clientX, event.clientY, current.from)
    event.preventDefault()
    setDrag({ from: current.from, to: current.to, x: current.x, y: current.y, size: current.size })
  }
  const end = (event: PointerEvent<HTMLButtonElement>) => {
    const current = gesture.current
    if (!current || current.id !== event.pointerId) return
    const to = targetAt(event.clientX, event.clientY, current.from)
    release(); setDrag(null)
    suppressClick.current = true
    event.preventDefault()
    if (current.dragging || Math.hypot(event.clientX - current.startX, event.clientY - current.startY) >= 8) {
      if (enabled && to !== null) onSwap(current.from, to)
    } else if (enabled && document.elementFromPoint(event.clientX, event.clientY)?.closest('button[data-post-index]') === current.capture) {
      // Handle the tap here: mobile browsers may omit click after tiny finger movement.
      onTap(current.from)
    }
  }
  const interrupted = (event: PointerEvent<HTMLButtonElement>) => {
    if (gesture.current?.id === event.pointerId) cancel()
  }
  const allowClick = (event: MouseEvent<HTMLButtonElement>) => {
    // Enter/Space and assistive-technology activation are never swallowed by a drag.
    if (event.detail === 0 || (!suppressClick.current && !gesture.current)) return true
    event.preventDefault()
    return false
  }

  return { drag, begin, move, end, interrupted, allowClick, cancel }
}
