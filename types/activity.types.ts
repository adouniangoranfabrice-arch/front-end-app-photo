
export interface Activity {
  id: string;
  user_name: string;
  description: string | null;
  created_at: string | null;
}

export interface RecentActivitiesResponse {
  total: number;
  activities: Activity[];
}
