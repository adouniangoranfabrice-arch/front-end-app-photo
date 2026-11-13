import type { ReactNode } from 'react'
import { useReveal } from '../hooks'

const stroke = { stroke: 'currentColor', strokeWidth: 1.6, strokeLinecap: 'round' as const, strokeLinejoin: 'round' as const }

const FEATURES: { title: string; text: string; icon: ReactNode }[] = [
  {
    title: 'Une galerie à votre image',
    text: 'Une couverture, le nom de l’événement, et vos photos en mosaïque. Vos clients reçoivent un vrai rendu professionnel, pas un dossier.',
    icon: <><rect x="3" y="4" width="18" height="16" rx="2.5" {...stroke} /><path d="M3 15l5-5 4 4 3-3 6 6" {...stroke} /><circle cx="15.5" cy="8.5" r="1.5" {...stroke} /></>,
  },
  {
    title: 'Import massif, sans attente',
    text: 'Des centaines de photos d’un coup, avec la progression en temps réel pour chaque événement.',
    icon: <><path d="M12 15V4m0 0L8 8m4-4l4 4" {...stroke} /><path d="M4 15v3a2 2 0 002 2h12a2 2 0 002-2v-3" {...stroke} /></>,
  },
  {
    title: 'Recherche par visage',
    text: 'Les visages sont repérés à l’import. Vous n’avez aucun tri à faire, aucun nom à saisir.',
    icon: <><path d="M4 8V6a2 2 0 012-2h2M16 4h2a2 2 0 012 2v2M20 16v2a2 2 0 01-2 2h-2M8 20H6a2 2 0 01-2-2v-2" {...stroke} /><circle cx="12" cy="10.5" r="2.8" {...stroke} /><path d="M7.5 17a5 5 0 019 0" {...stroke} /></>,
  },
  {
    title: 'Un lien, un QR code',
    text: 'Partagez la galerie en un message. Le lien reste actif aussi longtemps que vous le souhaitez.',
    icon: <><path d="M10 14a4 4 0 005.7 0l3-3a4 4 0 00-5.7-5.7l-1 1" {...stroke} /><path d="M14 10a4 4 0 00-5.7 0l-3 3a4 4 0 005.7 5.7l1-1" {...stroke} /></>,
  },
  {
    title: 'Téléchargements en un clic',
    text: 'Vos invités sélectionnent quelques photos ou récupèrent tout l’album en un seul fichier.',
    icon: <><path d="M12 4v11m0 0l-4-4m4 4l4-4" {...stroke} /><path d="M5 20h14" {...stroke} /></>,
  },
  {
    title: 'Vous gardez la main',
    text: 'Supprimez une photo ou un événement entier à tout moment. Rien n’est publié sans vous.',
    icon: <><path d="M12 3l8 3v6c0 5-3.5 8-8 9-4.5-1-8-4-8-9V6l8-3z" {...stroke} /><path d="M9 12l2 2 4-4" {...stroke} /></>,
  },
]

export default function Photographers() {
  const { ref, visible } = useReveal<HTMLDivElement>()

  return (
    <section className="section" id="photographers">
      <div className="container-page grid gap-14 lg:grid-cols-[0.8fr_1.2fr] lg:gap-20">
        <div className="lg:sticky lg:top-28 lg:self-start">
          <p className="kicker mb-6">Pour les photographes</p>
          <h2 className="h-section">Vous photographiez. Photiva s’occupe du reste.</h2>
          <p className="lead mt-6">
            Livrer vite et bien, c’est ce qui fait revenir les clients et parler de vous au prochain
            mariage. Photiva vous donne les outils pour le faire, sans y passer vos soirées.
          </p>
        </div>

        <div ref={ref} className="grid gap-x-10 gap-y-10 sm:grid-cols-2">
          {FEATURES.map((f, i) => (
            <div
              key={f.title}
              className="border-t border-overlay/[0.1] pt-6"
              style={{
                opacity: visible ? 1 : 0,
                transform: visible ? 'none' : 'translateY(16px)',
                transition: `opacity .6s ease ${(i % 2) * 0.1 + Math.floor(i / 2) * 0.08}s, transform .6s ease ${(i % 2) * 0.1 + Math.floor(i / 2) * 0.08}s`,
              }}
            >
              <svg viewBox="0 0 24 24" width="26" height="26" fill="none" aria-hidden="true" className="text-brand-400">
                {f.icon}
              </svg>
              <h3 className="mt-4 font-body text-base font-semibold text-ink-50">{f.title}</h3>
              <p className="mt-2 text-[15px] leading-relaxed text-ink-400">{f.text}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
