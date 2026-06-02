package com.sportbooking.backend_sportcourtbooking.DTOs;

import com.sportbooking.backend_sportcourtbooking.enums.UserRole;
import lombok.Data;

@Data
public class UserResponse {
    private Long id;
    private String fullName;
    private String email;
    private String phone;
    private UserRole role;
    private String token;
}