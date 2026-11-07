import { useState } from 'react'
import { Link } from 'react-router-dom'
import PhotographersList from '../components/PhotographersList'
import { useLogout } from "../utils/logout";
import RecentActivities from '../components/RecentActivities'


type View = 'overview' | 'users' | 'events' | 'photos' | 'reports' | 'settings'

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

const planStyles: Record<UserPlan, string> = {
  Gratuit: 'bg-ink-700/40 text-ink-300 border-ink-600/40',
  Pro: 'bg-gold-500/10 bg-indigo-600 border-gold-500/20',
  Studio: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
}

const statusStyles: Record<UserStatus, string> = {
  actif: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
  suspendu: 'bg-red-500/10 text-red-400 border-red-500/20',
  'en attente': 'bg-gold-500/10 bg-indigo-600 border-gold-500/20',
}

interface AdminEvent {
  name: string
  photographer: string
  date: string
  photos: number
  status: 'Terminé' | 'Traitement' | 'En attente'
  statusColor: 'emerald' | 'gold' | 'ink'
}

const ADMIN_EVENTS: AdminEvent[] = [
  { name: 'Mariage Kouassi & Grâce', photographer: 'Kouassi Photo', date: '15 Sept 2026', photos: 420, status: 'Terminé', statusColor: 'emerald' },
  { name: 'Baptême Baby Aya', photographer: 'Aya Photography', date: '22 Sept 2026', photos: 180, status: 'Traitement', statusColor: 'gold' },
  { name: 'Conférence TechAbidjan', photographer: 'Divine Shots', date: '28 Sept 2026', photos: 0, status: 'En attente', statusColor: 'ink' },
  { name: 'Concert Fête de la Musique', photographer: 'Grâce Studio', date: '01 Oct 2026', photos: 680, status: 'Traitement', statusColor: 'gold' },
  { name: 'Gala CCI Abidjan', photographer: 'Nadège Capture', date: '05 Oct 2026', photos: 1200, status: 'Terminé', statusColor: 'emerald' },
  { name: 'Mariage Yao & Berthe', photographer: 'Olivier Framed', date: '10 Oct 2026', photos: 0, status: 'En attente', statusColor: 'ink' },
]

const eventStatusStyles: Record<string, string> = {
  emerald: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
  gold: 'bg-gold-500/10 bg-indigo-600 border-gold-500/20',
  ink: 'bg-ink-700/40 text-ink-400 border-ink-600/40',
}

const RECENT_ACTIVITY = [
  { user: 'Kouassi Photo', action: 'a créé l\'événement', target: 'Mariage Kouassi & Grâce', time: 'Il y a 2 h', avatar: 'KP' },
  { user: 'Grâce Studio', action: 'a importé 680 photos', target: 'Concert Fête de la Musique', time: 'Il y a 5 h', avatar: 'GS' },
  { user: 'Aya Photography', action: 's\'est inscrite', target: 'Plan Pro', time: 'Il y a 1 j', avatar: 'AP' },
  { user: 'Nadège Capture', action: 'a terminé le traitement de', target: 'Gala CCI Abidjan', time: 'Il y a 2 j', avatar: 'NC' },
  { user: 'Marc Lens', action: 'a mis à niveau vers', target: 'Plan Gratuit', time: 'Il y a 3 j', avatar: 'ML' },
]

export default function AdminDashboard() {
  const [activeView, setActiveView] = useState<View>('overview')
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [userSearch, setUserSearch] = useState('')
  const [userFilter, setUserFilter] = useState<'all' | UserStatus>('all')
  const [eventSearch, setEventSearch] = useState('')
  const logout = useLogout();

  const filteredUsers = USERS.filter((u) => {
    if (userFilter !== 'all' && u.status !== userFilter) return false
    if (userSearch && !u.name.toLowerCase().includes(userSearch.toLowerCase()) && !u.email.toLowerCase().includes(userSearch.toLowerCase())) return false
    return true
  })

  const filteredEvents = ADMIN_EVENTS.filter(
    (e) => !eventSearch || e.name.toLowerCase().includes(eventSearch.toLowerCase()) || e.photographer.toLowerCase().includes(eventSearch.toLowerCase()),
  )

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
        <Link to="/" className="flex items-center gap-2.5 px-6 py-6 border-b border-overlay/[0.04]">
          <span className="flex items-center justify-center w-9 h-9 rounded-lg bg-gradient-to-br from-gold-400 to-gold-600 text-ink-950">
            <svg viewBox="0 0 24 24" fill="none" width="20" height="20">
              <path d="M3 9.5L7 4h10l4 5.5v9a2 2 0 01-2 2H5a2 2 0 01-2-2v-9z" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" />
              <circle cx="12" cy="13" r="3.5" stroke="currentColor" strokeWidth="2" />
              <path d="M8 4l1.5 2h5L16 4" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" />
            </svg>
          </span>
          <div className="flex flex-col">
            <span className="font-display text-lg font-extrabold text-gradient-gold">SnapEvent</span>
            <span className="text-[10px] font-semibold uppercase tracking-wider bg-indigo-600/70">Admin</span>
          </div>
        </Link>

        {/* Nav */}
        <nav className="flex-1 px-3 py-4 flex flex-col gap-1 overflow-y-auto">
          {SIDEBAR_ITEMS.map((item) => (
            <button
              key={item.id}
              onClick={() => { setActiveView(item.id); setSidebarOpen(false) }}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${
                activeView === item.id
                  ? 'bg-gold-500/10 bg-indigo-600 border border-gold-500/20'
                  : 'text-ink-400 hover:text-ink-100 hover:bg-overlay/[0.04] border border-transparent'
              }`}
            >
              {item.icon}
              {item.label}
            </button>
          ))}
        </nav>

        {/* Admin user + logout */}
        <div className="px-3 py-4 border-t border-overlay/[0.04]">
          <div className="flex items-center gap-3 px-4 py-3 rounded-xl bg-ink-800/50">
            <div className="w-9 h-9 rounded-full bg-gradient-to-br from-red-500 to-red-700 flex items-center justify-center text-white font-bold text-sm shrink-0">
              AD
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-semibold text-ink-100 truncate">Administrateur</p>
              <p className="text-xs text-ink-500 truncate">Super Admin</p>
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
          {activeView === 'overview' && (
            <div className="space-y-8">
              <div>
                <h2 className="text-2xl md:text-3xl font-extrabold text-ink-50 font-display">
                  Tableau de bord administrateur
                </h2>
                <p className="text-sm text-ink-400 mt-1">Vue d'ensemble de la plateforme SnapEvent</p>
              </div>

              {/* Stats grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
                {PLATFORM_STATS.map((stat) => (
                  <div key={stat.label} className="p-5 rounded-2xl bg-ink-900/60 border border-overlay/[0.06] transition-all hover:border-overlay/15">
                    <div className="w-11 h-11 rounded-xl bg-gold-500/10 border border-gold-500/15 flex items-center justify-center bg-indigo-600 mb-4">
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
                    <div className="flex items-center justify-between p-3 rounded-xl bg-gold-500/5 border border-gold-500/15">
                      <div className="flex items-center gap-3">
                        <span className="w-3 h-3 rounded-full bg-gold-400" />
                        <span className="text-sm text-ink-200">En attente</span>
                      </div>
                      <span className="text-lg font-bold bg-indigo-600">{pendingUsers}</span>
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
          {activeView === 'events' && (
            <div className="space-y-6">
              <div className="relative">
                <svg viewBox="0 0 24 24" width="18" height="18" fill="none" className="absolute left-3.5 top-1/2 -translate-y-1/2 text-ink-500">
                  <circle cx="11" cy="11" r="7" stroke="currentColor" strokeWidth="1.8" />
                  <path d="M21 21l-4.3-4.3" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
                </svg>
                <input
                  type="text"
                  value={eventSearch}
                  onChange={(e) => setEventSearch(e.target.value)}
                  placeholder="Rechercher un événement ou un photographe..."
                  className="w-full pl-11 pr-4 py-2.5 rounded-xl bg-ink-900/60 border border-overlay/[0.06] text-ink-100 placeholder-ink-500 text-sm outline-none transition-all focus:border-gold-500/30"
                />
              </div>

              <div className="rounded-2xl bg-ink-900/60 border border-overlay/[0.06] overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-overlay/[0.06]">
                        <th className="text-left px-5 py-3.5 text-xs font-semibold uppercase tracking-wider text-ink-500">Événement</th>
                        <th className="text-left px-5 py-3.5 text-xs font-semibold uppercase tracking-wider text-ink-500 hidden md:table-cell">Photographe</th>
                        <th className="text-left px-5 py-3.5 text-xs font-semibold uppercase tracking-wider text-ink-500 hidden sm:table-cell">Date</th>
                        <th className="text-left px-5 py-3.5 text-xs font-semibold uppercase tracking-wider text-ink-500 hidden lg:table-cell">Photos</th>
                        <th className="text-left px-5 py-3.5 text-xs font-semibold uppercase tracking-wider text-ink-500">Statut</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredEvents.map((event, i) => (
                        <tr key={i} className="border-b border-overlay/[0.04] hover:bg-overlay/[0.02] transition-colors">
                          <td className="px-5 py-4">
                            <span className="text-sm font-semibold text-ink-100">{event.name}</span>
                          </td>
                          <td className="px-5 py-4 hidden md:table-cell">
                            <span className="text-sm text-ink-300">{event.photographer}</span>
                          </td>
                          <td className="px-5 py-4 hidden sm:table-cell">
                            <span className="text-sm text-ink-400">{event.date}</span>
                          </td>
                          <td className="px-5 py-4 hidden lg:table-cell">
                            <span className="text-sm text-ink-200">{event.photos}</span>
                          </td>
                          <td className="px-5 py-4">
                            <span className={`px-2.5 py-1 text-xs font-semibold rounded-full border ${eventStatusStyles[event.statusColor]}`}>
                              {event.status}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                {filteredEvents.length === 0 && (
                  <div className="flex flex-col items-center justify-center py-16 text-ink-500">
                    <svg viewBox="0 0 24 24" width="40" height="40" fill="none">
                      <rect x="3" y="5" width="18" height="16" rx="2" stroke="currentColor" strokeWidth="1.5" />
                      <path d="M3 9h18M8 3v4M16 3v4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                    </svg>
                    <p className="text-sm mt-3">Aucun événement trouvé</p>
                  </div>
                )}
              </div>
            </div>
          )}

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
                          className="w-full rounded-t-lg bg-gradient-to-t from-gold-600 to-gold-400 transition-all duration-500 hover:from-gold-500 hover:to-gold-300"
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
          {activeView === 'reports' && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {[
                  { label: 'Revenu total', value: '28 540 €', sub: 'Depuis le lancement' },
                  { label: 'MRR', value: '4 280 €', sub: 'Septembre 2026' },
                  { label: 'Utilisateurs payants', value: '847', sub: '68% des utilisateurs' },
                  { label: 'Churn rate', value: '2,1 %', sub: '-0,3% vs août' },
                ].map((r) => (
                  <div key={r.label} className="p-5 rounded-2xl bg-ink-900/60 border border-overlay/[0.06]">
                    <p className="text-xs font-semibold uppercase tracking-wider text-ink-500 mb-2">{r.label}</p>
                    <p className="text-2xl font-extrabold text-ink-50 font-display mb-1">{r.value}</p>
                    <p className="text-xs text-ink-400">{r.sub}</p>
                  </div>
                ))}
              </div>

              <div className="rounded-2xl bg-ink-900/60 border border-overlay/[0.06] p-6">
                <h3 className="text-lg font-bold text-ink-50 font-body mb-5">Croissance des utilisateurs</h3>
                <div className="flex items-end gap-2 h-48">
                  {['Jan', 'Fév', 'Mar', 'Avr', 'Mai', 'Juin', 'Juil', 'Août', 'Sept'].map((month, i) => {
                    const height = 15 + i * 9
                    return (
                      <div key={month} className="flex-1 flex flex-col items-center gap-2">
                        <span className="text-xs font-bold text-ink-300">{Math.round(200 + i * 120)}</span>
                        <div
                          className="w-full rounded-t-lg bg-gradient-to-t from-gold-600 to-gold-400 transition-all duration-500 hover:from-gold-500 hover:to-gold-300"
                          style={{ height: `${height}%` }}
                        />
                        <span className="text-xs text-ink-500">{month}</span>
                      </div>
                    )
                  })}
                </div>
              </div>

              <div className="rounded-2xl bg-ink-900/60 border border-overlay/[0.06] p-6">
                <h3 className="text-lg font-bold text-ink-50 font-body mb-5">Répartition des plans</h3>
                <div className="flex flex-col gap-4">
                  {[
                    { plan: 'Gratuit', count: 401, pct: 32, color: 'from-ink-600 to-ink-500' },
                    { plan: 'Pro', count: 612, pct: 49, color: 'from-gold-600 to-gold-400' },
                    { plan: 'Studio', count: 235, pct: 19, color: 'from-emerald-600 to-emerald-400' },
                  ].map((p) => (
                    <div key={p.plan}>
                      <div className="flex items-center justify-between mb-1.5">
                        <span className="text-sm font-medium text-ink-200">{p.plan}</span>
                        <span className="text-sm text-ink-400">{p.count} utilisateurs ({p.pct}%)</span>
                      </div>
                      <div className="h-3 rounded-full bg-ink-800 overflow-hidden">
                        <div
                          className={`h-full rounded-full bg-gradient-to-r ${p.color} transition-all duration-500`}
                          style={{ width: `${p.pct}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

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
                      defaultValue="SnapEvent"
                      className="w-full px-4 py-3 rounded-xl bg-ink-800 border border-overlay/[0.08] text-ink-100 text-sm outline-none transition-all focus:border-gold-500/40 focus:ring-2 focus:ring-gold-500/10"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-ink-300 mb-2">Email de contact</label>
                    <input
                      type="email"
                      defaultValue="contact@snapevent.io"
                      className="w-full px-4 py-3 rounded-xl bg-ink-800 border border-overlay/[0.08] text-ink-100 text-sm outline-none transition-all focus:border-gold-500/40 focus:ring-2 focus:ring-gold-500/10"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-ink-300 mb-2">Limite de stockage par utilisateur (Go)</label>
                    <input
                      type="number"
                      defaultValue="10"
                      className="w-full px-4 py-3 rounded-xl bg-ink-800 border border-overlay/[0.08] text-ink-100 text-sm outline-none transition-all focus:border-gold-500/40 focus:ring-2 focus:ring-gold-500/10"
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
                        className={`relative w-12 h-6 rounded-full transition-colors ${toggle.defaultOn ? 'bg-gold-500' : 'bg-ink-700'}`}
                      >
                        <span
                          className={`absolute top-0.5 w-5 h-5 rounded-full bg-white transition-transform ${toggle.defaultOn ? 'translate-x-6' : 'translate-x-0.5'}`}
                        />
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              <button className="px-6 py-3 rounded-xl bg-gradient-to-r from-gold-400 to-gold-600 text-ink-950 font-semibold shadow-lg shadow-gold-500/20 transition-all hover:-translate-y-0.5">
                Enregistrer les modifications
              </button>
            </div>
          )}
        </main>
      </div>
    </div>
  )
}
