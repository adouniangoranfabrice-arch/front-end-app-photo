import { useState, useRef, useCallback } from 'react'
import axios from 'axios'
import api from '../../api/axios'

interface CreateEventModalProps {
  onClose: () => void
  onCreated: (event: CreatedEvent) => void
}

export interface CreatedEvent {
  id: string
  name: string
  description: string
  date: string
  time: string
  location: string
  coverUrl: string
  url: string
  qrSeed: string
}

// Réponse renvoyée par POST /api/events (EventResponse côté backend)
interface EventApiResponse {
  id: string
  name: string
  description: string | null
  event_type: string
  event_date: string | null
  location: string | null
  cover_photo: string | null
  public_token: string
  public_url: string
  is_public: boolean
  status: string
}

const EVENT_TYPES = [
  'Mariage',
  'Anniversaire',
  'Baptême',
  'Conférence',
  'Concert',
  'Soirée',
  'Entreprise',
  'Sport',
  'Autre',
]

const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp']
const MAX_FILE_SIZE = 10 * 1024 * 1024

const API_BASE = (import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000/api')
  .replace(/\/+$/, '')
  .replace(/\/api$/, '')

const QR_PATTERN: [number, number][] = [
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
]

function QRCode({ size = 160 }: { size?: number }) {
  return (
    <svg viewBox="0 0 200 200" width={size} height={size} className="text-ink-50">
      <rect width="200" height="200" fill="none" />
      <rect x="10" y="10" width="50" height="50" rx="4" fill="currentColor" />
      <rect x="20" y="20" width="30" height="30" rx="2" fill="#161614" />
      <rect x="27" y="27" width="16" height="16" rx="1" fill="currentColor" />
      <rect x="140" y="10" width="50" height="50" rx="4" fill="currentColor" />
      <rect x="150" y="20" width="30" height="30" rx="2" fill="#161614" />
      <rect x="157" y="27" width="16" height="16" rx="1" fill="currentColor" />
      <rect x="10" y="140" width="50" height="50" rx="4" fill="currentColor" />
      <rect x="20" y="150" width="30" height="30" rx="2" fill="#161614" />
      <rect x="27" y="157" width="16" height="16" rx="1" fill="currentColor" />
      {QR_PATTERN.map(([x, y], i) => (
        <rect key={i} x={x} y={y} width="15" height="15" rx="1" fill="currentColor" />
      ))}
    </svg>
  )
}

export default function CreateEventModal({ onClose, onCreated }: CreateEventModalProps) {
  const [step, setStep] = useState<'form' | 'success'>('form')
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [date, setDate] = useState('')
  const [time, setTime] = useState('')
  const [location, setLocation] = useState('')
  const [eventType, setEventType] = useState('')
  const [isPublic, setIsPublic] = useState(true)
  const [coverUrl, setCoverUrl] = useState('')
  const [coverFile, setCoverFile] = useState<File | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [dragging, setDragging] = useState(false)
  const [createdEvent, setCreatedEvent] = useState<CreatedEvent | null>(null)
  const [copied, setCopied] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFile = useCallback((file: File) => {
    if (!ALLOWED_TYPES.includes(file.type)) {
      setError('Format non autorisé. Utilisez JPG, PNG ou WEBP.')
      return
    }
    if (file.size > MAX_FILE_SIZE) {
      setError("L'image ne doit pas dépasser 10 MB.")
      return
    }
    setError('')
    setCoverFile(file)
    setCoverUrl(URL.createObjectURL(file))
  }, [])

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault()
      setDragging(false)
      const file = e.dataTransfer.files?.[0]
      if (file && file.type.startsWith('image/')) handleFile(file)
    },
    [handleFile],
  )

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (submitting) return

    setError('')
    setSubmitting(true)

    // Les champs sont envoyés en multipart/form-data (Form(...) + File(...) côté FastAPI)
    const formData = new FormData()
    formData.append('name', name.trim())
    formData.append('event_type', eventType)
    formData.append('is_public', String(isPublic))
    if (description.trim()) formData.append('description', description.trim())
    if (location.trim()) formData.append('location', location.trim())
    if (date) formData.append('event_date', `${date}T${time || '00:00'}:00`)
    if (coverFile) formData.append('cover_photo', coverFile)

    try {
      const { data } = await api.post<EventApiResponse>('/events', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      })

      setCreatedEvent({
        id: data.id,
        name: data.name,
        description: data.description ?? '',
        date,
        time,
        location: data.location ?? '',
        coverUrl: data.cover_photo ? `${API_BASE}${data.cover_photo}` : '',
        url: data.public_url,
        qrSeed: data.public_token,
      })
      setStep('success')
    } catch (err: unknown) {
      if (axios.isAxiosError(err)) {
        const detail = err.response?.data?.detail
        if (err.response?.status === 401) {
          setError('Session expirée. Veuillez vous reconnecter.')
        } else if (err.response?.status === 403) {
          setError('Seuls les photographes peuvent créer un événement.')
        } else if (typeof detail === 'string') {
          setError(detail)
        } else if (Array.isArray(detail)) {
          setError(detail.map((d: { msg?: string }) => d.msg).join(' • '))
        } else {
          setError("Impossible de créer l'événement. Vérifiez que le serveur est lancé.")
        }
      } else {
        setError('Une erreur inattendue est survenue.')
      }
    } finally {
      setSubmitting(false)
    }
  }

  const handleConfirm = () => {
    if (createdEvent) onCreated(createdEvent)
  }

  const copyUrl = () => {
    if (createdEvent) {
      navigator.clipboard?.writeText(createdEvent.url)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose} />

      <div className="relative z-10 w-full max-w-lg max-h-[90vh] overflow-y-auto bg-ink-900 border border-overlay/[0.08] rounded-3xl shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-overlay/[0.06] sticky top-0 bg-ink-900 z-10 rounded-t-3xl">
          <h2 className="text-lg font-bold text-ink-50 font-body">
            {step === 'form' ? 'Créer un événement' : 'Événement créé !'}
          </h2>
          <button
            onClick={onClose}
            className="p-2 -mr-2 text-ink-400 hover:text-ink-100 transition-colors"
          >
            <svg viewBox="0 0 24 24" width="22" height="22" fill="none">
              <path d="M6 6l12 12M18 6L6 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
            </svg>
          </button>
        </div>

        {step === 'form' ? (
          <form onSubmit={handleSubmit} className="p-6 flex flex-col gap-5">
            {/* Cover upload */}
            <div>
              <label className="block text-sm font-medium text-ink-300 mb-2">Photo de couverture</label>
              <div
                onDragOver={(e) => {
                  e.preventDefault()
                  setDragging(true)
                }}
                onDragLeave={() => setDragging(false)}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
                className={`relative h-36 rounded-2xl border-2 border-dashed cursor-pointer transition-all flex items-center justify-center overflow-hidden ${
                  dragging
                    ? 'border-gold-500 bg-gold-500/5'
                    : 'border-overlay/15 hover:border-gold-500/40 hover:bg-overlay/[0.02]'
                }`}
              >
                {coverUrl ? (
                  <>
                    <img src={coverUrl} alt="Couverture" className="absolute inset-0 w-full h-full object-cover" />
                    <div className="absolute inset-0 bg-ink-950/40 flex items-center justify-center">
                      <span className="text-sm text-white font-medium">Changer la photo</span>
                    </div>
                  </>
                ) : (
                  <div className="flex flex-col items-center gap-2 text-ink-500">
                    <svg viewBox="0 0 24 24" width="32" height="32" fill="none">
                      <path d="M12 16V6m0 0L8 10m4-4l4 4M4 16v2a2 2 0 002 2h12a2 2 0 002-2v-2" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                    <span className="text-sm">Glissez une image ou cliquez</span>
                  </div>
                )}
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => {
                    const file = e.target.files?.[0]
                    if (file) handleFile(file)
                  }}
                />
              </div>
            </div>

            {/* Name */}
            <div>
              <label className="block text-sm font-medium text-ink-300 mb-2">Nom de l'événement</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Mariage Kouassi & Grâce"
                required
                className="w-full px-4 py-3 rounded-xl bg-ink-800 border border-overlay/[0.08] text-ink-100 placeholder-ink-500 text-sm outline-none transition-all focus:border-gold-500/40 focus:ring-2 focus:ring-gold-500/10"
              />
            </div>

            {/* Event type */}
            <div>
              <label className="block text-sm font-medium text-ink-300 mb-2">Type d'événement</label>
              <select
                value={eventType}
                onChange={(e) => setEventType(e.target.value)}
                required
                className="w-full px-4 py-3 rounded-xl bg-ink-800 border border-overlay/[0.08] text-ink-100 text-sm outline-none transition-all focus:border-gold-500/40 focus:ring-2 focus:ring-gold-500/10"
              >
                <option value="" disabled>
                  Choisir un type
                </option>
                {EVENT_TYPES.map((t) => (
                  <option key={t} value={t}>
                    {t}
                  </option>
                ))}
              </select>
            </div>

            {/* Description */}
            <div>
              <label className="block text-sm font-medium text-ink-300 mb-2">Description</label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Décrivez votre événement..."
                rows={2}
                className="w-full px-4 py-3 rounded-xl bg-ink-800 border border-overlay/[0.08] text-ink-100 placeholder-ink-500 text-sm outline-none transition-all focus:border-gold-500/40 focus:ring-2 focus:ring-gold-500/10 resize-none"
              />
            </div>

            {/* Date + Time */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-ink-300 mb-2">Date</label>
                <input
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  required
                  className="w-full px-4 py-3 rounded-xl bg-ink-800 border border-overlay/[0.08] text-ink-100 text-sm outline-none transition-all focus:border-gold-500/40 focus:ring-2 focus:ring-gold-500/10"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-ink-300 mb-2">Heure</label>
                <input
                  type="time"
                  value={time}
                  onChange={(e) => setTime(e.target.value)}
                  required
                  className="w-full px-4 py-3 rounded-xl bg-ink-800 border border-overlay/[0.08] text-ink-100 text-sm outline-none transition-all focus:border-gold-500/40 focus:ring-2 focus:ring-gold-500/10"
                />
              </div>
            </div>

            {/* Location */}
            <div>
              <label className="block text-sm font-medium text-ink-300 mb-2">Lieu</label>
              <input
                type="text"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="Hôtel Ivoire, Abidjan"
                required
                className="w-full px-4 py-3 rounded-xl bg-ink-800 border border-overlay/[0.08] text-ink-100 placeholder-ink-500 text-sm outline-none transition-all focus:border-gold-500/40 focus:ring-2 focus:ring-gold-500/10"
              />
            </div>

            {/* Public */}
            <label className="flex items-center gap-3 text-sm text-ink-300 cursor-pointer">
              <input
                type="checkbox"
                checked={isPublic}
                onChange={(e) => setIsPublic(e.target.checked)}
                className="w-4 h-4 accent-gold-500"
              />
              Galerie publique (accessible via le lien)
            </label>

            {error && (
              <div className="px-4 py-3 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-sm">
                {error}
              </div>
            )}

            {/* Submit */}
            <button
              type="submit"
              disabled={submitting}
              className="w-full py-3.5 disabled:opacity-60 disabled:cursor-not-allowed disabled:hover:translate-y-0 rounded-xl bg-gradient-to-r from-gold-400 to-gold-600 text-ink-950 font-semibold shadow-lg shadow-gold-500/25 transition-all hover:-translate-y-0.5 hover:shadow-gold-500/40"
            >
              {submitting ? 'Création en cours…' : "Créer l'événement"}
            </button>
          </form>
        ) : (
          <div className="p-6 flex flex-col items-center text-center">
            {/* Success icon */}
            <div className="w-16 h-16 rounded-full bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center mb-5">
              <svg viewBox="0 0 24 24" width="32" height="32" fill="none">
                <path d="M5 13l4 4L19 7" stroke="#34d399" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>

            <h3 className="text-xl font-bold text-ink-50 mb-1 font-body">{createdEvent?.name}</h3>
            <p className="text-sm text-ink-400 mb-6">
              Votre galerie est prête. Partagez le lien ou le QR Code avec vos invités.
            </p>

            {/* QR Code */}
            <div className="relative w-44 h-44 flex items-center justify-center rounded-2xl bg-ink-950 border border-overlay/[0.08] p-3 mb-6">
              <div className="absolute -inset-3 rounded-2xl bg-gold-500/[0.1] blur-xl animate-pulse-glow" />
              <QRCode size={160} />
            </div>

            {/* URL */}
            <div className="w-full mb-5">
              <label className="block text-sm font-medium text-ink-300 mb-2">Lien de la galerie</label>
              <div className="flex items-center gap-2">
                <div className="flex-1 px-4 py-3 rounded-xl bg-ink-800 border border-overlay/[0.08] text-ink-200 text-sm truncate text-left">
                  {createdEvent?.url}
                </div>
                <button
                  onClick={copyUrl}
                  className="px-4 py-3 rounded-xl bg-gold-500/10 border border-gold-500/20 bg-indigo-600 text-sm font-semibold transition-all hover:bg-gold-500/20 shrink-0"
                >
                  {copied ? 'Copié !' : 'Copier'}
                </button>
              </div>
            </div>

            {/* Actions */}
            <div className="w-full flex flex-col gap-3">
              <button
                onClick={handleConfirm}
                className="w-full py-3.5 rounded-xl bg-gradient-to-r from-gold-400 to-gold-600 text-ink-950 font-semibold shadow-lg shadow-gold-500/25 transition-all hover:-translate-y-0.5"
              >
                Gérer les photos →
              </button>
              <button
                onClick={onClose}
                className="w-full py-3 rounded-xl bg-overlay/[0.04] border border-overlay/[0.08] text-ink-300 text-sm font-medium transition-all hover:bg-overlay/[0.08]"
              >
                Retour au dashboard
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
