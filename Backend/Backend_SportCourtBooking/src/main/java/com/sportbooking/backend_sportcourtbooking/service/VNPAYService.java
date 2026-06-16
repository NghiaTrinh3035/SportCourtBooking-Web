package com.sportbooking.backend_sportcourtbooking.service;

import java.net.http.HttpRequest;
import java.util.Calendar;
import java.util.HashMap;
import java.util.Map;
import java.util.TimeZone;
import com.sportbooking.backend_sportcourtbooking.DTOs.PaymentRequest;
import com.sportbooking.backend_sportcourtbooking.DTOs.PaymentResponse;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.beans.factory.annotation.Value;
import java.text.SimpleDateFormat;
import com.sportbooking.backend_sportcourtbooking.utils.VnPayUtil;

@Service
@RequiredArgsConstructor
public class VNPAYService {

    @Value("${payment.vnpay.tmn-code}")
    private String vnpTmnCode;

    @Value("${payment.vnpay.secret-key}")
    private String secretKey;

    @Value("${payment.vnpay.pay-url}")
    private String vnpPayUrl;

    @Value("${payment.vnpay.return-url}")
    private String vnpReturnUrl;

    public PaymentResponse createPaymentUrl(PaymentRequest request, HttpServletRequest httpReq) {
        // 1. Khởi tạo Map chứa các tham số
        Map<String, String> vnpParams = new HashMap<>();
        vnpParams.put("vnp_Version", "2.1.0");
        vnpParams.put("vnp_Command", "pay");
        vnpParams.put("vnp_TmnCode", vnpTmnCode);
        vnpParams.put("vnp_Amount", String.valueOf(request.getAmount().multiply(new java.math.BigDecimal(100)).intValue())); // VNPAY yêu cầu nhân 100
        vnpParams.put("vnp_CurrCode", "VND");
        vnpParams.put("vnp_TxnRef", String.valueOf(request.getBookingId())); // Mã đơn hàng
        vnpParams.put("vnp_OrderInfo", request.getBookingInfo() != null && !request.getBookingInfo().isEmpty() ? request.getBookingInfo() : "Thanh toan don dat san " + request.getBookingId());
        vnpParams.put("vnp_OrderType", "other");
        vnpParams.put("vnp_Locale", "vn");
        vnpParams.put("vnp_ReturnUrl", vnpReturnUrl);
        vnpParams.put("vnp_IpAddr", getIpAddress(httpReq));
        
        // Cấu hình thời gian tạo & hết hạn giao dịch (Tự viết Util)
        Calendar cld = Calendar.getInstance(TimeZone.getTimeZone("Etc/GMT+7"));
        SimpleDateFormat formatter = new SimpleDateFormat("yyyyMMddHHmmss");
        vnpParams.put("vnp_CreateDate", formatter.format(cld.getTime()));

        // 2. Build chuỗi data để Hash và chuỗi URL
        // (Sử dụng hàm hash của VNPay cung cấp để tạo ra vnp_SecureHash)
        String queryUrl = VnPayUtil.getPaymentURL(vnpParams, false); // Tự viết/Copy từ VNPay
        String hashData = VnPayUtil.getPaymentURL(vnpParams, true);
        String vnpSecureHash = VnPayUtil.hmacSHA512(secretKey, hashData);
        
        // 3. Nối Hash vào URL cuối cùng
        queryUrl += "&vnp_SecureHash=" + vnpSecureHash;
        String paymentUrl = vnpPayUrl + "?" + queryUrl;

        return PaymentResponse.builder()
                .status("OK")
                .message("Successfully created VNPAY URL")
                .paymentUrl(paymentUrl)
                .build();
    }

    public String getIpAddress(HttpServletRequest request) {
        String ipAdress = request.getHeader("X-FORWARDED-FOR");
        if (ipAdress == null) {
            ipAdress = request.getRemoteAddr();
        }
        return ipAdress;
    }
}