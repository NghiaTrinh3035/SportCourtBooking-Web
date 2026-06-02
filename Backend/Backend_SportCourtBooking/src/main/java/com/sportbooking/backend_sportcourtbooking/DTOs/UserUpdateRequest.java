package com.sportbooking.backend_sportcourtbooking.DTOs;

import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
public class UserUpdateRequest {
    @Size(max = 100)
    private String fullName;

    @Size(max = 20)
    private String phone;
    // Không cho sửa email hay role ở đây để bảo mật
}
