import { useState } from 'react'
import PhotographersList from '../components/PhotographersList'
import UserMenu from "../components/UserMenu";
import ProfileView from "../components/ProfileView";
import AdminReports from "../components/AdminReports";
import AdminEvents from "../components/AdminEvents";
import RecentActivities from '../components/RecentActivities'
import Logo from '../components/Logo'


type View = 'overview' | 'users' | 'events' | 'photos' | 'reports' | 'settings' | 'profile'

const SIDEBAR_ITEMS: { id: View; label: string; icon: React.ReactNode }[] = [
  {
    id: 'overview',
    label: 'Vue d\'ensemble',
    icon: (
      <svg viewBox="0 0 24 24" width="20" height="20" fill="none">
        <rect x="3" y="3" width="7" height="7" rx="1.5" stroke="currentColor" strokeWidth="1.8" />
        <rect x="14" y="3" width="7" height="7" rx="1.5" stroke="currentColor" strokeWidth="1.8" />
        <rect x="3" y="14" width="7" height="7" rx="1.5" stroke="currentColor" strokeWidth="1.8" />
        <rect x="14" y="14" width="7" height="7" rx="1.5" stroke="currentColor" strokeWidth="1.8" />
      </svg>
    ),
  },
  {
    id: 'users',
    label: 'Utilisateurs',
    icon: (
      <svg viewBox="0 0 24 24" width="20" height="20" fill="none">
        <circle cx="12" cy="8" r="4" stroke="currentColor" strokeWidth="1.8" />
        <path d="M4 21v-1a6 6 0 0112 0v1" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
      </svg>
    ),
  },
  {
    id: 'events',
    label: 'Événements',
    icon: (
      <svg viewBox="0 0 24 24" width="20" height="20" fill="none">
        <rect x="3" y="5" width="18" height="16" rx="2" stroke="currentColor" strokeWidth="1.8" />
        <path d="M3 9h18M8 3v4M16 3v4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
      </svg>
    ),
  },
  {
    id: 'photos',
    label: 'Photos',
    icon: (
      <svg viewBox="0 0 24 24" width="20" height="20" fill="none">
        <rect x="3" y="5" width="18" height="14" rx="2" stroke="currentColor" strokeWidth="1.8" />
        <circle cx="9" cy="11" r="2" stroke="currentColor" strokeWidth="1.8" />
        <path d="M21 17l-5-5-8 8" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
  },
  {
    id: 'reports',
    label: 'Rapports',
    icon: (
      <svg viewBox="0 0 24 24" width="20" height="20" fill="none">
        <path d="M4 20V10M10 20V4M16 20v-7M22 20H2" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
      </svg>
    ),
  },
  {
    id: 'settings',
    label: 'Paramètres',
    icon: (
      <svg viewBox="0 0 24 24" width="20" height="20" fill="none">
        <circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="1.8" />
        <path d="M19.4 15a1.6 1.6 0 00.3 1.8l.1.1a2 2 0 11-2.8 2.8l-.1-.1a1.6 1.6 0 00-1.8-.3 1.6 1.6 0 00-1 1.5V21a2 2 0 11-4 0v-.1a1.6 1.6 0 00-1-1.5 1.6 1.6 0 00-1.8.3l-.1.1a2 2 0 11-2.8-2.8l.1-.1a1.6 1.6 0 00.3-1.8 1.6 1.6 0 00-1.5-1H3a2 2 0 110-4h.1a1.6 1.6 0 001.5-1 1.6 1.6 0 00-.3-1.8l-.1-.1a2 2 0 112.8-2.8l.1.1a1.6 1.6 0 001.8.3h0a1.6 1.6 0 001-1.5V3a2 2 0 114 0v.1a1.6 1.6 0 001 1.5 1.6 1.6 0 001.8-.3l.1-.1a2 2 0 112.8 2.8l-.1.1a1.6 1.6 0 00-.3 1.8v0a1.6 1.6 0 001.5 1H21a2 2 0 110 4h-.1a1.6 1.6 0 00-1.5 1z" stroke="currentColor" strokeWidth="1.5" />
      </svg>
    ),
  },
]

const PLATFORM_STATS = [
  {
    label: 'Utilisateurs actifs',
    value: '1 248',
    change: '+124 ce mois',
    icon: (
      <svg viewBox="0 0 24 24" width="24" height="24" fill="none">
        <circle cx="12" cy="8" r="4" stroke="currentColor" strokeWidth="1.8" />
        <path d="M4 21v-1a6 6 0 0112 0v1" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
      </svg>
    ),
  },
  {
    label: 'Événements créés',
    value: '342',
    change: '+28 cette semaine',
    icon: (
      <svg viewBox="0 0 24 24" width="24" height="24" fill="none">
        <rect x="3" y="5" width="18" height="16" rx="2" stroke="currentColor" strokeWidth="1.8" />
        <path d="M3 9h18M8 3v4M16 3v4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
      </svg>
    ),
  },
  {
    label: 'Photos stockées',
    value: '128 540',
    change: '+8 200 cette semaine',
    icon: (
      <svg viewBox="0 0 24 24" width="24" height="24" fill="none">
        <rect x="3" y="5" width="18" height="14" rx="2" stroke="currentColor" strokeWidth="1.8" />
        <circle cx="9" cy="11" r="2" stroke="currentColor" strokeWidth="1.8" />
        <path d="M21 17l-5-5-8 8" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
  },
  {
    label: 'Revenu mensuel',
    value: '4 280 €',
    change: '+12% vs mois dernier',
    icon: (
      <svg viewBox="0 0 24 24" width="24" height="24" fill="none">
        <path d="M12 1v22M17 5H9.5a3.5 3.5 0 000 7h5a3.5 3.5 0 010 7H6" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
  },
]

type UserStatus = 'actif' | 'suspendu' | 'en attente'
type UserPlan = 'Gratuit' | 'Pro' | 'Studio'

interface User {
  id: string
  name: string
  email: string
  plan: UserPlan
  events: number
  photos: number
  joinedDate: string
  status: UserStatus
  avatar: string
}

const USERS: User[] = [
  { id: '1', name: 'Kouassi Photo', email: 'kouassi@mail.com', plan: 'Pro', events: 12, photos: 3480, joinedDate: '12 Jan 2026', status: 'actif', avatar: 'KP' },
  { id: '2', name: 'Grâce Studio', email: 'grace@mail.com', plan: 'Studio', events: 28, photos: 12400, joinedDate: '03 Fév 2026', status: 'actif', avatar: 'GS' },
  { id: '3', name: 'Aya Photography', email: 'aya@mail.com', plan: 'Pro', events: 8, photos: 2100, joinedDate: '15 Fév 2026', status: 'actif', avatar: 'AP' },
  { id: '4', name: 'Marc Lens', email: 'marc@mail.com', plan: 'Gratuit', events: 2, photos: 340, joinedDate: '01 Mar 2026', status: 'en attente', avatar: 'ML' },
  { id: '5', name: 'Divine Shots', email: 'divine@mail.com', plan: 'Pro', events: 15, photos: 5600, joinedDate: '20 Mar 2026', status: 'actif', avatar: 'DS' },
  { id: '6', name: 'Cyril Visuals', email: 'cyril@mail.com', plan: 'Gratuit', events: 1, photos: 120, joinedDate: '05 Avr 2026', status: 'suspendu', avatar: 'CV' },
  { id: '7', name: 'Nadège Capture', email: 'nadege@mail.com', plan: 'Studio', events: 32, photos: 18900, joinedDate: '18 Avr 2026', status: 'actif', avatar: 'NC' },
  { id: '8', name: 'Olivier Framed', email: 'olivier@mail.com', plan: 'Pro', events: 9, photos: 4200, joinedDate: '02 Mai 2026', status: 'actif', avatar: 'OF' },
]


export default function AdminDashboard() {
  const [activeView, setActiveView] = useState<View>('overview')
  const [sidebarOpen, setSidebarOpen] = useState(false)


  const activeUsers = USERS.filter((u) => u.status === 'actif').length
  const pendingUsers = USERS.filter((u) => u.status === 'en attente').length
  const suspendedUsers = USERS.filter((u) => u.status === 'suspendu').length

  return (
    <div className="min-h-screen bg-ink-950 flex">
      {/* Sidebar overlay (mobile) */}
      {sidebarOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-30 lg:hidden" onClick={() => setSidebarOpen(false)} />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed lg:sticky top-0 left-0 h-screen w-64 bg-ink-900 border-r border-overlay/[0.06] flex flex-col z-40 transition-transform duration-300 ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}
      >
        {/* Logo */}
        <div className="px-6 py-5 border-b border-overlay/[0.04]"><Logo size="sm" subtitle="Administration" /></div>

        {/* Nav */}
        <nav className="flex-1 px-3 py-4 flex flex-col gap-1 overflow-y-auto">
          {SIDEBAR_ITEMS.map((item) => (
            <button
              key={item.id}
              onClick={() => { setActiveView(item.id); setSidebarOpen(false) }}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${
                activeView === item.id
                  ? 'bg-brand-500/10 text-brand-400 border border-brand-500/20'
                  : 'text-ink-400 hover:text-ink-100 hover:bg-overlay/[0.04] border border-transparent'
              }`}
            >
              {item.icon}
              {item.label}
            </button>
          ))}
        </nav>

        {/* Utilisateur connecté */}
        <UserMenu
          variant="admin"
          active={activeView === 'profile'}
          onOpenProfile={() => { setActiveView('profile'); setSidebarOpen(false) }}
        />
      </aside>

      {/* Main content */}
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
            <h1 className="text-lg font-bold text-ink-50 font-body">
              {activeView === 'overview' && 'Vue d\'ensemble'}
              {activeView === 'users' && 'Gestion des utilisateurs'}
              {activeView === 'events' && 'Gestion des événements'}
              {activeView === 'photos' && 'Toutes les photos'}
              {activeView === 'reports' && 'Rapports'}
              {activeView === 'settings' && 'Paramètres système'}
              {activeView === 'profile' && 'Mon profil'}
            </h1>
          </div>

          <div className="flex items-center gap-3">
            <button className="p-2.5 rounded-xl bg-ink-800 border border-overlay/[0.06] text-ink-400 hover:text-ink-100 transition-colors">
              <svg viewBox="0 0 24 24" width="20" height="20" fill="none">
                <path d="M15 17h5l-1.4-1.4A2 2 0 0118 14.2V11a6 6 0 10-12 0v3.2a2 2 0 01-.6 1.4L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>
            <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-emerald-500/10 border border-emerald-500/20">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span className="text-xs font-semibold text-emerald-400 hidden sm:inline">Système opérationnel</span>
            </div>
          </div>
        </header>

        <main className="flex-1 p-6 overflow-y-auto">
          {/* ===== OVERVIEW ===== */}
          {activeView === 'profile' && <ProfileView />}

          {activeView === 'overview' && (
            <div className="space-y-8">
              <div>
                <h2 className="text-2xl md:text-3xl font-extrabold text-ink-50 font-display">
                  Tableau de bord administrateur
                </h2>
                <p className="text-sm text-ink-400 mt-1">Vue d'ensemble de la plateforme Photiva</p>
              </div>

              {/* Stats grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
                {PLATFORM_STATS.map((stat) => (
                  <div key={stat.label} className="p-5 rounded-2xl bg-ink-900/60 border border-overlay/[0.06] transition-all hover:border-overlay/15">
                    <div className="w-11 h-11 rounded-xl bg-brand-500/10 border border-brand-500/15 flex items-center justify-center text-brand-400 mb-4">
                      {stat.icon}
                    </div>
                    <p className="text-3xl font-extrabold text-ink-50 font-display mb-1">{stat.value}</p>
                    <p className="text-sm text-ink-400">{stat.label}</p>
                    <p className="text-xs text-emerald-400 mt-2">{stat.change}</p>
                  </div>
                ))}
              </div>

              {/* Two columns: activity + quick user summary */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Recent activity */}
               
                <div className="lg:col-span-2 rounded-2xl bg-ink-900/60 border border-overlay/[0.06] p-6">
                  <div className="flex flex-col gap-4">
                     <RecentActivities />
                  </div>
                </div>

                {/* User breakdown */}
                <div className="rounded-2xl bg-ink-900/60 border border-overlay/[0.06] p-6">
                  <h3 className="text-lg font-bold text-ink-50 font-body mb-5">Répartition utilisateurs</h3>
                  <div className="flex flex-col gap-4">
                    <div className="flex items-center justify-between p-3 rounded-xl bg-emerald-500/5 border border-emerald-500/15">
                      <div className="flex items-center gap-3">
                        <span className="w-3 h-3 rounded-full bg-emerald-400" />
                        <span className="text-sm text-ink-200">Actifs</span>
                      </div>
                      <span className="text-lg font-bold text-emerald-400">{activeUsers}</span>
                    </div>
                    <div className="flex items-center justify-between p-3 rounded-xl bg-brand-500/5 border border-brand-500/15">
                      <div className="flex items-center gap-3">
                        <span className="w-3 h-3 rounded-full bg-brand-400" />
                        <span className="text-sm text-ink-200">En attente</span>
                      </div>
                      <span className="text-lg font-bold text-brand-400">{pendingUsers}</span>
                    </div>
                    <div className="flex items-center justify-between p-3 rounded-xl bg-red-500/5 border border-red-500/15">
                      <div className="flex items-center gap-3">
                        <span className="w-3 h-3 rounded-full bg-red-400" />
                        <span className="text-sm text-ink-200">Suspendus</span>
                      </div>
                      <span className="text-lg font-bold text-red-400">{suspendedUsers}</span>
                    </div>
                  </div>
                  <div className="mt-5 pt-5 border-t border-overlay/[0.06]">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs text-ink-500">Taux d'activation</span>
                      <span className="text-xs font-bold text-ink-200">{Math.round((activeUsers / USERS.length) * 100)}%</span>
                    </div>
                    <div className="h-2 rounded-full bg-ink-800 overflow-hidden">
                      <div
                        className="h-full rounded-full bg-gradient-to-r from-emerald-400 to-emerald-600 transition-all duration-500"
                        style={{ width: `${(activeUsers / USERS.length) * 100}%` }}
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ===== USERS ===== */}
          {activeView === 'users' && (
            <div className="space-y-6">
              {/* Toolbar */}
               <PhotographersList />
            </div>

           
          )}

          

          {/* ===== EVENTS ===== */}
          {activeView === 'events' && <AdminEvents />}

          {/* ===== PHOTOS ===== */}
          {activeView === 'photos' && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="p-5 rounded-2xl bg-ink-900/60 border border-overlay/[0.06]">
                  <p className="text-3xl font-extrabold text-ink-50 font-display mb-1">128 540</p>
                  <p className="text-sm text-ink-400">Total photos</p>
                </div>
                <div className="p-5 rounded-2xl bg-ink-900/60 border border-overlay/[0.06]">
                  <p className="text-3xl font-extrabold text-ink-50 font-display mb-1">42,8 Go</p>
                  <p className="text-sm text-ink-400">Espace utilisé</p>
                </div>
                <div className="p-5 rounded-2xl bg-ink-900/60 border border-overlay/[0.06]">
                  <p className="text-3xl font-extrabold text-ink-50 font-display mb-1">98,2 %</p>
                  <p className="text-sm text-ink-400">Taux de traitement</p>
                </div>
              </div>
              <div className="rounded-2xl bg-ink-900/60 border border-overlay/[0.06] p-6">
                <h3 className="text-lg font-bold text-ink-50 font-body mb-4">Stockage par mois</h3>
                <div className="flex items-end gap-2 h-40">
                  {['Jan', 'Fév', 'Mar', 'Avr', 'Mai', 'Juin', 'Juil', 'Août', 'Sept'].map((month, i) => {
                    const height = 20 + Math.round(Math.sin(i * 0.8) * 30 + 50)
                    return (
                      <div key={month} className="flex-1 flex flex-col items-center gap-2">
                        <div
                          className="w-full rounded-t-lg bg-gradient-to-t from-brand-600 to-brand-400 transition-all duration-500 hover:from-brand-500 hover:to-brand-300"
                          style={{ height: `${height}%` }}
                        />
                        <span className="text-xs text-ink-500">{month}</span>
                      </div>
                    )
                  })}
                </div>
              </div>
            </div>
          )}

          {/* ===== REPORTS ===== */}
          {activeView === 'reports' && <AdminReports />}

          {/* ===== SETTINGS ===== */}
          {activeView === 'settings' && (
            <div className="space-y-6 max-w-2xl">
              <div className="rounded-2xl bg-ink-900/60 border border-overlay/[0.06] p-6">
                <h3 className="text-lg font-bold text-ink-50 font-body mb-5">Paramètres généraux</h3>
                <div className="flex flex-col gap-5">
                  <div>
                    <label className="block text-sm font-medium text-ink-300 mb-2">Nom de la plateforme</label>
                    <input
                      type="text"
                      defaultValue="Photiva"
                      className="w-full px-4 py-3 rounded-xl bg-ink-800 border border-overlay/[0.08] text-ink-100 text-sm outline-none transition-all focus:border-brand-500/40 focus:ring-2 focus:ring-brand-500/10"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-ink-300 mb-2">Email de contact</label>
                    <input
                      type="email"
                      defaultValue="contact@photiva.ci"
                      className="w-full px-4 py-3 rounded-xl bg-ink-800 border border-overlay/[0.08] text-ink-100 text-sm outline-none transition-all focus:border-brand-500/40 focus:ring-2 focus:ring-brand-500/10"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-ink-300 mb-2">Limite de stockage par utilisateur (Go)</label>
                    <input
                      type="number"
                      defaultValue="10"
                      className="w-full px-4 py-3 rounded-xl bg-ink-800 border border-overlay/[0.08] text-ink-100 text-sm outline-none transition-all focus:border-brand-500/40 focus:ring-2 focus:ring-brand-500/10"
                    />
                  </div>
                </div>
              </div>

              <div className="rounded-2xl bg-ink-900/60 border border-overlay/[0.06] p-6">
                <h3 className="text-lg font-bold text-ink-50 font-body mb-5">Toggles</h3>
                <div className="flex flex-col gap-4">
                  {[
                    { label: 'Inscriptions ouvertes', desc: 'Autoriser de nouveaux comptes', defaultOn: true },
                    { label: 'Mode maintenance', desc: 'Mettre la plateforme hors ligne', defaultOn: false },
                    { label: 'Notifications email', desc: 'Envoyer des emails aux utilisateurs', defaultOn: true },
                    { label: 'Modération automatique', desc: 'Valider les photos par IA', defaultOn: true },
                  ].map((toggle) => (
                    <div key={toggle.label} className="flex items-center justify-between p-3 rounded-xl bg-ink-800/50">
                      <div>
                        <p className="text-sm font-medium text-ink-100">{toggle.label}</p>
                        <p className="text-xs text-ink-500 mt-0.5">{toggle.desc}</p>
                      </div>
                      <button
                        className={`relative w-12 h-6 rounded-full transition-colors ${toggle.defaultOn ? 'bg-brand-500' : 'bg-ink-700'}`}
                      >
                        <span
                          className={`absolute top-0.5 w-5 h-5 rounded-full bg-white transition-transform ${toggle.defaultOn ? 'translate-x-6' : 'translate-x-0.5'}`}
                        />
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              <button className="px-6 py-3 rounded-xl bg-gradient-to-r from-brand-400 to-brand-600 text-white font-semibold shadow-lg shadow-brand-500/20 transition-all hover:-translate-y-0.5">
                Enregistrer les modifications
              </button>
            </div>
          )}
        </main>
      </div>
    </div>
  )
}
