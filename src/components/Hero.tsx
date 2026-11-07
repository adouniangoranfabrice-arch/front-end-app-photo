const HERO_BG =
  'https://images.pexels.com/photos/30049861/pexels-photo-30049861.jpeg?auto=compress&cs=tinysrgb&w=1600'
const FLOAT_1 =
  'https://images.pexels.com/photos/29997401/pexels-photo-29997401.jpeg?auto=compress&cs=tinysrgb&w=400'
const FLOAT_2 =
  'https://images.pexels.com/photos/32957317/pexels-photo-32957317.jpeg?auto=compress&cs=tinysrgb&w=400'
const FLOAT_3 =
  'https://images.pexels.com/photos/30049860/pexels-photo-30049860.jpeg?auto=compress&cs=tinysrgb&w=400'

import { Link } from 'react-router-dom'

export default function Hero() {
  return (
    <section id="hero" className="relative min-h-screen flex items-center justify-center overflow-hidden pt-20">
      {/* Background */}
      <div className="absolute inset-0 z-0">
        <img
          src={HERO_BG}
          alt="Cérémonie de mariage en Côte d'Ivoire"
          className="w-full h-full object-cover scale-105 animate-fade-in"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-ink-950/40 via-ink-950/60 to-ink-950/90" />
      </div>

      {/* Floating photos */}
      <div className="absolute inset-0 z-[1] pointer-events-none hidden md:block">
        <div className="absolute top-[18%] left-[5%] w-40 h-52 rounded-2xl overflow-hidden border-2 border-overlay/15 shadow-2xl animate-float opacity-0 animate-fade-in" style={{ animationDelay: '0.5s, 0.5s' }}>
          <img src={FLOAT_1} alt="Mariage" className="w-full h-full object-cover" />
        </div>
        <div className="absolute bottom-[15%] left-[10%] w-36 h-44 rounded-2xl overflow-hidden border-2 border-overlay/15 shadow-2xl animate-float-delay opacity-0 animate-fade-in" style={{ animationDelay: '0.8s, 0.8s' }}>
          <img src={FLOAT_2} alt="Photographe" className="w-full h-full object-cover" />
        </div>
        <div className="absolute top-[22%] right-[6%] w-36 h-48 rounded-2xl overflow-hidden border-2 border-overlay/15 shadow-2xl animate-float opacity-0 animate-fade-in" style={{ animationDelay: '1.1s, 1.1s' }}>
          <img src={FLOAT_3} alt="Célébration" className="w-full h-full object-cover" />
        </div>
      </div>

      {/* Content */}
      <div className="relative z-[2] text-center max-w-3xl mx-auto px-6">
        <span className="inline-flex items-center gap-2 px-4 py-2 mb-7 text-xs font-semibold uppercase tracking-wider text-gold-300 bg-gold-500/10 border border-gold-500/20 rounded-full opacity-0 animate-fade-up" style={{ animationDelay: '0.1s' }}>
          <span className="w-2 h-2 rounded-full bg-gold-400 shadow-[0_0_8px_#fbbf24] animate-pulse-glow" />
          La photographie événementielle, réinventée
        </span>

        <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-extrabold leading-[1.1] mb-6 opacity-0 animate-fade-up" style={{ animationDelay: '0.25s' }}>
          Retrouvez <span className="text-gradient-gold italic">vos photos</span> d'événement en quelques secondes.
        </h1>

        <p className="text-base md:text-lg text-ink-300 max-w-xl mx-auto mb-9 leading-relaxed opacity-0 animate-fade-up" style={{ animationDelay: '0.4s' }}>
          Une plateforme pensée pour les photographes et les événements en Côte d'Ivoire. Importez vos
          photos, partagez un simple lien ou QR Code et laissez vos invités retrouver facilement leurs
          photos grâce à leur selfie.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center mb-5 opacity-0 animate-fade-up" style={{ animationDelay: '0.55s' }}>
          <Link
            to="/signup"
            className="inline-flex items-center justify-center gap-2 px-7 py-3.5 rounded-full bg-gradient-to-r from-gold-400 to-gold-600 text-ink-950 font-semibold shadow-xl shadow-gold-500/30 transition-all hover:-translate-y-0.5 hover:shadow-gold-500/45"
          >
            Créer mon espace photographe →
          </Link>
          <a
            href="#how-it-works"
            className="inline-flex items-center justify-center gap-2 px-7 py-3.5 rounded-full bg-overlay/[0.06] border border-overlay/10 text-ink-100 font-semibold backdrop-blur-md transition-all hover:bg-overlay/[0.12] hover:border-overlay/20 hover:-translate-y-0.5"
          >
            Découvrir comment ça marche
          </a>
        </div>

        <p className="flex items-center justify-center gap-2 text-sm text-ink-400 opacity-0 animate-fade-up" style={{ animationDelay: '0.7s' }}>
          <svg viewBox="0 0 24 24" width="16" height="16" fill="none">
            <path
              d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
              stroke="currentColor"
              strokeWidth="1.8"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
          Aucune inscription nécessaire pour les invités.
        </p>
      </div>

      {/* Scroll indicator */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 z-[2] opacity-0 animate-fade-in" style={{ animationDelay: '1.2s' }}>
        <span className="text-xs uppercase tracking-widest text-ink-500">Défiler</span>
        <div className="w-px h-10 bg-gradient-to-b from-ink-500 to-transparent relative overflow-hidden">
          <div className="absolute top-0 w-px h-10 bg-gold-400 animate-scroll-down" />
        </div>
      </div>
    </section>
  )
}
