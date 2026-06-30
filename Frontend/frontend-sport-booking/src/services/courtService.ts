import type {
  Court,
  CourtBlock,
  CourtBlockRequest,
  CourtPriceRule,
  CourtPriceRuleRequest,
  CourtRequest,
  CourtScheduleResponse,
} from '../entities/court/types';
// import httpClient from '../shared/lib/httpClient';
import { courtApiRepository } from '../features/courts/repositories/courtApi.repository';

const courtService = {
  async getAllCourts(): Promise<Court[]> {
    return await courtApiRepository.getAllCourts();
  },

  async getCourtById(id: number): Promise<Court> {
    return await courtApiRepository.getCourtById(id);
  },

  async getCourtSchedule(courtId: number, date?: string): Promise<CourtScheduleResponse> {
    return await courtApiRepository.getCourtSchedule(courtId, date);
  },

  async getAvailableCourts(params: {
    startTime: string;
    endTime: string;
    sportId?: number;
  }): Promise<Court[]> {
    return await courtApiRepository.getAvailableCourts(params);
  },

  async createCourt(payload: CourtRequest): Promise<Court> {
    return await courtApiRepository.createCourt(payload);
  },

  async updateCourt(id: number, payload: CourtRequest): Promise<Court> {
    return await courtApiRepository.updateCourt(id, payload);
  },

  async deleteCourt(id: number): Promise<void> {
    return await courtApiRepository.deleteCourt(id);
  },

  async getCourtPrices(courtId: number): Promise<CourtPriceRule[]> {
    return await courtApiRepository.getCourtPrices(courtId);
  },

  async createCourtPriceRule(payload: CourtPriceRuleRequest): Promise<CourtPriceRule> {
    return await courtApiRepository.createCourtPriceRule(payload);
  },

  async updateCourtPriceRule(ruleId: number, payload: CourtPriceRuleRequest): Promise<CourtPriceRule> {
    return await courtApiRepository.updateCourtPriceRule(ruleId, payload);
  },

  async deleteCourtPriceRule(ruleId: number): Promise<void> {
    return await courtApiRepository.deleteCourtPriceRule(ruleId);
  },

  async getCourtBlocks(courtId: number): Promise<CourtBlock[]> {
    return await courtApiRepository.getCourtBlocks(courtId);
  },

  async createCourtBlock(payload: CourtBlockRequest): Promise<CourtBlock> {
    return await courtApiRepository.createCourtBlock(payload);
  },

  async deleteCourtBlock(blockId: number): Promise<void> {
    return await courtApiRepository.deleteCourtBlock(blockId);
  },

  // OLD CODE - KEEP FOR BACKUP
  /*
  async getAllCourtsOld(): Promise<Court[]> {
    const response = await httpClient.get<Court[]>('/courts');
    return response.data;
  },

  async getCourtByIdOld(id: number): Promise<Court> {
    const response = await httpClient.get<Court>(`/courts/${id}`);
    return response.data;
  },

  async getAvailableCourtsOld(params: {
    startTime: string;
    endTime: string;
    sportId?: number;
  }): Promise<Court[]> {
    const response = await httpClient.get<Court[]>('/courts/available', { params });
    return response.data;
  },

  async createCourtOld(payload: CourtRequest): Promise<Court> {
    const response = await httpClient.post<Court>('/courts', payload);
    return response.data;
  },

  async updateCourtOld(id: number, payload: CourtRequest): Promise<Court> {
    const response = await httpClient.put<Court>(`/courts/${id}`, payload);
    return response.data;
  },

  async deleteCourtOld(id: number): Promise<void> {
    await httpClient.delete(`/courts/${id}`);
  },

  async getCourtPricesOld(courtId: number): Promise<CourtPriceRule[]> {
    const response = await httpClient.get<CourtPriceRule[]>(`/courts/${courtId}/prices`);
    return response.data;
  },

  async createCourtPriceRuleOld(payload: CourtPriceRuleRequest): Promise<CourtPriceRule> {
    const response = await httpClient.post<CourtPriceRule>('/courts/prices', payload);
    return response.data;
  },

  async updateCourtPriceRuleOld(ruleId: number, payload: CourtPriceRuleRequest): Promise<CourtPriceRule> {
    const response = await httpClient.put<CourtPriceRule>(`/courts/prices/${ruleId}`, payload);
    return response.data;
  },

  async deleteCourtPriceRuleOld(ruleId: number): Promise<void> {
    await httpClient.delete(`/courts/prices/${ruleId}`);
  },

  async getCourtBlocksOld(courtId: number): Promise<CourtBlock[]> {
    const response = await httpClient.get<CourtBlock[]>(`/courts/${courtId}/blocks`);
    return response.data;
  },

  async createCourtBlockOld(payload: CourtBlockRequest): Promise<CourtBlock> {
    const response = await httpClient.post<CourtBlock>('/courts/blocks', payload);
    return response.data;
  },

  async deleteCourtBlockOld(blockId: number): Promise<void> {
    await httpClient.delete(`/courts/blocks/${blockId}`);
  },
  */
};

export default courtService;
