import type {
  Court,
  CourtBlock,
  CourtBlockRequest,
  CourtPriceRule,
  CourtPriceRuleRequest,
  CourtRequest,
  CourtScheduleResponse,
} from '../../../entities/court/types';
import { apiClient } from '../../../core/api/apiClient';

export const courtApiRepository = {
  async getAllCourts(): Promise<Court[]> {
    return await apiClient.get<Court[]>('/courts');
  },

  async getCourtById(id: number): Promise<Court> {
    return await apiClient.get<Court>(`/courts/${id}`);
  },

  async getCourtSchedule(courtId: number, date?: string): Promise<CourtScheduleResponse> {
    const params = date ? { date } : undefined;
    return await apiClient.get<CourtScheduleResponse>(`/courts/${courtId}/schedule`, { params });
  },

  async getAvailableCourts(params: {
    startTime: string;
    endTime: string;
    sportId?: number;
  }): Promise<Court[]> {
    return await apiClient.get<Court[]>('/courts/available', { params });
  },

  async createCourt(payload: CourtRequest): Promise<Court> {
    return await apiClient.post<Court>('/courts', payload);
  },

  async updateCourt(id: number, payload: CourtRequest): Promise<Court> {
    return await apiClient.put<Court>(`/courts/${id}`, payload);
  },

  async deleteCourt(id: number): Promise<void> {
    return await apiClient.delete<void>(`/courts/${id}`);
  },

  async getCourtPrices(courtId: number): Promise<CourtPriceRule[]> {
    return await apiClient.get<CourtPriceRule[]>(`/courts/${courtId}/prices`);
  },

  async createCourtPriceRule(payload: CourtPriceRuleRequest): Promise<CourtPriceRule> {
    return await apiClient.post<CourtPriceRule>('/courts/prices', payload);
  },

  async updateCourtPriceRule(ruleId: number, payload: CourtPriceRuleRequest): Promise<CourtPriceRule> {
    return await apiClient.put<CourtPriceRule>(`/courts/prices/${ruleId}`, payload);
  },

  async deleteCourtPriceRule(ruleId: number): Promise<void> {
    return await apiClient.delete<void>(`/courts/prices/${ruleId}`);
  },

  async getCourtBlocks(courtId: number): Promise<CourtBlock[]> {
    return await apiClient.get<CourtBlock[]>(`/courts/${courtId}/blocks`);
  },

  async createCourtBlock(payload: CourtBlockRequest): Promise<CourtBlock> {
    return await apiClient.post<CourtBlock>('/courts/blocks', payload);
  },

  async deleteCourtBlock(blockId: number): Promise<void> {
    return await apiClient.delete<void>(`/courts/blocks/${blockId}`);
  }
};
