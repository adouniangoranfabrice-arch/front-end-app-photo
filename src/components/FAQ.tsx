const QUESTIONS = [
  {
    q: 'Mes invités doivent-ils installer une application ?',
    a: 'Non. La galerie s’ouvre dans le navigateur du téléphone, depuis le lien ou le QR code. Aucun compte n’est demandé.',
  },
  {
    q: 'Que devient le selfie de l’invité ?',
    a: 'Il sert uniquement à comparer son visage avec ceux de la galerie. Il n’est jamais enregistré sur nos serveurs.',
  },
  {
    q: 'La reconnaissance faciale est-elle fiable ?',
    a: 'Elle fonctionne très bien sur les visages bien visibles, y compris en lumière de soirée. Un visage de dos ou caché peut lui échapper : les invités peuvent donc toujours parcourir la galerie complète.',
  },
  {
    q: 'Combien de photos puis-je importer ?',
    a: 'Jusqu’à 500 photos par envoi, et autant d’envois que nécessaire. Un mariage de 2 000 photos ne pose aucun problème.',
  },
  {
    q: 'Mes photos perdent-elles en qualité ?',
    a: 'Non. La galerie affiche des versions allégées pour un chargement rapide, mais les invités téléchargent les fichiers d’origine.',
  },
  {
    q: 'Puis-je supprimer une galerie après l’événement ?',
    a: 'Oui, à tout moment depuis votre tableau de bord. Les photos, les visages détectés et le lien sont alors supprimés définitivement.',
  },
]

export default function FAQ() {
  return (
    <section className="section" id="faq">
      <div className="container-page grid gap-12 lg:grid-cols-[0.8fr_1.2fr] lg:gap-20">
        <div>
          <p className="kicker mb-6">Questions fréquentes</p>
          <h2 className="h-section">Ce qu’on nous demande le plus souvent.</h2>
          <p className="lead mt-6">
            Une autre question&nbsp;? Écrivez-nous, on vous répond rapidement.
          </p>
        </div>

        <div className="divide-y divide-overlay/[0.08] border-y border-overlay/[0.08]">
          {QUESTIONS.map((item) => (
            <details key={item.q} className="group py-5">
              <summary className="flex cursor-pointer list-none items-center justify-between gap-6 text-left font-body text-base font-semibold text-ink-50 [&::-webkit-details-marker]:hidden">
                {item.q}
                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-overlay/[0.12] text-ink-300 transition-transform duration-300 group-open:rotate-45">
                  <svg viewBox="0 0 24 24" width="14" height="14" fill="none" aria-hidden="true">
                    <path d="M12 5v14M5 12h14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                  </svg>
                </span>
              </summary>
              <p className="mt-3 max-w-2xl pr-12 text-[15px] leading-relaxed text-ink-400">{item.a}</p>
            </details>
          ))}
        </div>
      </div>
    </section>
  )
}
