import { Link } from 'react-router-dom'

type LogoSize = 'sm' | 'md' | 'lg'

const SIZES: Record<LogoSize, { mark: number; text: string }> = {
  sm: { mark: 32, text: 'text-lg' },
  md: { mark: 38, text: 'text-xl' },
  lg: { mark: 44, text: 'text-2xl' },
}

/**
 * Emblème Photiva : un « P » dont la boucle est l'objectif d'un appareil,
 * avec un point de mise au point au centre.
 */
export function LogoMark({ size = 38, className = '' }: { size?: number; className?: string }) {
  return (
    <svg
      viewBox="0 0 40 40"
      width={size}
      height={size}
      aria-hidden="true"
      className={`shrink-0 drop-shadow-[0_6px_16px_rgba(139,92,246,0.35)] ${className}`}
    >
      <defs>
        <linearGradient id="photiva-mark-v" x1="0" y1="0" x2="40" y2="40" gradientUnits="userSpaceOnUse">
          <stop offset="0" stopColor="#c4b5fd" />
          <stop offset="0.45" stopColor="#8b5cf6" />
          <stop offset="1" stopColor="#6d28d9" />
        </linearGradient>
      </defs>
      <rect width="40" height="40" rx="11" fill="url(#photiva-mark-v)" />
      {/* Jambage du P */}
      <path d="M13 11.5v18" stroke="#ffffff" strokeWidth="3.4" strokeLinecap="round" />
      {/* Boucle = objectif */}
      <circle cx="20.5" cy="17.5" r="7" fill="none" stroke="#ffffff" strokeWidth="3.4" />
      <circle cx="20.5" cy="17.5" r="2.1" fill="#ffffff" />
      {/* Reflet */}
      <path d="M23.6 13.6a4.6 4.6 0 011.6 2" stroke="#f5f3ff" strokeWidth="1.3" strokeLinecap="round" opacity="0.85" />
    </svg>
  )
}

interface LogoProps {
  size?: LogoSize
  /** Masque le nom sur petits écrans */
  compactOnMobile?: boolean
  /** Toujours clair (pages sombres en permanence, ex. galerie publique) */
  onDark?: boolean
  subtitle?: string
  to?: string | null
  className?: string
}

export default function Logo({
  size = 'md',
  compactOnMobile = false,
  onDark = false,
  subtitle,
  to = '/',
  className = '',
}: LogoProps) {
  const { mark, text } = SIZES[size]

  const content = (
    <>
      <LogoMark size={mark} />
      <span className={`flex flex-col leading-none ${compactOnMobile ? 'hidden sm:flex' : ''}`}>
        <span
          className={`font-display ${text} font-extrabold tracking-tight ${
            onDark ? 'text-white' : 'text-ink-50'
          }`}
        >
          Photiva<span className="text-brand-400">.</span>
        </span>
        {subtitle && (
          <span className="mt-1 text-[10px] font-semibold uppercase tracking-[0.18em] text-brand-400/90">
            {subtitle}
          </span>
        )}
      </span>
    </>
  )

  const classes = `inline-flex items-center gap-2.5 ${className}`

  if (to === null) return <span className={classes}>{content}</span>

  return (
    <Link to={to} className={classes} aria-label="Photiva — accueil">
      {content}
    </Link>
  )
}
