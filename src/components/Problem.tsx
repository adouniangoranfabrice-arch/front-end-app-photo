import { useReveal } from '../hooks'

const PAINS = [
  {
    quote: '« Tu as les photos de la dot ? »',
    text: 'Le lundi matin, votre téléphone ne s’arrête plus. Chaque invité veut ses photos, tout de suite.',
  },
  {
    quote: 'Un lien de 8 Go que personne n’ouvre',
    text: 'Le dossier partagé est trop lourd pour un forfait mobile. La plupart abandonnent au chargement.',
  },
  {
    quote: '900 photos pour en trouver trois',
    text: 'Ceux qui insistent font défiler la galerie entière… et passent souvent à côté des meilleures.',
  },
]

export default function Problem() {
  const { ref, visible } = useReveal<HTMLDivElement>()

  return (
    <section className="section border-y border-overlay/[0.06] bg-ink-900/40" id="problem">
      <div ref={ref} className={`container-page reveal ${visible ? 'visible' : ''}`}>
        <div className="grid gap-12 lg:grid-cols-[0.9fr_1.1fr] lg:gap-20">
          <div>
            <p className="kicker mb-6">Le lendemain de la fête</p>
            <h2 className="h-section">
              Vous avez fait le plus beau travail. Le plus dur, c’est de le livrer.
            </h2>
            <p className="lead mt-6 max-w-md">
              Trier, envoyer, renvoyer, répondre aux messages… Tout ce temps passé après l’événement
              ne vous est jamais payé.
            </p>
          </div>

          <ol className="divide-y divide-overlay/[0.08] border-y border-overlay/[0.08]">
            {PAINS.map((pain, i) => (
              <li key={pain.quote} className="grid grid-cols-[3rem_1fr] gap-4 py-7">
                <span className="font-display text-2xl italic text-brand-500/70">{`0${i + 1}`}</span>
                <div>
                  <p className="font-display text-xl font-semibold text-ink-50 md:text-2xl">{pain.quote}</p>
                  <p className="mt-2 text-[15px] leading-relaxed text-ink-400">{pain.text}</p>
                </div>
              </li>
            ))}
          </ol>
        </div>

        <p className="mt-14 text-center font-display text-2xl text-ink-100 md:text-3xl">
          Avec Photiva, tout ça tient en un geste&nbsp;:{' '}
          <em className="italic text-brand-400">un selfie.</em>
        </p>
      </div>
    </section>
  )
}
