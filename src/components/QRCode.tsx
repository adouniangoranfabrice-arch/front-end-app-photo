import { Link } from 'react-router-dom'
import { useReveal } from '../hooks'

// Motif décoratif de QR code (illustration, pas un vrai code)
const DOTS = [
  [75, 15], [90, 15], [105, 15], [120, 15], [75, 30], [105, 30], [120, 30], [75, 45], [90, 45], [120, 45],
  [15, 75], [30, 75], [45, 75], [75, 75], [90, 75], [120, 75], [135, 75], [150, 75], [165, 75],
  [30, 90], [60, 90], [75, 90], [105, 90], [135, 90], [165, 90],
  [15, 105], [45, 105], [60, 105], [90, 105], [105, 105], [120, 105], [150, 105], [165, 105],
  [30, 120], [60, 120], [75, 120], [105, 120], [135, 120], [150, 120],
  [75, 135], [90, 135], [120, 135], [135, 135], [150, 135], [165, 135],
  [75, 150], [105, 150], [120, 150], [150, 150], [165, 150], [75, 165], [90, 165], [105, 165], [135, 165], [165, 165],
]

function Finder({ x, y }: { x: number; y: number }) {
  return (
    <>
      <rect x={x} y={y} width="50" height="50" rx="8" fill="#0c0c0a" />
      <rect x={x + 9} y={y + 9} width="32" height="32" rx="5" fill="#fbf7ee" />
      <rect x={x + 16} y={y + 16} width="18" height="18" rx="3" fill="#0c0c0a" />
    </>
  )
}

export default function QRCode() {
  const { ref, visible } = useReveal<HTMLDivElement>()

  return (
    <section className="section" id="qr-code">
      <div
        ref={ref}
        className={`container-page reveal ${visible ? 'visible' : ''}`}
      >
        <div className="grid items-center gap-12 overflow-hidden rounded-[32px] border border-overlay/[0.08] bg-gradient-to-br from-ink-900 to-ink-950 p-8 md:grid-cols-[auto_1fr] md:gap-16 md:p-14">
          {/* Chevalet de table */}
          <div className="mx-auto w-56 rotate-[-3deg] rounded-2xl bg-[#fbf7ee] p-5 text-center shadow-2xl shadow-black/40 transition-transform duration-500 hover:rotate-0">
            <p className="font-display text-base font-semibold text-[#0c0c0a]">Aya &amp; Kouamé</p>
            <p className="mb-4 text-[10px] uppercase tracking-[0.2em] text-[#6b6b63]">Retrouvez vos photos</p>
            <svg viewBox="0 0 200 200" className="mx-auto w-40" aria-hidden="true">
              <Finder x={10} y={10} />
              <Finder x={140} y={10} />
              <Finder x={10} y={140} />
              {DOTS.map(([x, y], i) => (
                <rect key={i} x={x} y={y} width="13" height="13" rx="3" fill="#0c0c0a" />
              ))}
            </svg>
            <p className="mt-4 text-[11px] text-[#6b6b63]">Scannez, souriez, c’est prêt.</p>
          </div>

          <div className="text-center md:text-left">
            <p className="kicker mb-6">Le jour J</p>
            <h2 className="h-section">Posez-le sur les tables. Les invités font le reste.</h2>
            <p className="lead mt-6 max-w-xl">
              Chaque événement a son QR code. Imprimez-le sur un chevalet, ajoutez-le au programme ou
              projetez-le pendant la soirée. Les invités peuvent retrouver leurs photos avant même d’être
              rentrés chez eux.
            </p>
            <Link to="/signup" className="btn-primary mt-9 rounded-full px-7 py-3.5 text-[15px]">
              Créer mon premier événement
            </Link>
          </div>
        </div>
      </div>
    </section>
  )
}
