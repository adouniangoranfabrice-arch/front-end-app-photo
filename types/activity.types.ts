export interface Activity {
  id: string;
  user_name: string;
  action?: string | null;
  description: string | null;
  created_at: string | null;
}

export interface RecentActivitiesResponse {
  total: number;
  activities: Activity[];
  // Présents depuis la pagination côté serveur
  page?: number;
  limit?: number;
  pages?: number;
}
