package com.sportbooking.backend_sportcourtbooking.service;

import com.sportbooking.backend_sportcourtbooking.DTOs.BookingRequest;
import com.sportbooking.backend_sportcourtbooking.DTOs.BookingStatusRequest;
import com.sportbooking.backend_sportcourtbooking.entity.*;
import com.sportbooking.backend_sportcourtbooking.enums.BookingStatus;
import com.sportbooking.backend_sportcourtbooking.enums.PaymentStatus;
import com.sportbooking.backend_sportcourtbooking.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.ArrayList;
import java.util.List;

@Service
@RequiredArgsConstructor
public class BookingService {

    private final BookingRepository bookingRepository;
    private final CourtRepository courtRepository;
    private final CourtBlockRepository courtBlockRepository;
    private final CourtPriceRuleService courtPriceRuleService;
    private final PaymentRepository paymentRepository;
    private final UserRepository userRepository;
    private final NotificationService notificationService;
    private final CurrentUserService currentUserService;

    public List<Booking> getMyBookings() {
        return bookingRepository.findByUserIdOrderByCreatedAtDesc(currentUserService.getCurrentUserId());
    }

    public Booking getBookingById(Long id) {
        Booking booking = bookingRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Đơn đặt sân không tồn tại"));
        ensureBookingAccess(booking);
        return booking;
    }

    public List<Booking> getBookingsByUserId(Long userId) {
        return bookingRepository.findByUserIdOrderByCreatedAtDesc(userId);
    }

    public List<Booking> getBookingsByStatus(BookingStatus status) {
        return bookingRepository.findByStatus(status);
    }

    @Transactional
    public Booking createBooking(BookingRequest request) {
        validateBookingTimes(request.getStartTime(), request.getEndTime());

        User user = resolveBookingUser(request);
        Court court = courtRepository.findByIdForUpdate(request.getCourtId())
                .orElseThrow(() -> new RuntimeException("Sân không tồn tại"));

        validateCourtAvailability(court, request.getStartTime(), request.getEndTime());
        ensureNoConflict(court.getId(), request.getStartTime(), request.getEndTime());

        BigDecimal totalPrice = courtPriceRuleService.calculateBookingPrice(court.getId(), request.getStartTime(), request.getEndTime());

        Booking booking = Booking.builder()
                .user(user)
                .court(court)
                .startTime(request.getStartTime())
                .endTime(request.getEndTime())
                .status(BookingStatus.PENDING)
                .totalPrice(totalPrice)
                .note(request.getNote())
                .build();

        Booking savedBooking = bookingRepository.save(booking);

        notificationService.createNotification(
                user.getId(),
            "Đặt sân thành công! Mã đơn #" + savedBooking.getId() + ". Vui lòng chờ OWNER/STAFF xác nhận trước khi cọc.",
                "/history"
        );
        notificationService.notifyStaffAndOwners(
                "Khách hàng " + user.getFullName() + " vừa đặt sân " + court.getName(),
                "/owner/bookings",
                "/staff/operations"
        );

        return savedBooking;
    }

    public Booking updateStatus(Long bookingId, BookingStatusRequest request) {
        Booking booking = bookingRepository.findById(bookingId)
                .orElseThrow(() -> new RuntimeException("Đơn không tồn tại"));
        ensureBookingAccess(booking);
        validateStatusTransition(booking.getStatus(), request.getStatus());

        booking.setStatus(request.getStatus());
        if (request.getStatus() == BookingStatus.CANCELED) {
            booking.setCancelReason(request.getCancelReason());
            booking.setConfirmedAt(null);
            removeBookingBlock(booking.getId());

            Payment payment = paymentRepository.findByBooking_Id(booking.getId());
            if (payment != null && payment.getStatus() == PaymentStatus.SUCCESS) {
                payment.setStatus(PaymentStatus.REFUNDED);
                paymentRepository.save(payment);
            }
        } else if (request.getStatus() == BookingStatus.CONFIRMED) {
            booking.setConfirmedAt(LocalDateTime.now());
            booking.setCancelReason(null);
        } else if (request.getStatus() == BookingStatus.COMPLETED) {
            booking.setConfirmedAt(null);
            removeBookingBlock(booking.getId());
        }
        Booking savedBooking = bookingRepository.save(booking);

        if (request.getStatus() == BookingStatus.CONFIRMED) {
            notificationService.createNotification(
                    booking.getUser().getId(),
                    "Đơn sân #" + bookingId + " của bạn đã được xác nhận.",
                    "/history"
            );
        } else if (request.getStatus() == BookingStatus.CANCELED) {
            notificationService.createNotification(
                    booking.getUser().getId(),
                    "Đơn sân #" + bookingId + " đã bị hủy.",
                    "/history"
            );
                notificationService.notifyStaffAndOwners(
                    "Đơn #" + bookingId + " đã chuyển sang trạng thái HỦY.",
                    "/owner/bookings",
                    "/staff/operations"
            );
        } else if (request.getStatus() == BookingStatus.COMPLETED) {
            notificationService.createNotification(
                    booking.getUser().getId(),
                    "Đơn sân #" + bookingId + " đã được đánh dấu hoàn tất.",
                    "/history"
            );
        }

        return savedBooking;
    }

    @Transactional
    public int autoCancelExpiredConfirmedBookings(int timeoutMinutes) {
        LocalDateTime cutoff = LocalDateTime.now().minusMinutes(timeoutMinutes);
        List<Booking> expiredBookings = bookingRepository.findExpiredConfirmedWithoutSuccessfulDeposit(
                BookingStatus.CONFIRMED,
                PaymentStatus.SUCCESS,
                cutoff
        );

        if (expiredBookings.isEmpty()) {
            return 0;
        }

        List<Long> canceledIds = new ArrayList<>();
        for (Booking booking : expiredBookings) {
            booking.setStatus(BookingStatus.CANCELED);
            booking.setCancelReason("Tự động hủy: quá " + timeoutMinutes + " phút chưa thanh toán tiền cọc");
            booking.setConfirmedAt(null);
            removeBookingBlock(booking.getId());
            canceledIds.add(booking.getId());

            notificationService.createNotification(
                    booking.getUser().getId(),
                    "Đơn sân #" + booking.getId() + " đã tự động hủy do quá thời hạn cọc.",
                    "/history"
            );
        }

        bookingRepository.saveAll(expiredBookings);
        notificationService.notifyStaffAndOwners(
                "Hệ thống đã tự động hủy " + canceledIds.size() + " đơn quá hạn cọc: " + canceledIds,
            "/owner/bookings",
            "/staff/operations"
        );

        return canceledIds.size();
    }

    @Transactional
    public int releaseExpiredBookingBlocks(int bufferMinutes) {
        LocalDateTime cutoff = LocalDateTime.now().minusMinutes(bufferMinutes);
        List<CourtBlock> expiredBlocks = courtBlockRepository.findByBookingIdIsNotNullAndEndTimeLessThanEqual(cutoff);
        if (expiredBlocks.isEmpty()) {
            return 0;
        }
        courtBlockRepository.deleteAll(expiredBlocks);
        return expiredBlocks.size();
    }

    public Booking cancelBooking(Long bookingId, String reason) {
        BookingStatusRequest request = new BookingStatusRequest();
        request.setStatus(BookingStatus.CANCELED);
        request.setCancelReason(reason);
        return updateStatus(bookingId, request);
    }

    private User resolveBookingUser(BookingRequest request) {
        if (request.getUserId() == null) {
            return currentUserService.getCurrentUser();
        }
        if (!currentUserService.isCurrentUserStaffOrOwner() && !currentUserService.getCurrentUserId().equals(request.getUserId())) {
            throw new RuntimeException("Không có quyền đặt hộ người dùng khác");
        }
        return userRepository.findById(request.getUserId())
                .orElseThrow(() -> new RuntimeException("User không tồn tại"));
    }

    private void validateBookingTimes(LocalDateTime start, LocalDateTime end) {
        if (!start.isBefore(end)) {
            throw new RuntimeException("Giờ bắt đầu phải trước giờ kết thúc!");
        }
        if (start.isBefore(LocalDateTime.now())) {
            throw new RuntimeException("Không thể đặt lùi thời gian!");
        }
    }

    private void validateCourtAvailability(Court court, LocalDateTime start, LocalDateTime end) {
        if (!court.isActive()) {
            throw new RuntimeException("Sân đang tạm khóa");
        }

        LocalTime startTime = start.toLocalTime();
        LocalTime endTime = end.toLocalTime();
        if (startTime.isBefore(court.getOpenTime()) || endTime.isAfter(court.getCloseTime())) {
            throw new RuntimeException("Khung giờ đặt nằm ngoài giờ hoạt động của sân");
        }
    }

    private void ensureNoConflict(Long courtId, LocalDateTime start, LocalDateTime end) {
        boolean isBooked = bookingRepository.existsByCourtIdAndTimeRange(courtId, start, end);
        if (isBooked) {
            throw new RuntimeException("Sân đã có người đặt trong khung giờ này!");
        }
        boolean isBlocked = courtBlockRepository.existsByCourtIdAndStartTimeLessThanAndEndTimeGreaterThan(courtId, end, start);
        if (isBlocked) {
            throw new RuntimeException("Sân đang bị chặn trong khung giờ này");
        }
    }

    private void ensureBookingAccess(Booking booking) {
        if (currentUserService.isCurrentUserStaffOrOwner()) {
            return;
        }
        if (!booking.getUser().getId().equals(currentUserService.getCurrentUserId())) {
            throw new RuntimeException("Không có quyền thao tác với đơn này");
        }
    }

    private void removeBookingBlock(Long bookingId) {
        if (courtBlockRepository.existsByBookingId(bookingId)) {
            courtBlockRepository.deleteByBookingId(bookingId);
        }
    }

    private void validateStatusTransition(BookingStatus currentStatus, BookingStatus nextStatus) {
        if (currentStatus == nextStatus) {
            return;
        }

        if (currentStatus == BookingStatus.CANCELED) {
            throw new RuntimeException("Đơn đã hủy, không thể đổi trạng thái");
        }
        if (currentStatus == BookingStatus.COMPLETED) {
            throw new RuntimeException("Đơn đã hoàn tất, không thể đổi trạng thái");
        }

        if (currentStatus == BookingStatus.PENDING
                && nextStatus != BookingStatus.CONFIRMED
                && nextStatus != BookingStatus.CANCELED) {
            throw new RuntimeException("Đơn PENDING chỉ có thể chuyển sang CONFIRMED hoặc CANCELED");
        }

        if (currentStatus == BookingStatus.CONFIRMED
                && nextStatus != BookingStatus.DEPOSITED
                && nextStatus != BookingStatus.CANCELED) {
            throw new RuntimeException("Đơn CONFIRMED chỉ có thể chuyển sang DEPOSITED hoặc CANCELED");
        }

        if (currentStatus == BookingStatus.DEPOSITED
                && nextStatus != BookingStatus.COMPLETED
                && nextStatus != BookingStatus.CANCELED) {
            throw new RuntimeException("Đơn DEPOSITED chỉ có thể chuyển sang COMPLETED hoặc CANCELED");
        }
    }
}
