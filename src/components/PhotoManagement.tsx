import { useState, useRef, useCallback } from 'react'

interface PhotoItem {
  id: string
  name: string
  url: string
  size: string
  date: string
  status: 'traitée' | 'en attente'
}

const SAMPLE_PHOTOS: PhotoItem[] = [
  { id: '1', name: 'IMG_0241.jpg', url: 'https://images.pexels.com/photos/30049861/pexels-photo-30049861.jpeg?auto=compress&cs=tinysrgb&w=300', size: '4.2 MB', date: '15 Sept', status: 'traitée' },
  { id: '2', name: 'IMG_0242.jpg', url: 'https://images.pexels.com/photos/29997401/pexels-photo-29997401.jpeg?auto=compress&cs=tinysrgb&w=300', size: '3.8 MB', date: '15 Sept', status: 'traitée' },
  { id: '3', name: 'IMG_0243.jpg', url: 'https://images.pexels.com/photos/30049860/pexels-photo-30049860.jpeg?auto=compress&cs=tinysrgb&w=300', size: '5.1 MB', date: '15 Sept', status: 'traitée' },
  { id: '4', name: 'IMG_0244.jpg', url: 'https://images.pexels.com/photos/30575396/pexels-photo-30575396.jpeg?auto=compress&cs=tinysrgb&w=300', size: '4.5 MB', date: '15 Sept', status: 'traitée' },
  { id: '5', name: 'IMG_0245.jpg', url: 'https://images.pexels.com/photos/11450797/pexels-photo-11450797.jpeg?auto=compress&cs=tinysrgb&w=300', size: '3.9 MB', date: '15 Sept', status: 'traitée' },
  { id: '6', name: 'IMG_0246.jpg', url: 'https://images.pexels.com/photos/11450800/pexels-photo-11450800.jpeg?auto=compress&cs=tinysrgb&w=300', size: '4.7 MB', date: '15 Sept', status: 'traitée' },
  { id: '7', name: 'IMG_0247.jpg', url: 'https://images.pexels.com/photos/11450794/pexels-photo-11450794.jpeg?auto=compress&cs=tinysrgb&w=300', size: '5.3 MB', date: '15 Sept', status: 'en attente' },
  { id: '8', name: 'IMG_0248.jpg', url: 'https://images.pexels.com/photos/38627012/pexels-photo-38627012.jpeg?auto=compress&cs=tinysrgb&w=300', size: '4.1 MB', date: '15 Sept', status: 'en attente' },
  { id: '9', name: 'IMG_0249.jpg', url: 'https://images.pexels.com/photos/32957317/pexels-photo-32957317.jpeg?auto=compress&cs=tinysrgb&w=300', size: '3.6 MB', date: '15 Sept', status: 'traitée' },
  { id: '10', name: 'IMG_0250.jpg', url: 'https://images.pexels.com/photos/13521541/pexels-photo-13521541.jpeg?auto=compress&cs=tinysrgb&w=300', size: '4.8 MB', date: '15 Sept', status: 'traitée' },
  { id: '11', name: 'IMG_0251.jpg', url: 'https://images.pexels.com/photos/69135/pexels-photo-69135.jpeg?auto=compress&cs=tinysrgb&w=300', size: '5.0 MB', date: '15 Sept', status: 'traitée' },
  { id: '12', name: 'IMG_0252.jpg', url: 'https://images.pexels.com/photos/35588265/pexels-photo-35588265.jpeg?auto=compress&cs=tinysrgb&w=300', size: '4.3 MB', date: '15 Sept', status: 'traitée' },
]

type SortKey = 'date-desc' | 'date-asc' | 'name-asc' | 'name-desc'
type FilterKey = 'all' | 'traitée' | 'en attente'

const SORT_LABELS: Record<SortKey, string> = {
  'date-desc': 'Plus récentes',
  'date-asc': 'Plus anciennes',
  'name-asc': 'Nom (A-Z)',
  'name-desc': 'Nom (Z-A)',
}

const FILTER_LABELS: Record<FilterKey, string> = {
  all: 'Toutes',
  'traitée': 'Traitée',
  'en attente': 'En attente',
}

export default function PhotoManagement({ onBack }: { onBack: () => void }) {
  const [photos, setPhotos] = useState<PhotoItem[]>(SAMPLE_PHOTOS)
  const [dragging, setDragging] = useState(false)
  const [uploadProgress, setUploadProgress] = useState<number[]>([])
  const [search, setSearch] = useState('')
  const [sortKey, setSortKey] = useState<SortKey>('date-desc')
  const [filter, setFilter] = useState<FilterKey>('all')
  const [selected, setSelected] = useState<Set<string>>(new Set())
  const [showSort, setShowSort] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const total = 1500
  const processed = photos.filter((p) => p.status === 'traitée').length + 1245 - 12
  const progressPct = Math.round((processed / total) * 100)

  const handleFiles = useCallback((files: FileList) => {
    const newPhotos: PhotoItem[] = []
    const fileArr = Array.from(files).slice(0, 5)

    fileArr.forEach((file, idx) => {
      const id = `upload-${Date.now()}-${idx}`
      const url = URL.createObjectURL(file)
      newPhotos.push({
        id,
        name: file.name,
        url,
        size: `${(file.size / 1024 / 1024).toFixed(1)} MB`,
        date: 'Aujourd\'hui',
        status: 'en attente',
      })
      setUploadProgress((prev) => [...prev, 0])

      const progressIdx = idx
      let prog = 0
      const interval = setInterval(() => {
        prog += Math.random() * 25
        if (prog >= 100) {
          prog = 100
          clearInterval(interval)
          setUploadProgress((prev) => {
            const next = [...prev]
            next[progressIdx] = 100
            return next
          })
          setTimeout(() => {
            setUploadProgress((prev) => prev.slice(1))
          }, 500)
        } else {
          setUploadProgress((prev) => {
            const next = [...prev]
            next[progressIdx] = prog
            return next
          })
        }
      }, 200 + idx * 100)
    })

    setPhotos((prev) => [...newPhotos, ...prev])
  }, [])

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault()
      setDragging(false)
      if (e.dataTransfer.files?.length) handleFiles(e.dataTransfer.files)
    },
    [handleFiles],
  )

  const toggleSelect = (id: string) => {
    setSelected((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  const deleteSelected = () => {
    setPhotos((prev) => prev.filter((p) => !selected.has(p.id)))
    setSelected(new Set())
  }

  const deleteOne = (id: string) => {
    setPhotos((prev) => prev.filter((p) => p.id !== id))
    setSelected((prev) => {
      const next = new Set(prev)
      next.delete(id)
      return next
    })
  }

  let filtered = photos.filter((p) => {
    if (filter !== 'all' && p.status !== filter) return false
    if (search && !p.name.toLowerCase().includes(search.toLowerCase())) return false
    return true
  })

  filtered = [...filtered].sort((a, b) => {
    switch (sortKey) {
      case 'name-asc': return a.name.localeCompare(b.name)
      case 'name-desc': return b.name.localeCompare(a.name)
      case 'date-asc': return a.date.localeCompare(b.date)
      default: return 0
    }
  })

  return (
    <div className="flex-1 flex flex-col min-w-0">
      {/* Top bar */}
      <header className="sticky top-0 z-20 bg-ink-950/80 backdrop-blur-xl border-b border-overlay/[0.06] px-6 py-4 flex items-center justify-between gap-4">
        <div className="flex items-center gap-3 min-w-0">
          <button
            onClick={onBack}
            className="p-2 -ml-2 text-ink-300 hover:text-ink-100 transition-colors shrink-0"
          >
            <svg viewBox="0 0 24 24" width="22" height="22" fill="none">
              <path d="M19 12H5M12 19l-7-7 7-7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
          <h1 className="text-lg font-bold text-ink-50 font-body truncate">Gestion des photos</h1>
        </div>
      </header>

      <main className="flex-1 p-6 overflow-y-auto">
        {/* Processing status */}
        <div className="mb-6 p-5 rounded-2xl bg-ink-900/60 border border-overlay/[0.06]">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gold-500/10 border border-gold-500/15 flex items-center justify-center bg-indigo-600">
                <svg viewBox="0 0 24 24" width="20" height="20" fill="none">
                  <circle cx="12" cy="11" r="3.5" stroke="currentColor" strokeWidth="1.8" />
                  <path d="M5 8a2 2 0 012-2m10 2a2 2 0 00-2-2M5 16v2a2 2 0 002 2h10a2 2 0 002-2v-2" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
                </svg>
              </div>
              <div>
                <p className="text-sm font-semibold text-ink-100">Analyse des visages en cours...</p>
                <p className="text-xs text-ink-500">{processed.toLocaleString('fr-FR')} / {total.toLocaleString('fr-FR')} photos traitées</p>
              </div>
            </div>
            <span className="text-sm font-bold bg-indigo-600">{progressPct}%</span>
          </div>
          <div className="h-2 rounded-full bg-ink-800 overflow-hidden">
            <div
              className="h-full rounded-full bg-gradient-to-r from-gold-400 to-gold-600 transition-all duration-500"
              style={{ width: `${progressPct}%` }}
            />
          </div>
        </div>

        {/* Upload zone */}
        <div
          onDragOver={(e) => {
            e.preventDefault()
            setDragging(true)
          }}
          onDragLeave={() => setDragging(false)}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
          className={`mb-6 h-32 rounded-2xl border-2 border-dashed cursor-pointer transition-all flex items-center justify-center ${
            dragging
              ? 'border-gold-500 bg-gold-500/5'
              : 'border-overlay/15 hover:border-gold-500/40 hover:bg-overlay/[0.02]'
          }`}
        >
          <div className="flex flex-col items-center gap-2 text-ink-500">
            <svg viewBox="0 0 24 24" width="32" height="32" fill="none">
              <path d="M12 16V6m0 0L8 10m4-4l4 4M4 16v2a2 2 0 002 2h12a2 2 0 002-2v-2" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            <p className="text-sm font-medium">Glissez vos photos ici ou cliquez pour importer</p>
            <p className="text-xs text-ink-600">JPG, PNG, RAW — jusqu'à 500 photos à la fois</p>
          </div>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            multiple
            className="hidden"
            onChange={(e) => {
              if (e.target.files?.length) handleFiles(e.target.files)
              e.target.value = ''
            }}
          />
        </div>

        {/* Upload progress bars */}
        {uploadProgress.length > 0 && (
          <div className="mb-6 flex flex-col gap-2">
            {uploadProgress.map((prog, i) => (
              <div key={i} className="flex items-center gap-3 p-3 rounded-xl bg-ink-900/60 border border-overlay/[0.06]">
                <svg viewBox="0 0 24 24" width="20" height="20" fill="none" className="bg-indigo-600 shrink-0">
                  <rect x="3" y="5" width="18" height="14" rx="2" stroke="currentColor" strokeWidth="1.8" />
                  <circle cx="9" cy="11" r="2" stroke="currentColor" strokeWidth="1.8" />
                </svg>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs text-ink-400 truncate">Importation en cours...</span>
                    <span className="text-xs text-ink-500">{Math.round(prog)}%</span>
                  </div>
                  <div className="h-1.5 rounded-full bg-ink-800 overflow-hidden">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-gold-400 to-gold-600 transition-all duration-200"
                      style={{ width: `${prog}%` }}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Toolbar */}
        <div className="flex flex-col sm:flex-row gap-3 mb-5">
          {/* Search */}
          <div className="relative flex-1">
            <svg viewBox="0 0 24 24" width="18" height="18" fill="none" className="absolute left-3.5 top-1/2 -translate-y-1/2 text-ink-500">
              <circle cx="11" cy="11" r="7" stroke="currentColor" strokeWidth="1.8" />
              <path d="M21 21l-4.3-4.3" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
            </svg>
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Rechercher une photo..."
              className="w-full pl-11 pr-4 py-2.5 rounded-xl bg-ink-900/60 border border-overlay/[0.06] text-ink-100 placeholder-ink-500 text-sm outline-none transition-all focus:border-gold-500/30"
            />
          </div>

          {/* Filter */}
          <div className="flex gap-2">
            {(Object.keys(FILTER_LABELS) as FilterKey[]).map((key) => (
              <button
                key={key}
                onClick={() => setFilter(key)}
                className={`px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all whitespace-nowrap ${
                  filter === key
                    ? 'bg-gold-500/10 bg-indigo-600 border border-gold-500/20'
                    : 'bg-ink-900/60 text-ink-400 border border-overlay/[0.06] hover:text-ink-100'
                }`}
              >
                {FILTER_LABELS[key]}
              </button>
            ))}
          </div>

          {/* Sort */}
          <div className="relative">
            <button
              onClick={() => setShowSort((v) => !v)}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-ink-900/60 border border-overlay/[0.06] text-ink-300 text-sm font-medium transition-all hover:text-ink-100"
            >
              <svg viewBox="0 0 24 24" width="16" height="16" fill="none">
                <path d="M4 6h16M7 12h10M10 18h4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
              </svg>
              {SORT_LABELS[sortKey]}
            </button>
            {showSort && (
              <>
                <div className="fixed inset-0 z-10" onClick={() => setShowSort(false)} />
                <div className="absolute right-0 mt-2 w-44 rounded-xl bg-ink-800 border border-overlay/[0.08] shadow-2xl z-20 py-1.5">
                  {(Object.keys(SORT_LABELS) as SortKey[]).map((key) => (
                    <button
                      key={key}
                      onClick={() => {
                        setSortKey(key)
                        setShowSort(false)
                      }}
                      className={`w-full text-left px-4 py-2.5 text-sm transition-colors ${
                        sortKey === key ? 'bg-indigo-600' : 'text-ink-300 hover:text-ink-100 hover:bg-overlay/[0.04]'
                      }`}
                    >
                      {SORT_LABELS[key]}
                    </button>
                  ))}
                </div>
              </>
            )}
          </div>
        </div>

        {/* Selection bar */}
        {selected.size > 0 && (
          <div className="mb-4 flex items-center justify-between p-3 rounded-xl bg-gold-500/10 border border-gold-500/20">
            <span className="text-sm font-medium text-gold-300">{selected.size} sélectionnée(s)</span>
            <div className="flex gap-2">
              <button
                onClick={() => setSelected(new Set())}
                className="px-3 py-1.5 rounded-lg text-sm text-ink-300 hover:text-ink-100 transition-colors"
              >
                Annuler
              </button>
              <button
                onClick={deleteSelected}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm text-red-400 hover:bg-red-500/10 transition-colors"
              >
                <svg viewBox="0 0 24 24" width="16" height="16" fill="none">
                  <path d="M3 6h18M8 6V4a2 2 0 012-2h4a2 2 0 012 2v2m-9 5v6m4-6v6M5 6l1 14a2 2 0 002 2h8a2 2 0 002-2l1-14" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
                Supprimer
              </button>
            </div>
          </div>
        )}

        {/* Photo grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
          {filtered.map((photo) => (
            <div
              key={photo.id}
              className={`group relative rounded-xl overflow-hidden bg-ink-900/60 border transition-all ${
                selected.has(photo.id)
                  ? 'border-gold-500/50 ring-2 ring-gold-500/20'
                  : 'border-overlay/[0.06] hover:border-overlay/15'
              }`}
            >
              {/* Checkbox */}
              <button
                onClick={() => toggleSelect(photo.id)}
                className={`absolute top-2 left-2 z-10 w-5 h-5 rounded-md border-2 transition-all flex items-center justify-center ${
                  selected.has(photo.id)
                    ? 'bg-gold-500 border-gold-500'
                    : 'bg-ink-950/60 border-overlay/30 opacity-0 group-hover:opacity-100'
                }`}
              >
                {selected.has(photo.id) && (
                  <svg viewBox="0 0 24 24" width="14" height="14" fill="none">
                    <path d="M5 13l4 4L19 7" stroke="#0c0c0a" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                )}
              </button>

              {/* Delete on hover */}
              <button
                onClick={() => deleteOne(photo.id)}
                className="absolute top-2 right-2 z-10 w-7 h-7 rounded-lg bg-ink-950/60 border border-overlay/10 text-ink-300 opacity-0 group-hover:opacity-100 transition-all hover:text-red-400 hover:bg-red-500/10 flex items-center justify-center"
              >
                <svg viewBox="0 0 24 24" width="14" height="14" fill="none">
                  <path d="M3 6h18M8 6V4a2 2 0 012-2h4a2 2 0 012 2v2m-9 5v6m4-6v6M5 6l1 14a2 2 0 002 2h8a2 2 0 002-2l1-14" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </button>

              {/* Image */}
              <div className="aspect-square overflow-hidden">
                <img
                  src={photo.url}
                  alt={photo.name}
                  loading="lazy"
                  className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                />
              </div>

              {/* Info */}
              <div className="p-2.5">
                <p className="text-xs font-medium text-ink-200 truncate">{photo.name}</p>
                <div className="flex items-center justify-between mt-1">
                  <span className="text-xs text-ink-500">{photo.size}</span>
                  <span className={`text-xs font-medium ${photo.status === 'traitée' ? 'text-emerald-400' : 'bg-indigo-600'}`}>
                    {photo.status === 'traitée' ? '✓' : '...'}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>

        {filtered.length === 0 && (
          <div className="flex flex-col items-center justify-center py-20 text-ink-500">
            <svg viewBox="0 0 24 24" width="48" height="48" fill="none">
              <rect x="3" y="5" width="18" height="14" rx="2" stroke="currentColor" strokeWidth="1.5" />
              <circle cx="9" cy="11" r="2" stroke="currentColor" strokeWidth="1.5" />
            </svg>
            <p className="text-sm mt-3">Aucune photo trouvée</p>
          </div>
        )}
      </main>
    </div>
  )
}
