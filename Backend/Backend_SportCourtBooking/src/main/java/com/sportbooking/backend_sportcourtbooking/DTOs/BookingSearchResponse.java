package com.sportbooking.backend_sportcourtbooking.DTOs;

import com.sportbooking.backend_sportcourtbooking.enums.BookingStatus;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class BookingSearchResponse {
    private Long bookingId;
    private String courtName;
    private LocalDateTime startTime;
    private LocalDateTime endTime;
    private BigDecimal totalPrice;
    private String customerName;
    private String customerPhone;
    private BookingStatus status;
}
