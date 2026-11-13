import { useReveal } from '../hooks'

const EVENTS = [
  { label: 'Mariages', note: 'Civil, religieux, coutumier', img: 'https://images.pexels.com/photos/30049861/pexels-photo-30049861.jpeg?auto=compress&cs=tinysrgb&w=900', span: 'md:col-span-2 md:row-span-2' },
  { label: 'Dots & cérémonies traditionnelles', note: '', img: 'https://images.pexels.com/photos/34060925/pexels-photo-34060925.jpeg?auto=compress&cs=tinysrgb&w=600', span: '' },
  { label: 'Baptêmes', note: '', img: 'https://images.pexels.com/photos/16537217/pexels-photo-16537217.png?auto=compress&cs=tinysrgb&w=600', span: '' },
  { label: 'Concerts & festivals', note: '', img: 'https://images.pexels.com/photos/4218027/pexels-photo-4218027.jpeg?auto=compress&cs=tinysrgb&w=600', span: '' },
  { label: 'Remises de diplômes', note: '', img: 'https://images.pexels.com/photos/7972735/pexels-photo-7972735.jpeg?auto=compress&cs=tinysrgb&w=600', span: '' },
  { label: 'Séminaires & conférences', note: 'Événements d’entreprise', img: 'https://images.pexels.com/photos/9275222/pexels-photo-9275222.jpeg?auto=compress&cs=tinysrgb&w=900', span: 'md:col-span-2' },
  { label: 'Anniversaires', note: '', img: 'https://images.pexels.com/photos/30218071/pexels-photo-30218071.jpeg?auto=compress&cs=tinysrgb&w=600', span: '' },
  { label: 'Sport', note: '', img: 'https://images.pexels.com/photos/30144519/pexels-photo-30144519.jpeg?auto=compress&cs=tinysrgb&w=600', span: '' },
]

export default function EventTypes() {
  const { ref, visible } = useReveal<HTMLDivElement>()

  return (
    <section className="section" id="event-types">
      <div className="container-page">
        <div className="mb-12 flex flex-col justify-between gap-6 md:flex-row md:items-end">
          <div className="max-w-xl">
            <p className="kicker mb-6">Pour quelles occasions&nbsp;?</p>
            <h2 className="h-section">Partout où il y a du monde à photographier.</h2>
          </div>
          <p className="max-w-sm text-[15px] leading-relaxed text-ink-400">
            Plus il y a d’invités, plus Photiva vous fait gagner de temps. Les grands mariages ivoiriens
            en sont la meilleure preuve.
          </p>
        </div>

        <div ref={ref} className="grid auto-rows-[180px] grid-cols-2 gap-3 md:auto-rows-[210px] md:grid-cols-4">
          {EVENTS.map((event, i) => (
            <figure
              key={event.label}
              className={`group relative overflow-hidden rounded-2xl bg-ink-800 ${event.span}`}
              style={{
                opacity: visible ? 1 : 0,
                transition: `opacity .7s ease ${i * 0.07}s`,
              }}
            >
              <img
                src={event.img}
                alt={event.label}
                loading="lazy"
                className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/5 to-transparent" />
              <figcaption className="absolute bottom-4 left-4 right-4 text-white">
                <span className="block text-sm font-semibold md:text-base">{event.label}</span>
                {event.note && <span className="text-xs text-white/70">{event.note}</span>}
              </figcaption>
            </figure>
          ))}
        </div>
      </div>
    </section>
  )
}
