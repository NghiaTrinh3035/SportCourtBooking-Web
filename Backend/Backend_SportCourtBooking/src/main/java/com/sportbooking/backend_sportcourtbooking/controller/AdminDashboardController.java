package com.sportbooking.backend_sportcourtbooking.controller;

import com.sportbooking.backend_sportcourtbooking.DTOs.AdminDashboardResponse;
import com.sportbooking.backend_sportcourtbooking.DTOs.ApiResponse;
import com.sportbooking.backend_sportcourtbooking.service.AdminDashboardService;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.time.LocalDateTime;

@RestController
@RequestMapping("/api/owner/dashboard")
@RequiredArgsConstructor
public class AdminDashboardController {

    private final AdminDashboardService adminDashboardService;

    @GetMapping("/summary")
    @PreAuthorize("hasRole('OWNER')")
    public ResponseEntity<ApiResponse<AdminDashboardResponse>> getSummary(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime start,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime end
    ) {
        return ResponseEntity.ok(new ApiResponse<>(true, "Success", adminDashboardService.getSummary(start, end)));
    }

    // OLD CODE - KEEP FOR BACKUP
    /*
    @GetMapping("/summary")
    @PreAuthorize("hasRole('OWNER')")
    public ResponseEntity<AdminDashboardResponse> getSummaryOld(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime start,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime end
    ) {
        return ResponseEntity.ok(adminDashboardService.getSummary(start, end));
    }
    */
}
