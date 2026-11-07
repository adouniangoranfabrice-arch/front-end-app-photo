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
      <main className="min-h-screen bg-gray-50 p-6">
        <p className="text-center text-gray-600">
          Chargement de tes événements...
        </p>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gray-50 px-4 py-8 sm:px-8">
      <div className="mx-auto max-w-full">
        <div className="mb-8 flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              Mes événements
            </h1>
            <p className="mt-2 text-gray-600">
              Retrouve et gère tous tes événements.
            </p>
          </div>

          <span className="rounded-full bg-indigo-100 px-4 py-2 text-sm font-semibold text-indigo-700">
            {events.length} événement{events.length > 1 ? "s" : ""}
          </span>
        </div>

        <div className="mb-8">
          <input
            type="search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Rechercher un événement..."
            aria-label="Rechercher un événement"
            className="w-full rounded-xl border border-gray-200 bg-white px-4 py-3 outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
          />
        </div>

        {notice && (
          <div
            role="status"
            className="mb-6 rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-emerald-700"
          >
            {notice}
          </div>
        )}

        {error && (
          <div
            role="alert"
            className="mb-6 rounded-xl border border-red-200 bg-red-50 p-4 text-red-700"
          >
            {error}
          </div>
        )}

        {!error && filteredEvents.length === 0 && (
          <div className="rounded-2xl border border-dashed border-gray-300 bg-white px-6 py-16 text-center">
            <h2 className="text-xl font-semibold text-gray-800">
              {events.length === 0
                ? "Aucun événement pour le moment"
                : "Aucun résultat"}
            </h2>

            <p className="mt-2 text-gray-500">
              {events.length === 0
                ? "Tes événements apparaîtront ici une fois créés."
                : "Essaie avec un autre terme de recherche."}
            </p>
          </div>
        )}

        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        
        {filteredEvents.map((event) => {
  const eventId = event.id ?? event.id;
  const coverUrl = getCoverUrl(event);

  if (!eventId) {
    console.error("Identifiant de l'événement absent :", event);
    return null;
  }

  const progress = uploadProgress[eventId];
  const isUploading = progress !== undefined;

  return (
    <article key={eventId}>
      <div className="relative h-52 bg-gray-200">
        {coverUrl ? (
          <img
            src={coverUrl}
            alt={`Image de ${event.name}`}
            className="h-full w-full object-cover"
            loading="lazy"
          />
        ) : (
          <div className="flex h-full items-center justify-center text-gray-500">
            Aucune image disponible
          </div>
        )}

        <button
          type="button"
          onClick={() => {
            setDeleteError("");
            setEventToDelete(event);
          }}
          disabled={isUploading}
          className="absolute right-3 top-3 flex items-center gap-1.5 rounded-full bg-white/90 px-3 py-1.5 text-xs font-semibold text-red-600 shadow-sm transition hover:bg-red-600 hover:text-white disabled:cursor-not-allowed disabled:opacity-50"
          aria-label={`Supprimer l'événement ${event.name}`}
          title={isUploading ? "Import en cours" : "Supprimer l'événement"}
        >
          <svg viewBox="0 0 24 24" width="14" height="14" fill="none" aria-hidden="true">
            <path
              d="M4 7h16M10 11v6M14 11v6M5 7l1 12a2 2 0 002 2h8a2 2 0 002-2l1-12M9 7V4h6v3"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
          Supprimer
        </button>

        {event.type && (
          <span className="absolute left-3 top-3 rounded-full bg-white/90 px-3 py-1 text-xs font-semibold text-gray-700 shadow-sm">
            {event.type}
          </span>
        )}
      </div>


        {/* {event.public_url && (
          <p className="mt-3 text-sm text-gray-600">
            <span className="font-medium">Lien :</span>{" "}
            {event.public_url}
          </p>
        )} */}

        
        {event.public_url && (
        <div className="mt-5">
            <label className="mb-2 block text-center text-sm font-semibold text-gray-500">
            Lien de la galerie
            </label>

            <div className="flex items-center gap-2">
            <div className="min-w-0 flex-1 truncate rounded-xl border border-white/10 bg-indigo-200 px-4 py-3 text-sm text-indigo-300">
                {event.public_url}
            </div>

            <button
                type="button"
                onClick={async () => {
                try {
                    await navigator.clipboard.writeText(event.public_url!);
                    setUploadMessages((previous) => ({
                    ...previous,
                    [`gallery-${event.id}`]: "Lien copié !",
                    }));
                } catch {
                    setUploadMessages((previous) => ({
                    ...previous,
                    [`gallery-${event.id}`]: "Impossible de copier le lien.",
                    }));
                }
                }}
                className="shrink-0 rounded-xl bg-indigo-500/10 px-4 py-3 text-sm font-semibold text-indigo-600 transition hover:bg-indigo-500/20"
            >
                Copier
            </button>
            </div>

            {uploadMessages[`gallery-${event.id}`] && (
            <p role="status" className="mt-2 text-xs text-gray-400">
                {uploadMessages[`gallery-${event.id}`]}
            </p>
            )}
        </div>
        )}


        {event.created_at && (
          <p className="mt-3 text-sm text-gray-600">
            <span className="font-medium">Date :</span>{" "}
            {event.created_at}
          </p>
        )}

        {event.location && (
          <p className="mt-2 text-sm text-gray-600">
            <span className="font-medium">Lieu :</span>{" "}
            {event.location}
          </p>
        )}

        {event.description && (
          <p className="mt-3 line-clamp-3 text-sm leading-6 text-gray-500">
            {event.description}
          </p>
        )}

      {/* Bouton d'ajout de photos */}
      {/* <div className="mt-5">
        <label
          className={`inline-flex cursor-pointer items-center justify-center rounded-xl px-4 py-3 text-sm font-semibold text-white transition ${
            uploadingEventId !== null
              ? "cursor-not-allowed bg-gray-400"
              : "bg-indigo-600 hover:bg-indigo-700"
          }`}
        >
          <input
            type="file"
            accept="image/*"
            multiple
            disabled={uploadingEventId !== null}
            className="sr-only"
            onChange={(e) => {
              const files = e.currentTarget.files;
              void handleUpload(eventId, files);
              e.currentTarget.value = "";
            }}
          />

          {uploadingEventId === eventId
            ? "Importation en cours..."
            : "＋ Ajouter des photos"}
        </label>

        {uploadMessages[eventId] && (
          <p
            role="status"
            className="mt-3 break-words text-sm text-gray-600"
          >
            {uploadMessages[eventId]}
          </p>
        )}
      </div> */}

      
<div className="mt-5">
  <label
    className={`flex min-h-[130px] w-full flex-col items-center justify-center rounded-xl border-2 border-dashed px-4 py-6 text-center transition ${
      isUploading
        ? "cursor-not-allowed border-indigo-400 bg-indigo-500/5"
        : "cursor-pointer border-gray-700 hover:border-indigo-500 hover:bg-indigo-500/5"
    }`}
    onDragOver={(e) => {
      e.preventDefault();
    }}
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
        <div className="mb-2 flex items-baseline justify-between">
          <span className="text-sm font-medium text-gray-600">
            {progress.phase === "upload"
              ? `Envoi de ${progress.fileCount} photo${progress.fileCount > 1 ? "s" : ""}…`
              : "Traitement des photos sur le serveur…"}
          </span>
          <span className="text-2xl font-bold tabular-nums text-indigo-600">
            {progress.percent}%
          </span>
        </div>

        <div
          role="progressbar"
          aria-valuemin={0}
          aria-valuemax={100}
          aria-valuenow={progress.percent}
          aria-label={`Progression de l'import pour ${event.name}`}
          className="h-3 w-full overflow-hidden rounded-full bg-gray-200"
        >
          <div
            className={`h-full rounded-full transition-[width] duration-200 ease-out ${
              progress.phase === "processing"
                ? "animate-pulse bg-emerald-500"
                : "bg-indigo-600"
            }`}
            style={{ width: `${progress.percent}%` }}
          />
        </div>

        <p className="mt-2 text-xs tabular-nums text-gray-500">
          {progress.phase === "upload"
            ? `${formatBytes(progress.loaded)} / ${formatBytes(progress.total)}`
            : "Envoi terminé — enregistrement et analyse en cours, ne fermez pas la page."}
        </p>
      </div>
    ) : (
      <>
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="mb-3 h-7 w-7 text-gray-400"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={1.8}
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M12 16V4m0 0L8 8m4-4 4 4M5 14v4a2 2 0 002 2h10a2 2 0 002-2v-4"
          />
        </svg>

        <span className="text-sm text-gray-400">
          Glissez vos photos ici ou cliquez pour importer
        </span>

        <span className="mt-2 text-xs text-gray-500">
          JPG, JPEG, PNG, .webp — jusqu'à 500 photos à la fois
        </span>
      </>
    )}
  </label>

  {uploadMessages[eventId] && (
    <p
      role="status"
      className="mt-3 break-words text-sm text-gray-600"
    >
      {uploadMessages[eventId]}
    </p>
  )}
</div>

    </article>
  );
})}

        </div>
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
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={() => !deleting && setEventToDelete(null)}
          />

          <div className="relative w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl">
            <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-red-100">
              <svg viewBox="0 0 24 24" width="24" height="24" fill="none" aria-hidden="true">
                <path
                  d="M12 9v4m0 4h.01M10.3 3.9L2.4 18a2 2 0 001.7 3h15.8a2 2 0 001.7-3L13.7 3.9a2 2 0 00-3.4 0z"
                  stroke="#dc2626"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </div>

            <h2 id="delete-event-title" className="text-lg font-bold text-gray-900">
              Supprimer « {eventToDelete.name} » ?
            </h2>
            <p className="mt-2 text-sm leading-6 text-gray-600">
              L'événement, <strong>toutes ses photos</strong> et les visages
              détectés seront définitivement supprimés. Le lien public ne
              fonctionnera plus. Cette action est irréversible.
            </p>

            {deleteError && (
              <p role="alert" className="mt-4 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">
                {deleteError}
              </p>
            )}

            <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
              <button
                type="button"
                onClick={() => setEventToDelete(null)}
                disabled={deleting}
                className="rounded-xl border border-gray-200 px-4 py-2.5 text-sm font-semibold text-gray-700 transition hover:bg-gray-50 disabled:opacity-50"
              >
                Annuler
              </button>
              <button
                type="button"
                onClick={() => void confirmDelete()}
                disabled={deleting}
                className="flex items-center justify-center gap-2 rounded-xl bg-red-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-red-700 disabled:cursor-wait disabled:opacity-70"
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
    </main>
  );
}
