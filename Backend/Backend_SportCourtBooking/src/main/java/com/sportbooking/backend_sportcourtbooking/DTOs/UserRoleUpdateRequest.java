package com.sportbooking.backend_sportcourtbooking.DTOs;

import com.sportbooking.backend_sportcourtbooking.enums.UserRole;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class UserRoleUpdateRequest {
    @NotNull
    private UserRole role;
}
