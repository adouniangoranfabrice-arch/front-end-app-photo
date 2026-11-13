import { Link } from 'react-router-dom'

const MAIN_PHOTO =
  'https://images.pexels.com/photos/30049861/pexels-photo-30049861.jpeg?auto=compress&cs=tinysrgb&w=1100'
const SECOND_PHOTO =
  'https://images.pexels.com/photos/29997401/pexels-photo-29997401.jpeg?auto=compress&cs=tinysrgb&w=500'
const SELFIE =
  'https://images.pexels.com/photos/7243117/pexels-photo-7243117.jpeg?auto=compress&cs=tinysrgb&w=160'

export default function Hero() {
  return (
    <section id="hero" className="relative overflow-hidden pt-28 pb-20 md:pt-36 md:pb-28">
      {/* Lumière chaude discrète, comme un projecteur hors champ */}
      <div className="pointer-events-none absolute -right-40 -top-40 h-[620px] w-[620px] rounded-full bg-brand-500/[0.09] blur-3xl" />

      <div className="container-page relative grid items-center gap-14 lg:grid-cols-[1.05fr_1fr] lg:gap-10">
        {/* Texte */}
        <div className="opacity-0 animate-fade-up">
          <p className="kicker mb-7">Pour les photographes d'événements</p>

          <h1 className="font-display text-[2.6rem] font-bold leading-[1.03] tracking-tight text-ink-50 sm:text-6xl lg:text-[4.1rem]">
            Chaque invité repart avec <em className="font-medium italic text-brand-400">ses</em> photos.
          </h1>

          <p className="lead mt-7 max-w-xl">
            Vous livrez 1 200 photos d'un mariage. Photiva les présente dans une galerie soignée, et
            chaque invité retrouve les siennes avec un simple selfie. Fini les dossiers WhatsApp à trier
            et les «&nbsp;tu peux m'envoyer celles où je suis&nbsp;?&nbsp;».
          </p>

          <div className="mt-9 flex flex-col gap-3 sm:flex-row sm:items-center">
            <Link to="/signup" className="btn-primary rounded-full px-7 py-3.5 text-[15px]">
              Créer mon espace gratuitement
            </Link>
            <a
              href="#how-it-works"
              className="group inline-flex items-center justify-center gap-2 px-4 py-3.5 text-[15px] font-semibold text-ink-200 transition-colors hover:text-ink-50"
            >
              Voir comment ça marche
              <span className="transition-transform group-hover:translate-x-1" aria-hidden="true">→</span>
            </a>
          </div>

          <ul className="mt-10 flex flex-wrap gap-x-6 gap-y-2 border-t border-overlay/[0.08] pt-6 text-sm text-ink-400">
            <li>Aucune application à installer</li>
            <li>Aucun compte pour les invités</li>
            <li>Pensé pour le mobile</li>
          </ul>
        </div>

        {/* Composition photo */}
        <div className="relative mx-auto w-full max-w-[520px] opacity-0 animate-fade-in" style={{ animationDelay: '0.2s' }}>
          <figure className="relative ml-auto w-[86%] overflow-hidden rounded-[28px] shadow-2xl shadow-black/40">
            <img
              src={MAIN_PHOTO}
              alt="Mariés lors de leur cérémonie"
              className="aspect-[4/5] w-full object-cover"
            />
            <figcaption className="absolute bottom-4 right-4 rounded-full bg-black/45 px-3 py-1 text-[11px] font-medium text-white/85 backdrop-blur">
              Mariage · Grand-Bassam
            </figcaption>
          </figure>

          <img
            src={SECOND_PHOTO}
            alt=""
            className="absolute -bottom-8 left-0 hidden aspect-square w-[42%] rounded-[22px] border-[6px] border-ink-950 object-cover shadow-2xl sm:block"
          />

          {/* Carte d'interface : le résultat d'un selfie */}
          <div className="absolute -left-2 top-10 w-60 rounded-2xl border border-white/10 bg-[#141412]/90 p-3.5 text-white shadow-2xl backdrop-blur-xl sm:-left-8">
            <div className="flex items-center gap-3">
              <img src={SELFIE} alt="" className="h-11 w-11 rounded-full object-cover ring-2 ring-brand-400" />
              <div className="min-w-0">
                <p className="text-sm font-semibold">C'est bien vous&nbsp;!</p>
                <p className="text-xs text-white/60">27 photos trouvées sur 1 184</p>
              </div>
            </div>
            <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-white/10">
              <div className="h-full w-full rounded-full bg-gradient-to-r from-brand-300 to-brand-500" />
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
