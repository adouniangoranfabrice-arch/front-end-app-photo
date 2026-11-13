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

/**
 * Carte utilisateur en bas de la barre latérale.
 * Un clic affiche « Mon profil » dans la zone principale (la barre latérale reste visible).
 */
export default function UserMenu({
  variant = "photographer",
  onOpenProfile,
  active = false,
}: {
  variant?: "photographer" | "admin";
  onOpenProfile: () => void;
  active?: boolean;
}) {
  const { user, loading, error } = useCurrentUser();
  const logout = useLogout();

  const handleLogout = () => {
    clearCurrentUser();
    logout();
  };

  const avatarClass =
    variant === "admin"
      ? "bg-gradient-to-br from-red-500 to-red-700 text-white"
      : "bg-gradient-to-br from-brand-300 to-brand-600 text-white";

  return (
    <div className="border-t border-overlay/[0.04] px-3 py-4">
      <button
        type="button"
        onClick={onOpenProfile}
        title="Voir mon profil"
        aria-current={active ? "page" : undefined}
        className={`group flex w-full items-center gap-3 rounded-xl border px-3 py-3 text-left transition ${
          active
            ? "border-brand-500/30 bg-brand-500/10"
            : "border-transparent bg-ink-800/50 hover:bg-ink-800"
        }`}
      >
        <span className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-sm font-bold ${avatarClass}`}>
          {loading ? "" : initials(user) || "?"}
        </span>
        <span className="min-w-0 flex-1">
          {loading ? (
            <>
              <span className="block h-3.5 w-24 animate-pulse rounded bg-ink-700" />
              <span className="mt-1.5 block h-3 w-16 animate-pulse rounded bg-ink-700/70" />
            </>
          ) : (
            <>
              <span className="block truncate text-sm font-semibold text-ink-100">
                {fullName(user) || "Mon compte"}
              </span>
              <span className="block truncate text-xs text-ink-500">
                {error ? "Profil indisponible" : roleLabel(user?.role)}
              </span>
            </>
          )}
        </span>
        <svg viewBox="0 0 24 24" width="16" height="16" fill="none" aria-hidden="true" className="shrink-0 text-ink-500 transition group-hover:translate-x-0.5 group-hover:text-ink-200">
          <path d="M9 6l6 6-6 6" {...icon} strokeWidth={2} />
        </svg>
      </button>

      <button
        type="button"
        onClick={handleLogout}
        className="mt-2 flex items-center gap-2 px-3 py-2.5 text-sm text-ink-500 transition-colors hover:text-red-400"
      >
        <svg viewBox="0 0 24 24" width="18" height="18" fill="none" aria-hidden="true">
          <path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4M16 17l5-5-5-5M21 12H9" {...icon} />
        </svg>
        Déconnexion
      </button>
    </div>
  );
}
