import { useEffect, useState } from 'react'

/**
 * Tracks which section is closest to the top of the viewport so the nav can
 * highlight it. Uses scroll position rather than IntersectionObserver ratios
 * because the sections have very different heights.
 */
export function useActiveSection(ids: string[]): string {
  const [active, setActive] = useState(ids[0] ?? '')

  useEffect(() => {
    const onScroll = () => {
      const anchor = window.innerHeight * 0.3
      let current = ids[0] ?? ''

      for (const id of ids) {
        const el = document.getElementById(id)
        if (!el) continue
        if (el.getBoundingClientRect().top <= anchor) current = id
      }

      const atBottom =
        window.innerHeight + window.scrollY >= document.body.offsetHeight - 4
      setActive(atBottom ? (ids[ids.length - 1] ?? current) : current)
    }

    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    window.addEventListener('resize', onScroll)
    return () => {
      window.removeEventListener('scroll', onScroll)
      window.removeEventListener('resize', onScroll)
    }
  }, [ids])

  return active
}
