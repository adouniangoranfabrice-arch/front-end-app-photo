import { useReveal } from '../hooks'

const PHONE_PHOTOS = [
  'https://images.pexels.com/photos/6697317/pexels-photo-6697317.jpeg?auto=compress&cs=tinysrgb&w=240',
  'https://images.pexels.com/photos/13619259/pexels-photo-13619259.jpeg?auto=compress&cs=tinysrgb&w=240',
  'https://images.pexels.com/photos/13929492/pexels-photo-13929492.jpeg?auto=compress&cs=tinysrgb&w=240',
  'https://images.pexels.com/photos/7243117/pexels-photo-7243117.jpeg?auto=compress&cs=tinysrgb&w=240',
  'https://images.pexels.com/photos/30049860/pexels-photo-30049860.jpeg?auto=compress&cs=tinysrgb&w=240',
  'https://images.pexels.com/photos/32957317/pexels-photo-32957317.jpeg?auto=compress&cs=tinysrgb&w=240',
]

const GESTURES = [
  { title: 'Ils ouvrent le lien', text: 'Depuis WhatsApp ou en scannant le QR code. La galerie s’ouvre dans le navigateur.' },
  { title: 'Ils prennent un selfie', text: 'La caméra s’ouvre directement. Une photo de face, bien éclairée, suffit.' },
  { title: 'Ils gardent leurs photos', text: 'Seules les photos où ils apparaissent s’affichent. Ils les téléchargent une à une ou toutes ensemble.' },
]

export default function FacialRecognition() {
  const { ref, visible } = useReveal<HTMLDivElement>()

  return (
    <section className="section relative overflow-hidden bg-ink-900/40" id="features">
      <div ref={ref} className={`container-page reveal ${visible ? 'visible' : ''}`}>
        <div className="grid items-center gap-16 lg:grid-cols-[1fr_auto] lg:gap-24">
          <div>
            <p className="kicker mb-6">Côté invités</p>
            <h2 className="h-section max-w-xl">Trois gestes, et chacun a ses souvenirs.</h2>
            <p className="lead mt-6 max-w-lg">
              Vos invités n’ont rien à installer et aucun compte à créer. Même la tante qui découvre
              son smartphone s’en sort.
            </p>

            <ol className="mt-10 space-y-7">
              {GESTURES.map((g, i) => (
                <li key={g.title} className="flex gap-5">
                  <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-brand-500/40 font-display text-sm italic text-brand-400">
                    {i + 1}
                  </span>
                  <div>
                    <h3 className="font-body text-base font-semibold text-ink-50">{g.title}</h3>
                    <p className="mt-1 text-[15px] leading-relaxed text-ink-400">{g.text}</p>
                  </div>
                </li>
              ))}
            </ol>

            <div className="mt-10 flex max-w-lg gap-3 rounded-2xl border border-overlay/[0.08] bg-ink-950/50 p-4">
              <svg viewBox="0 0 24 24" width="20" height="20" fill="none" aria-hidden="true" className="mt-0.5 shrink-0 text-emerald-400">
                <path d="M12 3l8 3v6c0 5-3.5 8-8 9-4.5-1-8-4-8-9V6l8-3z" stroke="currentColor" strokeWidth="1.7" strokeLinejoin="round" />
                <path d="M9 12l2 2 4-4" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              <p className="text-sm leading-relaxed text-ink-300">
                <span className="font-semibold text-ink-100">Le selfie n’est jamais conservé.</span>{' '}
                Il sert uniquement à la recherche, le temps de trouver les photos, puis il est oublié.
              </p>
            </div>
          </div>

          {/* Téléphone */}
          <div className="mx-auto">
            <div className="relative w-[290px] rounded-[46px] border border-white/10 bg-[#0c0c0a] p-2.5 shadow-2xl shadow-black/50">
              <div className="absolute left-1/2 top-4 z-20 h-6 w-24 -translate-x-1/2 rounded-full bg-black" />
              <div className="overflow-hidden rounded-[38px] bg-[#161614] text-white">
                <div className="px-5 pb-4 pt-14">
                  <p className="text-[11px] uppercase tracking-[0.18em] text-white/45">Mariage</p>
                  <p className="font-display text-xl font-semibold">Aya &amp; Kouamé</p>
                </div>

                <div className="mx-4 flex items-center gap-3 rounded-2xl bg-white/[0.06] p-3">
                  <img src={PHONE_PHOTOS[3]} alt="" className="h-12 w-12 rounded-full object-cover ring-2 ring-brand-400" />
                  <div>
                    <p className="text-sm font-semibold">24 photos de vous</p>
                    <p className="text-xs text-white/55">sur 1 184 dans la galerie</p>
                  </div>
                </div>

                <div className="mt-4 grid grid-cols-3 gap-1 px-1">
                  {PHONE_PHOTOS.map((src, i) => (
                    <img key={i} src={src} alt="" loading="lazy" className="aspect-square w-full rounded-md object-cover" />
                  ))}
                </div>

                <div className="p-4">
                  <div className="rounded-xl bg-gradient-to-r from-brand-400 to-brand-600 py-3 text-center text-sm font-semibold text-white">
                    Tout télécharger
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
