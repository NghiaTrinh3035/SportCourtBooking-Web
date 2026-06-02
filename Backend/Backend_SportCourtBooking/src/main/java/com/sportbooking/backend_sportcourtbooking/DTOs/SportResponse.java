package com.sportbooking.backend_sportcourtbooking.DTOs;

import lombok.Data;

@Data
public class SportResponse {
    private Long id;
    private String name;
    private String iconUrl;
    private int totalCourts; // Biến đếm bạn yêu cầu
}
