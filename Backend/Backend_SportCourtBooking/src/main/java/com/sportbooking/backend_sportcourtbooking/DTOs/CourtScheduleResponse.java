package com.sportbooking.backend_sportcourtbooking.DTOs;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalTime;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CourtScheduleResponse {
    private Long courtId;
    private String date; // YYYY-MM-DD
    private LocalTime openTime;
    private LocalTime closeTime;
    private List<OccupiedSlot> occupiedSlots;
}
