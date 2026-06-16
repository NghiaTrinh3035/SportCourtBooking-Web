package com.sportbooking.backend_sportcourtbooking.controller;

import com.sportbooking.backend_sportcourtbooking.DTOs.BookingRequest;
import com.sportbooking.backend_sportcourtbooking.DTOs.BookingSearchResponse;
import com.sportbooking.backend_sportcourtbooking.DTOs.BookingStatusRequest;
import com.sportbooking.backend_sportcourtbooking.DTOs.ApiResponse;
import com.sportbooking.backend_sportcourtbooking.entity.Booking;
import com.sportbooking.backend_sportcourtbooking.enums.BookingStatus;
import com.sportbooking.backend_sportcourtbooking.service.BookingService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/bookings")
@RequiredArgsConstructor
public class BookingController {
    private final BookingService bookingService;

    @PostMapping
    @PreAuthorize("hasAnyRole('CUSTOMER','OWNER','STAFF')")
    public ResponseEntity<ApiResponse<Booking>> createBooking(@Valid @RequestBody BookingRequest request) {
        return ResponseEntity.ok(new ApiResponse<>(true, "Success", bookingService.createBooking(request)));
    }

    @GetMapping("/me")
    @PreAuthorize("hasAnyRole('CUSTOMER','OWNER','STAFF')")
    public ResponseEntity<ApiResponse<List<Booking>>> getMyBookings() {
        return ResponseEntity.ok(new ApiResponse<>(true, "Success", bookingService.getMyBookings()));
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasAnyRole('CUSTOMER','OWNER','STAFF')")
    public ResponseEntity<ApiResponse<Booking>> getBookingById(@PathVariable Long id) {
        return ResponseEntity.ok(new ApiResponse<>(true, "Success", bookingService.getBookingById(id)));
    }

    @GetMapping("/user/{userId}")
    @PreAuthorize("hasRole('OWNER')")
    public ResponseEntity<ApiResponse<List<Booking>>> getBookingsByUser(@PathVariable Long userId) {
        return ResponseEntity.ok(new ApiResponse<>(true, "Success", bookingService.getBookingsByUserId(userId)));
    }

    @GetMapping("/owner/status/{status}")
    @PreAuthorize("hasRole('OWNER')")
    public ResponseEntity<ApiResponse<List<Booking>>> getBookingsByStatus(@PathVariable BookingStatus status) {
        return ResponseEntity.ok(new ApiResponse<>(true, "Success", bookingService.getBookingsByStatus(status)));
    }

    @PutMapping("/{id}/status")
    @PreAuthorize("hasAnyRole('OWNER','STAFF')")
    public ResponseEntity<ApiResponse<Booking>> updateStatus(@PathVariable Long id, @Valid @RequestBody BookingStatusRequest request) {
        return ResponseEntity.ok(new ApiResponse<>(true, "Success", bookingService.updateStatus(id, request)));
    }

    @PutMapping("/{id}/cancel")
    @PreAuthorize("hasAnyRole('CUSTOMER','OWNER','STAFF')")
    public ResponseEntity<ApiResponse<Booking>> cancelBooking(@PathVariable Long id, @RequestParam(required = false) String reason) {
        return ResponseEntity.ok(new ApiResponse<>(true, "Success", bookingService.cancelBooking(id, reason)));
    }

    @GetMapping("/search")
    @PreAuthorize("hasAnyRole('OWNER','STAFF')")
    public ResponseEntity<ApiResponse<List<BookingSearchResponse>>> searchBookings(@RequestParam String phone) {
        return ResponseEntity.ok(new ApiResponse<>(true, "Success", bookingService.searchBookingsByPhone(phone)));
    }

    // OLD CODE - KEEP FOR BACKUP
    /*
    @PostMapping
    @PreAuthorize("hasAnyRole('CUSTOMER','OWNER','STAFF')")
    public ResponseEntity<Booking> createBookingOld(@Valid @RequestBody BookingRequest request) {
        return ResponseEntity.ok(bookingService.createBooking(request));
    }

    @GetMapping("/me")
    @PreAuthorize("hasAnyRole('CUSTOMER','OWNER','STAFF')")
    public ResponseEntity<List<Booking>> getMyBookingsOld() {
        return ResponseEntity.ok(bookingService.getMyBookings());
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasAnyRole('CUSTOMER','OWNER','STAFF')")
    public ResponseEntity<Booking> getBookingByIdOld(@PathVariable Long id) {
        return ResponseEntity.ok(bookingService.getBookingById(id));
    }

    @GetMapping("/user/{userId}")
    @PreAuthorize("hasRole('OWNER')")
    public ResponseEntity<List<Booking>> getBookingsByUserOld(@PathVariable Long userId) {
        return ResponseEntity.ok(bookingService.getBookingsByUserId(userId));
    }

    @GetMapping("/owner/status/{status}")
    @PreAuthorize("hasRole('OWNER')")
    public ResponseEntity<List<Booking>> getBookingsByStatusOld(@PathVariable BookingStatus status) {
        return ResponseEntity.ok(bookingService.getBookingsByStatus(status));
    }

    @PutMapping("/{id}/status")
    @PreAuthorize("hasAnyRole('OWNER','STAFF')")
    public ResponseEntity<Booking> updateStatusOld(@PathVariable Long id, @Valid @RequestBody BookingStatusRequest request) {
        return ResponseEntity.ok(bookingService.updateStatus(id, request));
    }

    @PutMapping("/{id}/cancel")
    @PreAuthorize("hasAnyRole('CUSTOMER','OWNER','STAFF')")
    public ResponseEntity<Booking> cancelBookingOld(@PathVariable Long id, @RequestParam(required = false) String reason) {
        return ResponseEntity.ok(bookingService.cancelBooking(id, reason));
    }
    */
}
