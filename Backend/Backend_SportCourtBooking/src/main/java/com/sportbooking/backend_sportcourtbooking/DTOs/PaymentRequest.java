package com.sportbooking.backend_sportcourtbooking.DTOs;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;
import java.math.BigDecimal;

@Data
public class PaymentRequest {
    @NotNull
    private Long bookingId;
    @NotNull
    private BigDecimal amount;
    @NotBlank
    private String paymentMethod;   // "CASH" hoặc "BANK_TRANSFER"
    private String transactionRef;  // Mã giao dịch
    
    private String bookingInfo;
}
