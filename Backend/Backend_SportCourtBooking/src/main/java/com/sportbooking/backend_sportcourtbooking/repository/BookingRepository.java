package com.sportbooking.backend_sportcourtbooking.repository;

import com.sportbooking.backend_sportcourtbooking.entity.Booking;
import com.sportbooking.backend_sportcourtbooking.enums.BookingStatus;
import com.sportbooking.backend_sportcourtbooking.enums.PaymentStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface BookingRepository extends JpaRepository<Booking, Long> {
    List<Booking> findByUserId(Long userId);
    @Query("SELECT CASE WHEN COUNT(b) > 0 THEN true ELSE false END " +
            "FROM Booking b " +
            "WHERE b.court.id = :courtId " +
            "AND b.status != 'CANCELED' " +
            "AND (b.startTime < :newEnd AND b.endTime > :newStart)")
    boolean existsByCourtIdAndTimeRange(@Param("courtId") Long courtId,
                                        @Param("newStart") LocalDateTime newStart,
                                        @Param("newEnd") LocalDateTime newEnd);



    // 1. Tìm kiếm Booking theo SĐT khách hàng (Chức năng search booking)
    @Query("SELECT b FROM Booking b WHERE b.user.phone LIKE %:phone% ORDER BY b.startTime DESC")
    List<Booking> findByUserPhone(@Param("phone") String phone);

    // 2. Lấy danh sách booking trong một khoảng thời gian (Dùng để hiển thị lên Lịch Admin)
    List<Booking> findByStartTimeBetween(LocalDateTime start, LocalDateTime end);

    // 3. Tính tổng doanh thu theo khoảng thời gian (Chỉ tính đơn đã hoàn thành/xác nhận)
    @Query("SELECT SUM(b.totalPrice) FROM Booking b " +
            "WHERE b.status IN :statuses " +
            "AND b.startTime BETWEEN :start AND :end")
    BigDecimal calculateRevenue(@Param("start") LocalDateTime start,
                                @Param("end") LocalDateTime end,
                                @Param("statuses") List<BookingStatus> statuses);

    // 4. Lấy các đơn đang ở trạng thái PENDING để Admin duyệt (nếu cần duyệt tay)
    List<Booking> findByStatus(BookingStatus status);

    List<Booking> findByUserIdOrderByCreatedAtDesc(Long userId);

    List<Booking> findByCourtIdOrderByStartTimeAsc(Long courtId);

    List<Booking> findByStatusIn(List<BookingStatus> statuses);

    long countByStatus(BookingStatus status);

    @Query("SELECT b FROM Booking b LEFT JOIN b.payment p " +
            "WHERE b.status = :bookingStatus " +
            "AND b.confirmedAt IS NOT NULL " +
            "AND b.confirmedAt <= :cutoff " +
            "AND (p IS NULL OR p.status <> :paidStatus)")
    List<Booking> findExpiredConfirmedWithoutSuccessfulDeposit(
            @Param("bookingStatus") BookingStatus bookingStatus,
            @Param("paidStatus") PaymentStatus paidStatus,
            @Param("cutoff") LocalDateTime cutoff
    );

    List<Booking> findByStatusAndEndTimeLessThanEqual(BookingStatus status, LocalDateTime endTime);

    @Query("SELECT b FROM Booking b WHERE b.court.id = :courtId " +
           "AND b.status <> com.sportbooking.backend_sportcourtbooking.enums.BookingStatus.CANCELED " +
           "AND b.startTime < :endOfDay AND b.endTime > :startOfDay " +
           "ORDER BY b.startTime ASC")
    List<Booking> findOccupiedBookingsByCourtAndDate(@Param("courtId") Long courtId,
                                                     @Param("startOfDay") LocalDateTime startOfDay,
                                                     @Param("endOfDay") LocalDateTime endOfDay);
}

