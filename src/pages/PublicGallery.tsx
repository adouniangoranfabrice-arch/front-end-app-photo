import { useCallback, useEffect, useMemo, useState } from "react";
import { useParams } from "react-router-dom";
import api from "../../api/axios";
import axios from "axios";
import JSZip from "jszip";

interface GalleryPhoto {
  id: string;
  file_url: string | null;
  thumbnail_url: string | null;
  original_name: string | null;
  width: number | null;
  height: number | null;
  created_at: string | null;
}

interface PublicEvent {
  id: string;
  name: string;
  description: string | null;
  event_type: string;
  event_date: string | null;
  location: string | null;
  cover_photo: string | null;
  public_token: string;
  photos: GalleryPhoto[];
  photos_count: number;
}

type ViewMode = "mosaic" | "grid";

type ZipState =
  | { status: "idle" }
  | { status: "downloading"; done: number; total: number }
  | { status: "zipping"; percent: number }
  | { status: "error"; message: string };

// ---------------------------------------------------------------
// Utilitaires
// ---------------------------------------------------------------

/** Ajoute une transformation Cloudinary (redimensionnement sans recadrage). */
function cloudinaryResize(url: string, transformation: string): string {
  return url.includes("/image/upload/")
    ? url.replace("/image/upload/", `/image/upload/${transformation}/`)
    : url;
}

function formatDate(value: string | null): string | null {
  if (!value) return null;
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return new Intl.DateTimeFormat("fr-FR", {
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(date);
}

function slugify(value: string): string {
  return (
    value
      .normalize("NFD")
      .replace(/[̀-ͯ]/g, "")
      .replace(/[^a-zA-Z0-9]+/g, "-")
      .replace(/^-|-$/g, "")
      .toLowerCase() || "galerie"
  );
}

function extensionFrom(photo: GalleryPhoto, blob: Blob): string {
  const fromName = photo.original_name?.match(/\.[a-z0-9]+$/i)?.[0];
  if (fromName) return fromName.toLowerCase();
  if (blob.type === "image/png") return ".png";
  if (blob.type === "image/webp") return ".webp";
  return ".jpg";
}

function baseName(photo: GalleryPhoto, index: number): string {
  const raw = photo.original_name?.replace(/\.[a-z0-9]+$/i, "");
  return raw ? slugify(raw) : `photo-${index + 1}`;
}

function triggerDownload(blob: Blob, filename: string) {
  const objectUrl = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = objectUrl;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  link.remove();
  setTimeout(() => URL.revokeObjectURL(objectUrl), 1000);
}

/** Nombre de colonnes de la mosaïque selon la largeur d'écran. */
function useColumnCount(): number {
  const getCount = () => {
    const w = window.innerWidth;
    if (w >= 1280) return 4;
    if (w >= 768) return 3;
    return 2;
  };
  const [count, setCount] = useState(getCount);

  useEffect(() => {
    const onResize = () => setCount(getCount());
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  return count;
}

// ---------------------------------------------------------------
// Icônes
// ---------------------------------------------------------------

function CalendarIcon() {
  return (
    <span className="flex h-6 w-6 items-center justify-center rounded-full bg-indigo-500/25 text-indigo-200">
      <svg viewBox="0 0 24 24" width="14" height="14" fill="none" aria-hidden="true">
        <rect x="3.5" y="5" width="17" height="15.5" rx="3" stroke="currentColor" strokeWidth="1.8" />
        <path d="M3.5 10h17" stroke="currentColor" strokeWidth="1.8" />
        <path d="M8 3v4M16 3v4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
        <circle cx="8.5" cy="14.5" r="1.2" fill="currentColor" />
        <circle cx="12" cy="14.5" r="1.2" fill="currentColor" />
        <circle cx="15.5" cy="14.5" r="1.2" fill="currentColor" />
      </svg>
    </span>
  );
}

function PinIcon() {
  return (
    <span className="flex h-6 w-6 items-center justify-center rounded-full bg-rose-500/25 text-rose-200">
      <svg viewBox="0 0 24 24" width="14" height="14" fill="none" aria-hidden="true">
        <path
          d="M12 21s-6.5-5.6-6.5-11a6.5 6.5 0 0113 0c0 5.4-6.5 11-6.5 11z"
          stroke="currentColor"
          strokeWidth="1.8"
          strokeLinejoin="round"
        />
        <circle cx="12" cy="10" r="2.4" stroke="currentColor" strokeWidth="1.8" />
      </svg>
    </span>
  );
}

function DownloadIcon() {
  return (
    <svg viewBox="0 0 24 24" width="16" height="16" fill="none" aria-hidden="true">
      <path
        d="M12 4v11m0 0l-4-4m4 4l4-4M5 19h14"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

// ---------------------------------------------------------------
// Page
// ---------------------------------------------------------------

export default function PublicGallery() {
  const { public_token } = useParams<{ public_token: string }>();

  const [event, setEvent] = useState<PublicEvent | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const [view, setView] = useState<ViewMode>("mosaic");
  const [zip, setZip] = useState<ZipState>({ status: "idle" });

  // Sélection de photos à télécharger
  const [selectMode, setSelectMode] = useState(false);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  const toggleSelected = (id: string) => {
    setSelectedIds((previous) => {
      const next = new Set(previous);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const exitSelectMode = () => {
    setSelectMode(false);
    setSelectedIds(new Set());
  };

  const columnCount = useColumnCount();

  useEffect(() => {
    if (!public_token) {
      setError("Le lien de cette galerie est invalide.");
      setLoading(false);
      return;
    }

    let cancelled = false;

    const fetchGallery = async () => {
      setLoading(true);
      setError("");

      try {
        const response = await api.get<PublicEvent>(
          `/public/events/${encodeURIComponent(public_token)}`
        );
        if (!cancelled) setEvent(response.data);
      } catch (err: unknown) {
        if (cancelled) return;
        if (axios.isAxiosError(err) && err.response?.status === 404) {
          setError("Cette galerie est introuvable ou n'est plus publique.");
        } else if (axios.isAxiosError(err)) {
          setError("Impossible de charger la galerie. Vérifiez votre connexion.");
        } else {
          setError("Une erreur inattendue est survenue.");
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    void fetchGallery();

    return () => {
      cancelled = true;
    };
  }, [public_token]);

  // Photos affichables, de la première à la dernière
  const photos = useMemo(
    () => (event?.photos ?? []).filter((p) => p.file_url || p.thumbnail_url),
    [event]
  );

  // Répartition en colonnes : chaque photo va dans la colonne la plus courte,
  // ce qui garde l'ordre de lecture de gauche à droite puis de haut en bas.
  const columns = useMemo(() => {
    const cols: { photo: GalleryPhoto; index: number }[][] = Array.from(
      { length: columnCount },
      () => []
    );
    const heights = new Array(columnCount).fill(0);

    photos.forEach((photo, index) => {
      const ratio =
        photo.width && photo.height ? photo.height / photo.width : 0.75;
      const shortest = heights.indexOf(Math.min(...heights));
      cols[shortest].push({ photo, index });
      heights[shortest] += ratio;
    });

    return cols;
  }, [photos, columnCount]);

  const selectedPhoto =
    selectedIndex !== null ? photos[selectedIndex] ?? null : null;

  const showPrev = useCallback(() => {
    setSelectedIndex((i) =>
      i === null ? null : (i - 1 + photos.length) % photos.length
    );
  }, [photos.length]);

  const showNext = useCallback(() => {
    setSelectedIndex((i) => (i === null ? null : (i + 1) % photos.length));
  }, [photos.length]);

  // Navigation clavier dans la visionneuse
  useEffect(() => {
    if (selectedIndex === null) return;

    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setSelectedIndex(null);
      if (e.key === "ArrowLeft") showPrev();
      if (e.key === "ArrowRight") showNext();
    };

    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", onKey);
    };
  }, [selectedIndex, showPrev, showNext]);

  // -------------------------------------------------------------
  // Téléchargements
  // -------------------------------------------------------------

  const downloadOne = async (photo: GalleryPhoto, index: number) => {
    if (!photo.file_url) return;
    try {
      const response = await fetch(photo.file_url);
      if (!response.ok) throw new Error("Échec du téléchargement");
      const blob = await response.blob();
      triggerDownload(blob, `${baseName(photo, index)}${extensionFrom(photo, blob)}`);
    } catch (err) {
      console.error("Erreur de téléchargement :", err);
      alert("Impossible de télécharger la photo.");
    }
  };

  /** Télécharge une liste de photos dans un ZIP (toutes ou la sélection). */
  const downloadZip = async (subset: GalleryPhoto[], suffix: string) => {
    if (!event || zip.status === "downloading" || zip.status === "zipping") return;

    // On garde l'ordre de la galerie et la numérotation d'origine
    const toDownload = photos
      .map((photo, galleryIndex) => ({ photo, galleryIndex }))
      .filter(({ photo }) => photo.file_url && subset.includes(photo));
    if (toDownload.length === 0) return;

    // Une seule photo : téléchargement direct, sans ZIP
    if (toDownload.length === 1) {
      await downloadOne(toDownload[0].photo, toDownload[0].galleryIndex);
      return true;
    }

    const archive = new JSZip();
    const folder = archive.folder(slugify(event.name)) ?? archive;
    const padding = String(photos.length).length;
    let done = 0;
    let failed = 0;

    setZip({ status: "downloading", done: 0, total: toDownload.length });

    // Téléchargement par lots de 4 pour ne pas saturer la connexion
    const CONCURRENCY = 4;
    let cursor = 0;

    const worker = async () => {
      while (cursor < toDownload.length) {
        const { photo, galleryIndex } = toDownload[cursor++];
        try {
          const response = await fetch(photo.file_url!);
          if (!response.ok) throw new Error(String(response.status));
          const blob = await response.blob();
          // Numérotation identique à la galerie (de la première à la dernière)
          const number = String(galleryIndex + 1).padStart(padding, "0");
          folder.file(
            `${number}_${baseName(photo, galleryIndex)}${extensionFrom(photo, blob)}`,
            blob
          );
        } catch (err) {
          failed++;
          console.error("Photo ignorée :", photo.file_url, err);
        } finally {
          done++;
          setZip({ status: "downloading", done, total: toDownload.length });
        }
      }
    };

    try {
      await Promise.all(
        Array.from({ length: Math.min(CONCURRENCY, toDownload.length) }, worker)
      );

      if (failed === toDownload.length) {
        throw new Error("Aucune photo n'a pu être téléchargée.");
      }

      setZip({ status: "zipping", percent: 0 });

      // Les JPEG sont déjà compressés : STORE est bien plus rapide
      const content = await archive.generateAsync(
        { type: "blob", compression: "STORE" },
        (meta) => setZip({ status: "zipping", percent: Math.round(meta.percent) })
      );

      triggerDownload(content, `${slugify(event.name)}${suffix}-photiva.zip`);

      if (failed > 0) {
        alert(`${failed} photo(s) n'ont pas pu être ajoutées à l'archive.`);
      }
      setZip({ status: "idle" });
      return true;
    } catch (err) {
      console.error("Erreur ZIP :", err);
      setZip({
        status: "error",
        message:
          err instanceof Error ? err.message : "Impossible de créer l'archive.",
      });
    }
  };

  const downloadAll = () => downloadZip(photos, "");

  const downloadSelection = async () => {
    const subset = photos.filter((p) => selectedIds.has(p.id));
    const ok = await downloadZip(subset, `-selection-${subset.length}`);
    if (ok) exitSelectMode();
  };

  // -------------------------------------------------------------
  // États de chargement / erreur
  // -------------------------------------------------------------

  if (loading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-neutral-950 px-4 text-white">
        <div className="text-center">
          <div className="mx-auto mb-4 h-10 w-10 animate-spin rounded-full border-2 border-white/20 border-t-indigo-500" />
          <p className="text-sm text-neutral-400">Chargement de votre galerie...</p>
        </div>
      </main>
    );
  }

  if (error || !event) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-neutral-950 px-4 text-white">
        <div className="w-full max-w-md rounded-2xl border border-white/10 bg-white/5 p-8 text-center">
          <div className="mb-4 text-4xl">📷</div>
          <h1 className="text-xl font-semibold">Galerie indisponible</h1>
          <p className="mt-3 text-sm leading-6 text-neutral-400">
            {error || "Cette galerie n'est pas disponible."}
          </p>
          <button
            type="button"
            onClick={() => window.location.reload()}
            className="mt-6 rounded-xl bg-indigo-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-indigo-500"
          >
            Réessayer
          </button>
        </div>
      </main>
    );
  }

  const zipBusy = zip.status === "downloading" || zip.status === "zipping";
  const zipPercent =
    zip.status === "downloading"
      ? Math.round((zip.done / zip.total) * 90)
      : zip.status === "zipping"
        ? 90 + Math.round(zip.percent / 10)
        : 0;

  const zipLabel =
    zip.status === "downloading"
      ? `Préparation ${zip.done}/${zip.total}…`
      : zip.status === "zipping"
        ? `Création du ZIP ${zip.percent}%`
        : "Tout télécharger";

  // -------------------------------------------------------------
  // Rendu
  // -------------------------------------------------------------

  const renderTile = (photo: GalleryPhoto, index: number, mode: ViewMode) => {
    const src =
      mode === "mosaic" && photo.file_url
        ? cloudinaryResize(photo.file_url, "w_700,c_limit,q_auto,f_auto")
        : photo.thumbnail_url || photo.file_url!;

    const ratio =
      photo.width && photo.height ? `${photo.width} / ${photo.height}` : "4 / 3";

    const isSelected = selectedIds.has(photo.id);

    return (
      <div
        key={photo.id}
        className={`group relative overflow-hidden rounded-xl bg-neutral-900 transition ${
          mode === "grid" ? "aspect-square" : ""
        } ${isSelected ? "ring-[3px] ring-indigo-500 ring-offset-2 ring-offset-neutral-950" : ""}`}
        style={mode === "mosaic" ? { aspectRatio: ratio } : undefined}
      >
        <button
          type="button"
          onClick={() =>
            selectMode ? toggleSelected(photo.id) : setSelectedIndex(index)
          }
          className="block h-full w-full focus:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-indigo-500"
          aria-label={
            selectMode
              ? `${isSelected ? "Désélectionner" : "Sélectionner"} la photo ${index + 1}`
              : `Agrandir la photo ${index + 1}`
          }
          aria-pressed={selectMode ? isSelected : undefined}
        >
          <img
            src={src}
            alt={photo.original_name || `Photo ${index + 1}`}
            loading="lazy"
            className={`h-full w-full object-cover transition duration-500 ${
              isSelected ? "scale-[0.97] brightness-90" : "group-hover:scale-[1.03]"
            }`}
          />
        </button>

        {/* Dégradé au survol */}
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 transition group-hover:opacity-100" />

        {selectMode ? (
          /* Case à cocher */
          <span
            className={`pointer-events-none absolute left-2.5 top-2.5 flex h-7 w-7 items-center justify-center rounded-full border-2 shadow-md transition ${
              isSelected
                ? "border-indigo-500 bg-indigo-500 text-white"
                : "border-white/90 bg-black/30 text-transparent backdrop-blur-sm"
            }`}
            aria-hidden="true"
          >
            <svg viewBox="0 0 24 24" width="14" height="14" fill="none">
              <path d="M5 12.5l4.5 4.5L19 7.5" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </span>
        ) : (
          <span className="pointer-events-none absolute left-2.5 top-2.5 rounded-md bg-black/50 px-2 py-0.5 text-[11px] font-medium tabular-nums text-white/90 backdrop-blur-sm">
            {index + 1}
          </span>
        )}

        {!selectMode && (
          <button
            type="button"
            onClick={() => void downloadOne(photo, index)}
            className="absolute bottom-2.5 right-2.5 flex h-9 w-9 items-center justify-center rounded-full bg-white/90 text-neutral-900 opacity-0 shadow-lg transition hover:bg-white focus:opacity-100 group-hover:opacity-100"
            aria-label={`Télécharger la photo ${index + 1}`}
            title="Télécharger"
          >
            <DownloadIcon />
          </button>
        )}
      </div>
    );
  };

  return (
    <main className="min-h-screen bg-neutral-950 text-white">
      {/* En-tête */}
      <header className="border-b border-white/10">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-5 sm:px-6 lg:px-8">
          <a href="/" className="text-xl font-bold tracking-tight">
            Photiva<span className="text-indigo-400">.</span>
          </a>
          <span className="rounded-full border border-white/10 px-3 py-1.5 text-xs text-neutral-400">
            Galerie publique
          </span>
        </div>
      </header>

      {/* Couverture */}
      <section className="mx-auto max-w-7xl px-4 pt-6 sm:px-6 sm:pt-10 lg:px-8">
        <div className="relative flex min-h-[280px] items-end overflow-hidden rounded-2xl bg-neutral-900 sm:min-h-[380px] md:rounded-3xl">
          {event.cover_photo && (
            <img
              src={event.cover_photo}
              alt={`Couverture de ${event.name}`}
              className="absolute inset-0 h-full w-full object-cover"
            />
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/35 to-black/10" />

          <div className="relative z-10 w-full p-6 sm:p-10 lg:p-12">
            {event.event_type && (
              <span className="inline-flex rounded-full border border-white/20 bg-black/30 px-3 py-1.5 text-xs font-medium text-white backdrop-blur-sm">
                {event.event_type}
              </span>
            )}
            <h1 className="mt-4 max-w-3xl text-3xl font-bold tracking-tight sm:text-4xl md:text-5xl">
              {event.name}
            </h1>
            {event.description && (
              <p className="mt-3 max-w-2xl text-sm leading-6 text-neutral-200 sm:text-base">
                {event.description}
              </p>
            )}
            <div className="mt-5 flex flex-wrap gap-x-5 gap-y-2 text-sm text-neutral-300">
              {event.event_date && (
                <span className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-black/30 py-1.5 pl-2 pr-3.5 backdrop-blur-sm">
                  <CalendarIcon />
                  {formatDate(event.event_date)}
                </span>
              )}
              {event.location && (
                <span className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-black/30 py-1.5 pl-2 pr-3.5 backdrop-blur-sm">
                  <PinIcon />
                  {event.location}
                </span>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Barre d'outils collante */}
      <div className="sticky top-0 z-30 mt-8 border-y border-white/10 bg-neutral-950/85 backdrop-blur-md">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-3 px-4 py-3 sm:px-6 lg:px-8">
          <div className="flex items-center gap-3">
            <h2 className="text-lg font-semibold tracking-tight">Les photos</h2>
            <span className="rounded-full bg-white/5 px-3 py-1 text-xs tabular-nums text-neutral-300">
              {photos.length} photo{photos.length !== 1 ? "s" : ""}
            </span>
          </div>

          <div className="flex items-center gap-2">
            {/* Choix de l'affichage */}
            <div
              className="flex rounded-xl border border-white/10 bg-white/5 p-1"
              role="group"
              aria-label="Mode d'affichage"
            >
              {(
                [
                  ["mosaic", "Mosaïque"],
                  ["grid", "Grille"],
                ] as const
              ).map(([mode, label]) => (
                <button
                  key={mode}
                  type="button"
                  onClick={() => setView(mode)}
                  aria-pressed={view === mode}
                  className={`rounded-lg px-3 py-1.5 text-xs font-medium transition ${
                    view === mode
                      ? "bg-white text-neutral-900"
                      : "text-neutral-400 hover:text-white"
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>

            {/* Mode sélection */}
            {photos.length > 0 && (
              <button
                type="button"
                onClick={() => (selectMode ? exitSelectMode() : setSelectMode(true))}
                disabled={zipBusy}
                aria-pressed={selectMode}
                className={`flex items-center gap-2 rounded-xl border px-4 py-2.5 text-sm font-semibold transition disabled:opacity-50 ${
                  selectMode
                    ? "border-white bg-white text-neutral-900"
                    : "border-white/15 text-white hover:bg-white/10"
                }`}
              >
                <svg viewBox="0 0 24 24" width="16" height="16" fill="none" aria-hidden="true">
                  <rect x="3.5" y="3.5" width="17" height="17" rx="4" stroke="currentColor" strokeWidth="1.8" />
                  <path d="M8 12.5l2.8 2.8L16.5 9.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
                {selectMode ? "Annuler" : "Sélectionner"}
              </button>
            )}

            {/* Tout télécharger */}
            {photos.length > 0 && !selectMode && (
              <button
                type="button"
                onClick={() => void downloadAll()}
                disabled={zipBusy}
                className="relative overflow-hidden rounded-xl bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-indigo-500 disabled:cursor-wait"
              >
                {zipBusy && (
                  <span
                    className="absolute inset-y-0 left-0 bg-indigo-400/40 transition-[width] duration-200"
                    style={{ width: `${zipPercent}%` }}
                    aria-hidden="true"
                  />
                )}
                <span className="relative flex items-center gap-2 tabular-nums">
                  <DownloadIcon />
                  {zipLabel}
                </span>
              </button>
            )}
          </div>
        </div>

        {zip.status === "error" && (
          <p role="alert" className="mx-auto max-w-7xl px-4 pb-3 text-sm text-red-400 sm:px-6 lg:px-8">
            {zip.message}{" "}
            <button
              type="button"
              className="underline"
              onClick={() => setZip({ status: "idle" })}
            >
              Fermer
            </button>
          </p>
        )}
      </div>

      {/* Photos */}
      <section className="mx-auto max-w-7xl px-4 py-8 sm:px-6 sm:py-10 lg:px-8">
        {photos.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-white/15 px-6 py-16 text-center">
            <div className="text-4xl">🖼️</div>
            <h3 className="mt-4 text-lg font-medium">Les photos arrivent bientôt</h3>
            <p className="mt-2 text-sm text-neutral-400">
              Aucune photo n'est disponible pour le moment.
            </p>
          </div>
        ) : view === "mosaic" ? (
          <div className="flex gap-3 sm:gap-4">
            {columns.map((col, c) => (
              <div key={c} className="flex min-w-0 flex-1 flex-col gap-3 sm:gap-4">
                {col.map(({ photo, index }) => renderTile(photo, index, "mosaic"))}
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 lg:grid-cols-4 xl:grid-cols-5">
            {photos.map((photo, index) => renderTile(photo, index, "grid"))}
          </div>
        )}
      </section>

      <footer
        className={`border-t border-white/10 px-4 py-7 text-center text-sm text-neutral-500 ${
          selectMode ? "pb-28" : ""
        }`}
      >
        Galerie partagée avec Photiva
      </footer>

      {/* Barre flottante de la sélection */}
      {selectMode && (
        <div className="fixed inset-x-0 bottom-0 z-40 px-4 pb-4 sm:pb-6">
          <div className="mx-auto flex max-w-2xl flex-wrap items-center justify-between gap-3 rounded-2xl border border-white/10 bg-neutral-900/95 px-4 py-3 shadow-2xl backdrop-blur-md">
            <div className="flex items-center gap-3">
              <span className="flex h-8 min-w-8 items-center justify-center rounded-full bg-indigo-600 px-2 text-sm font-bold tabular-nums">
                {selectedIds.size}
              </span>
              <span className="text-sm text-neutral-300">
                photo{selectedIds.size > 1 ? "s" : ""} sélectionnée
                {selectedIds.size > 1 ? "s" : ""}
              </span>
              <button
                type="button"
                onClick={() =>
                  setSelectedIds(
                    selectedIds.size === photos.length
                      ? new Set()
                      : new Set(photos.map((p) => p.id))
                  )
                }
                disabled={zipBusy}
                className="text-sm font-medium text-indigo-300 underline-offset-4 hover:underline disabled:opacity-50"
              >
                {selectedIds.size === photos.length ? "Tout désélectionner" : "Tout sélectionner"}
              </button>
            </div>

            <button
              type="button"
              onClick={() => void downloadSelection()}
              disabled={selectedIds.size === 0 || zipBusy}
              className="relative overflow-hidden rounded-xl bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-indigo-500 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {zipBusy && (
                <span
                  className="absolute inset-y-0 left-0 bg-indigo-400/40 transition-[width] duration-200"
                  style={{ width: `${zipPercent}%` }}
                  aria-hidden="true"
                />
              )}
              <span className="relative flex items-center gap-2 tabular-nums">
                <DownloadIcon />
                {zipBusy
                  ? zipLabel
                  : `Télécharger${selectedIds.size > 0 ? ` (${selectedIds.size})` : ""}`}
              </span>
            </button>
          </div>
        </div>
      )}

      {/* Visionneuse plein écran */}
      {selectedPhoto && selectedIndex !== null && (
        <div
          className="fixed inset-0 z-50 flex flex-col bg-black/95"
          role="dialog"
          aria-modal="true"
          aria-label="Aperçu de la photo"
          onClick={() => setSelectedIndex(null)}
        >
          {/* Barre du haut */}
          <div
            className="flex items-center justify-between px-4 py-3 text-sm text-neutral-300"
            onClick={(e) => e.stopPropagation()}
          >
            <span className="tabular-nums">
              {selectedIndex + 1} / {photos.length}
            </span>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => void downloadOne(selectedPhoto, selectedIndex)}
                className="rounded-full bg-white px-4 py-2 text-sm font-semibold text-neutral-900 transition hover:bg-neutral-200"
              >
                ↓ Télécharger
              </button>
              <button
                type="button"
                onClick={() => setSelectedIndex(null)}
                className="rounded-full bg-white/10 px-3.5 py-2 text-white hover:bg-white/20"
                aria-label="Fermer l'aperçu"
              >
                ✕
              </button>
            </div>
          </div>

          {/* Image + flèches */}
          <div className="relative flex min-h-0 flex-1 items-center justify-center px-4 pb-4 sm:px-16">
            {photos.length > 1 && (
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  showPrev();
                }}
                className="absolute left-2 top-1/2 z-10 -translate-y-1/2 rounded-full bg-white/10 p-3 text-white transition hover:bg-white/25 sm:left-4"
                aria-label="Photo précédente"
              >
                <svg viewBox="0 0 24 24" width="22" height="22" fill="none" aria-hidden="true">
                  <path d="M15 5l-7 7 7 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </button>
            )}

            <img
              key={selectedPhoto.id}
              src={selectedPhoto.file_url || selectedPhoto.thumbnail_url!}
              alt={selectedPhoto.original_name || "Photo agrandie"}
              className="max-h-full max-w-full rounded-lg object-contain"
              onClick={(e) => e.stopPropagation()}
            />

            {photos.length > 1 && (
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  showNext();
                }}
                className="absolute right-2 top-1/2 z-10 -translate-y-1/2 rounded-full bg-white/10 p-3 text-white transition hover:bg-white/25 sm:right-4"
                aria-label="Photo suivante"
              >
                <svg viewBox="0 0 24 24" width="22" height="22" fill="none" aria-hidden="true">
                  <path d="M9 5l7 7-7 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </button>
            )}
          </div>

          {/* Bande de miniatures */}
          {photos.length > 1 && (
            <div
              className="flex gap-2 overflow-x-auto px-4 pb-4"
              onClick={(e) => e.stopPropagation()}
            >
              {photos.map((p, i) => (
                <button
                  key={p.id}
                  type="button"
                  onClick={() => setSelectedIndex(i)}
                  ref={(el) => {
                    if (i === selectedIndex) el?.scrollIntoView({ block: "nearest", inline: "center" });
                  }}
                  className={`h-14 w-14 shrink-0 overflow-hidden rounded-md transition ${
                    i === selectedIndex
                      ? "ring-2 ring-white"
                      : "opacity-50 hover:opacity-100"
                  }`}
                  aria-label={`Aller à la photo ${i + 1}`}
                >
                  <img
                    src={p.thumbnail_url || p.file_url!}
                    alt=""
                    loading="lazy"
                    className="h-full w-full object-cover"
                  />
                </button>
              ))}
            </div>
          )}
        </div>
      )}
    </main>
  );
}
