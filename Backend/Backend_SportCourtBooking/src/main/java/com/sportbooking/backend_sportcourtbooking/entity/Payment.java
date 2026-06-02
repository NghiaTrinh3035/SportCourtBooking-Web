package com.sportbooking.backend_sportcourtbooking.entity;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.sportbooking.backend_sportcourtbooking.enums.PaymentMethod;
import com.sportbooking.backend_sportcourtbooking.enums.PaymentStatus;
import jakarta.persistence.*;
import lombok.*;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "payments")
@Data @NoArgsConstructor @AllArgsConstructor
public class Payment {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @OneToOne
    @JoinColumn(name = "booking_id")
    @JsonIgnore
    private Booking booking;

    private BigDecimal amount;

    @Enumerated(EnumType.STRING)
    private PaymentStatus status;

    @Enumerated(EnumType.STRING)
    private PaymentMethod paymentMethod;

    private String transactionRef;

    private LocalDateTime paymentTime;
}
