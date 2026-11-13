import { useReveal } from '../hooks'

const STEPS = [
  {
    title: 'Créez l’événement',
    text: 'Un nom, une date, une photo de couverture. Deux minutes, pas plus.',
  },
  {
    title: 'Importez vos photos',
    text: 'Glissez votre sélection, jusqu’à 500 photos d’un coup. La progression s’affiche en direct.',
  },
  {
    title: 'Partagez le lien',
    text: 'Envoyez-le dans le groupe WhatsApp des mariés ou imprimez le QR code sur les tables.',
  },
  {
    title: 'Les invités se retrouvent',
    text: 'Un selfie, et chacun voit uniquement les photos où il apparaît. Il les télécharge en un clic.',
  },
]

export default function HowItWorks() {
  const { ref, visible } = useReveal<HTMLOListElement>()

  return (
    <section className="section" id="how-it-works">
      <div className="container-page">
        <div className="flex flex-col justify-between gap-6 md:flex-row md:items-end">
          <div className="max-w-2xl">
            <p className="kicker mb-6">Comment ça marche</p>
            <h2 className="h-section">De votre carte mémoire au téléphone des invités.</h2>
          </div>
          <p className="max-w-sm text-[15px] leading-relaxed text-ink-400">
            Aucune formation nécessaire. Si vous savez envoyer un message WhatsApp, vous savez utiliser
            Photiva.
          </p>
        </div>

        <ol ref={ref} className="mt-14 grid gap-px overflow-hidden rounded-3xl border border-overlay/[0.08] bg-overlay/[0.08] sm:grid-cols-2 lg:grid-cols-4">
          {STEPS.map((step, i) => (
            <li
              key={step.title}
              className="group relative bg-ink-950 p-7 transition-colors hover:bg-ink-900 md:p-8"
              style={{
                opacity: visible ? 1 : 0,
                transform: visible ? 'none' : 'translateY(16px)',
                transition: `opacity .6s ease ${i * 0.12}s, transform .6s ease ${i * 0.12}s, background-color .3s`,
              }}
            >
              <span className="font-display text-5xl font-medium italic text-ink-700 transition-colors group-hover:text-brand-500/60">
                {i + 1}
              </span>
              <h3 className="mt-8 font-body text-lg font-semibold text-ink-50">{step.title}</h3>
              <p className="mt-2 text-[15px] leading-relaxed text-ink-400">{step.text}</p>
            </li>
          ))}
        </ol>
      </div>
    </section>
  )
}
