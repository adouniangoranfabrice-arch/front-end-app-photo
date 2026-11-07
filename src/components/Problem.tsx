import { useReveal } from '../hooks'

const PROBLEMS = [
  'Des centaines de photos',
  'Des albums difficiles à parcourir',
  'Des recherches interminables',
  'Des photos que les invités ne retrouvent jamais',
]

export default function Problem() {
  const { ref, visible } = useReveal<HTMLDivElement>()

  return (
    <section className="py-20 md:py-28" id="problem">
      <div className="max-w-content mx-auto px-6">
        <div ref={ref} className={`reveal ${visible ? 'visible' : ''}`}>
          <h2 className="text-3xl md:text-5xl font-extrabold text-center max-w-2xl mx-auto mb-14">
            Combien de temps vos invités passent-ils à chercher leurs photos ?
          </h2>

          <div className="grid md:grid-cols-[1fr_auto_1fr] gap-8 md:gap-10 items-center">
            {/* Before */}
            <div>
              <span className="inline-block mb-6 px-4 py-1.5 text-xs font-bold uppercase tracking-wider text-red-400 bg-red-500/10 border border-red-500/20 rounded-full">
                Avant
              </span>
              <ul className="flex flex-col gap-4">
                {PROBLEMS.map((p) => (
                  <li key={p} className="flex items-center gap-3 text-base text-ink-300">
                    <span className="flex items-center justify-center w-6 h-6 rounded-full bg-red-500/15 text-red-400 text-xs font-bold shrink-0">
                      ✕
                    </span>
                    {p}
                  </li>
                ))}
              </ul>
            </div>

            {/* Divider */}
            <div className="hidden md:block w-px h-full min-h-[200px] bg-gradient-to-b from-transparent via-overlay/10 to-transparent" />

            {/* Solution */}
            <div className="text-left">
              <span className="inline-block mb-6 px-4 py-1.5 text-xs font-bold uppercase tracking-wider text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 rounded-full">
                La solution
              </span>
              <h3 className="text-2xl font-bold mb-7 text-ink-50">
                Nous avons simplifié tout cela.
              </h3>
              <div className="flex items-center gap-4 flex-wrap">
                <span className="text-lg font-semibold text-ink-300 px-5 py-3 rounded-xl bg-overlay/[0.04] border border-overlay/[0.08]">
                  Prenez un selfie
                </span>
                <span className="text-2xl bg-indigo-600">→</span>
                <span className="text-lg font-semibold text-gold-300 px-5 py-3 rounded-xl bg-gold-500/10 border border-gold-500/30 shadow-[0_0_20px_rgba(245,158,11,0.15)]">
                  Retrouvez vos photos
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
