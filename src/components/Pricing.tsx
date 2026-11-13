import { Link } from 'react-router-dom'
import { useReveal } from '../hooks'

const PLANS = [
  {
    name: 'Découverte',
    tagline: 'Pour tester Photiva sur un ou deux événements.',
    price: '0',
    period: 'FCFA / mois',
    features: ['Événements en nombre limité', 'Galerie en ligne', 'Lien et QR code', 'Téléchargement par les invités'],
    cta: 'Commencer gratuitement',
    highlighted: false,
  },
  {
    name: 'Pro',
    tagline: 'Pour le photographe qui enchaîne les week-ends.',
    price: '15 000',
    period: 'FCFA / mois',
    features: [
      'Plusieurs événements en parallèle',
      'Import massif de photos',
      'Recherche par visage',
      'Téléchargement de l’album complet',
      'Personnalisation de la galerie',
      'Statistiques de consultation',
    ],
    cta: 'Passer à Pro',
    highlighted: true,
  },
  {
    name: 'Studio',
    tagline: 'Pour les studios et les équipes de plusieurs photographes.',
    price: 'Sur devis',
    period: '',
    features: ['Gros volumes de photos', 'Votre logo sur les galeries', 'Nom de domaine personnalisé', 'Accompagnement prioritaire'],
    cta: 'Discutons-en',
    highlighted: false,
  },
]

export default function Pricing() {
  const { ref, visible } = useReveal<HTMLDivElement>()

  return (
    <section className="section border-y border-overlay/[0.06] bg-ink-900/40" id="pricing">
      <div className="container-page">
        <div className="mx-auto max-w-2xl text-center">
          <p className="kicker mb-6 justify-center">Tarifs</p>
          <h2 className="h-section">Commencez gratuitement. Payez quand ça décolle.</h2>
          <p className="lead mt-6">
            Pas d’engagement, pas de frais cachés. Vous changez d’offre quand vous voulez.
          </p>
        </div>

        <div ref={ref} className="mx-auto mt-14 grid max-w-5xl items-start gap-5 md:grid-cols-3">
          {PLANS.map((plan, i) => (
            <div
              key={plan.name}
              className={`relative flex h-full flex-col rounded-3xl p-8 ${
                plan.highlighted
                  ? 'border border-brand-500/50 bg-ink-950 shadow-[0_30px_80px_-30px_rgba(139,92,246,0.35)]'
                  : 'border border-overlay/[0.08] bg-ink-950/40'
              }`}
              style={{
                opacity: visible ? 1 : 0,
                transform: visible ? 'none' : 'translateY(20px)',
                transition: `opacity .6s ease ${i * 0.12}s, transform .6s ease ${i * 0.12}s`,
              }}
            >
              <div className="flex items-center justify-between">
                <h3 className="font-display text-2xl font-semibold text-ink-50">{plan.name}</h3>
                {plan.highlighted && (
                  <span className="rounded-full bg-brand-500/15 px-2.5 py-1 text-[11px] font-semibold text-brand-300">
                    Le plus choisi
                  </span>
                )}
              </div>
              <p className="mt-2 min-h-[44px] text-sm leading-relaxed text-ink-400">{plan.tagline}</p>

              <p className="mt-6 flex items-baseline gap-2">
                <span className="font-display text-[2.6rem] font-semibold leading-none tracking-tight text-ink-50">
                  {plan.price}
                </span>
                {plan.period && <span className="text-sm text-ink-400">{plan.period}</span>}
              </p>

              <ul className="mt-8 flex-1 space-y-3 border-t border-overlay/[0.08] pt-6">
                {plan.features.map((f) => (
                  <li key={f} className="flex gap-3 text-[15px] text-ink-300">
                    <svg viewBox="0 0 24 24" width="18" height="18" fill="none" aria-hidden="true" className="mt-0.5 shrink-0 text-brand-400">
                      <path d="M5 13l4 4L19 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                    {f}
                  </li>
                ))}
              </ul>

              <Link
                to="/signup"
                className={`${plan.highlighted ? 'btn-primary' : 'btn-ghost'} mt-8 w-full rounded-full py-3`}
              >
                {plan.cta}
              </Link>
            </div>
          ))}
        </div>

        <p className="mt-10 text-center text-sm text-ink-500">
          Prix en francs CFA. Vous pouvez changer d’offre ou arrêter à tout moment.
        </p>
      </div>
    </section>
  )
}
