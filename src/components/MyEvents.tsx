import { useEffect, useMemo, useState } from "react";
import axios from "axios";
import api from "../../api/axios";

interface Event {
  id?: string;
  name: string;
  type?: string;
  date?: string;
  description?: string;
  location?: string;
  public_url?: string;
  cover_url?: string | null;
  cover_photo?: string | null;
  created_at: string | null;
}


const API_URL = (
  import.meta.env.VITE_API_URL || "http://127.0.0.1:8000"
).replace(/\/+$/, "");

function getCoverUrl(event: Event): string | null {
  const image = event.cover_photo || event.cover_url;

  if (!image?.trim()) return null;

  if (/^https?:\/\//i.test(image)) return image;

  const filename = image.replace(/\\/g, "/").split("/").pop();

  if (!filename) return null;

  // Retire /api à la fin de l'URL de base si nécessaire
  const baseUrl = API_URL.replace(/\/api$/, "");

  return `${baseUrl}/uploads/events/${encodeURIComponent(filename)}`;
}


interface UploadProgress {
  percent: number;
  phase: "upload" | "processing";
  fileCount: number;
  loaded: number;
  total: number;
}

function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} o`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} Ko`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} Mo`;
}

export default function MyEvents() {
  const [events, setEvents] = useState<Event[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  // Progression de l'import par événement (plusieurs imports possibles en parallèle)
  const [uploadProgress, setUploadProgress] = useState<
    Record<string, UploadProgress>
  >({});

  // Suppression d'un événement
  const [eventToDelete, setEventToDelete] = useState<Event | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState("");
  const [notice, setNotice] = useState("");

  // Analyse des visages (photos importées avant la reconnaissance faciale)
  const [indexingEventId, setIndexingEventId] = useState<string | null>(null);

  async function handleIndexFaces(eventId: string) {
    setIndexingEventId(eventId);
    const key = `faces-${eventId}`;

    try {
      const { data } = await api.post<{
        photos_indexed: number;
        faces_found: number;
        failed: number;
      }>(`/faces/events/${encodeURIComponent(eventId)}/index`, null, {
        timeout: 0, // peut être long : une analyse par photo
      });

      setUploadMessages((previous) => ({
        ...previous,
        [key]:
          data.photos_indexed === 0 && data.failed === 0
            ? "Toutes les photos sont déjà analysées : la recherche par visage est active."
            : `${data.photos_indexed} photo(s) analysée(s), ${data.faces_found} visage(s) trouvé(s)` +
              (data.failed > 0 ? `, ${data.failed} échec(s).` : "."),
      }));
    } catch (err: unknown) {
      setUploadMessages((previous) => ({
        ...previous,
        [key]:
          axios.isAxiosError(err) && typeof err.response?.data?.detail === "string"
            ? err.response.data.detail
            : "L'analyse des visages a échoué.",
      }));
    } finally {
      setIndexingEventId(null);
    }
  }

const [uploadMessages, setUploadMessages] = useState<
  Record<string, string>
>({});


  useEffect(() => {
    let active = true;

    async function fetchEvents() {
      try {
        setLoading(true);
        setError("");

        const response = await api.get<Event[]>("/events/me");
        
        // console.log("Réponse API :", response.data);
        // console.log("Premier événement :", response.data[0]);
        

        if (active) {
          setEvents(response.data);
        }
      } catch (err: unknown) {
        if (!active) return;

        if (axios.isAxiosError(err)) {
          setError(
            err.response?.status === 401
              ? "Ta session a expiré. Connecte-toi à nouveau."
              : err.response?.data?.detail ||
                "Impossible de charger tes événements."
          );
        } else {
          setError("Une erreur inattendue est survenue.");
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    }

    fetchEvents();

    return () => {
      active = false;
    };
  }, []);

 
async function handleUpload(eventId: string, files: FileList | null) {
  if (!eventId || !files || files.length === 0) {
    console.error("Identifiant ou fichiers manquants.");
    return;
  }

  const formData = new FormData();


//   console.log("Nombre de fichiers :", files.length);
// console.log("FormData :", [...formData.entries()].map(([key, value]) => ({
//   key,
//   value: value instanceof File ? value.name : value,
// })));

  Array.from(files).forEach((file) => {
    formData.append("files", file);
  });

  // Vérifier que les fichiers sont présents
  for (const [key, value] of formData.entries()) {
    console.log(
      "FormData :",
      key,
      value instanceof File ? value.name : value
    );
  }

  const totalSize = Array.from(files).reduce((sum, f) => sum + f.size, 0);

  try {
    setUploadMessages((previous) => {
      const next = { ...previous };
      delete next[eventId];
      return next;
    });
    setUploadProgress((previous) => ({
      ...previous,
      [eventId]: {
        percent: 0,
        phase: "upload",
        fileCount: files.length,
        loaded: 0,
        total: totalSize,
      },
    }));

    const response = await api.post(
      `/photos/events/${encodeURIComponent(eventId)}/upload`,
      formData,
      {
        headers: { "Content-Type": "multipart/form-data" },
        // Progression en temps réel de l'envoi des fichiers
        onUploadProgress: (progressEvent) => {
          const total = progressEvent.total ?? totalSize;
          const loaded = progressEvent.loaded;
          const percent = total
            ? Math.min(100, Math.round((loaded * 100) / total))
            : 0;

          setUploadProgress((previous) => ({
            ...previous,
            [eventId]: {
              percent,
              // Une fois tout envoyé, le serveur traite encore les photos
              phase: percent >= 100 ? "processing" : "upload",
              fileCount: files.length,
              loaded,
              total,
            },
          }));
        },
      }
    );

    // console.log("Photos importées :", response.data);

    setUploadMessages((previous) => ({
      ...previous,
      [eventId]: `${response.data.length} photo(s) ajoutée(s) avec succès.`,
    }));
  } catch (err: unknown) {
    if (axios.isAxiosError(err)) {
      console.error(
        "Erreur upload :",
        err.response?.status,
        err.response?.data
      );

      setUploadMessages((previous) => ({
        ...previous,
        [eventId]:
          err.response?.data?.detail?.[0]?.msg ??
          err.response?.data?.detail ??
          "Impossible d'importer les photos.",
      }));
    } else {
      console.error("Erreur inattendue :", err);
    }
  } finally {
    setUploadProgress((previous) => {
      const next = { ...previous };
      delete next[eventId];
      return next;
    });
  }
}



  async function confirmDelete() {
    if (!eventToDelete?.id || deleting) return;

    setDeleting(true);
    setDeleteError("");

    try {
      const { data } = await api.delete<{
        message: string;
        deleted_photos: number;
        cloudinary_failures: number;
      }>(`/events/${encodeURIComponent(eventToDelete.id)}`);

      const deletedId = eventToDelete.id;
      setEvents((previous) => previous.filter((e) => e.id !== deletedId));
      setEventToDelete(null);
      setNotice(
        `« ${eventToDelete.name} » a été supprimé avec ${data.deleted_photos} photo${
          data.deleted_photos > 1 ? "s" : ""
        }.` +
          (data.cloudinary_failures > 0
            ? ` (${data.cloudinary_failures} image(s) n'ont pas pu être retirées de Cloudinary.)`
            : "")
      );
      setTimeout(() => setNotice(""), 5000);
    } catch (err: unknown) {
      if (axios.isAxiosError(err)) {
        setDeleteError(
          err.response?.status === 401
            ? "Ta session a expiré. Connecte-toi à nouveau."
            : typeof err.response?.data?.detail === "string"
              ? err.response.data.detail
              : "Impossible de supprimer l'événement."
        );
      } else {
        setDeleteError("Une erreur inattendue est survenue.");
      }
    } finally {
      setDeleting(false);
    }
  }

  const filteredEvents = useMemo(() => {
    const term = search.trim().toLowerCase();

    if (!term) return events;

    return events.filter((event) =>
      [
        event.name,
        event.type,
        event.description,
        event.location,
      ]
        .filter(Boolean)
        .some((value) => value!.toLowerCase().includes(term))
    );
  }, [events, search]);

  

  if (loading) {
    return (
      <section aria-busy="true" aria-label="Chargement des événements">
        <div className="mb-6 h-8 w-56 animate-pulse rounded-lg bg-ink-800" />
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 2xl:grid-cols-3">
          {[0, 1, 2].map((i) => (
            <div key={i} className="overflow-hidden rounded-2xl border border-overlay/[0.06] bg-ink-900/60">
              <div className="h-44 animate-pulse bg-ink-800" />
              <div className="space-y-3 p-5">
                <div className="h-4 w-2/3 animate-pulse rounded bg-ink-800" />
                <div className="h-3 w-1/2 animate-pulse rounded bg-ink-800" />
                <div className="h-24 animate-pulse rounded-xl bg-ink-800/70" />
              </div>
            </div>
          ))}
        </div>
      </section>
    );
  }

  return (
    <section>
      {/* En-tête de section */}
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <div className="flex items-center gap-3">
            <h2 className="font-display text-2xl font-bold text-ink-50">Mes événements</h2>
            <span className="rounded-full border border-brand-500/20 bg-brand-500/10 px-2.5 py-0.5 text-xs font-semibold tabular-nums text-brand-400">
              {events.length}
            </span>
          </div>
          <p className="mt-1 text-sm text-ink-400">
            Importez vos photos, partagez le lien et laissez vos invités se retrouver.
          </p>
        </div>

        <label className="relative block w-full sm:w-72">
          <span className="sr-only">Rechercher un événement</span>
          <svg viewBox="0 0 24 24" width="18" height="18" fill="none" aria-hidden="true" className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-ink-500">
            <circle cx="11" cy="11" r="7" stroke="currentColor" strokeWidth="1.8" />
            <path d="M20 20l-3.5-3.5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
          </svg>
          <input
            type="search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Rechercher…"
            className="input pl-10"
          />
        </label>
      </div>

      {notice && (
        <div role="status" className="alert-success mb-5">
          {notice}
        </div>
      )}

      {error && (
        <div role="alert" className="alert-error mb-5">
          {error}
        </div>
      )}

      {!error && filteredEvents.length === 0 && (
        <div className="flex flex-col items-center rounded-2xl border border-dashed border-overlay/[0.12] bg-ink-900/40 px-6 py-16 text-center">
          <span className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl border border-brand-500/20 bg-brand-500/10 text-brand-400">
            <svg viewBox="0 0 24 24" width="26" height="26" fill="none" aria-hidden="true">
              <rect x="3" y="5" width="18" height="16" rx="2.5" stroke="currentColor" strokeWidth="1.7" />
              <path d="M3 10h18M8 3v4M16 3v4" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
            </svg>
          </span>
          <h3 className="font-body text-lg font-semibold text-ink-100">
            {events.length === 0 ? "Aucun événement pour le moment" : "Aucun résultat"}
          </h3>
          <p className="mt-1 max-w-sm text-sm text-ink-400">
            {events.length === 0
              ? "Créez votre premier événement avec le bouton « Nouvel événement »."
              : "Essayez avec un autre terme de recherche."}
          </p>
        </div>
      )}

      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 2xl:grid-cols-3">
        {filteredEvents.map((event) => {
          const eventId = event.id;
          const coverUrl = getCoverUrl(event);

          if (!eventId) {
            console.error("Identifiant de l'événement absent :", event);
            return null;
          }

          const progress = uploadProgress[eventId];
          const isUploading = progress !== undefined;
          const displayDate = formatEventDate(event.date ?? event.created_at);
          const copyMessage = uploadMessages[`gallery-${eventId}`];

          return (
            <article
              key={eventId}
              className="group flex flex-col overflow-hidden rounded-2xl border border-overlay/[0.06] bg-ink-900/60 transition-all duration-300 hover:border-brand-500/25 hover:shadow-2xl hover:shadow-black/20"
            >
              {/* Couverture */}
              <div className="relative h-44 overflow-hidden bg-ink-800">
                {coverUrl ? (
                  <img
                    src={coverUrl}
                    alt=""
                    className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
                    loading="lazy"
                  />
                ) : (
                  <div className="flex h-full items-center justify-center bg-gradient-to-br from-ink-800 to-ink-900 text-ink-600">
                    <svg viewBox="0 0 24 24" width="40" height="40" fill="none" aria-hidden="true">
                      <rect x="3" y="5" width="18" height="14" rx="2" stroke="currentColor" strokeWidth="1.5" />
                      <circle cx="9" cy="11" r="2" stroke="currentColor" strokeWidth="1.5" />
                      <path d="M21 17l-5-5-8 8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </div>
                )}

                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/10 to-transparent" />

                {event.type && (
                  <span className="absolute left-3 top-3 rounded-full bg-black/50 px-3 py-1 text-[11px] font-semibold uppercase tracking-wider text-white backdrop-blur">
                    {event.type}
                  </span>
                )}

                <button
                  type="button"
                  onClick={() => {
                    setDeleteError("");
                    setEventToDelete(event);
                  }}
                  disabled={isUploading}
                  className="absolute right-3 top-3 flex h-9 w-9 items-center justify-center rounded-full bg-black/50 text-white/90 backdrop-blur transition hover:bg-red-600 disabled:cursor-not-allowed disabled:opacity-40"
                  aria-label={`Supprimer l'événement ${event.name}`}
                  title={isUploading ? "Import en cours" : "Supprimer l'événement"}
                >
                  <svg viewBox="0 0 24 24" width="16" height="16" fill="none" aria-hidden="true">
                    <path d="M4 7h16M10 11v6M14 11v6M5 7l1 12a2 2 0 002 2h8a2 2 0 002-2l1-12M9 7V4h6v3" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </button>

                <h3 className="absolute inset-x-4 bottom-3 truncate font-display text-xl font-bold text-white">
                  {event.name}
                </h3>
              </div>

              <div className="flex flex-1 flex-col gap-4 p-5">
                {/* Méta */}
                {(displayDate || event.location) && (
                  <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 text-sm text-ink-400">
                    {displayDate && (
                      <span className="flex items-center gap-1.5">
                        <svg viewBox="0 0 24 24" width="15" height="15" fill="none" aria-hidden="true" className="text-brand-400">
                          <rect x="3" y="5" width="18" height="16" rx="2" stroke="currentColor" strokeWidth="1.8" />
                          <path d="M3 10h18M8 3v4M16 3v4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
                        </svg>
                        {displayDate}
                      </span>
                    )}
                    {event.location && (
                      <span className="flex min-w-0 items-center gap-1.5">
                        <svg viewBox="0 0 24 24" width="15" height="15" fill="none" aria-hidden="true" className="shrink-0 text-brand-400">
                          <path d="M12 21s-7-6.1-7-11.5a7 7 0 1114 0C19 14.9 12 21 12 21z" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" />
                          <circle cx="12" cy="9.5" r="2.5" stroke="currentColor" strokeWidth="1.8" />
                        </svg>
                        <span className="truncate">{event.location}</span>
                      </span>
                    )}
                  </div>
                )}

                {event.description && (
                  <p className="line-clamp-2 text-sm leading-6 text-ink-400">{event.description}</p>
                )}

                {/* Lien de la galerie */}
                {event.public_url && (
                  <div>
                    <p className="mb-1.5 text-xs font-semibold uppercase tracking-wider text-ink-500">
                      Lien de la galerie
                    </p>
                    <div className="flex items-center gap-2 rounded-xl border border-overlay/[0.08] bg-ink-950/50 p-1.5 pl-3">
                      <span className="min-w-0 flex-1 truncate text-sm text-ink-300" title={event.public_url}>
                        {event.public_url.replace(/^https?:\/\//, "")}
                      </span>
                      <a
                        href={event.public_url}
                        target="_blank"
                        rel="noreferrer"
                        className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-ink-400 transition hover:bg-overlay/[0.06] hover:text-ink-100"
                        aria-label="Ouvrir la galerie"
                        title="Ouvrir la galerie"
                      >
                        <svg viewBox="0 0 24 24" width="16" height="16" fill="none" aria-hidden="true">
                          <path d="M14 4h6v6M20 4l-9 9M18 14v5a1 1 0 01-1 1H5a1 1 0 01-1-1V7a1 1 0 011-1h5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                      </a>
                      <button
                        type="button"
                        onClick={async () => {
                          let message = "Lien copié !";
                          try {
                            await navigator.clipboard.writeText(event.public_url!);
                          } catch {
                            message = "Impossible de copier le lien.";
                          }
                          setUploadMessages((previous) => ({ ...previous, [`gallery-${eventId}`]: message }));
                          window.setTimeout(() => {
                            setUploadMessages((previous) => ({ ...previous, [`gallery-${eventId}`]: "" }));
                          }, 2000);
                        }}
                        className="shrink-0 rounded-lg bg-brand-500/10 px-3 py-1.5 text-xs font-semibold text-brand-400 transition hover:bg-brand-500/20"
                      >
                        {copyMessage === "Lien copié !" ? "Copié ✓" : "Copier"}
                      </button>
                    </div>
                    {copyMessage && copyMessage !== "Lien copié !" && (
                      <p role="status" className="mt-1.5 text-xs text-red-400">{copyMessage}</p>
                    )}
                  </div>
                )}

                {/* Import des photos */}
                <div className="mt-auto">
                  <label
                    className={`flex min-h-[112px] w-full flex-col items-center justify-center rounded-xl border-2 border-dashed px-4 py-5 text-center transition ${
                      isUploading
                        ? "cursor-not-allowed border-brand-500/50 bg-brand-500/5"
                        : "cursor-pointer border-overlay/[0.12] hover:border-brand-500/60 hover:bg-brand-500/5"
                    }`}
                    onDragOver={(e) => e.preventDefault()}
                    onDrop={(e) => {
                      e.preventDefault();
                      if (isUploading) return;
                      void handleUpload(eventId, e.dataTransfer.files);
                    }}
                  >
                    <input
                      type="file"
                      accept="image/*"
                      multiple
                      disabled={isUploading}
                      className="sr-only"
                      onChange={(e) => {
                        const files = e.currentTarget.files;
                        void handleUpload(eventId, files);
                        e.currentTarget.value = "";
                      }}
                    />

                    {progress ? (
                      <div className="w-full" aria-live="polite">
                        <div className="mb-2 flex items-baseline justify-between gap-3">
                          <span className="text-left text-sm font-medium text-ink-300">
                            {progress.phase === "upload"
                              ? `Envoi de ${progress.fileCount} photo${progress.fileCount > 1 ? "s" : ""}…`
                              : "Traitement sur le serveur…"}
                          </span>
                          <span className="font-display text-2xl font-bold tabular-nums text-brand-400">
                            {progress.percent}%
                          </span>
                        </div>
                        <div
                          role="progressbar"
                          aria-valuemin={0}
                          aria-valuemax={100}
                          aria-valuenow={progress.percent}
                          aria-label={`Progression de l'import pour ${event.name}`}
                          className="h-2 w-full overflow-hidden rounded-full bg-ink-800"
                        >
                          <div
                            className={`h-full rounded-full transition-[width] duration-200 ease-out ${
                              progress.phase === "processing"
                                ? "animate-pulse bg-emerald-500"
                                : "bg-gradient-to-r from-brand-400 to-brand-600"
                            }`}
                            style={{ width: `${progress.percent}%` }}
                          />
                        </div>
                        <p className="mt-2 text-left text-xs tabular-nums text-ink-500">
                          {progress.phase === "upload"
                            ? `${formatBytes(progress.loaded)} / ${formatBytes(progress.total)}`
                            : "Enregistrement et analyse en cours, ne fermez pas la page."}
                        </p>
                      </div>
                    ) : (
                      <>
                        <span className="mb-2 flex h-10 w-10 items-center justify-center rounded-full bg-overlay/[0.05] text-ink-300">
                          <svg viewBox="0 0 24 24" width="20" height="20" fill="none" aria-hidden="true">
                            <path d="M12 16V4m0 0L8 8m4-4l4 4M5 14v4a2 2 0 002 2h10a2 2 0 002-2v-4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                          </svg>
                        </span>
                        <span className="text-sm font-medium text-ink-200">
                          Glissez vos photos ou <span className="text-brand-400">parcourez</span>
                        </span>
                        <span className="mt-1 text-xs text-ink-500">JPG, PNG, WEBP · jusqu'à 500 à la fois</span>
                      </>
                    )}
                  </label>

                  {uploadMessages[eventId] && (
                    <p role="status" className="mt-2 break-words text-xs text-ink-400">
                      {uploadMessages[eventId]}
                    </p>
                  )}

                  {/* Analyse des visages des photos déjà importées */}
                  <button
                    type="button"
                    onClick={() => void handleIndexFaces(eventId)}
                    disabled={indexingEventId !== null || isUploading}
                    className="btn-secondary mt-3 w-full"
                  >
                    {indexingEventId === eventId ? (
                      <>
                        <span className="h-4 w-4 animate-spin rounded-full border-2 border-brand-500/25 border-t-brand-500" />
                        Analyse des visages…
                      </>
                    ) : (
                      <>
                        <svg viewBox="0 0 24 24" width="17" height="17" fill="none" aria-hidden="true" className="text-brand-400">
                          <path d="M4 8V6a2 2 0 012-2h2M16 4h2a2 2 0 012 2v2M20 16v2a2 2 0 01-2 2h-2M8 20H6a2 2 0 01-2-2v-2" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
                          <circle cx="12" cy="10.5" r="2.8" stroke="currentColor" strokeWidth="1.8" />
                          <path d="M7.5 17a5 5 0 019 0" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
                        </svg>
                        Activer la recherche par visage
                      </>
                    )}
                  </button>

                  {uploadMessages[`faces-${eventId}`] && (
                    <p role="status" className="mt-2 text-xs text-ink-400">
                      {uploadMessages[`faces-${eventId}`]}
                    </p>
                  )}
                </div>
              </div>
            </article>
          );
        })}
      </div>

      {/* Confirmation de suppression */}
      {eventToDelete && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          role="dialog"
          aria-modal="true"
          aria-labelledby="delete-event-title"
        >
          <div
            className="absolute inset-0 bg-black/70 backdrop-blur-sm"
            onClick={() => !deleting && setEventToDelete(null)}
          />

          <div className="relative w-full max-w-md rounded-2xl border border-overlay/[0.08] bg-ink-900 p-6 shadow-2xl">
            <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-red-500/15 text-red-400">
              <svg viewBox="0 0 24 24" width="24" height="24" fill="none" aria-hidden="true">
                <path d="M12 9v4m0 4h.01M10.3 3.9L2.4 18a2 2 0 001.7 3h15.8a2 2 0 001.7-3L13.7 3.9a2 2 0 00-3.4 0z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>

            <h2 id="delete-event-title" className="font-body text-lg font-bold text-ink-50">
              Supprimer « {eventToDelete.name} » ?
            </h2>
            <p className="mt-2 text-sm leading-6 text-ink-400">
              L'événement, <strong className="text-ink-200">toutes ses photos</strong> et les visages
              détectés seront définitivement supprimés. Le lien public ne fonctionnera plus.
              Cette action est irréversible.
            </p>

            {deleteError && (
              <p role="alert" className="alert-error mt-4">
                {deleteError}
              </p>
            )}

            <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
              <button
                type="button"
                onClick={() => setEventToDelete(null)}
                disabled={deleting}
                className="btn-ghost"
              >
                Annuler
              </button>
              <button
                type="button"
                onClick={() => void confirmDelete()}
                disabled={deleting}
                className="btn-danger"
              >
                {deleting && (
                  <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white" />
                )}
                {deleting ? "Suppression…" : "Supprimer définitivement"}
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}

function formatEventDate(value?: string | null): string | null {
  if (!value) return null;
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric" });
}
