import { useReveal } from '../hooks'

const EVENTS = [
  { label: 'Mariages', img: 'https://images.pexels.com/photos/30049861/pexels-photo-30049861.jpeg?auto=compress&cs=tinysrgb&w=600' },
  { label: 'Baptêmes', img: 'https://images.pexels.com/photos/16537217/pexels-photo-16537217.png?auto=compress&cs=tinysrgb&w=600' },
  { label: 'Anniversaires', img: 'https://images.pexels.com/photos/30218071/pexels-photo-30218071.jpeg?auto=compress&cs=tinysrgb&w=600' },
  { label: 'Cérémonies traditionnelles', img: 'https://images.pexels.com/photos/34060925/pexels-photo-34060925.jpeg?auto=compress&cs=tinysrgb&w=600' },
  { label: 'Conférences', img: 'https://images.pexels.com/photos/9275222/pexels-photo-9275222.jpeg?auto=compress&cs=tinysrgb&w=600' },
  { label: 'Concerts', img: 'https://images.pexels.com/photos/4218027/pexels-photo-4218027.jpeg?auto=compress&cs=tinysrgb&w=600' },
  { label: 'Festivals', img: 'https://images.pexels.com/photos/1179581/pexels-photo-1179581.jpeg?auto=compress&cs=tinysrgb&w=600' },
  { label: 'Événements professionnels', img: 'https://images.pexels.com/photos/26202153/pexels-photo-26202153.jpeg?auto=compress&cs=tinysrgb&w=600' },
  { label: 'Remises de diplômes', img: 'https://images.pexels.com/photos/7972735/pexels-photo-7972735.jpeg?auto=compress&cs=tinysrgb&w=600' },
  { label: 'Événements sportifs', img: 'https://images.pexels.com/photos/30144519/pexels-photo-30144519.jpeg?auto=compress&cs=tinysrgb&w=600' },
]

export default function EventTypes() {
  const { ref, visible } = useReveal<HTMLDivElement>()

  return (
    <section className="py-20 md:py-28 text-center" id="event-types">
      <div className="max-w-content mx-auto px-6">
        <h2 className="text-3xl md:text-5xl font-extrabold mb-5">Pour tous vos événements.</h2>
        <p className="text-lg text-ink-300 max-w-xl mx-auto mb-14 leading-relaxed">
          Quelle que soit l'occasion, SnapEvent s'adapte à votre univers photographique.
        </p>

        <div ref={ref} className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
          {EVENTS.map((event, i) => (
            <div
              key={event.label}
              className="group relative rounded-2xl overflow-hidden aspect-square cursor-pointer"
              style={{
                opacity: visible ? 1 : 0,
                transform: visible ? 'translateY(0)' : 'translateY(20px)',
                transition: `opacity 0.5s ease ${(i % 5) * 0.1}s, transform 0.5s ease ${(i % 5) * 0.1}s`,
              }}
            >
              <img
                src={event.img}
                alt={event.label}
                loading="lazy"
                className="w-full h-full object-cover transition-transform duration-600 group-hover:scale-110"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent transition-opacity group-hover:from-gold-500/20 group-hover:from-30%" />
              <span className="absolute bottom-4 left-4 text-sm font-semibold text-white drop-shadow-lg z-10">
                {event.label}
              </span>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
