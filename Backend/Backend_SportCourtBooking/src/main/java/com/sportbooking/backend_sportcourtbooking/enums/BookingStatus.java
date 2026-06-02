package com.sportbooking.backend_sportcourtbooking.enums;

public enum BookingStatus {
    PENDING,    // Mới đặt, chưa thanh toán
    CONFIRMED,  // Đã OWNER/STAFF xác nhận, chờ cọc
    DEPOSITED,  // Đã cọc thành công
    CANCELED,   // Khách hủy hoặc Admin hủy
    COMPLETED   // Đã xong
}