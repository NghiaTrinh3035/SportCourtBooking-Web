package com.sportbooking.backend_sportcourtbooking.service;

import com.sportbooking.backend_sportcourtbooking.DTOs.AdminDashboardResponse;
import com.sportbooking.backend_sportcourtbooking.enums.BookingStatus;
import com.sportbooking.backend_sportcourtbooking.repository.BookingRepository;
import com.sportbooking.backend_sportcourtbooking.repository.CourtRepository;
import com.sportbooking.backend_sportcourtbooking.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
public class AdminDashboardService {

    private final UserRepository userRepository;
    private final CourtRepository courtRepository;
    private final BookingRepository bookingRepository;

    public AdminDashboardResponse getSummary(LocalDateTime start, LocalDateTime end) {
        AdminDashboardResponse response = new AdminDashboardResponse();
        response.setTotalUsers(userRepository.count());
        response.setTotalCourts(courtRepository.count());
        response.setPendingBookings(bookingRepository.countByStatus(BookingStatus.PENDING));
        response.setConfirmedBookings(bookingRepository.countByStatus(BookingStatus.CONFIRMED));
        response.setCompletedBookings(bookingRepository.countByStatus(BookingStatus.COMPLETED));
        response.setCanceledBookings(bookingRepository.countByStatus(BookingStatus.CANCELED));

        BigDecimal revenue = bookingRepository.calculateRevenue(
                start,
                end,
                List.of(BookingStatus.CONFIRMED, BookingStatus.COMPLETED)
        );
        response.setTotalRevenue(revenue == null ? BigDecimal.ZERO : revenue);
        return response;
    }
}
