import { useState } from 'react'
import { Link } from 'react-router-dom'
import CreateEventModal, { type CreatedEvent } from '../components/CreateEventModal'
import PhotoManagement from '../components/PhotoManagement'
import { useLogout } from "../utils/logout";
import MyEvents from '../components/MyEvents';

const SIDEBAR_ITEMS = [
  { id: 'dashboard', label: 'Dashboard', icon: (
    <svg viewBox="0 0 24 24" width="20" height="20" fill="none">
      <rect x="3" y="3" width="7" height="7" rx="1.5" stroke="currentColor" strokeWidth="1.8" />
      <rect x="14" y="3" width="7" height="7" rx="1.5" stroke="currentColor" strokeWidth="1.8" />
      <rect x="3" y="14" width="7" height="7" rx="1.5" stroke="currentColor" strokeWidth="1.8" />
      <rect x="14" y="14" width="7" height="7" rx="1.5" stroke="currentColor" strokeWidth="1.8" />
    </svg>
  ) },
  { id: 'events', label: 'Mes événements', icon: (
    <svg viewBox="0 0 24 24" width="20" height="20" fill="none">
      <rect x="3" y="5" width="18" height="16" rx="2" stroke="currentColor" strokeWidth="1.8" />
      <path d="M3 9h18M8 3v4M16 3v4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  ) },
  { id: 'photos', label: 'Photos', icon: (
    <svg viewBox="0 0 24 24" width="20" height="20" fill="none">
      <rect x="3" y="5" width="18" height="14" rx="2" stroke="currentColor" strokeWidth="1.8" />
      <circle cx="9" cy="11" r="2" stroke="currentColor" strokeWidth="1.8" />
      <path d="M21 17l-5-5-8 8" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  ) },
  { id: 'clients', label: 'Clients', icon: (
    <svg viewBox="0 0 24 24" width="20" height="20" fill="none">
      <circle cx="12" cy="8" r="4" stroke="currentColor" strokeWidth="1.8" />
      <path d="M4 21v-1a6 6 0 0112 0v1" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  ) },
  { id: 'stats', label: 'Statistiques', icon: (
    <svg viewBox="0 0 24 24" width="20" height="20" fill="none">
      <path d="M4 20V10M10 20V4M16 20v-7M22 20H2" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  ) },
  { id: 'subscription', label: 'Abonnement', icon: (
    <svg viewBox="0 0 24 24" width="20" height="20" fill="none">
      <rect x="3" y="6" width="18" height="13" rx="2" stroke="currentColor" strokeWidth="1.8" />
      <path d="M3 10h18" stroke="currentColor" strokeWidth="1.8" />
    </svg>
  ) },
  { id: 'settings', label: 'Paramètres', icon: (
    <svg viewBox="0 0 24 24" width="20" height="20" fill="none">
      <circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="1.8" />
      <path d="M19.4 15a1.6 1.6 0 00.3 1.8l.1.1a2 2 0 11-2.8 2.8l-.1-.1a1.6 1.6 0 00-1.8-.3 1.6 1.6 0 00-1 1.5V21a2 2 0 11-4 0v-.1a1.6 1.6 0 00-1-1.5 1.6 1.6 0 00-1.8.3l-.1.1a2 2 0 11-2.8-2.8l.1-.1a1.6 1.6 0 00.3-1.8 1.6 1.6 0 00-1.5-1H3a2 2 0 110-4h.1a1.6 1.6 0 001.5-1 1.6 1.6 0 00-.3-1.8l-.1-.1a2 2 0 112.8-2.8l.1.1a1.6 1.6 0 001.8.3h0a1.6 1.6 0 001-1.5V3a2 2 0 114 0v.1a1.6 1.6 0 001 1.5 1.6 1.6 0 001.8-.3l.1-.1a2 2 0 112.8 2.8l-.1.1a1.6 1.6 0 00-.3 1.8v0a1.6 1.6 0 001.5 1H21a2 2 0 110 4h-.1a1.6 1.6 0 00-1.5 1z" stroke="currentColor" strokeWidth="1.5" />
    </svg>
  ) },
]

const STATS = [
  { label: "Nombre d'événements", value: '12', change: '+3 ce mois', icon: (
    <svg viewBox="0 0 24 24" width="24" height="24" fill="none">
      <rect x="3" y="5" width="18" height="16" rx="2" stroke="currentColor" strokeWidth="1.8" />
      <path d="M3 9h18M8 3v4M16 3v4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  ) },
  { label: 'Nombre de photos', value: '3 480', change: '+520 cette semaine', icon: (
    <svg viewBox="0 0 24 24" width="24" height="24" fill="none">
      <rect x="3" y="5" width="18" height="14" rx="2" stroke="currentColor" strokeWidth="1.8" />
      <circle cx="9" cy="11" r="2" stroke="currentColor" strokeWidth="1.8" />
      <path d="M21 17l-5-5-8 8" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  ) },
  { label: 'Nombre de recherches', value: '1 204', change: '+18% vs mois dernier', icon: (
    <svg viewBox="0 0 24 24" width="24" height="24" fill="none">
      <circle cx="11" cy="11" r="7" stroke="currentColor" strokeWidth="1.8" />
      <path d="M21 21l-4.3-4.3" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  ) },
  { label: 'Nombre de téléchargements', value: '856', change: '+42 cette semaine', icon: (
    <svg viewBox="0 0 24 24" width="24" height="24" fill="none">
      <path d="M12 4v12m0 0l-4-4m4 4l4-4M4 20h16" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  ) },
]

export default function Dashboard() {
  const [activeItem, setActiveItem] = useState('dashboard')
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [view, setView] = useState<'dashboard' | 'photos'>('dashboard')
  const [eventsRefreshKey, setEventsRefreshKey] = useState(0)
  const logout = useLogout();

  const handleEventCreated = (_event: CreatedEvent) => {
    setEventsRefreshKey((k) => k + 1)
    setShowCreateModal(false)
    setView('photos')
    setActiveItem('photos')
  }

  const handleSidebarClick = (id: string) => {
    setActiveItem(id)
    setSidebarOpen(false)
    if (id === 'photos') {
      setView('photos')
    } else {
      setView('dashboard')
    }
  }

  return (
    <div className="min-h-screen bg-ink-950 flex">
      {/* Sidebar overlay (mobile) */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-30 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed lg:sticky top-0 left-0 h-screen w-64 bg-ink-900 border-r border-overlay/[0.06] flex flex-col z-40 transition-transform duration-300 ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}
      >
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2.5 px-6 py-6 border-b border-overlay/[0.04]">
          <span className="flex items-center justify-center w-9 h-9 rounded-lg bg-gradient-to-br from-gold-400 to-gold-600 text-ink-950">
            <svg viewBox="0 0 24 24" fill="none" width="20" height="20">
              <path d="M3 9.5L7 4h10l4 5.5v9a2 2 0 01-2 2H5a2 2 0 01-2-2v-9z" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" />
              <circle cx="12" cy="13" r="3.5" stroke="currentColor" strokeWidth="2" />
              <path d="M8 4l1.5 2h5L16 4" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" />
            </svg>
          </span>
          <span className="font-display text-lg font-extrabold text-gradient-gold">SnapEvent</span>
        </Link>

        {/* Nav */}
        <nav className="flex-1 px-3 py-4 flex flex-col gap-1 overflow-y-auto">
          {SIDEBAR_ITEMS.map((item) => (
            <button
              key={item.id}
              onClick={() => handleSidebarClick(item.id)}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${
                activeItem === item.id
                  ? 'bg-gold-500/10 bg-indigo-600 border border-gold-500/20'
                  : 'text-ink-400 hover:text-ink-100 hover:bg-overlay/[0.04] border border-transparent'
              }`}
            >
              {item.icon}
              {item.label}
            </button>
          ))}
        </nav>

        {/* User + logout */}
        <div className="px-3 py-4 border-t border-overlay/[0.04]">
          <div className="flex items-center gap-3 px-4 py-3 rounded-xl bg-ink-800/50">
            <div className="w-9 h-9 rounded-full bg-gradient-to-br from-gold-400 to-gold-600 flex items-center justify-center text-ink-950 font-bold text-sm shrink-0">
              KP
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-semibold text-ink-100 truncate">Kouassi Photo</p>
              <p className="text-xs text-ink-500 truncate">Plan Pro</p>
            </div>
          </div>
          <button
            onClick={logout}
            className="flex items-center gap-2 px-4 py-2.5 mt-2 text-sm text-ink-500 hover:text-red-400 transition-colors"
          >
            <svg viewBox="0 0 24 24" width="18" height="18" fill="none">
              <path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4M16 17l5-5-5-5M21 12H9" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            Déconnexion
          </button>
        </div>
      </aside>

      {/* Main content */}
      {view === 'photos' ? (
        <PhotoManagement onBack={() => { setView('dashboard'); setActiveItem('dashboard') }} />
      ) : (
        <div className="flex-1 flex flex-col min-w-0">
          {/* Top bar */}
          <header className="sticky top-0 z-20 bg-ink-950/80 backdrop-blur-xl border-b border-overlay/[0.06] px-6 py-4 flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <button
                className="lg:hidden p-2 -ml-2 text-ink-300"
                onClick={() => setSidebarOpen(true)}
                aria-label="Ouvrir le menu"
              >
                <svg viewBox="0 0 24 24" width="24" height="24" fill="none">
                  <path d="M3 6h18M3 12h18M3 18h18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                </svg>
              </button>
              <h1 className="text-lg font-bold text-ink-50 font-body">Dashboard</h1>
            </div>

            <div className="flex items-center gap-3">
              <button className="p-2.5 rounded-xl bg-ink-800 border border-overlay/[0.06] text-ink-400 hover:text-ink-100 transition-colors">
                <svg viewBox="0 0 24 24" width="20" height="20" fill="none">
                  <path d="M15 17h5l-1.4-1.4A2 2 0 0118 14.2V11a6 6 0 10-12 0v3.2a2 2 0 01-.6 1.4L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </button>
              <button
                onClick={() => setShowCreateModal(true)}
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-gold-400 to-gold-600 text-ink-950 text-sm font-semibold shadow-lg shadow-gold-500/20 transition-all hover:-translate-y-0.5"
              >
                <svg viewBox="0 0 24 24" width="18" height="18" fill="none">
                  <path d="M12 5v14M5 12h14" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
                </svg>
                <span className="hidden sm:inline">Nouvel événement</span>
              </button>
            </div>
          </header>

          {/* Dashboard content */}
          <main className="flex-1 p-6 overflow-y-auto">
            {/* Greeting */}
            <div className="mb-8">
              <h2 className="text-2xl md:text-3xl font-extrabold text-ink-50 font-display">
                Bonjour, Kouassi
              </h2>
              <p className="text-sm text-ink-400 mt-1">Voici un aperçu de votre activité aujourd'hui</p>
            </div>

            {/* Stats grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 mb-8">
              {STATS.map((stat) => (
                <div
                  key={stat.label}
                  className="p-5 rounded-2xl bg-ink-900/60 border border-overlay/[0.06] transition-all hover:border-overlay/15"
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="w-11 h-11 rounded-xl bg-gold-500/10 border border-gold-500/15 flex items-center justify-center bg-indigo-600">
                      {stat.icon}
                    </div>
                  </div>
                  <p className="text-3xl font-extrabold text-ink-50 font-display mb-1">{stat.value}</p>
                  <p className="text-sm text-ink-400">{stat.label}</p>
                  <p className="text-xs text-emerald-400 mt-2">{stat.change}</p>
                </div>
              ))}
            </div>

            {/* Recent events */}
            {/* <div>
              <div className="flex items-center justify-between mb-5">
                <h3 className="text-lg font-bold text-ink-50 font-body">Événements récents</h3>
                <button
                  onClick={() => setShowCreateModal(true)}
                  className="text-sm bg-indigo-600 hover:text-gold-300 transition-colors font-medium"
                >
                  + Nouvel événement
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {allEvents.map((event) => (
                  <div
                    key={event.name}
                    className="group rounded-2xl bg-ink-900/60 border border-overlay/[0.06] overflow-hidden transition-all hover:border-gold-500/30 hover:shadow-xl hover:shadow-gold-500/5"
                  >
                    
                    <div className="relative h-40 overflow-hidden">
                      <img
                        src={event.cover}
                        alt={event.name}
                        loading="lazy"
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-ink-950/90 via-ink-950/20 to-transparent" />
                      <span
                        className={`absolute top-3 right-3 px-3 py-1 text-xs font-semibold rounded-full border ${
                          statusStyles[event.statusColor]
                        }`}
                      >
                        {event.status}
                      </span>
                    </div>

                    
                    <div className="p-5">
                      <h4 className="text-base font-bold text-ink-50 mb-1 truncate">{event.name}</h4>
                      <div className="flex items-center gap-4 text-sm text-ink-400 mb-4">
                        <span className="flex items-center gap-1.5">
                          <svg viewBox="0 0 24 24" width="15" height="15" fill="none">
                            <rect x="3" y="5" width="18" height="16" rx="2" stroke="currentColor" strokeWidth="1.8" />
                            <path d="M3 9h18M8 3v4M16 3v4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
                          </svg>
                          {event.date}
                        </span>
                        <span className="flex items-center gap-1.5">
                          <svg viewBox="0 0 24 24" width="15" height="15" fill="none">
                            <rect x="3" y="5" width="18" height="14" rx="2" stroke="currentColor" strokeWidth="1.8" />
                            <circle cx="9" cy="11" r="2" stroke="currentColor" strokeWidth="1.8" />
                          </svg>
                          {event.photos} photos
                        </span>
                      </div>

                     
                      {event.status === 'Traitement' && (
                        <div className="mb-4">
                          <div className="flex items-center justify-between text-xs text-ink-500 mb-1.5">
                            <span>Reconnaissance faciale</span>
                            <span>{event.progress}%</span>
                          </div>
                          <div className="h-1.5 rounded-full bg-ink-800 overflow-hidden">
                            <div
                              className="h-full rounded-full bg-gradient-to-r from-gold-400 to-gold-600 transition-all duration-500"
                              style={{ width: `${event.progress}%` }}
                            />
                          </div>
                        </div>
                      )}

                      <button
                        onClick={() => { setView('photos'); setActiveItem('photos') }}
                        className="w-full py-2.5 rounded-xl bg-overlay/[0.04] border border-overlay/[0.08] text-ink-100 text-sm font-semibold transition-all hover:bg-gold-500/10 hover:border-gold-500/30 hover:bg-indigo-600"
                      >
                        Ouvrir
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div> */}
            <MyEvents key={eventsRefreshKey} />
           
          </main>
        </div>
      )}

      {/* Create event modal */}
      {showCreateModal && (
        <CreateEventModal
          onClose={() => setShowCreateModal(false)}
          onCreated={handleEventCreated}
        />
      )}
    </div>
  )
}
