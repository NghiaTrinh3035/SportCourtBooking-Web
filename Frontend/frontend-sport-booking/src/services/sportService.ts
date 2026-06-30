import type { Sport } from '../entities/sport/types';
import { apiClient } from '../core/api/apiClient';

const sportService = {
  async getAllSports(): Promise<Sport[]> {
    return await apiClient.get<Sport[]>('/sports');
  },
};

export default sportService;
