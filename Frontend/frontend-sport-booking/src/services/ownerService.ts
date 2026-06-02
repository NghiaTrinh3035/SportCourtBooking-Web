import type { AdminDashboardSummary } from '../entities/dashboard/types';
import type { Sport, SportRequest } from '../entities/sport/types';
// import httpClient from '../shared/lib/httpClient';
import { ownerApiRepository } from '../features/owner/repositories/ownerApi.repository';

const ownerService = {
  async getDashboardSummary(start: string, end: string): Promise<AdminDashboardSummary> {
    return await ownerApiRepository.getDashboardSummary(start, end);
  },

  async getSports(): Promise<Sport[]> {
    return await ownerApiRepository.getSports();
  },

  async createSport(payload: SportRequest): Promise<Sport> {
    return await ownerApiRepository.createSport(payload);
  },

  async updateSport(id: number, payload: SportRequest): Promise<Sport> {
    return await ownerApiRepository.updateSport(id, payload);
  },

  async deleteSport(id: number): Promise<void> {
    return await ownerApiRepository.deleteSport(id);
  },

  // OLD CODE - KEEP FOR BACKUP
  /*
  async getDashboardSummaryOld(start: string, end: string): Promise<AdminDashboardSummary> {
    const response = await httpClient.get<AdminDashboardSummary>('/owner/dashboard/summary', {
      params: { start, end },
    });
    return response.data;
  },

  async getSportsOld(): Promise<Sport[]> {
    const response = await httpClient.get<Sport[]>('/sports');
    return response.data;
  },

  async createSportOld(payload: SportRequest): Promise<Sport> {
    const response = await httpClient.post<Sport>('/sports', payload);
    return response.data;
  },

  async updateSportOld(id: number, payload: SportRequest): Promise<Sport> {
    const response = await httpClient.put<Sport>(`/sports/${id}`, payload);
    return response.data;
  },

  async deleteSportOld(id: number): Promise<void> {
    await httpClient.delete(`/sports/${id}`);
  },
  */
};

export default ownerService;
