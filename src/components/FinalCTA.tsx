import { Link } from 'react-router-dom'
import { useReveal } from '../hooks'

const CTA_BG =
  'https://images.pexels.com/photos/38627012/pexels-photo-38627012.jpeg?auto=compress&cs=tinysrgb&w=1600'

export default function FinalCTA() {
  const { ref, visible } = useReveal<HTMLDivElement>()

  return (
    <section className="px-3 pb-20 sm:px-6 md:pb-28" id="final-cta">
      <div
        ref={ref}
        className={`relative mx-auto max-w-content overflow-hidden rounded-[32px] reveal ${visible ? 'visible' : ''}`}
      >
        <img src={CTA_BG} alt="" className="absolute inset-0 h-full w-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-r from-black/90 via-black/75 to-black/40" />

        <div className="relative px-7 py-16 text-white sm:px-12 md:py-24">
          <h2 className="max-w-xl font-display text-[2rem] font-bold leading-[1.08] tracking-tight sm:text-5xl">
            Votre prochain événement mérite mieux qu’un dossier partagé.
          </h2>
          <p className="mt-6 max-w-lg text-base leading-relaxed text-white/75 md:text-lg">
            Créez votre espace en deux minutes et testez Photiva sur votre prochaine prestation. C’est
            gratuit pour commencer.
          </p>
          <div className="mt-9 flex flex-col gap-3 sm:flex-row sm:items-center">
            <Link to="/signup" className="btn-primary rounded-full px-7 py-3.5 text-[15px] !text-white">
              Créer mon espace photographe
            </Link>
            <Link
              to="/login"
              className="inline-flex items-center justify-center px-4 py-3.5 text-[15px] font-semibold text-white/80 transition-colors hover:text-white"
            >
              J’ai déjà un compte
            </Link>
          </div>
        </div>
      </div>
    </section>
  )
}
