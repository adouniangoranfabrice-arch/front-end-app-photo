import { useReveal } from '../hooks'

const PHONE_PHOTOS = [
  'https://images.pexels.com/photos/6697317/pexels-photo-6697317.jpeg?auto=compress&cs=tinysrgb&w=200',
  'https://images.pexels.com/photos/7243117/pexels-photo-7243117.jpeg?auto=compress&cs=tinysrgb&w=200',
  'https://images.pexels.com/photos/13619259/pexels-photo-13619259.jpeg?auto=compress&cs=tinysrgb&w=200',
  'https://images.pexels.com/photos/13929492/pexels-photo-13929492.jpeg?auto=compress&cs=tinysrgb&w=200',
  'https://images.pexels.com/photos/6697317/pexels-photo-6697317.jpeg?auto=compress&cs=tinysrgb&w=200',
  'https://images.pexels.com/photos/13619259/pexels-photo-13619259.jpeg?auto=compress&cs=tinysrgb&w=200',
]

const SELFIE_IMG =
  'https://images.pexels.com/photos/7243117/pexels-photo-7243117.jpeg?auto=compress&cs=tinysrgb&w=300'

const PIPELINE = ['PHOTO', 'DÉTECTION DU VISAGE', 'ANALYSE', 'RECHERCHE', 'VOS PHOTOS']

export default function FacialRecognition() {
  const { ref, visible } = useReveal<HTMLDivElement>()

  return (
    <section className="relative py-20 md:py-28 overflow-hidden" id="facial-recognition">
      {/* Glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full bg-gold-500/[0.06] blur-3xl pointer-events-none" />

      <div className="max-w-content mx-auto px-6 relative z-10">
        <div
          ref={ref}
          className={`grid md:grid-cols-2 gap-12 md:gap-16 items-center reveal ${visible ? 'visible' : ''}`}
        >
          {/* Left: text + pipeline */}
          <div>
            <span className="inline-flex items-center gap-2 px-4 py-2 mb-5 text-xs font-semibold uppercase tracking-wider text-gold-300 bg-gold-500/10 border border-gold-500/20 rounded-full">
              Technologie
            </span>
            <h2 className="text-3xl md:text-5xl font-extrabold mb-5 leading-tight">
              Une nouvelle façon de retrouver vos photos.
            </h2>
            <p className="text-lg text-ink-300 leading-relaxed mb-9">
              Notre technologie analyse les visages présents dans les photos de votre événement afin
              de permettre aux invités de retrouver rapidement leurs propres photos à partir d'un
              selfie.
            </p>

            {/* Pipeline */}
            <div className="flex flex-col mb-8">
              {PIPELINE.map((step, i) => (
                <div
                  key={step}
                  className="flex flex-col items-center"
                  style={{
                    opacity: visible ? 1 : 0,
                    transform: visible ? 'translateX(0)' : 'translateX(-20px)',
                    transition: `opacity 0.5s ease ${i * 0.15}s, transform 0.5s ease ${i * 0.15}s`,
                  }}
                >
                  <span className="text-sm font-semibold tracking-wide text-gold-300 px-5 py-2.5 rounded-full bg-gold-500/[0.08] border border-gold-500/20 whitespace-nowrap">
                    {step}
                  </span>
                  {i < PIPELINE.length - 1 && (
                    <span className="text-gold-500 text-xl my-1 animate-float">↓</span>
                  )}
                </div>
              ))}
            </div>

            <div className="flex items-center gap-2.5 text-sm text-emerald-400 px-4 py-3.5 rounded-xl bg-emerald-500/[0.06] border border-emerald-500/15">
              <svg viewBox="0 0 24 24" width="18" height="18" fill="none">
                <path
                  d="M12 3l8 3v6c0 5-3.5 8-8 9-4.5-1-8-4-8-9V6l8-3z"
                  stroke="currentColor"
                  strokeWidth="1.8"
                  strokeLinejoin="round"
                />
                <path d="M9 12l2 2 4-4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              <span>Confidentialité et sécurité au cœur de l'expérience.</span>
            </div>
          </div>

          {/* Right: phone mockup */}
          <div className="flex justify-center">
            <div className="relative w-[300px] h-[620px] bg-ink-950 rounded-[44px] p-3 shadow-2xl border border-overlay/10 shadow-gold-500/10">
              <div className="absolute top-3 left-1/2 -translate-x-1/2 w-30 h-7 bg-ink-950 rounded-b-2xl z-20" style={{ width: '120px' }} />
              <div className="w-full h-full bg-ink-900 rounded-[32px] overflow-hidden flex flex-col">
                {/* Selfie screen */}
                <div className="pt-10 px-5 pb-4 text-center">
                  <span className="font-display text-lg font-bold text-ink-50">Prenez votre selfie</span>
                </div>
                <div className="px-5 pb-5 flex flex-col items-center gap-4">
                  <div className="relative w-40 h-40 rounded-2xl overflow-hidden border-2 border-gold-500 shadow-[0_0_20px_rgba(245,158,11,0.3)]">
                    <div className="absolute left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-gold-400 to-transparent shadow-[0_0_10px_#fbbf24] animate-scan z-10" />
                    <img src={SELFIE_IMG} alt="Selfie" className="w-full h-full object-cover" />
                  </div>
                  <button className="px-7 py-3 rounded-full bg-gradient-to-r from-gold-400 to-gold-600 text-ink-950 text-sm font-semibold shadow-lg shadow-gold-500/30 transition-transform hover:scale-105">
                    Prendre un selfie
                  </button>
                </div>
                {/* Results */}
                <div className="px-4 pb-4 flex-1 flex flex-col">
                  <div className="text-center mb-3">
                    <span className="text-sm font-bold text-gold-300 px-4 py-1.5 rounded-full bg-gold-500/10">
                      24 photos trouvées
                    </span>
                  </div>
                  <div className="grid grid-cols-3 gap-1.5 flex-1">
                    {PHONE_PHOTOS.map((src, i) => (
                      <div
                        key={i}
                        className="rounded-lg overflow-hidden aspect-square opacity-0 animate-fade-in"
                        style={{ animationDelay: `${0.5 + i * 0.1}s` }}
                      >
                        <img src={src} alt={`Photo ${i + 1}`} className="w-full h-full object-cover" />
                      </div>
                    ))}
                  </div>
                  <button className="mt-3 py-2.5 rounded-xl bg-overlay/[0.06] border border-overlay/[0.08] text-ink-100 text-sm font-semibold transition-colors hover:bg-overlay/10">
                    Télécharger mes photos
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
