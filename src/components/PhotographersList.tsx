
import { useEffect, useMemo, useState } from "react";
import api from "../../api/axios";

interface Photographer {
  id: string;
  firstname: string | null;
  lastname: string | null;
  email: string | null;
  phone: string | null;
  is_active: boolean;
  business_name: string | null;
  profile_photo: string | null;
  city: string | null;
  is_verified: boolean;
  events_count: number;
  photos_count: number;
  created_at: string | null;
}

interface PhotographersResponse {
  total: number;
  photographers: Photographer[];
}

export default function PhotographersList() {
  const [photographers, setPhotographers] = useState<Photographer[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");

  const fetchPhotographers = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await api.get<PhotographersResponse>(
        "/stats_list_users/photographers"
      );

      setPhotographers(response.data.photographers);
    } catch (err: any) {
      setError(
        err.response?.data?.detail ||
          "Impossible de charger les photographes."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPhotographers();
  }, []);

  const filteredPhotographers = useMemo(() => {
    const term = search.trim().toLowerCase();

    if (!term) return photographers;

    return photographers.filter((p) =>
      [
        p.firstname,
        p.lastname,
        p.email,
        p.phone,
        p.business_name,
        p.city,
      ]
        .filter(Boolean)
        .some((value) => value!.toLowerCase().includes(term))
    );
  }, [photographers, search]);

  const formatDate = (date: string | null) => {
    if (!date) return "—";

    const parsedDate = new Date(date);

    return Number.isNaN(parsedDate.getTime())
      ? "—"
      : parsedDate.toLocaleDateString("fr-FR");
  };

  if (loading) {
    return (
      <div className="p-8 text-center text-gray-500">
        Chargement des photographes...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-8">
      <div className="mx-auto max-w-full">
        <div className="mb-6 flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              Photographes
            </h1>
            <p className="mt-1 text-sm text-gray-500">
              Gestion des comptes photographes de Photiva
            </p>
          </div>

          <button
            onClick={fetchPhotographers}
            className="rounded-lg bg-indigo-600 px-4 py-2 text-white hover:bg-indigo-700"
          >
            Actualiser
          </button>
        </div>

        <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-3">
          <div className="rounded-xl border bg-white p-5 shadow-sm">
            <p className="text-sm text-gray-500">Total photographes</p>
            <p className="mt-2 text-3xl font-bold">
              {photographers.length}
            </p>
          </div>

          <div className="rounded-xl border bg-white p-5 shadow-sm">
            <p className="text-sm text-gray-500">Comptes actifs</p>
            <p className="mt-2 text-3xl font-bold text-green-600">
              {photographers.filter((p) => p.is_active).length}
            </p>
          </div>

          <div className="rounded-xl border bg-white p-5 shadow-sm">
            <p className="text-sm text-gray-500">Profils vérifiés</p>
            <p className="mt-2 text-3xl font-bold text-indigo-600">
              {photographers.filter((p) => p.is_verified).length}
            </p>
          </div>
        </div>

        <div className="mb-4">
          <input
            type="search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Rechercher par nom, email, téléphone, ville..."
            className="w-full rounded-lg border border-gray-300 bg-white px-4 py-3 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
          />
        </div>

        {error && (
          <div className="mb-4 rounded-lg border border-red-200 bg-red-50 p-4 text-red-700">
            {error}
            <button
              onClick={fetchPhotographers}
              className="ml-3 font-semibold underline"
            >
              Réessayer
            </button>
          </div>
        )}

        {!error && filteredPhotographers.length === 0 ? (
          <div className="rounded-xl border bg-white p-10 text-center text-gray-500">
            {search
              ? "Aucun photographe ne correspond à la recherche."
              : "Aucun photographe enregistré."}
          </div>
        ) : (
          !error && (
            <div className="overflow-x-auto rounded-xl border bg-white shadow-sm">
              <table className="w-full min-w-[1050px] text-left text-sm">
                <thead className="bg-gray-100 text-gray-600">
                  <tr>
                    <th className="px-4 py-3">Photographe</th>
                    <th className="px-4 py-3">Contact</th>
                    <th className="px-4 py-3">Ville</th>
                    <th className="px-4 py-3">Compte</th>
                    <th className="px-4 py-3">Profil</th>
                    <th className="px-4 py-3">Événements</th>
                    <th className="px-4 py-3">Photos</th>
                    <th className="px-4 py-3">Inscription</th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-gray-100">
                  {filteredPhotographers.map((p) => (
                    <tr key={p.id} className="hover:bg-gray-50">
                      <td className="px-4 py-4">
                        <div className="flex items-center gap-3">
                          {p.profile_photo ? (
                            <img
                              src={p.profile_photo}
                              alt=""
                              className="h-10 w-10 rounded-full object-cover"
                            />
                          ) : (
                            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-indigo-100 font-semibold text-indigo-700">
                              {(p.firstname?.[0] || "?").toUpperCase()}
                            </div>
                          )}

                          <div>
                            <p className="font-semibold text-gray-900">
                              {[p.firstname, p.lastname]
                                .filter(Boolean)
                                .join(" ") || "Sans nom"}
                            </p>
                            <p className="text-gray-500">
                              {p.business_name || "Entreprise non renseignée"}
                            </p>
                          </div>
                        </div>
                      </td>

                      <td className="px-4 py-4">
                        <p>{p.email || "—"}</p>
                        <p className="mt-1 text-gray-500">
                          {p.phone || "—"}
                        </p>
                      </td>

                      <td className="px-4 py-4">{p.city || "—"}</td>

                      <td className="px-4 py-4">
                        <span
                          className={`rounded-full px-2.5 py-1 text-xs font-medium ${
                            p.is_active
                              ? "bg-green-100 text-green-700"
                              : "bg-red-100 text-red-700"
                          }`}
                        >
                          {p.is_active ? "Actif" : "Désactivé"}
                        </span>
                      </td>

                      <td className="px-4 py-4">
                        {p.is_verified ? (
                          <span className="text-green-700">Vérifié</span>
                        ) : (
                          <span className="text-gray-500">Non vérifié</span>
                        )}
                      </td>

                      <td className="px-4 py-4 font-medium">
                        {p.events_count}
                      </td>

                      <td className="px-4 py-4 font-medium">
                        {p.photos_count}
                      </td>

                      <td className="px-4 py-4">
                        {formatDate(p.created_at)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )
        )}

        <p className="mt-4 text-sm text-gray-500">
          {filteredPhotographers.length} résultat(s) sur{" "}
          {photographers.length} photographe(s)
        </p>
      </div>
    </div>
  );
}