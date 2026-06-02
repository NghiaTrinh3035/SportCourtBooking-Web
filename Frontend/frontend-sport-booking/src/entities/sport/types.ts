export interface Sport {
  id: number;
  name: string;
  iconUrl?: string | null;
  totalCourts?: number;
}

export interface SportRequest {
  name: string;
  iconUrl?: string;
}
