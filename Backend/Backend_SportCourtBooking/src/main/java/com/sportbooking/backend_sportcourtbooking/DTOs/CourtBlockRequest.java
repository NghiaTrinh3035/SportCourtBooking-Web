package com.sportbooking.backend_sportcourtbooking.DTOs;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.Data;

import java.time.LocalDateTime;

@Data
public class CourtBlockRequest {
    @NotNull
    private Long courtId;

    @NotNull
    private LocalDateTime startTime;

    @NotNull
    private LocalDateTime endTime;

    @Size(max = 255)
    @NotBlank
    private String reason;
}
