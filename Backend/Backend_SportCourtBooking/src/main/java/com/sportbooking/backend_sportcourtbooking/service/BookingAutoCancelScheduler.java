package com.sportbooking.backend_sportcourtbooking.service;

import lombok.RequiredArgsConstructor;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
public class BookingAutoCancelScheduler {

    private static final int DEPOSIT_TIMEOUT_MINUTES = 15;
    private static final int BLOCK_RELEASE_BUFFER_MINUTES = 15;

    private final BookingService bookingService;

    @Scheduled(fixedDelay = 60000)
    public void autoCancelExpiredConfirmedBookings() {
        bookingService.autoCancelExpiredConfirmedBookings(DEPOSIT_TIMEOUT_MINUTES);
    }

    @Scheduled(fixedDelay = 60000)
    public void releaseExpiredBookingBlocks() {
        bookingService.releaseExpiredBookingBlocks(BLOCK_RELEASE_BUFFER_MINUTES);
    }
}
