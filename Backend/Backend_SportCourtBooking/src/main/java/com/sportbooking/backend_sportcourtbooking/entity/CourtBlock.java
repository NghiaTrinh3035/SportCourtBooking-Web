package com.sportbooking.backend_sportcourtbooking.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "court_blocks")
@Data @NoArgsConstructor @AllArgsConstructor
public class CourtBlock {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "court_id")
    private Court court;

    @OneToOne
    @JoinColumn(name = "booking_id", unique = true)
    private Booking booking;

    private LocalDateTime startTime;
    private LocalDateTime endTime;

    private String reason; // "Sửa lưới", "Tổ chức giải"
}