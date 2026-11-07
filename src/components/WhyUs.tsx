import { useReveal } from '../hooks'

const REASONS = [
  { icon: '⚡', title: 'Rapidité', text: 'Vos invités trouvent leurs photos rapidement.' },
  { icon: '🎯', title: 'Simplicité', text: 'Une expérience accessible depuis un smartphone.' },
  { icon: '📸', title: 'Professionnalisme', text: 'Présentez vos photos dans une galerie moderne.' },
  { icon: '🇨🇮', title: "Pensé pour la Côte d'Ivoire", text: 'Une solution adaptée aux besoins des photographes événementiels ivoiriens.' },
  { icon: '🔐', title: 'Sécurité', text: 'Protection et contrôle des accès aux contenus.' },
  { icon: '📈', title: 'Développement de votre activité', text: 'Transformez votre galerie en outil de fidélisation et de vente.' },
]

export default function WhyUs() {
  const { ref, visible } = useReveal<HTMLDivElement>()

  return (
    <section className="py-20 md:py-28 text-center" id="why-us">
      <div className="max-w-content mx-auto px-6">
        <h2 className="text-3xl md:text-5xl font-extrabold mb-5">
          Pourquoi les photographes nous choisissent ?
        </h2>
        <p className="text-lg text-ink-300 max-w-xl mx-auto mb-14 leading-relaxed">
          Une plateforme conçue par et pour les photographes événementiels.
        </p>

        <div ref={ref} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {REASONS.map((r, i) => (
            <div
              key={r.title}
              className="group p-9 rounded-2xl bg-ink-800/50 border border-overlay/[0.06] text-left transition-all duration-300 hover:-translate-y-1.5 hover:border-gold-500/30 hover:shadow-2xl hover:shadow-gold-500/5"
              style={{
                opacity: visible ? 1 : 0,
                transform: visible ? 'translateY(0)' : 'translateY(20px)',
                transition: `opacity 0.5s ease ${(i % 3) * 0.1}s, transform 0.5s ease ${(i % 3) * 0.1}s, border-color 0.3s, box-shadow 0.3s`,
              }}
            >
              <div className="text-4xl mb-4 leading-none">{r.icon}</div>
              <h3 className="text-lg font-bold mb-2.5 text-ink-50 font-body">{r.title}</h3>
              <p className="text-sm text-ink-300 leading-relaxed">{r.text}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
