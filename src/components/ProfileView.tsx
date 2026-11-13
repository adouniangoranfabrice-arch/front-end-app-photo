import { useState, type ReactNode } from "react";
import { useLogout } from "../utils/logout";
import {
  clearCurrentUser,
  fullName,
  initials,
  roleLabel,
  useCurrentUser,
} from "../utils/currentUser";

const icon = {
  stroke: "currentColor",
  strokeWidth: 1.7,
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
};

function formatDate(value?: string | null): string | null {
  if (!value) return null;
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return null;
  return date.toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric" });
}

function Field({
  label,
  value,
  href,
  copyable = false,
  children,
}: {
  label: string;
  value?: string | null;
  href?: string;
  copyable?: boolean;
  children: ReactNode;
}) {
  const [copied, setCopied] = useState(false);

  const copy = async () => {
    if (!value) return;
    try {
      await navigator.clipboard.writeText(value);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1800);
    } catch {
      /* presse-papiers indisponible */
    }
  };

  return (
    <div className="flex items-start gap-4 py-4">
      <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-brand-500/10 text-brand-400">
        <svg viewBox="0 0 24 24" width="19" height="19" fill="none" aria-hidden="true">
          {children}
        </svg>
      </span>
      <div className="min-w-0 flex-1">
        <dt className="text-xs font-medium uppercase tracking-wider text-ink-500">{label}</dt>
        <dd className="mt-1 break-words text-[15px] text-ink-100">
          {!value ? (
            <span className="text-ink-500">Non renseigné</span>
          ) : href ? (
            <a href={href} target={href.startsWith("http") ? "_blank" : undefined} rel="noreferrer" className="text-brand-300 underline-offset-4 hover:underline">
              {value}
            </a>
          ) : (
            value
          )}
        </dd>
      </div>
      {copyable && value && (
        <button
          type="button"
          onClick={() => void copy()}
          className="shrink-0 rounded-lg px-2.5 py-1.5 text-xs font-semibold text-ink-400 transition hover:bg-overlay/[0.06] hover:text-ink-100"
        >
          {copied ? "Copié ✓" : "Copier"}
        </button>
      )}
    </div>
  );
}

export default function ProfileView() {
  const { user, loading, error, reload } = useCurrentUser();
  const logout = useLogout();

  const isAdmin = (user?.role ?? localStorage.getItem("user_role"))?.toUpperCase() === "ADMIN";

  const handleLogout = () => {
    clearCurrentUser();
    logout();
  };

  const avatarClass = isAdmin
    ? "bg-gradient-to-br from-red-500 to-red-700 text-white"
    : "bg-gradient-to-br from-brand-300 to-brand-600 text-white";

  const website = user?.website
    ? /^https?:\/\//i.test(user.website)
      ? user.website
      : `https://${user.website}`
    : undefined;

  return (
    <div className="mx-auto w-full max-w-5xl">
        {error ? (
          <div className="card mx-auto max-w-lg p-8 text-center">
            <p className="alert-error">{error}</p>
            <div className="mt-5 flex justify-center gap-3">
              <button type="button" onClick={reload} className="btn-ghost">Réessayer</button>
              <button type="button" onClick={handleLogout} className="btn-primary">Se reconnecter</button>
            </div>
          </div>
        ) : loading || !user ? (
          <div className="card overflow-hidden" aria-busy="true">
            <div className="h-40 animate-pulse bg-ink-800" />
            <div className="space-y-3 p-8">
              <div className="h-6 w-48 animate-pulse rounded bg-ink-800" />
              <div className="h-4 w-72 animate-pulse rounded bg-ink-800" />
            </div>
          </div>
        ) : (
          <>
            {/* En-tête du profil */}
            <section className="card overflow-hidden">
              <div className="relative h-36 overflow-hidden sm:h-44">
                <div className="absolute inset-0 bg-gradient-to-br from-brand-500/35 via-brand-700/15 to-transparent" />
                <div className="absolute -right-16 -top-16 h-64 w-64 rounded-full bg-brand-400/15 blur-3xl" />
                <svg className="absolute bottom-0 right-6 h-28 w-28 text-brand-300/10 sm:h-36 sm:w-36" viewBox="0 0 40 40" aria-hidden="true">
                  <circle cx="20" cy="20" r="14" fill="none" stroke="currentColor" strokeWidth="3" />
                  <circle cx="20" cy="20" r="5" fill="currentColor" />
                </svg>
              </div>

              <div className="flex flex-col gap-5 px-6 pb-7 sm:flex-row sm:items-end sm:justify-between sm:px-8">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-end">
                  <div className={`-mt-14 flex h-28 w-28 shrink-0 items-center justify-center rounded-full border-[5px] border-ink-900 text-4xl font-bold shadow-xl ${avatarClass}`}>
                    {initials(user)}
                  </div>
                  <div className="pb-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <h1 className="font-display text-3xl font-bold text-ink-50">{fullName(user)}</h1>
                      <span className="rounded-full border border-brand-500/25 bg-brand-500/10 px-2.5 py-0.5 text-xs font-semibold text-brand-400">
                        {roleLabel(user.role)}
                      </span>
                    </div>
                    {user.business_name && <p className="mt-1 text-ink-300">{user.business_name}</p>}
                    <p className="mt-2 flex items-center gap-2 text-sm">
                      <span className={`h-2 w-2 rounded-full ${user.is_active === false ? "bg-red-400" : "bg-emerald-400"}`} />
                      <span className="text-ink-400">
                        {user.is_active === false ? "Compte désactivé" : "Compte actif"}
                        {formatDate(user.created_at) && ` · membre depuis le ${formatDate(user.created_at)}`}
                      </span>
                    </p>
                  </div>
                </div>

                {/* <button type="button" onClick={handleLogout} className="btn-ghost self-start sm:self-end">
                  <svg viewBox="0 0 24 24" width="17" height="17" fill="none" aria-hidden="true">
                    <path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4M16 17l5-5-5-5M21 12H9" {...icon} />
                  </svg>
                  Se déconnecter
                </button> */}
              </div>
            </section>

            <div className="mt-6 grid gap-6 lg:grid-cols-[1.4fr_1fr]">
              {/* Coordonnées */}
              <section className="card p-6 sm:p-8">
                <h2 className="font-body text-lg font-semibold text-ink-50">Coordonnées</h2>
                <p className="mt-1 text-sm text-ink-400">Les informations liées à votre compte Photiva.</p>

                <dl className="mt-4 divide-y divide-overlay/[0.06]">
                  <Field label="Nom" value={user.firstname}>
                    <circle cx="12" cy="8" r="4" {...icon} />
                    <path d="M4 21v-1a6 6 0 0112 0v1" {...icon} />
                  </Field>
                  <Field label="Prénom(s)" value={user.lastname}>
                    <circle cx="12" cy="8" r="4" {...icon} />
                    <path d="M4 21v-1a6 6 0 0112 0v1" {...icon} />
                  </Field>
                  <Field label="Adresse e-mail" value={user.email} href={user.email ? `mailto:${user.email}` : undefined} copyable>
                    <rect x="3" y="5" width="18" height="14" rx="2" {...icon} />
                    <path d="M3 7l9 6 9-6" {...icon} />
                  </Field>
                  <Field label="Téléphone" value={user.phone} href={user.phone ? `tel:${user.phone.replace(/\s+/g, "")}` : undefined} copyable>
                    <path d="M5 4h4l2 5-2.5 1.5a11 11 0 005 5L15 13l5 2v4a2 2 0 01-2 2A16 16 0 013 6a2 2 0 012-2z" {...icon} />
                  </Field>
                  <Field label="Ville" value={user.city}>
                    <path d="M12 21s-7-6.1-7-11.5a7 7 0 1114 0C19 14.9 12 21 12 21z" {...icon} />
                    <circle cx="12" cy="9.5" r="2.5" {...icon} />
                  </Field>
                  <Field label="Site web" value={user.website} href={website}>
                    <circle cx="12" cy="12" r="9" {...icon} />
                    <path d="M3 12h18M12 3a14 14 0 010 18M12 3a14 14 0 000 18" {...icon} />
                  </Field>
                </dl>
              </section>

              <div className="flex flex-col gap-6">
                {/* Bio */}
                <section className="card p-6 sm:p-8">
                  <h2 className="font-body text-lg font-semibold text-ink-50">À propos</h2>
                  <p className={`mt-3 text-[15px] leading-relaxed ${user.bio ? "text-ink-300" : "text-ink-500"}`}>
                    {user.bio || "Aucune présentation pour le moment."}
                  </p>
                </section>

                {/* Compte */}
                <section className="card p-6 sm:p-8">
                  <h2 className="font-body text-lg font-semibold text-ink-50">Compte</h2>
                  <dl className="mt-4 space-y-3 text-sm">
                    <div className="flex justify-between gap-4">
                      <dt className="text-ink-500">Rôle</dt>
                      <dd className="text-ink-100">{roleLabel(user.role)}</dd>
                    </div>
                    <div className="flex justify-between gap-4">
                      <dt className="text-ink-500">Statut</dt>
                      <dd className={user.is_active === false ? "text-red-400" : "text-emerald-400"}>
                        {user.is_active === false ? "Désactivé" : "Actif"}
                      </dd>
                    </div>
                    <div className="flex justify-between gap-4">
                      <dt className="text-ink-500">Inscription</dt>
                      <dd className="text-ink-100">{formatDate(user.created_at) ?? "—"}</dd>
                    </div>
                    {/* <div className="flex justify-between gap-4">
                      <dt className="shrink-0 text-ink-500">Identifiant</dt>
                      <dd className="truncate font-mono text-xs text-ink-400" title={user.id}>{user.id}</dd>
                    </div> */}
                  </dl>
                </section>
              </div>
            </div>
          </>
        )}
    </div>
  );
}
