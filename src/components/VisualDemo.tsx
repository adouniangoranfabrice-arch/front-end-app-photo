import { useReveal } from '../hooks'

const STEPS = [
  { num: '01', text: "Le photographe couvre l'événement" },
  { num: '02', text: 'Il importe ses photos' },
  { num: '03', text: 'Les invités scannent le QR Code' },
  { num: '04', text: 'Ils retrouvent leurs photos avec un selfie' },
]

export default function VisualDemo() {
  const { ref, visible } = useReveal<HTMLDivElement>()

  return (
    <section className="py-16 md:py-20" id="demo">
      <div className="max-w-content mx-auto px-6">
        <div ref={ref} className={`relative grid grid-cols-1 md:grid-cols-4 gap-8 md:gap-6 ${visible ? 'visible' : ''} reveal`}>
          {/* Animated connecting line */}
          <svg className="absolute top-9 left-0 w-full h-20 pointer-events-none z-0 hidden md:block" viewBox="0 0 1000 100" preserveAspectRatio="none">
            <line
              x1="125" y1="50" x2="875" y2="50"
              stroke="url(#vdemo-grad)"
              strokeWidth="2"
              strokeDasharray="1000"
              strokeDashoffset={visible ? '0' : '1000'}
              style={{ transition: 'stroke-dashoffset 2s ease' }}
            />
            <defs>
              <linearGradient id="vdemo-grad" x1="0" y1="0" x2="1" y2="0">
                <stop offset="0%" stopColor="#fbbf24" />
                <stop offset="100%" stopColor="#f59e0b" />
              </linearGradient>
            </defs>
          </svg>

          {STEPS.map((step, i) => (
            <div
              key={step.num}
              className="flex flex-col md:flex-col items-center text-center relative z-10"
              style={{
                opacity: visible ? 1 : 0,
                transform: visible ? 'translateY(0)' : 'translateY(20px)',
                transition: `opacity 0.6s ease ${i * 0.2}s, transform 0.6s ease ${i * 0.2}s`,
              }}
            >
              <div className="w-18 h-18 flex items-center justify-center w-[72px] h-[72px] rounded-full bg-ink-800 border-2 border-gold-500 shadow-[0_0_20px_rgba(245,158,11,0.2)] mb-5 font-display text-xl font-extrabold bg-indigo-600 transition-all duration-300 hover:scale-110 hover:shadow-[0_0_30px_rgba(245,158,11,0.4)]">
                {step.num}
              </div>
              <p className="text-sm font-medium text-ink-300 max-w-[200px] leading-relaxed">
                {step.text}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
