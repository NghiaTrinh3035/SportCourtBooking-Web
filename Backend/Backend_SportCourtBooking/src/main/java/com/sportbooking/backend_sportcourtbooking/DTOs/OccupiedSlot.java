package com.sportbooking.backend_sportcourtbooking.DTOs;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class OccupiedSlot {
    private LocalDateTime startTime;
    private LocalDateTime endTime;
    private String type; // "BOOKED" hoặc "BLOCKED"
}
