package com.sportbooking.backend_sportcourtbooking.repository;


import com.sportbooking.backend_sportcourtbooking.entity.Payment;
import org.springframework.data.jpa.repository.JpaRepository;

public interface PaymentRepository extends JpaRepository<Payment, Long> {
    Payment findByBooking_Id(Long bookingId);
}
