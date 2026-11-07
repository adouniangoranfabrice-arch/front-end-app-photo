import { Link } from 'react-router-dom'
import { useReveal } from '../hooks'

const PLANS = [
  {
    name: 'GRATUIT',
    tagline: 'Pour découvrir la plateforme.',
    price: '0',
    currency: 'FCFA',
    period: '/mois',
    features: ['Événements limités', 'Galerie', 'QR Code', 'Partage'],
    cta: 'Commencer gratuitement',
    highlighted: false,
    isContact: false,
  },
  {
    name: 'PRO',
    tagline: 'Pour les photographes actifs.',
    price: '15 000',
    currency: 'FCFA',
    period: '/mois',
    features: [
      'Plusieurs événements',
      'Importation massive',
      'Recherche par visage',
      'Statistiques',
      'Personnalisation',
      'Téléchargements',
    ],
    cta: 'Choisir Pro',
    highlighted: true,
    isContact: false,
  },
  {
    name: 'BUSINESS',
    tagline: 'Pour les studios et équipes.',
    price: 'Sur mesure',
    currency: '',
    period: '',
    features: [
      'Gros volume',
      'Branding personnalisé',
      'Domaine personnalisé',
      'Statistiques avancées',
      'Support prioritaire',
    ],
    cta: 'Nous contacter',
    highlighted: false,
    isContact: true,
  },
]

export default function Pricing() {
  const { ref, visible } = useReveal<HTMLDivElement>()

  return (
    <section className="py-20 md:py-28 text-center bg-ink-900/50" id="pricing">
      <div className="max-w-content mx-auto px-6">
        <h2 className="text-3xl md:text-5xl font-extrabold mb-5">
          Commencez gratuitement. Évoluez à votre rythme.
        </h2>
        <p className="text-lg text-ink-300 max-w-xl mx-auto mb-14 leading-relaxed">
          Des tarifs transparents, sans engagement. Choisissez l'offre qui correspond à votre activité.
        </p>

        <div ref={ref} className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto items-stretch">
          {PLANS.map((plan, i) => (
            <div
              key={plan.name}
              className={`relative p-9 rounded-2xl bg-ink-800/50 border text-left flex flex-col transition-all duration-300 ${
                plan.highlighted
                  ? 'border-gold-500 shadow-[0_0_40px_rgba(245,158,11,0.15)] md:-translate-y-2'
                  : 'border-overlay/[0.06] hover:border-overlay/15 hover:shadow-2xl'
              }`}
              style={{
                opacity: visible ? 1 : 0,
                transform: visible ? 'translateY(0)' : 'translateY(30px)',
                transition: `opacity 0.6s ease ${i * 0.15}s, transform 0.6s ease ${i * 0.15}s, border-color 0.3s, box-shadow 0.3s`,
              }}
            >
              {plan.highlighted && (
                <span className="absolute -top-3.5 left-1/2 -translate-x-1/2 px-4 py-1.5 text-xs font-bold uppercase tracking-wide text-ink-950 bg-gradient-to-r from-gold-400 to-gold-600 rounded-full whitespace-nowrap">
                  Populaire
                </span>
              )}
              <h3 className="text-xl font-extrabold tracking-wide text-ink-50 font-body mb-2">
                {plan.name}
              </h3>
              <p className="text-sm text-ink-400 mb-6">{plan.tagline}</p>
              <div className="flex items-baseline gap-1 flex-wrap mb-8">
                <span className="text-4xl font-extrabold text-ink-50 font-display">{plan.price}</span>
                {plan.currency && <span className="text-base font-semibold text-ink-300">{plan.currency}</span>}
                {plan.period && <span className="text-sm text-ink-500">{plan.period}</span>}
              </div>
              <ul className="flex flex-col gap-3.5 mb-8 flex-1">
                {plan.features.map((f) => (
                  <li key={f} className="flex items-center gap-2.5 text-sm text-ink-300">
                    <svg viewBox="0 0 24 24" width="18" height="18" fill="none" className="bg-indigo-600 shrink-0">
                      <path
                        d="M5 13l4 4L19 7"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                    {f}
                  </li>
                ))}
              </ul>
              <Link
                to={plan.isContact ? '/signup' : '/signup'}
                className={`w-full text-center py-3.5 rounded-full font-semibold transition-all ${
                  plan.highlighted
                    ? 'bg-gradient-to-r from-gold-400 to-gold-600 text-ink-950 shadow-lg shadow-gold-500/25 hover:-translate-y-0.5 hover:shadow-gold-500/40'
                    : 'bg-overlay/[0.06] border border-overlay/10 text-ink-100 hover:bg-overlay/[0.12] hover:border-overlay/20'
                }`}
              >
                {plan.cta}
              </Link>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
