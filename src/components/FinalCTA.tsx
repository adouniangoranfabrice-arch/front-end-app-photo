import { Link } from 'react-router-dom'
import { useReveal } from '../hooks'

const CTA_BG =
  'https://images.pexels.com/photos/38627012/pexels-photo-38627012.jpeg?auto=compress&cs=tinysrgb&w=1600'

export default function FinalCTA() {
  const { ref, visible } = useReveal<HTMLDivElement>()

  return (
    <section className="relative py-28 md:py-36 overflow-hidden" id="final-cta">
      <div className="absolute inset-0 z-0">
        <img src={CTA_BG} alt="Célébration" className="w-full h-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-b from-ink-950/80 via-ink-950/85 to-ink-950/95" />
      </div>

      <div className="max-w-content mx-auto px-6 relative z-10">
        <div ref={ref} className={`text-center max-w-2xl mx-auto reveal ${visible ? 'visible' : ''}`}>
          <h2 className="text-3xl md:text-5xl font-extrabold mb-5 leading-tight">
            Vos photos sont précieuses. Rendez-les faciles à retrouver.
          </h2>
          <p className="text-lg text-ink-300 leading-relaxed mb-9">
            Commencez dès aujourd'hui à offrir une nouvelle expérience à vos clients et à leurs invités.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              to="/signup"
              className="inline-flex items-center justify-center gap-2 px-7 py-3.5 rounded-full bg-gradient-to-r from-gold-400 to-gold-600 text-ink-950 font-semibold shadow-xl shadow-gold-500/30 transition-all hover:-translate-y-0.5 hover:shadow-gold-500/45"
            >
              Créer mon espace photographe →
            </Link>
            <a
              href="#how-it-works"
              className="inline-flex items-center justify-center gap-2 px-7 py-3.5 rounded-full bg-overlay/[0.06] border border-overlay/10 text-ink-100 font-semibold backdrop-blur-md transition-all hover:bg-overlay/[0.12] hover:border-overlay/20 hover:-translate-y-0.5"
            >
              Découvrir la plateforme
            </a>
          </div>
        </div>
      </div>
    </section>
  )
}
