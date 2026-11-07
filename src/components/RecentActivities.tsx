
import { useEffect, useState } from "react";
import api from "../../api/axios";
import type {
  Activity,
  RecentActivitiesResponse,
} from "../../types/activity.types";

export default function RecentActivities() {
  const [activities, setActivities] = useState<Activity[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(5);

  useEffect(() => {
    const fetchActivities = async () => {
      try {
        setLoading(true);
        setError(null);

        const response = await api.get<RecentActivitiesResponse>(
          "/admin/activities/recent"
        );

        setActivities(response.data.activities);
        setCurrentPage(1);
      } catch (err) {
        console.error("Erreur de chargement des activités :", err);
        setError("Impossible de charger les activités.");
      } finally {
        setLoading(false);
      }
    };

    fetchActivities();
  }, []);

  const formatDate = (date: string | null) => {
    if (!date) return "Date inconnue";

    const parsedDate = new Date(date);

    if (Number.isNaN(parsedDate.getTime())) {
      return "Date invalide";
    }

    return new Intl.DateTimeFormat("fr-FR", {
      day: "2-digit",
      month: "long",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      timeZone: "Africa/Abidjan",
    }).format(parsedDate);
  };

  // Calcul des pages
  const totalPages = Math.ceil(activities.length / itemsPerPage);

  // Activités à afficher sur la page courante
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;

  const currentActivities = activities.slice(startIndex, endIndex);

  // Changement du nombre d'activités par page
  const handleItemsPerPageChange = (
    event: React.ChangeEvent<HTMLSelectElement>
  ) => {
    setItemsPerPage(Number(event.target.value));
    setCurrentPage(1);
  };

  if (loading) {
    return (
      <div className="rounded-xl border border-gray-200 bg-white p-6">
        Chargement des activités...
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-red-700">
        {error}
      </div>
    );
  }

  return (
    <section>
      {/* En-tête */}
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">
            Activités récentes
          </h3>

          <p className="mt-1 text-sm text-gray-500">
            Historique des activités de la plateforme
          </p>
        </div>

        <span className="w-fit rounded-full bg-gray-100 px-3 py-1 text-sm text-gray-600">
          {activities.length} activité(s)
        </span>
      </div>

      {/* Nombre d'activités par page */}
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <label
          htmlFor="itemsPerPage"
          className="text-sm text-gray-600"
        >
          Activités par page :
        </label>

        <select
          id="itemsPerPage"
          value={itemsPerPage}
          onChange={handleItemsPerPageChange}
          className="rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-700 outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-100"
        >
          <option value={5}>5</option>
          <option value={10}>10</option>
          <option value={20}>20</option>
        </select>
      </div>

      {/* Liste des activités */}
      {activities.length === 0 ? (
        <p className="py-8 text-center text-gray-500">
          Aucune activité enregistrée.
        </p>
      ) : (
        <>
          <div>
            {currentActivities.map((activity) => (
              <article
                key={activity.id}
                className="flex flex-col gap-3 py-4 sm:flex-row sm:items-start"
              >
                {/* Avatar */}
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-amber-100 font-semibold text-amber-800">
                  {(activity.user_name || "S")
                    .charAt(0)
                    .toUpperCase()}
                </div>

                {/* Informations */}
                <div className="min-w-0 flex-1">
                  <p className="font-medium text-gray-900">
                    {activity.user_name || "Utilisateur inconnu"}  {activity.description || "Aucune description disponible"} {formatDate(activity.created_at)} min
                  </p>

                </div>
              </article>
            ))}
          </div>

          {/* Pied de pagination */}
          <div className="mt-6 flex flex-col gap-4 border-t border-gray-100 pt-4 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-sm text-gray-500">
              Affichage de{" "}
              <span className="font-medium text-gray-800">
                {startIndex + 1}
              </span>{" "}
              à{" "}
              <span className="font-medium text-gray-800">
                {Math.min(endIndex, activities.length)}
              </span>{" "}
              sur{" "}
              <span className="font-medium text-gray-800">
                {activities.length}
              </span>{" "}
              activités
            </p>

            <div className="flex items-center gap-2">
              {/* Précédent */}
              <button
                type="button"
                onClick={() =>
                  setCurrentPage((page) => Math.max(1, page - 1))
                }
                disabled={currentPage === 1}
                className="rounded-lg border border-gray-300 px-3 py-2 text-sm font-medium text-gray-700 transition hover:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-40"
              >
                Précédent
              </button>

              {/* Numéro de page */}
              <span className="whitespace-nowrap px-2 text-sm text-gray-600">
                Page {currentPage} / {totalPages}
              </span>

              {/* Suivant */}
              <button
                type="button"
                onClick={() =>
                  setCurrentPage((page) =>
                    Math.min(totalPages, page + 1)
                  )
                }
                disabled={currentPage === totalPages}
                className="rounded-lg border border-gray-300 px-3 py-2 text-sm font-medium text-gray-700 transition hover:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-40"
              >
                Suivant
              </button>
            </div>
          </div>
        </>
      )}
    </section>
  );
}
