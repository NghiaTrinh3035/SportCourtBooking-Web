package com.sportbooking.backend_sportcourtbooking.entity;

import jakarta.persistence.*;
import lombok.*;
import java.math.BigDecimal;
import java.time.LocalTime;

@Entity
@Table(name = "court_price_rules")
@Data @NoArgsConstructor @AllArgsConstructor
public class CourtPriceRule {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "court_id") // Giá này áp dụng cho sân nào?
    private Court court;

    @Column(nullable = false)
    private LocalTime startTime;

    @Column(nullable = false)
    private LocalTime endTime;

    @Column(nullable = false)
    private BigDecimal price;
}
