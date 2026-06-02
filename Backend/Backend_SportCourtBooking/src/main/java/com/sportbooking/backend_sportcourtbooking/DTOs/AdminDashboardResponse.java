package com.sportbooking.backend_sportcourtbooking.DTOs;

import lombok.Data;

import java.math.BigDecimal;

@Data
public class AdminDashboardResponse {
    private long totalUsers;
    private long totalCourts;
    private long pendingBookings;
    private long confirmedBookings;
    private long completedBookings;
    private long canceledBookings;
    private BigDecimal totalRevenue;
}
