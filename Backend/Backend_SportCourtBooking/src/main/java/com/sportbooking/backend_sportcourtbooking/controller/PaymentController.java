package com.sportbooking.backend_sportcourtbooking.controller;

import com.sportbooking.backend_sportcourtbooking.DTOs.PaymentRequest;
import com.sportbooking.backend_sportcourtbooking.DTOs.ApiResponse;
import com.sportbooking.backend_sportcourtbooking.entity.Payment;
import com.sportbooking.backend_sportcourtbooking.service.PaymentService;
import com.sportbooking.backend_sportcourtbooking.service.VNPAYService;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import java.util.Enumeration;
import java.util.HashMap;
import java.util.Map;
import com.sportbooking.backend_sportcourtbooking.DTOs.PaymentResponse;
import com.sportbooking.backend_sportcourtbooking.utils.VnPayUtil;
import org.springframework.beans.factory.annotation.Value;

@RestController
@RequestMapping("/api/payments")
@RequiredArgsConstructor
public class PaymentController {

    private final PaymentService paymentService;

    private final VNPAYService vnPayService;

    @Value("${payment.vnpay.secret-key}")
    private String secretKey;

@PostMapping("/create-payment-url")
public ResponseEntity<PaymentResponse> createPaymentUrl(
        @RequestBody PaymentRequest request,
        HttpServletRequest httpRequest) {
    
    // Gọi sang Service để xử lý logic tạo URL
    PaymentResponse result = vnPayService.createPaymentUrl(request, httpRequest);
    
    return ResponseEntity.ok(result);
}
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

   // 1. API Tạo URL Thanh Toán (Frontend gọi)
    @PostMapping("/create-vnpay")
    public ResponseEntity<ApiResponse<PaymentResponse>> createVnPayPayment(@RequestBody PaymentRequest request, 
                                                              HttpServletRequest httpReq) {
        PaymentResponse response = vnPayService.createPaymentUrl(request, httpReq);
        return ResponseEntity.ok(new ApiResponse<>(true, "Success", response));
    }

    // 2. API Nhận Callback sau khi user thanh toán xong trên VNPAY
    @GetMapping("/vnpay-return")
    public ResponseEntity<?> vnPayReturn(HttpServletRequest request, jakarta.servlet.http.HttpServletResponse response) throws java.io.IOException {
        // Lấy tất cả param từ request của VNPAY trả về
        Map<String, String> fields = new HashMap<>();
        for (Enumeration<String> params = request.getParameterNames(); params.hasMoreElements(); ) {
            String fieldName = params.nextElement();
            String fieldValue = request.getParameter(fieldName);
            if ((fieldValue != null) && (fieldValue.length() > 0)) {
                fields.put(fieldName, fieldValue);
            }
        }

        String vnp_SecureHash = request.getParameter("vnp_SecureHash");
        fields.remove("vnp_SecureHashType");
        fields.remove("vnp_SecureHash");

        // Hash lại các param trả về và so sánh với hash của VNPAY gửi để chống giả mạo
        String hashData = VnPayUtil.getPaymentURL(fields, true);
        String signValue = VnPayUtil.hmacSHA512(secretKey, hashData);
        
        if (signValue.equals(vnp_SecureHash)) {
            if ("00".equals(request.getParameter("vnp_TransactionStatus"))) {
                try {
                    Long bookingId = Long.parseLong(request.getParameter("vnp_TxnRef"));
                    java.math.BigDecimal amount = new java.math.BigDecimal(request.getParameter("vnp_Amount")).divide(new java.math.BigDecimal(100));
                    String transactionNo = request.getParameter("vnp_TransactionNo");
                    
                    paymentService.processVnPayCallback(bookingId, amount, transactionNo);
                    
                    response.sendRedirect("http://localhost:5173/payment/" + bookingId + "?payment_status=success");
                    return ResponseEntity.ok().build();
                } catch (Exception e) {
                    e.printStackTrace();
                    response.sendRedirect("http://localhost:5173/profile?payment=failed_db");
                    return ResponseEntity.ok().build();
                }
            } else {
                String bookingId = request.getParameter("vnp_TxnRef");
                response.sendRedirect("http://localhost:5173/payment/" + bookingId + "?payment_status=failed");
                return ResponseEntity.ok().build();
            }
        } else {
            response.sendRedirect("http://localhost:5173/profile?payment=invalid");
            return ResponseEntity.badRequest().build();
        }
    }
}
