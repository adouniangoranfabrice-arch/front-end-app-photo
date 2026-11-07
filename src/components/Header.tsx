import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useScrollPosition } from '../hooks'
import { useTheme } from '../theme'

const NAV_LINKS = [
  { label: 'Accueil', href: '/#hero' },
  { label: 'Comment ça marche', href: '/#how-it-works' },
  { label: 'Fonctionnalités', href: '/#features' },
  { label: 'Pour les photographes', href: '/#photographers' },
  { label: 'Tarifs', href: '/#pricing' },
  { label: 'À propos', href: '/#about' },
]

export default function Header() {
  const scrolled = useScrollPosition()
  const [menuOpen, setMenuOpen] = useState(false)
  const { theme, toggleTheme } = useTheme()

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled
          ? 'bg-ink-950/80 backdrop-blur-xl border-b border-overlay/[0.06] py-2.5'
          : 'bg-transparent py-4'
      }`}
    >
      <div className="max-w-content mx-auto px-6 flex items-center justify-between gap-6">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2.5 shrink-0">
          <span className="flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-br from-gold-400 to-gold-600 text-ink-950 shadow-lg shadow-gold-500/20">
            <svg viewBox="0 0 24 24" fill="none" width="22" height="22">
              <path
                d="M3 9.5L7 4h10l4 5.5v9a2 2 0 01-2 2H5a2 2 0 01-2-2v-9z"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinejoin="round"
              />
              <circle cx="12" cy="13" r="3.5" stroke="currentColor" strokeWidth="2" />
              <path d="M8 4l1.5 2h5L16 4" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" />
            </svg>
          </span>
          <span className="font-display text-xl font-extrabold text-gradient-gold hidden sm:block">
            SnapEvent
          </span>
        </Link>

        {/* Desktop Nav */}
        <nav className="hidden lg:flex items-center gap-1 flex-1 justify-center">
          {NAV_LINKS.map((link) => (
            <a
              key={link.href}
              href={link.href}
              className="px-3.5 py-2 text-sm font-medium text-ink-300 rounded-lg transition-colors hover:text-ink-50 hover:bg-overlay/[0.04] whitespace-nowrap"
            >
              {link.label}
            </a>
          ))}
        </nav>

        {/* Desktop Actions */}
        <div className="hidden lg:flex items-center gap-2 shrink-0">
          {/* Theme toggle */}
          <button
            onClick={toggleTheme}
            aria-label="Changer le thème"
            className="p-2.5 rounded-xl bg-ink-800/50 border border-overlay/[0.06] text-ink-400 hover:bg-indigo-600 transition-colors"
          >
            {theme === 'dark' ? (
              <svg viewBox="0 0 24 24" width="20" height="20" fill="none">
                <circle cx="12" cy="12" r="4" stroke="currentColor" strokeWidth="1.8" />
                <path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
              </svg>
            ) : (
              <svg viewBox="0 0 24 24" width="20" height="20" fill="none">
                <path d="M21 12.8A9 9 0 1111.2 3a7 7 0 009.8 9.8z" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" />
              </svg>
            )}
          </button>

          <Link
            to="/login"
            className="px-5 py-2.5 text-sm font-medium text-ink-300 transition-colors hover:text-ink-50"
          >
            Se connecter
          </Link>
          <Link
            to="/signup"
            className="inline-flex items-center gap-2 px-5 py-2.5 text-sm font-semibold rounded-full bg-gradient-to-r from-gold-400 to-gold-600 text-ink-950 shadow-lg shadow-gold-500/25 transition-all hover:-translate-y-0.5 hover:shadow-gold-500/40"
          >
            Créer mon compte
          </Link>
        </div>

        {/* Mobile actions */}
        <div className="flex lg:hidden items-center gap-2 shrink-0">
          <button
            onClick={toggleTheme}
            aria-label="Changer le thème"
            className="p-2 rounded-xl text-ink-400 hover:bg-indigo-600 transition-colors"
          >
            {theme === 'dark' ? (
              <svg viewBox="0 0 24 24" width="20" height="20" fill="none">
                <circle cx="12" cy="12" r="4" stroke="currentColor" strokeWidth="1.8" />
                <path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
              </svg>
            ) : (
              <svg viewBox="0 0 24 24" width="20" height="20" fill="none">
                <path d="M21 12.8A9 9 0 1111.2 3a7 7 0 009.8 9.8z" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" />
              </svg>
            )}
          </button>
          <button
            className={`flex flex-col gap-1.5 p-2 z-50 ${menuOpen ? 'fixed right-6 top-4' : ''}`}
            onClick={() => setMenuOpen((v) => !v)}
            aria-label="Menu"
            aria-expanded={menuOpen}
          >
            <span
              className={`block w-6 h-0.5 bg-ink-100 rounded transition-all ${
                menuOpen ? 'translate-y-2 rotate-45' : ''
              }`}
            />
            <span
              className={`block w-6 h-0.5 bg-ink-100 rounded transition-all ${menuOpen ? 'opacity-0' : ''}`}
            />
            <span
              className={`block w-6 h-0.5 bg-ink-100 rounded transition-all ${
                menuOpen ? '-translate-y-2 -rotate-45' : ''
              }`}
            />
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {menuOpen && (
        <div className="lg:hidden fixed inset-0 z-40">
          <div
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={() => setMenuOpen(false)}
          />
          <nav className="absolute top-0 right-0 h-full w-[80%] max-w-sm bg-ink-900 border-l border-overlay/[0.06] p-8 pt-20 flex flex-col gap-1 overflow-y-auto">
            {NAV_LINKS.map((link) => (
              <a
                key={link.href}
                href={link.href}
                className="px-4 py-3.5 text-base font-medium text-ink-300 border-b border-overlay/[0.04] transition-colors hover:bg-indigo-600"
                onClick={() => setMenuOpen(false)}
              >
                {link.label}
              </a>
            ))}
            <div className="flex flex-col gap-3 mt-6">
              <Link
                to="/login"
                className="w-full text-center py-3 rounded-full border border-overlay/10 text-ink-100 font-semibold transition-colors hover:bg-overlay/5"
                onClick={() => setMenuOpen(false)}
              >
                Se connecter
              </Link>
              <Link
                to="/signup"
                className="w-full text-center py-3 rounded-full bg-gradient-to-r from-gold-400 to-gold-600 text-ink-950 font-semibold shadow-lg shadow-gold-500/25"
                onClick={() => setMenuOpen(false)}
              >
                Créer mon compte
              </Link>
            </div>
          </nav>
        </div>
      )}
    </header>
  )
}
