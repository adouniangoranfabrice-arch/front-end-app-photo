import { useCallback, useEffect, useState, type ReactNode } from "react";
import api from "../../api/axios";

interface PhotographerStats {
  events: { total: number; this_month: number };
  photos: { total: number; this_week: number };
  storage_bytes: number;
  faces: { total: number };
  searches: { total: number; this_month: number };
  downloads: { total: number; this_month: number };
}

const nf = new Intl.NumberFormat("fr-FR");

function formatBytes(bytes: number): string {
  if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)} Ko`;
  if (bytes < 1024 ** 3) return `${(bytes / 1024 ** 2).toFixed(1).replace(".", ",")} Mo`;
  return `${(bytes / 1024 ** 3).toFixed(2).replace(".", ",")} Go`;
}

function plural(n: number, word: string) {
  return `${nf.format(n)} ${word}${n > 1 ? "s" : ""}`;
}

const svg = (children: ReactNode) => (
  <svg viewBox="0 0 24 24" width="22" height="22" fill="none" aria-hidden="true">
    {children}
  </svg>
);
const s = { stroke: "currentColor", strokeWidth: 1.8, strokeLinecap: "round" as const, strokeLinejoin: "round" as const };

export default function DashboardStats({ refreshKey = 0 }: { refreshKey?: number }) {
  const [stats, setStats] = useState<PhotographerStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const load = useCallback(() => {
    setLoading(true);
    setError("");
    api
      .get<PhotographerStats>("/users/me/stats")
      .then((res) => setStats(res.data))
      .catch((err) => {
        console.error("Statistiques indisponibles :", err);
        setError("Impossible de charger vos statistiques.");
      })
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    load();
  }, [load, refreshKey]);

  const cards = stats
    ? [
        {
          label: "Événements",
          value: nf.format(stats.events.total),
          detail: stats.events.this_month > 0 ? `+${nf.format(stats.events.this_month)} ce mois-ci` : "Aucun nouveau ce mois-ci",
          positive: stats.events.this_month > 0,
          icon: svg(<><rect x="3" y="5" width="18" height="16" rx="2" {...s} /><path d="M3 10h18M8 3v4M16 3v4" {...s} /></>),
        },
        {
          label: "Photos en ligne",
          value: nf.format(stats.photos.total),
          detail: `${stats.photos.this_week > 0 ? `+${nf.format(stats.photos.this_week)} cette semaine · ` : ""}${formatBytes(stats.storage_bytes)}`,
          positive: stats.photos.this_week > 0,
          icon: svg(<><rect x="3" y="5" width="18" height="14" rx="2" {...s} /><circle cx="9" cy="11" r="2" {...s} /><path d="M21 17l-5-5-8 8" {...s} /></>),
        },
        {
          label: "Recherches par selfie",
          value: nf.format(stats.searches.total),
          detail: `${stats.searches.this_month > 0 ? `+${nf.format(stats.searches.this_month)} ce mois-ci · ` : ""}${plural(stats.faces.total, "visage")} détecté${stats.faces.total > 1 ? "s" : ""}`,
          positive: stats.searches.this_month > 0,
          icon: svg(<><path d="M4 8V6a2 2 0 012-2h2M16 4h2a2 2 0 012 2v2M20 16v2a2 2 0 01-2 2h-2M8 20H6a2 2 0 01-2-2v-2" {...s} /><circle cx="12" cy="10.5" r="2.8" {...s} /><path d="M7.5 17a5 5 0 019 0" {...s} /></>),
        },
        {
          label: "Photos téléchargées",
          value: nf.format(stats.downloads.total),
          detail: stats.downloads.this_month > 0 ? `+${nf.format(stats.downloads.this_month)} ce mois-ci` : "Aucune ce mois-ci",
          positive: stats.downloads.this_month > 0,
          icon: svg(<path d="M12 4v12m0 0l-4-4m4 4l4-4M4 20h16" {...s} />),
        },
      ]
    : [];

  return (
    <div className="mb-8">
      {error && (
        <div className="alert-error mb-4 flex items-center justify-between gap-3">
          <span>{error}</span>
          <button type="button" onClick={load} className="font-semibold underline-offset-4 hover:underline">
            Réessayer
          </button>
        </div>
      )}

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {loading && !stats
          ? [0, 1, 2, 3].map((i) => (
              <div key={i} className="card p-5" aria-hidden="true">
                <div className="mb-4 h-11 w-11 animate-pulse rounded-xl bg-ink-800" />
                <div className="mb-2 h-8 w-20 animate-pulse rounded bg-ink-800" />
                <div className="h-3.5 w-32 animate-pulse rounded bg-ink-800/70" />
              </div>
            ))
          : cards.map((card) => (
              <div
                key={card.label}
                className={`card p-5 transition-all hover:border-brand-500/20 ${loading ? "opacity-60" : ""}`}
              >
                <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-xl border border-brand-500/15 bg-brand-500/10 text-brand-400">
                  {card.icon}
                </div>
                <p className="mb-1 font-display text-3xl font-extrabold tabular-nums text-ink-50">{card.value}</p>
                <p className="text-sm text-ink-400">{card.label}</p>
                <p className={`mt-2 text-xs ${card.positive ? "text-emerald-400" : "text-ink-500"}`}>{card.detail}</p>
              </div>
            ))}
      </div>
    </div>
  );
}
