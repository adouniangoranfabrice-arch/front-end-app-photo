import { useCallback, useEffect, useMemo, useState } from "react";
import api from "../../api/axios";

interface Reports {
  kpis: {
    photographers: { total: number; active: number; this_month: number };
    events: { total: number; public: number; this_month: number };
    photos: { total: number; this_month: number };
    storage_bytes: number;
    faces: { total: number };
    searches: { total: number; this_month: number };
    downloads: { total: number; this_month: number };
  };
  growth: { label: string; year: number; month: number; photographers: number; events: number; photos: number }[];
  event_types: { type: string; label: string; count: number }[];
  top_photographers: { user_id: string; name: string; photos: number; events: number; storage_bytes: number }[];
  generated_at: string;
}

type Metric = "photographers" | "events" | "photos";

const METRICS: { id: Metric; label: string }[] = [
  { id: "photographers", label: "Inscriptions" },
  { id: "events", label: "Événements" },
  { id: "photos", label: "Photos" },
];

const nf = new Intl.NumberFormat("fr-FR");

function formatBytes(bytes: number): string {
  if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)} Ko`;
  if (bytes < 1024 ** 3) return `${(bytes / 1024 ** 2).toFixed(1).replace(".", ",")} Mo`;
  return `${(bytes / 1024 ** 3).toFixed(2).replace(".", ",")} Go`;
}

function pct(part: number, total: number) {
  return total > 0 ? Math.round((part / total) * 100) : 0;
}

function Kpi({ label, value, sub, positive = false }: { label: string; value: string; sub: string; positive?: boolean }) {
  return (
    <div className="card p-5">
      <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-ink-500">{label}</p>
      <p className="mb-1 font-display text-2xl font-extrabold tabular-nums text-ink-50">{value}</p>
      <p className={`text-xs ${positive ? "text-emerald-400" : "text-ink-400"}`}>{sub}</p>
    </div>
  );
}

export default function AdminReports() {
  const [data, setData] = useState<Reports | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [metric, setMetric] = useState<Metric>("photographers");

  const load = useCallback(() => {
    setLoading(true);
    setError("");
    api
      .get<Reports>("/admin/reports", { params: { months: 12 } })
      .then((res) => setData(res.data))
      .catch((err) => {
        console.error("Rapports indisponibles :", err);
        setError(
          err?.response?.status === 403
            ? "Accès réservé aux administrateurs."
            : "Impossible de charger les rapports."
        );
      })
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const growthMax = useMemo(
    () => Math.max(1, ...(data?.growth.map((g) => g[metric]) ?? [0])),
    [data, metric]
  );
  const growthTotal = useMemo(
    () => data?.growth.reduce((sum, g) => sum + g[metric], 0) ?? 0,
    [data, metric]
  );

  if (loading && !data) {
    return (
      <div className="space-y-6" aria-busy="true">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: 8 }, (_, i) => (
            <div key={i} className="card h-[108px] animate-pulse" />
          ))}
        </div>
        <div className="card h-72 animate-pulse" />
      </div>
    );
  }

  if (error && !data) {
    return (
      <div className="alert-error flex items-center justify-between gap-3">
        <span>{error}</span>
        <button type="button" onClick={load} className="font-semibold underline-offset-4 hover:underline">
          Réessayer
        </button>
      </div>
    );
  }

  if (!data) return null;

  const k = data.kpis;
  const typesTotal = data.event_types.reduce((s, t) => s + t.count, 0);

  return (
    <div className={`space-y-6 transition-opacity ${loading ? "opacity-60" : ""}`}>
      {/* En-tête */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h2 className="font-display text-2xl font-extrabold text-ink-50">Rapports</h2>
          <p className="mt-1 text-sm text-ink-400">
            Données réelles de la plateforme · mises à jour le{" "}
            {new Date(data.generated_at).toLocaleString("fr-FR", { dateStyle: "long", timeStyle: "short" })}
          </p>
        </div>
        <button type="button" onClick={load} disabled={loading} className="btn-ghost self-start">
          <svg viewBox="0 0 24 24" width="16" height="16" fill="none" aria-hidden="true" className={loading ? "animate-spin" : ""}>
            <path d="M20 11a8 8 0 10-2.3 5.7M20 4v7h-7" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          Actualiser
        </button>
      </div>

      {/* Indicateurs clés */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Kpi
          label="Photographes"
          value={nf.format(k.photographers.total)}
          sub={k.photographers.this_month > 0 ? `+${nf.format(k.photographers.this_month)} ce mois-ci` : "Aucune inscription ce mois-ci"}
          positive={k.photographers.this_month > 0}
        />
        <Kpi
          label="Comptes actifs"
          value={`${pct(k.photographers.active, k.photographers.total)} %`}
          sub={`${nf.format(k.photographers.active)} sur ${nf.format(k.photographers.total)} photographes`}
        />
        <Kpi
          label="Événements"
          value={nf.format(k.events.total)}
          sub={`${k.events.this_month > 0 ? `+${nf.format(k.events.this_month)} ce mois-ci · ` : ""}${nf.format(k.events.public)} publics`}
          positive={k.events.this_month > 0}
        />
        <Kpi
          label="Photos en ligne"
          value={nf.format(k.photos.total)}
          sub={k.photos.this_month > 0 ? `+${nf.format(k.photos.this_month)} ce mois-ci` : "Aucune ce mois-ci"}
          positive={k.photos.this_month > 0}
        />
        <Kpi label="Stockage utilisé" value={formatBytes(k.storage_bytes)} sub={k.photos.total > 0 ? `≈ ${formatBytes(k.storage_bytes / k.photos.total)} par photo` : "—"} />
        <Kpi label="Visages détectés" value={nf.format(k.faces.total)} sub="Indexés pour la recherche par selfie" />
        <Kpi
          label="Recherches par selfie"
          value={nf.format(k.searches.total)}
          sub={k.searches.this_month > 0 ? `+${nf.format(k.searches.this_month)} ce mois-ci` : "Aucune ce mois-ci"}
          positive={k.searches.this_month > 0}
        />
        <Kpi
          label="Photos téléchargées"
          value={nf.format(k.downloads.total)}
          sub={k.downloads.this_month > 0 ? `+${nf.format(k.downloads.this_month)} ce mois-ci` : "Aucune ce mois-ci"}
          positive={k.downloads.this_month > 0}
        />
      </div>

      {/* Croissance */}
      <section className="card p-6">
        <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h3 className="font-body text-lg font-bold text-ink-50">Évolution sur 12 mois</h3>
            <p className="text-sm text-ink-400">
              {nf.format(growthTotal)} {METRICS.find((m) => m.id === metric)?.label.toLowerCase()} sur la période
            </p>
          </div>
          <div className="inline-flex rounded-xl border border-overlay/[0.08] bg-ink-950/40 p-1" role="tablist">
            {METRICS.map((m) => (
              <button
                key={m.id}
                type="button"
                role="tab"
                aria-selected={metric === m.id}
                onClick={() => setMetric(m.id)}
                className={`rounded-lg px-3 py-1.5 text-sm font-medium transition ${
                  metric === m.id ? "bg-brand-500 text-white" : "text-ink-400 hover:text-ink-100"
                }`}
              >
                {m.label}
              </button>
            ))}
          </div>
        </div>

        <div className="flex h-56 items-end gap-1.5 sm:gap-2">
          {data.growth.map((g) => {
            const value = g[metric];
            const height = value === 0 ? 2 : Math.max(6, (value / growthMax) * 100);
            return (
              <div key={`${g.year}-${g.month}`} className="group flex h-full flex-1 flex-col items-center justify-end gap-2">
                <span className={`text-[11px] font-bold tabular-nums ${value ? "text-ink-200" : "text-ink-600"}`}>
                  {nf.format(value)}
                </span>
                <div
                  className={`w-full rounded-t-md transition-all duration-500 ${
                    value ? "bg-gradient-to-t from-brand-600 to-brand-400 group-hover:from-brand-500 group-hover:to-brand-300" : "bg-ink-800"
                  }`}
                  style={{ height: `${height}%` }}
                  title={`${g.label} ${g.year} : ${nf.format(value)}`}
                />
                <span className="text-[11px] text-ink-500">{g.label}</span>
              </div>
            );
          })}
        </div>
      </section>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Types d'événements */}
        <section className="card p-6">
          <h3 className="mb-5 font-body text-lg font-bold text-ink-50">Types d'événements</h3>
          {data.event_types.length === 0 ? (
            <p className="py-6 text-center text-sm text-ink-500">Aucun événement pour le moment.</p>
          ) : (
            <div className="flex flex-col gap-4">
              {data.event_types.map((t) => {
                const share = pct(t.count, typesTotal);
                return (
                  <div key={t.type}>
                    <div className="mb-1.5 flex items-center justify-between gap-3">
                      <span className="truncate text-sm font-medium text-ink-200">{t.label}</span>
                      <span className="shrink-0 text-sm tabular-nums text-ink-400">
                        {nf.format(t.count)} ({share} %)
                      </span>
                    </div>
                    <div className="h-2.5 overflow-hidden rounded-full bg-ink-800">
                      <div
                        className="h-full rounded-full bg-gradient-to-r from-brand-600 to-brand-400 transition-all duration-500"
                        style={{ width: `${Math.max(share, 2)}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </section>

        {/* Photographes les plus actifs */}
        <section className="card p-6">
          <h3 className="mb-5 font-body text-lg font-bold text-ink-50">Photographes les plus actifs</h3>
          {data.top_photographers.length === 0 ? (
            <p className="py-6 text-center text-sm text-ink-500">Aucune photo importée pour le moment.</p>
          ) : (
            <ol className="divide-y divide-overlay/[0.06]">
              {data.top_photographers.map((p, i) => (
                <li key={p.user_id ?? i} className="flex items-center gap-4 py-3">
                  <span className="w-5 text-center font-display text-lg italic text-brand-400">{i + 1}</span>
                  <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-brand-500/15 text-sm font-semibold text-brand-300">
                    {p.name.charAt(0).toUpperCase()}
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-semibold text-ink-50">{p.name}</p>
                    <p className="text-xs text-ink-500">
                      {nf.format(p.events)} événement{p.events > 1 ? "s" : ""} · {formatBytes(p.storage_bytes)}
                    </p>
                  </div>
                  <span className="text-sm font-semibold tabular-nums text-ink-200">
                    {nf.format(p.photos)} <span className="font-normal text-ink-500">photos</span>
                  </span>
                </li>
              ))}
            </ol>
          )}
        </section>
      </div>

      <p className="text-xs text-ink-500">
        Les recherches par selfie et les téléchargements sont comptés depuis la mise en place du suivi.
        Le chiffre d'affaires apparaîtra ici une fois les abonnements payants mis en place.
      </p>
    </div>
  );
}
