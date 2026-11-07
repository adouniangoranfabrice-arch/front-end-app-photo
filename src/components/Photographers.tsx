import { useReveal } from '../hooks'

const FEATURES = [
  { icon: '📸', title: 'Gestion des événements', text: 'Organisez tous vos événements depuis un seul espace.' },
  { icon: '☁️', title: 'Galerie en ligne', text: 'Publiez facilement vos photos.' },
  { icon: '🔍', title: 'Recherche intelligente', text: 'Permettez aux invités de retrouver leurs photos.' },
  { icon: '📱', title: 'QR Code', text: 'Partagez votre galerie instantanément.' },
  { icon: '📊', title: 'Statistiques', text: 'Suivez les consultations et téléchargements.' },
  { icon: '💰', title: 'Vente de photos', text: 'Monétisez vos photos directement depuis la plateforme.' },
]

export default function Photographers() {
  const { ref, visible } = useReveal<HTMLDivElement>()

  return (
    <section className="py-20 md:py-28 bg-ink-900/50" id="photographers">
      <div className="max-w-content mx-auto px-6">
        <div ref={ref} className={`text-center reveal ${visible ? 'visible' : ''}`}>
          <span className="inline-flex items-center gap-2 px-4 py-2 mb-5 text-xs font-semibold uppercase tracking-wider text-gold-300 bg-gold-500/10 border border-gold-500/20 rounded-full">
            Pour les photographes
          </span>
          <h2 className="text-3xl md:text-5xl font-extrabold mb-5">
            Votre travail mérite une expérience à la hauteur.
          </h2>
          <p className="text-lg text-ink-300 max-w-xl mx-auto mb-14 leading-relaxed">
            Ne vous contentez plus de livrer des dossiers remplis de photos. Offrez à vos clients une
            expérience moderne, simple et mémorable.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {FEATURES.map((f, i) => (
            <div
              key={f.title}
              className="group p-9 rounded-2xl bg-ink-800/50 border border-overlay/[0.06] transition-all duration-300 hover:-translate-y-1.5 hover:border-gold-500/30 hover:shadow-2xl hover:shadow-gold-500/5"
              style={{
                opacity: visible ? 1 : 0,
                transform: visible ? 'translateY(0)' : 'translateY(30px)',
                transition: `opacity 0.5s ease ${i * 0.1}s, transform 0.5s ease ${i * 0.1}s, border-color 0.3s, box-shadow 0.3s`,
              }}
            >
              <div className="text-4xl mb-5 leading-none">{f.icon}</div>
              <h3 className="text-lg font-bold mb-2.5 text-ink-50 font-body">{f.title}</h3>
              <p className="text-sm text-ink-300 leading-relaxed">{f.text}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
