import type { AdminDashboardSummary } from '../../../entities/dashboard/types';
import type { Sport, SportRequest } from '../../../entities/sport/types';
import { apiClient } from '../../../core/api/apiClient';

export const ownerApiRepository = {
  async getDashboardSummary(start: string, end: string): Promise<AdminDashboardSummary> {
    return await apiClient.get<AdminDashboardSummary>('/owner/dashboard/summary', {
      params: { start, end },
    });
  },

  async getSports(): Promise<Sport[]> {
    return await apiClient.get<Sport[]>('/sports');
  },

  async createSport(payload: SportRequest): Promise<Sport> {
    return await apiClient.post<Sport>('/sports', payload);
  },

  async updateSport(id: number, payload: SportRequest): Promise<Sport> {
    return await apiClient.put<Sport>(`/sports/${id}`, payload);
  },

  async deleteSport(id: number): Promise<void> {
    return await apiClient.delete<void>(`/sports/${id}`);
  },
};
