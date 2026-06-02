package com.sportbooking.backend_sportcourtbooking.DTOs;

import com.sportbooking.backend_sportcourtbooking.enums.BookingStatus;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class BookingStatusRequest {
    @NotNull
    private BookingStatus status;

    private String cancelReason;
}
