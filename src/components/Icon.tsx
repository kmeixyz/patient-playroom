import type { ReactNode } from 'react'

type IconProps = { name: string; className?: string }

const paths: Record<string, ReactNode> = {
  search: (
    <>
      <circle cx="11" cy="11" r="6" />
      <path d="M15.5 15.5 20 20" />
    </>
  ),
  tiles: (
    <>
      <rect x="3.5" y="3.5" width="7" height="7" rx="1.5" />
      <rect x="13.5" y="3.5" width="7" height="7" rx="1.5" />
      <rect x="3.5" y="13.5" width="7" height="7" rx="1.5" />
      <rect x="13.5" y="13.5" width="7" height="7" rx="1.5" />
    </>
  ),
  eye: (
    <>
      <path d="M2.5 12S6 5.5 12 5.5 21.5 12 21.5 12 18 18.5 12 18.5 2.5 12 2.5 12Z" />
      <circle cx="12" cy="12" r="2.5" />
    </>
  ),
  grid: (
    <>
      <path d="M9 3.5v17M15 3.5v17M3.5 9h17M3.5 15h17" />
    </>
  ),
  maze: (
    <>
      <rect x="3.5" y="3.5" width="17" height="17" rx="2" />
      <path d="M7.5 3.5v9h5v-5h4.5M7.5 20.5v-4h9" />
    </>
  ),
  letters: (
    <>
      <path d="M4 18 8 6l4 12M5.4 14.2h5.2" />
      <path d="M15 10.5h3.5a2 2 0 0 1 0 4H15v-4Zm0 4h4a2 2 0 0 1 0 4h-4v-4Z" />
    </>
  ),
  jump: (
    <>
      <circle cx="9" cy="5.5" r="2" />
      <path d="M9 8v5l-3 6M9 13l3.5 3 1 4M6 11h6M20 20.5h-4v-4" />
    </>
  ),
  dance: (
    <>
      <circle cx="12" cy="5" r="2" />
      <path d="M12 7.5v5m0 0-3.5 8m3.5-8 3.5 8M7 10.5l5 2 5-2" />
    </>
  ),
  check: <path d="m5 12.5 4.5 4.5L19 7" />,
  ban: (
    <>
      <circle cx="12" cy="12" r="8.5" />
      <path d="m6.5 17.5 11-11" />
    </>
  ),
  star: (
    <path d="m12 4 2.4 5 5.6.8-4 3.9 1 5.5-5-2.7-5 2.7 1-5.5-4-3.9 5.6-.8L12 4Z" />
  ),
  phone: (
    <>
      <rect x="6.5" y="2.5" width="11" height="19" rx="2.5" />
      <path d="M10.5 5.5h3" />
    </>
  ),
  qr: (
    <>
      <rect x="3.5" y="3.5" width="6" height="6" rx="1" />
      <rect x="14.5" y="3.5" width="6" height="6" rx="1" />
      <rect x="3.5" y="14.5" width="6" height="6" rx="1" />
      <path d="M14.5 14.5h3v3m3 0v3h-6" />
    </>
  ),
  heart: (
    <path d="M12 19.5S4 15 4 9.8A4.3 4.3 0 0 1 12 7.4 4.3 4.3 0 0 1 20 9.8c0 5.2-8 9.7-8 9.7Z" />
  ),
  clock: (
    <>
      <circle cx="12" cy="12" r="8.5" />
      <path d="M12 7.5V12l3 2" />
    </>
  ),
  users: (
    <>
      <circle cx="9" cy="8" r="3" />
      <path d="M3.5 19.5c0-3 2.5-5 5.5-5s5.5 2 5.5 5" />
      <path d="M16 6.2a3 3 0 0 1 0 5.6M17.5 14.9c1.8.6 3 2.4 3 4.6" />
    </>
  ),
  arrow: <path d="M5 12h13m-5-5 5 5-5 5" />,
}

export function Icon({ name, className }: IconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.7"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      className={className}
    >
      {paths[name] ?? paths.star}
    </svg>
  )
}
