package com.sportbooking.backend_sportcourtbooking.DTOs;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Future;
import lombok.Data;

import java.time.LocalDateTime;

@Data
public class BookingRequest {
    private Long userId;
    @NotNull
    private Long courtId;
    @NotNull
    @Future
    private LocalDateTime startTime;
    @NotNull
    @Future
    private LocalDateTime endTime;
    private String note;
}
