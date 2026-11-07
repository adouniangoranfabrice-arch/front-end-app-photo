import { Link } from 'react-router-dom'
import { useReveal } from '../hooks'

export default function QRCode() {
  const { ref, visible } = useReveal<HTMLDivElement>()

  return (
    <section className="relative py-20 md:py-28 overflow-hidden" id="qr-code">
      <div className="max-w-content mx-auto px-6">
        <div ref={ref} className={`grid md:grid-cols-2 gap-12 md:gap-16 items-center reveal ${visible ? 'visible' : ''}`}>
          {/* QR Code */}
          <div className="flex justify-center">
            <div className="relative w-72 h-72 flex items-center justify-center rounded-3xl bg-ink-900 border border-overlay/[0.06] p-5 shadow-2xl transition-transform hover:scale-105">
              <div className="absolute -inset-5 rounded-3xl bg-gold-500/[0.1] blur-2xl animate-pulse-glow" />
              <svg viewBox="0 0 200 200" width="240" height="240" className="relative z-10 text-ink-50">
                <rect width="200" height="200" fill="none" />
                {/* Corner squares */}
                <rect x="10" y="10" width="50" height="50" rx="4" fill="currentColor" />
                <rect x="20" y="20" width="30" height="30" rx="2" fill="#161614" />
                <rect x="27" y="27" width="16" height="16" rx="1" fill="currentColor" />
                <rect x="140" y="10" width="50" height="50" rx="4" fill="currentColor" />
                <rect x="150" y="20" width="30" height="30" rx="2" fill="#161614" />
                <rect x="157" y="27" width="16" height="16" rx="1" fill="currentColor" />
                <rect x="10" y="140" width="50" height="50" rx="4" fill="currentColor" />
                <rect x="20" y="150" width="30" height="30" rx="2" fill="#161614" />
                <rect x="27" y="157" width="16" height="16" rx="1" fill="currentColor" />
                {/* Pattern dots */}
                {[
                  [75, 15], [90, 15], [105, 15], [120, 15],
                  [75, 30], [105, 30], [120, 30],
                  [75, 45], [90, 45], [120, 45],
                  [15, 75], [30, 75], [45, 75], [75, 75], [90, 75], [120, 75], [135, 75], [150, 75], [165, 75],
                  [30, 90], [60, 90], [75, 90], [105, 90], [135, 90], [165, 90],
                  [15, 105], [45, 105], [60, 105], [90, 105], [105, 105], [120, 105], [150, 105], [165, 105],
                  [30, 120], [60, 120], [75, 120], [105, 120], [135, 120], [150, 120],
                  [75, 135], [90, 135], [120, 135], [135, 135], [150, 135], [165, 135],
                  [75, 150], [105, 150], [120, 150], [150, 150], [165, 150],
                  [75, 165], [90, 165], [105, 165], [135, 165], [165, 165],
                ].map(([x, y], i) => (
                  <rect key={i} x={x} y={y} width="15" height="15" rx="1" fill="currentColor" />
                ))}
              </svg>
            </div>
          </div>

          {/* Text */}
          <div className="text-center md:text-left">
            <h2 className="text-3xl md:text-5xl font-extrabold mb-5 leading-tight">
              Un QR Code. Une galerie. Des souvenirs retrouvés.
            </h2>
            <p className="text-lg text-ink-300 leading-relaxed mb-8">
              Affichez le QR Code de votre événement sur les tables, à l'entrée, sur vos supports
              imprimés ou partagez-le directement sur WhatsApp.
            </p>
            <Link
              to="/signup"
              className="inline-flex items-center gap-2 px-7 py-3.5 rounded-full bg-gradient-to-r from-gold-400 to-gold-600 text-ink-950 font-semibold shadow-xl shadow-gold-500/30 transition-all hover:-translate-y-0.5 hover:shadow-gold-500/45"
            >
              Créer mon événement →
            </Link>
          </div>
        </div>
      </div>
    </section>
  )
}
