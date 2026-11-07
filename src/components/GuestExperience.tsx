import { useReveal } from '../hooks'

export default function GuestExperience() {
  const { ref, visible } = useReveal<HTMLDivElement>()

  return (
    <section className="py-20 md:py-28 bg-ink-900/50" id="guest-experience">
      <div className="max-w-content mx-auto px-6">
        <div ref={ref} className={`grid md:grid-cols-2 gap-12 md:gap-16 items-center reveal ${visible ? 'visible' : ''}`}>
          {/* Text */}
          <div className="text-center md:text-left">
            <span className="inline-flex items-center gap-2 px-4 py-2 mb-5 text-xs font-semibold uppercase tracking-wider text-gold-300 bg-gold-500/10 border border-gold-500/20 rounded-full">
              Expérience invité
            </span>
            <h2 className="text-3xl md:text-5xl font-extrabold mb-5 leading-tight">
              Une expérience simple pour vos invités.
            </h2>
            <p className="text-lg text-ink-300 leading-relaxed mb-7">
              Vos invités n'ont rien à installer, aucun compte à créer. Ils scannent, prennent un
              selfie et retrouvent leurs photos en quelques secondes.
            </p>
            <div className="inline-flex items-center gap-2.5 text-sm text-emerald-400 px-4 py-3.5 rounded-xl bg-emerald-500/[0.06] border border-emerald-500/15">
              <svg viewBox="0 0 24 24" width="20" height="20" fill="none">
                <path
                  d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                  stroke="currentColor"
                  strokeWidth="1.8"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
              <span>Aucune création de compte nécessaire.</span>
            </div>
          </div>

          {/* Phone mockup */}
          <div className="flex justify-center">
            <div className="relative w-[280px] h-[560px] bg-ink-950 rounded-[44px] p-3 shadow-2xl border border-overlay/10">
              <div className="absolute top-3 left-1/2 -translate-x-1/2 w-28 h-7 bg-ink-950 rounded-b-2xl z-20" />
              <div className="w-full h-full bg-ink-900 rounded-[32px] overflow-hidden flex flex-col">
                <div className="pt-10 px-5 pb-2 text-center">
                  <span className="font-display text-base font-semibold text-gold-300">
                    Mariage Kouassi & Grâce
                  </span>
                </div>
                <div className="flex-1 flex flex-col items-center justify-center px-6 pb-8 gap-4">
                  <div className="text-5xl">📸</div>
                  <h3 className="text-xl font-bold text-ink-50 font-body">Retrouvez vos photos</h3>
                  <button className="w-full py-3.5 rounded-xl bg-gradient-to-r from-gold-400 to-gold-600 text-ink-950 text-sm font-semibold shadow-lg shadow-gold-500/30 transition-transform hover:scale-[1.02]">
                    Prendre un selfie
                  </button>
                  <span className="text-sm text-ink-500">ou</span>
                  <button className="w-full py-3.5 rounded-xl bg-overlay/[0.06] border border-overlay/[0.08] text-ink-100 text-sm font-semibold transition-colors hover:bg-overlay/10">
                    Importer une photo
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
