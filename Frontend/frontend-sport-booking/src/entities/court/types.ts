export interface SportSummary {
  id: number;
  name: string;
  iconUrl?: string | null;
}

export interface Court {
  id: number;
  name: string;
  description?: string | null;
  openTime: string;
  closeTime: string;
  active: boolean;
  sport?: SportSummary;
}

export interface CourtRequest {
  name: string;
  sportId: number;
  description?: string;
  openTime: string;
  closeTime: string;
  active?: boolean;
}

export interface CourtPriceRule {
  id: number;
  court?: Court;
  startTime: string;
  endTime: string;
  price: number;
}

export interface CourtPriceRuleRequest {
  courtId: number;
  startTime: string;
  endTime: string;
  price: number;
}

export interface CourtBlock {
  id: number;
  court?: Court;
  startTime: string;
  endTime: string;
  reason: string;
}

export interface CourtBlockRequest {
  courtId: number;
  startTime: string;
  endTime: string;
  reason: string;
}

export interface OccupiedSlot {
  startTime: string;
  endTime: string;
  type: 'BOOKED' | 'BLOCKED';
}

export interface CourtScheduleResponse {
  courtId: number;
  date: string;
  openTime: string;
  closeTime: string;
  occupiedSlots: OccupiedSlot[];
}

