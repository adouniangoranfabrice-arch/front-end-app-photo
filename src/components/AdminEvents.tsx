import { useEffect, useRef, useState } from "react";
import api from "../../api/axios";

interface AdminEvent {
  id: string;
  name: string;
  event_type: string | null;
  event_date: string | null;
  location: string | null;
  cover_photo: string | null;
  is_public: boolean;
  status: string;
  created_at: string | null;
  public_url: string | null;
  photographer: { id: string; name: string; email: string | null };
  photos: number;
  faces: number;
  searches: number;
  downloads: number;
}

interface EventsResponse {
  total: number;
  page: number;
  limit: number;
  pages: number;
  events: AdminEvent[];
}

type Visibility = "all" | "public" | "private";

const nf = new Intl.NumberFormat("fr-FR");

const API_ROOT = (import.meta.env.VITE_API_URL || "http://127.0.0.1:8000")
  .replace(/\/+$/, "")
  .replace(/\/api$/, "");

function coverUrl(path: string | null): string | null {
  if (!path?.trim()) return null;
  if (/^https?:\/\//i.test(path)) return path;
  const filename = path.replace(/\\/g, "/").split("/").pop();
  return filename ? `${API_ROOT}/uploads/events/${encodeURIComponent(filename)}` : null;
}

function formatDate(value: string | null): string {
  if (!value) return "—";
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return value;
  return d.toLocaleDateString("fr-FR", { day: "numeric", month: "short", year: "numeric" });
}

function statusOf(event: AdminEvent): { label: string; className: string } {
  if (event.status !== "ACTIVE") {
    return { label: "Inactif", className: "bg-red-500/10 text-red-400 border-red-500/20" };
  }
  if (event.photos === 0) {
    return { label: "Sans photos", className: "bg-ink-700/40 text-ink-400 border-ink-600/40" };
  }
  if (event.faces === 0) {
    return { label: "Non indexé", className: "bg-amber-500/10 text-amber-400 border-amber-500/20" };
  }
  return { label: "Prêt", className: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20" };
}

export default function AdminEvents() {
  const [search, setSearch] = useState("");
  const [debounced, setDebounced] = useState("");
  const [visibility, setVisibility] = useState<Visibility>("all");
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);

  const [data, setData] = useState<EventsResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [reloadKey, setReloadKey] = useState(0);
  const requestId = useRef(0);

  // Recherche envoyée au serveur 350 ms après la dernière frappe
  useEffect(() => {
    const timer = window.setTimeout(() => {
      setDebounced(search.trim());
      setPage(1);
    }, 350);
    return () => window.clearTimeout(timer);
  }, [search]);

  useEffect(() => {
    const id = ++requestId.current;
    setLoading(true);
    setError("");

    api
      .get<EventsResponse>("/admin/events", {
        params: { page, limit, visibility, search: debounced || undefined },
      })
      .then((res) => {
        if (id === requestId.current) setData(res.data);
      })
      .catch((err) => {
        if (id !== requestId.current) return;
        console.error("Événements indisponibles :", err);
        setError(
          err?.response?.status === 403
            ? "Accès réservé aux administrateurs."
            : "Impossible de charger les événements."
        );
      })
      .finally(() => {
        if (id === requestId.current) setLoading(false);
      });
  }, [page, limit, visibility, debounced, reloadKey]);

  const events = data?.events ?? [];
  const total = data?.total ?? 0;
  const pages = data?.pages ?? 1;
  const start = (page - 1) * limit;

  return (
    <div className="space-y-5">
      {/* En-tête + filtres */}
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <h2 className="font-display text-2xl font-extrabold text-ink-50">Gestion des événements</h2>
          <p className="mt-1 text-sm text-ink-400">
            {data ? `${nf.format(total)} événement${total > 1 ? "s" : ""}` : "Chargement…"}
            {debounced && ` pour « ${debounced} »`}
          </p>
        </div>

        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <label className="relative block sm:w-80">
            <span className="sr-only">Rechercher</span>
            <svg viewBox="0 0 24 24" width="18" height="18" fill="none" aria-hidden="true" className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-ink-500">
              <circle cx="11" cy="11" r="7" stroke="currentColor" strokeWidth="1.8" />
              <path d="M21 21l-4.3-4.3" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
            </svg>
            <input
              type="search"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Événement, lieu, photographe…"
              className="input pl-10"
            />
          </label>

          <div className="inline-flex rounded-xl border border-overlay/[0.08] bg-ink-950/40 p-1" role="tablist" aria-label="Visibilité">
            {([
              ["all", "Tous"],
              ["public", "Publics"],
              ["private", "Privés"],
            ] as [Visibility, string][]).map(([value, label]) => (
              <button
                key={value}
                type="button"
                role="tab"
                aria-selected={visibility === value}
                onClick={() => {
                  setVisibility(value);
                  setPage(1);
                }}
                className={`rounded-lg px-3 py-1.5 text-sm font-medium transition ${
                  visibility === value ? "bg-brand-500 text-white" : "text-ink-400 hover:text-ink-100"
                }`}
              >
                {label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {error && (
        <div className="alert-error flex items-center justify-between gap-3">
          <span>{error}</span>
          <button type="button" onClick={() => setReloadKey((k) => k + 1)} className="font-semibold underline-offset-4 hover:underline">
            Réessayer
          </button>
        </div>
      )}

      <div className="card overflow-hidden">
        <div className={`overflow-x-auto transition-opacity ${loading && data ? "opacity-50" : ""}`} aria-busy={loading}>
          <table className="w-full">
            <thead>
              <tr className="border-b border-overlay/[0.06] text-left text-xs font-semibold uppercase tracking-wider text-ink-500">
                <th className="px-5 py-3.5">Événement</th>
                <th className="hidden px-5 py-3.5 md:table-cell">Photographe</th>
                <th className="hidden px-5 py-3.5 sm:table-cell">Date</th>
                <th className="hidden px-5 py-3.5 lg:table-cell">Photos</th>
                <th className="hidden px-5 py-3.5 xl:table-cell">Activité invités</th>
                <th className="px-5 py-3.5">Statut</th>
                <th className="px-5 py-3.5"><span className="sr-only">Actions</span></th>
              </tr>
            </thead>
            <tbody>
              {loading && !data
                ? Array.from({ length: 5 }, (_, i) => (
                    <tr key={i} className="border-b border-overlay/[0.04]">
                      <td className="px-5 py-4" colSpan={7}>
                        <div className="flex items-center gap-3">
                          <div className="h-11 w-11 animate-pulse rounded-lg bg-ink-800" />
                          <div className="flex-1 space-y-2">
                            <div className="h-3.5 w-1/3 animate-pulse rounded bg-ink-800" />
                            <div className="h-3 w-1/5 animate-pulse rounded bg-ink-800/70" />
                          </div>
                        </div>
                      </td>
                    </tr>
                  ))
                : events.map((event) => {
                    const cover = coverUrl(event.cover_photo);
                    const status = statusOf(event);
                    return (
                      <tr key={event.id} className="border-b border-overlay/[0.04] transition-colors hover:bg-overlay/[0.02]">
                        <td className="px-5 py-3.5">
                          <div className="flex min-w-[200px] items-center gap-3">
                            <div className="h-11 w-11 shrink-0 overflow-hidden rounded-lg bg-ink-800">
                              {cover && <img src={cover} alt="" loading="lazy" className="h-full w-full object-cover" />}
                            </div>
                            <div className="min-w-0">
                              <p className="truncate text-sm font-semibold text-ink-100">{event.name}</p>
                              <p className="truncate text-xs text-ink-500">
                                {[event.event_type, event.location].filter(Boolean).join(" · ") || "—"}
                              </p>
                            </div>
                          </div>
                        </td>
                        <td className="hidden px-5 py-3.5 md:table-cell">
                          <p className="text-sm text-ink-200">{event.photographer.name}</p>
                          {event.photographer.email && <p className="text-xs text-ink-500">{event.photographer.email}</p>}
                        </td>
                        <td className="hidden whitespace-nowrap px-5 py-3.5 text-sm text-ink-400 sm:table-cell">
                          {formatDate(event.event_date ?? event.created_at)}
                        </td>
                        <td className="hidden px-5 py-3.5 lg:table-cell">
                          <p className="text-sm tabular-nums text-ink-200">{nf.format(event.photos)}</p>
                          <p className="text-xs text-ink-500">{nf.format(event.faces)} visages</p>
                        </td>
                        <td className="hidden whitespace-nowrap px-5 py-3.5 text-xs text-ink-400 xl:table-cell">
                          <p>
                            <span className="font-semibold tabular-nums text-ink-200">{nf.format(event.searches)}</span> recherches
                          </p>
                          <p>
                            <span className="font-semibold tabular-nums text-ink-200">{nf.format(event.downloads)}</span> téléchargements
                          </p>
                        </td>
                        <td className="px-5 py-3.5">
                          <div className="flex flex-col items-start gap-1.5">
                            <span className={`whitespace-nowrap rounded-full border px-2.5 py-1 text-xs font-semibold ${status.className}`}>
                              {status.label}
                            </span>
                            <span className="text-[11px] text-ink-500">{event.is_public ? "Public" : "Privé"}</span>
                          </div>
                        </td>
                        <td className="px-5 py-3.5 text-right">
                          {event.public_url && event.is_public && (
                            <a
                              href={event.public_url}
                              target="_blank"
                              rel="noreferrer"
                              title="Ouvrir la galerie"
                              aria-label={`Ouvrir la galerie ${event.name}`}
                              className="inline-flex h-9 w-9 items-center justify-center rounded-lg text-ink-400 transition hover:bg-overlay/[0.06] hover:text-ink-100"
                            >
                              <svg viewBox="0 0 24 24" width="17" height="17" fill="none" aria-hidden="true">
                                <path d="M14 4h6v6M20 4l-9 9M18 14v5a1 1 0 01-1 1H5a1 1 0 01-1-1V7a1 1 0 011-1h5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                              </svg>
                            </a>
                          )}
                        </td>
                      </tr>
                    );
                  })}
            </tbody>
          </table>
        </div>

        {data && events.length === 0 && (
          <div className="flex flex-col items-center justify-center py-16 text-ink-500">
            <svg viewBox="0 0 24 24" width="40" height="40" fill="none" aria-hidden="true">
              <rect x="3" y="5" width="18" height="16" rx="2" stroke="currentColor" strokeWidth="1.5" />
              <path d="M3 9h18M8 3v4M16 3v4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
            </svg>
            <p className="mt-3 text-sm">{debounced || visibility !== "all" ? "Aucun événement ne correspond." : "Aucun événement sur la plateforme."}</p>
          </div>
        )}

        {/* Pagination */}
        {data && total > 0 && (
          <div className="flex flex-col gap-4 border-t border-overlay/[0.06] px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex flex-wrap items-center gap-3 text-sm text-ink-400">
              <span>
                {start + 1}–{Math.min(start + limit, total)} sur {nf.format(total)}
              </span>
              <select
                value={limit}
                onChange={(e) => {
                  setLimit(Number(e.target.value));
                  setPage(1);
                }}
                aria-label="Événements par page"
                className="rounded-lg border border-overlay/[0.12] bg-ink-900/60 px-2 py-1.5 text-sm text-ink-200 outline-none focus:border-brand-500"
              >
                <option value={10}>10 par page</option>
                <option value={25}>25 par page</option>
                <option value={50}>50 par page</option>
              </select>
            </div>
            <div className="flex items-center gap-2">
              <button type="button" onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page === 1} className="btn-ghost px-3 py-2">
                Précédent
              </button>
              <span className="px-1 text-sm tabular-nums text-ink-300">
                {page} / {pages}
              </span>
              <button type="button" onClick={() => setPage((p) => Math.min(pages, p + 1))} disabled={page >= pages} className="btn-ghost px-3 py-2">
                Suivant
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
