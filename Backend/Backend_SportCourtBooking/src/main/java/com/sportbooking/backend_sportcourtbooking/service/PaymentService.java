package com.sportbooking.backend_sportcourtbooking.service;

import com.sportbooking.backend_sportcourtbooking.DTOs.PaymentRequest;
import com.sportbooking.backend_sportcourtbooking.entity.Booking;
import com.sportbooking.backend_sportcourtbooking.entity.CourtBlock;
import com.sportbooking.backend_sportcourtbooking.entity.Payment;
import com.sportbooking.backend_sportcourtbooking.enums.BookingStatus;
import com.sportbooking.backend_sportcourtbooking.enums.PaymentMethod;
import com.sportbooking.backend_sportcourtbooking.enums.PaymentStatus;
import com.sportbooking.backend_sportcourtbooking.repository.BookingRepository;
import com.sportbooking.backend_sportcourtbooking.repository.CourtBlockRepository;
import com.sportbooking.backend_sportcourtbooking.repository.PaymentRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDateTime;

@Service
@RequiredArgsConstructor
public class PaymentService {

    private static final BigDecimal DEPOSIT_RATE = new BigDecimal("0.30");

    private final PaymentRepository paymentRepository;
    private final BookingRepository bookingRepository;
    private final CourtBlockRepository courtBlockRepository;
    private final NotificationService notificationService;
    private final CurrentUserService currentUserService;

    @Transactional
    public Payment processPayment(PaymentRequest request) {
        Booking booking = bookingRepository.findById(request.getBookingId())
                .orElseThrow(() -> new RuntimeException("Không tìm thấy đơn đặt sân với ID: " + request.getBookingId()));

        if (!currentUserService.isCurrentUserStaffOrOwner() && !booking.getUser().getId().equals(currentUserService.getCurrentUserId())) {
            throw new RuntimeException("Không có quyền thanh toán đơn này");
        }

        if (booking.getStatus() != BookingStatus.CONFIRMED) {
            throw new RuntimeException("Chỉ đơn đã được OWNER/STAFF xác nhận mới được cọc");
        }

        Payment existingPayment = paymentRepository.findByBooking_Id(booking.getId());
        if (existingPayment != null) {
            throw new RuntimeException("Đơn này đã có thanh toán");
        }

        BigDecimal requiredDeposit = booking.getTotalPrice()
                .multiply(DEPOSIT_RATE)
                .setScale(0, RoundingMode.HALF_UP);

        if (request.getAmount().compareTo(requiredDeposit) != 0) {
            throw new RuntimeException("Số tiền cọc phải đúng 30% tổng đơn: " + requiredDeposit);
        }

        Payment payment = new Payment();
        payment.setBooking(booking);
        payment.setAmount(requiredDeposit);
        payment.setStatus(PaymentStatus.SUCCESS);
        try {
            payment.setPaymentMethod(PaymentMethod.valueOf(request.getPaymentMethod()));
        } catch (IllegalArgumentException e) {
            throw new RuntimeException("Phương thức thanh toán không hợp lệ (Dùng CASH hoặc BANK_TRANSFER)");
        }
        payment.setTransactionRef(request.getTransactionRef());
        payment.setPaymentTime(LocalDateTime.now());

        Payment savedPayment = paymentRepository.save(payment);

        booking.setStatus(BookingStatus.DEPOSITED);
        booking.setConfirmedAt(null);
        bookingRepository.save(booking);

        if (!courtBlockRepository.existsByBookingId(booking.getId())) {
            CourtBlock block = new CourtBlock();
            block.setCourt(booking.getCourt());
            block.setBooking(booking);
            block.setStartTime(booking.getStartTime());
            block.setEndTime(booking.getEndTime());
            block.setReason("Giữ chỗ theo cọc đơn #" + booking.getId());
            courtBlockRepository.save(block);
        }

        notificationService.createNotification(
                booking.getUser().getId(),
                "Cọc thành công đơn #" + booking.getId() + " với số tiền " + requiredDeposit + " VND.",
                "/history"
        );
        notificationService.notifyStaffAndOwners(
                "Đơn #" + booking.getId() + " đã cọc " + requiredDeposit + " VND.",
            "/owner/revenue",
            "/staff/operations"
        );

        return savedPayment;
    }
}
