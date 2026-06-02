package com.sportbooking.backend_sportcourtbooking.DTOs;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalTime;

@Data
public class CourtPriceRuleRequest {
    @NotNull
    private Long courtId;

    @NotNull
    private LocalTime startTime;

    @NotNull
    private LocalTime endTime;

    @NotNull
    @Positive
    private BigDecimal price;
}
