package com.sportbooking.backend_sportcourtbooking.controller;

import com.sportbooking.backend_sportcourtbooking.DTOs.PaymentRequest;
import com.sportbooking.backend_sportcourtbooking.DTOs.ApiResponse;
import com.sportbooking.backend_sportcourtbooking.entity.Payment;
import com.sportbooking.backend_sportcourtbooking.service.PaymentService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/payments")
@RequiredArgsConstructor
public class PaymentController {

    private final PaymentService paymentService;

    @PostMapping
    @PreAuthorize("hasAnyRole('CUSTOMER','OWNER','STAFF')")
    public ResponseEntity<ApiResponse<Payment>> createPayment(@Valid @RequestBody PaymentRequest request) {
        Payment payment = paymentService.processPayment(request);
        return ResponseEntity.ok(new ApiResponse<>(true, "Success", payment));
    }

    // OLD CODE - KEEP FOR BACKUP
    /*
    @PostMapping
    @PreAuthorize("hasAnyRole('CUSTOMER','OWNER','STAFF')")
    public ResponseEntity<?> createPaymentOld(@Valid @RequestBody PaymentRequest request) {
        Payment payment = paymentService.processPayment(request);

        return ResponseEntity.ok(payment);
    }
    */
}
