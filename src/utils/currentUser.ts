import { useCallback, useEffect, useState } from "react";
import axios from "axios";
import api from "../../api/axios";

export interface CurrentUser {
  id: string;
  firstname: string | null;
  lastname: string | null;
  email: string | null;
  role: string | null;
  business_name?: string | null;
  phone?: string | null;
  city?: string | null;
  website?: string | null;
  bio?: string | null;
  is_active?: boolean;
  created_at?: string | null;
}

// Cache partagé : le profil n'est chargé qu'une fois par session d'onglet
let cachedUser: CurrentUser | null = null;
let pending: Promise<CurrentUser> | null = null;

function fetchCurrentUser(force = false): Promise<CurrentUser> {
  if (cachedUser && !force) return Promise.resolve(cachedUser);
  if (pending && !force) return pending;

  pending = api
    .get<CurrentUser>("/users/me")
    .then((response) => {
      cachedUser = response.data;
      return response.data;
    })
    .finally(() => {
      pending = null;
    });

  return pending;
}

/** À appeler à la déconnexion pour ne pas réafficher l'ancien profil. */
export function clearCurrentUser() {
  cachedUser = null;
  pending = null;
}

export function useCurrentUser() {
  const [user, setUser] = useState<CurrentUser | null>(cachedUser);
  const [loading, setLoading] = useState(!cachedUser);
  const [error, setError] = useState("");

  const load = useCallback((force = false) => {
    setLoading(true);
    setError("");

    fetchCurrentUser(force)
      .then(setUser)
      .catch((err: unknown) => {
        if (axios.isAxiosError(err) && err.response?.status === 401) {
          setError("Votre session a expiré. Reconnectez-vous.");
        } else {
          setError("Impossible de charger votre profil.");
        }
      })
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  return { user, loading, error, reload: () => load(true) };
}

export function fullName(user: CurrentUser | null): string {
  if (!user) return "";
  return [user.firstname, user.lastname].filter(Boolean).join(" ").trim() || user.email || "";
}

export function initials(user: CurrentUser | null): string {
  if (!user) return "";
  const letters = [user.firstname, user.lastname]
    .filter(Boolean)
    .map((part) => part!.trim()[0])
    .join("");
  return (letters || user.email?.[0] || "?").toUpperCase().slice(0, 2);
}

export function roleLabel(role: string | null | undefined): string {
  switch (role?.toUpperCase()) {
    case "ADMIN":
      return "Administrateur";
    case "PHOTOGRAPHER":
      return "Photographe";
    default:
      return role || "Utilisateur";
  }
}
