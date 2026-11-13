import { useCallback, useEffect, useRef, useState } from "react";
import api from "../../api/axios";
import type {
  Activity,
  RecentActivitiesResponse,
} from "../../types/activity.types";

interface PageData {
  activities: Activity[];
  total: number;
  pages: number;
}

// Pages déjà chargées (gardées tant que l'onglet est ouvert) :
// revenir sur une page ou rouvrir le tableau de bord est instantané.
const pageCache = new Map<string, PageData>();
const cacheKey = (page: number, limit: number) => `${limit}:${page}`;

async function fetchPage(page: number, limit: number): Promise<PageData> {
  const key = cacheKey(page, limit);
  const cached = pageCache.get(key);
  if (cached) return cached;

  const { data } = await api.get<RecentActivitiesResponse>("/admin/activities/recent", {
    params: { page, limit },
  });

  let result: PageData;

  if (data.pages !== undefined) {
    result = { activities: data.activities, total: data.total, pages: data.pages };
  } else {
    // Ancien serveur (sans pagination) : on découpe localement
    const start = (page - 1) * limit;
    result = {
      activities: data.activities.slice(start, start + limit),
      total: data.activities.length,
      pages: Math.max(1, Math.ceil(data.activities.length / limit)),
    };
  }

  pageCache.set(key, result);
  return result;
}

function formatDate(date: string | null): string {
  if (!date) return "Date inconnue";
  const parsed = new Date(date);
  if (Number.isNaN(parsed.getTime())) return "Date invalide";
  return new Intl.DateTimeFormat("fr-FR", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    timeZone: "Africa/Abidjan",
  }).format(parsed);
}

function timeAgo(date: string | null): string | null {
  if (!date) return null;
  const parsed = new Date(date);
  if (Number.isNaN(parsed.getTime())) return null;

  const seconds = Math.round((Date.now() - parsed.getTime()) / 1000);
  const rtf = new Intl.RelativeTimeFormat("fr", { numeric: "auto" });

  if (seconds < 60) return "à l'instant";
  if (seconds < 3600) return rtf.format(-Math.floor(seconds / 60), "minute");
  if (seconds < 86400) return rtf.format(-Math.floor(seconds / 3600), "hour");
  if (seconds < 86400 * 30) return rtf.format(-Math.floor(seconds / 86400), "day");
  return null;
}

function SkeletonRows({ count }: { count: number }) {
  return (
    <>
      {Array.from({ length: count }, (_, i) => (
        <div key={i} className="flex items-center gap-3 py-4">
          <div className="h-10 w-10 shrink-0 animate-pulse rounded-full bg-ink-800" />
          <div className="flex-1 space-y-2">
            <div className="h-3.5 w-2/3 animate-pulse rounded bg-ink-800" />
            <div className="h-3 w-1/3 animate-pulse rounded bg-ink-800/70" />
          </div>
        </div>
      ))}
    </>
  );
}

export default function RecentActivities() {
  const [itemsPerPage, setItemsPerPage] = useState(5);
  const [currentPage, setCurrentPage] = useState(1);
  const [data, setData] = useState<PageData | null>(
    () => pageCache.get(cacheKey(1, 5)) ?? null
  );
  const [loading, setLoading] = useState(!data);
  const [error, setError] = useState<string | null>(null);
  const requestId = useRef(0);

  const load = useCallback((page: number, limit: number) => {
    const id = ++requestId.current;
    setLoading(true);
    setError(null);

    fetchPage(page, limit)
      .then((result) => {
        if (id !== requestId.current) return; // réponse obsolète
        setData(result);

        // Préchargement de la page suivante pendant que l'admin lit celle-ci
        if (page < result.pages) {
          void fetchPage(page + 1, limit).catch(() => undefined);
        }
      })
      .catch((err) => {
        if (id !== requestId.current) return;
        console.error("Erreur de chargement des activités :", err);
        setError("Impossible de charger les activités.");
      })
      .finally(() => {
        if (id === requestId.current) setLoading(false);
      });
  }, []);

  useEffect(() => {
    load(currentPage, itemsPerPage);
  }, [currentPage, itemsPerPage, load]);

  const refresh = () => {
    pageCache.clear();
    load(currentPage, itemsPerPage);
  };

  const total = data?.total ?? 0;
  const totalPages = data?.pages ?? 1;
  const activities = data?.activities ?? [];
  const startIndex = (currentPage - 1) * itemsPerPage;
  const firstLoad = loading && !data;

  return (
    <section>
      {/* En-tête */}
      <div className="mb-5 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h3 className="font-body text-lg font-semibold text-ink-50">Activités récentes</h3>
          <p className="mt-1 text-sm text-ink-400">Historique des actions sur la plateforme</p>
        </div>

        <div className="flex items-center gap-2">
          {data && (
            <span className="rounded-full bg-ink-800/60 px-3 py-1 text-sm tabular-nums text-ink-300">
              {total.toLocaleString("fr-FR")} activité{total > 1 ? "s" : ""}
            </span>
          )}
          <button
            type="button"
            onClick={refresh}
            disabled={loading}
            aria-label="Actualiser"
            title="Actualiser"
            className="flex h-9 w-9 items-center justify-center rounded-lg border border-overlay/[0.1] text-ink-400 transition hover:bg-overlay/[0.05] hover:text-ink-100 disabled:opacity-50"
          >
            <svg viewBox="0 0 24 24" width="16" height="16" fill="none" aria-hidden="true" className={loading ? "animate-spin" : ""}>
              <path d="M20 11a8 8 0 10-2.3 5.7M20 4v7h-7" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
        </div>
      </div>

      {error && (
        <div className="alert-error mb-4 flex items-center justify-between gap-3">
          <span>{error}</span>
          <button type="button" onClick={refresh} className="font-semibold underline-offset-4 hover:underline">
            Réessayer
          </button>
        </div>
      )}

      {/* Liste : pendant un changement de page, l'ancienne reste visible (atténuée) */}
      <div
        className={`divide-y divide-overlay/[0.06] transition-opacity ${loading && data ? "opacity-50" : ""}`}
        aria-busy={loading}
      >
        {firstLoad ? (
          <SkeletonRows count={itemsPerPage} />
        ) : activities.length === 0 && !error ? (
          <p className="py-10 text-center text-ink-400">Aucune activité enregistrée.</p>
        ) : (
          activities.map((activity) => {
            const ago = timeAgo(activity.created_at);
            return (
              <article key={activity.id} className="flex items-start gap-3 py-4">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-brand-500/15 font-semibold text-brand-300">
                  {(activity.user_name || "S").charAt(0).toUpperCase()}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-sm text-ink-200">
                    <span className="font-semibold text-ink-50">{activity.user_name || "Utilisateur inconnu"}</span>{" "}
                    {activity.description || "a effectué une action"}
                  </p>
                  <p className="mt-0.5 text-xs text-ink-500" title={formatDate(activity.created_at)}>
                    {ago ? `${ago} · ` : ""}
                    {formatDate(activity.created_at)}
                  </p>
                </div>
              </article>
            );
          })
        )}
      </div>

      {/* Pagination */}
      {data && total > 0 && (
        <div className="mt-5 flex flex-col gap-4 border-t border-overlay/[0.08] pt-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex flex-wrap items-center gap-3 text-sm text-ink-400">
            <span>
              {startIndex + 1}–{Math.min(startIndex + itemsPerPage, total)} sur {total.toLocaleString("fr-FR")}
            </span>
            <label className="flex items-center gap-2">
              <span className="sr-only sm:not-sr-only">Par page</span>
              <select
                value={itemsPerPage}
                onChange={(e) => {
                  setItemsPerPage(Number(e.target.value));
                  setCurrentPage(1);
                }}
                className="rounded-lg border border-overlay/[0.12] bg-ink-900/60 px-2 py-1.5 text-sm text-ink-200 outline-none focus:border-brand-500"
              >
                <option value={5}>5</option>
                <option value={10}>10</option>
                <option value={20}>20</option>
              </select>
            </label>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="btn-ghost px-3 py-2"
            >
              Précédent
            </button>
            <span className="whitespace-nowrap px-1 text-sm tabular-nums text-ink-300">
              {currentPage} / {totalPages}
            </span>
            <button
              type="button"
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              disabled={currentPage >= totalPages}
              className="btn-ghost px-3 py-2"
            >
              Suivant
            </button>
          </div>
        </div>
      )}
    </section>
  );
}
