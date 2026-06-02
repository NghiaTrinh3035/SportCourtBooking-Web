package com.sportbooking.backend_sportcourtbooking.DTOs;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
public class SportRequest {
    @NotBlank
    @Size(max = 100)
    private String name;

    @Size(max = 255)
    private String iconUrl;
}
