import { useReveal } from '../hooks'

const STEPS = [
  {
    num: '01',
    title: 'Créez votre événement',
    text: 'Créez votre événement en quelques clics.',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" width="32" height="32">
        <rect x="3" y="5" width="18" height="16" rx="2" stroke="currentColor" strokeWidth="1.8" />
        <path d="M3 9h18M8 3v4M16 3v4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
        <circle cx="12" cy="14" r="2" stroke="currentColor" strokeWidth="1.8" />
      </svg>
    ),
  },
  {
    num: '02',
    title: 'Importez vos photos',
    text: 'Importez des centaines de photos depuis votre espace photographe.',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" width="32" height="32">
        <path d="M12 16V4m0 0L8 8m4-4l4 4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M4 16v2a2 2 0 002 2h12a2 2 0 002-2v-2" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
      </svg>
    ),
  },
  {
    num: '03',
    title: 'Partagez',
    text: 'Générez automatiquement un lien et un QR Code.',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" width="32" height="32">
        <rect x="3" y="3" width="7" height="7" rx="1" stroke="currentColor" strokeWidth="1.8" />
        <rect x="14" y="3" width="7" height="7" rx="1" stroke="currentColor" strokeWidth="1.8" />
        <rect x="3" y="14" width="7" height="7" rx="1" stroke="currentColor" strokeWidth="1.8" />
        <path d="M14 14h3v3h-3zM17 17h4v4h-4zM14 18v3M18 14h3" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
      </svg>
    ),
  },
  {
    num: '04',
    title: 'Retrouvez',
    text: 'Les invités prennent un selfie et retrouvent les photos sur lesquelles ils apparaissent.',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" width="32" height="32">
        <circle cx="12" cy="11" r="3.5" stroke="currentColor" strokeWidth="1.8" />
        <path d="M5 8a2 2 0 012-2m10 2a2 2 0 00-2-2M5 16v2a2 2 0 002 2h10a2 2 0 002-2v-2" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
        <path d="M12 15v3" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
      </svg>
    ),
  },
]

export default function HowItWorks() {
  const { ref, visible } = useReveal<HTMLDivElement>()

  return (
    <section className="py-20 md:py-28 text-center" id="how-it-works">
      <div className="max-w-content mx-auto px-6">
        <span className="inline-flex items-center gap-2 px-4 py-2 mb-5 text-xs font-semibold uppercase tracking-wider text-gold-300 bg-gold-500/10 border border-gold-500/20 rounded-full">
          Comment ça marche
        </span>
        <h2 className="text-3xl md:text-5xl font-extrabold mb-5">Simple comme un selfie.</h2>
        <p className="text-lg text-ink-300 max-w-xl mx-auto mb-14 leading-relaxed">
          De la création de l'événement à la livraison des photos, tout est pensé pour vous faire
          gagner du temps.
        </p>

        <div ref={ref} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {STEPS.map((step, i) => (
            <div
              key={step.num}
              className="group relative text-left p-8 rounded-2xl bg-ink-800/50 border border-overlay/[0.06] transition-all duration-300 hover:-translate-y-1.5 hover:border-gold-500/30 hover:shadow-2xl hover:shadow-gold-500/5 overflow-hidden"
              style={{
                opacity: visible ? 1 : 0,
                transform: visible ? 'translateY(0)' : 'translateY(30px)',
                transition: `opacity 0.6s ease ${i * 0.15}s, transform 0.6s ease ${i * 0.15}s, border-color 0.3s, box-shadow 0.3s`,
              }}
            >
              <div className="absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-gold-400 to-gold-600 origin-left scale-x-0 group-hover:scale-x-100 transition-transform duration-300" />
              <div className="text-4xl font-display font-extrabold text-ink-700 mb-4 transition-colors group-hover:text-gold-600/40">
                {step.num}
              </div>
              <div className="bg-indigo-600 mb-5 transition-transform group-hover:scale-110">
                {step.icon}
              </div>
              <h3 className="text-xl font-bold mb-3 text-ink-50">{step.title}</h3>
              <p className="text-sm text-ink-300 leading-relaxed">{step.text}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
