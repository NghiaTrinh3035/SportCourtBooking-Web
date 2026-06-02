package com.sportbooking.backend_sportcourtbooking.DTOs;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.Data;

import java.time.LocalTime;

@Data
public class CourtRequest {
    @NotBlank
    @Size(max = 100)
    private String name;

    @NotNull
    private Long sportId;

    @Size(max = 500)
    private String description;

    @NotNull
    private LocalTime openTime;

    @NotNull
    private LocalTime closeTime;

    private Boolean active;
}
