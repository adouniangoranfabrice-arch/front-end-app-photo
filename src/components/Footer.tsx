import { Link } from 'react-router-dom'
import Logo from './Logo'

const COLUMNS = [
  { title: 'Produit', links: [['Comment ça marche', '/#how-it-works'], ['Pour les photographes', '/#photographers'], ['Tarifs', '/#pricing'], ['Questions fréquentes', '/#faq']] },
  { title: 'Votre espace', links: [['Créer un compte', '/signup'], ['Se connecter', '/login'], ['Tableau de bord', '/dashboard']] },
  { title: 'Légal', links: [["Conditions d'utilisation", '#'], ['Confidentialité', '#'], ['Données personnelles', '#']] },
]

const SOCIALS = [
  { name: 'WhatsApp', icon: (
    <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor">
      <path d="M12 2a10 10 0 00-8.6 15l-1.4 5 5.2-1.4A10 10 0 1012 2zm0 18a8 8 0 01-4.1-1.1l-.3-.2-3 .8.8-2.9-.2-.3A8 8 0 1112 20zm4.4-6c-.2-.1-1.4-.7-1.6-.8-.2-.1-.4-.1-.6.1-.2.2-.6.8-.8 1-.1.1-.3.2-.5.1-.7-.3-1.4-.6-2.1-1.6-.5-.9-.5-1-.4-1.2.1-.1.2-.3.4-.5.1-.2.1-.3.2-.5.1-.1 0-.2-.1-.3-.1-.1 0-.6-.2-1-.3-.3-.1-.5-.1-.7-.1-.1 0-.3.1-.4.2-.2.2-.6.7-.6 1.5 0 .9.6 1.7.7 1.9.1.2 1.2 1.9 3 2.6.4.2.8.3 1.1.4.5.1.9.1 1.2.1.4-.1 1.1-.5 1.3-.8.2-.3.2-.6.1-.7z" />
    </svg>
  ) },
  { name: 'Instagram', icon: (
    <svg viewBox="0 0 24 24" width="20" height="20" fill="none">
      <rect x="3" y="3" width="18" height="18" rx="5" stroke="currentColor" strokeWidth="1.8" />
      <circle cx="12" cy="12" r="4" stroke="currentColor" strokeWidth="1.8" />
      <circle cx="17.5" cy="6.5" r="1" fill="currentColor" />
    </svg>
  ) },
  { name: 'Facebook', icon: (
    <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor">
      <path d="M14 9h3V6h-3c-1.7 0-3 1.3-3 3v2H8v3h3v7h3v-7h2.5l.5-3H14V9z" />
    </svg>
  ) },
  { name: 'LinkedIn', icon: (
    <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor">
      <path d="M6 8h3v10H6zM7.5 3a1.5 1.5 0 100 3 1.5 1.5 0 000-3zM11 8h3v1.4c.5-.9 1.6-1.7 3-1.7 3 0 3.5 2 3.5 4.5V18h-3v-5c0-1.2-.3-2-1.5-2s-1.5.8-1.5 2v5h-3V8z" />
    </svg>
  ) },
]

export default function Footer() {
  return (
    <footer className="bg-ink-950 pt-20 pb-8 border-t border-overlay/[0.06]" id="about">
      <div className="max-w-content mx-auto px-6">
        <div className="grid md:grid-cols-[1fr_2fr] gap-12 md:gap-16 mb-14">
          {/* Brand */}
          <div className="max-w-xs">
            <div className="flex items-center gap-2.5 mb-5">
              <Logo />
            </div>
            <p className="text-sm text-ink-400 leading-relaxed mb-6">
              La galerie photo qui permet à chaque invité de retrouver ses photos en un selfie. Conçue à Abidjan, pour les photographes d'ici.
            </p>
            <div className="flex gap-3">
              {SOCIALS.map((s) => (
                <a
                  key={s.name}
                  href="#"
                  aria-label={s.name}
                  className="flex items-center justify-center w-10 h-10 rounded-lg bg-overlay/[0.05] border border-overlay/[0.06] text-ink-400 transition-all hover:bg-brand-500/10 hover:border-brand-500/30 hover:text-brand-400 hover:-translate-y-0.5"
                >
                  {s.icon}
                </a>
              ))}
            </div>
          </div>

          {/* Columns */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-8">
            {COLUMNS.map((col) => (
              <div key={col.title}>
                <h4 className="text-xs font-semibold uppercase tracking-[0.18em] text-ink-500 font-body mb-5">
                  {col.title}
                </h4>
                <ul className="flex flex-col gap-3">
                  {col.links.map(([label, href]) => (
                    <li key={label}>
                      {href.startsWith('/') && !href.includes('#') ? (
                        <Link to={href} className="text-sm text-ink-400 transition-colors hover:text-ink-50">{label}</Link>
                      ) : (
                        <a href={href} className="text-sm text-ink-400 transition-colors hover:text-ink-50">{label}</a>
                      )}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>

        {/* Bottom */}
        <div className="flex flex-col sm:flex-row justify-between items-center gap-3 pt-8 border-t border-overlay/[0.06]">
          <p className="text-sm text-ink-500">© 2026 Photiva. Tous droits réservés.</p>
          <p className="text-sm text-ink-500">
            Fait avec soin en Côte d'Ivoire
          </p>
        </div>
      </div>
    </footer>
  )
}
