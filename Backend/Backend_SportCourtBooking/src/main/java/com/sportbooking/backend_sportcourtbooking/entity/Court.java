package com.sportbooking.backend_sportcourtbooking.entity;

import jakarta.persistence.*;
import lombok.*;
import com.fasterxml.jackson.annotation.JsonIgnore;
import java.util.List;

import java.time.LocalTime;

@Entity
@Table(name = "courts")
@Data @NoArgsConstructor @AllArgsConstructor
public class Court {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String name; // VD: Sân số 1

    @ManyToOne
    @JoinColumn(name = "sport_id")
    private Sport sport;

    private String description; // Sàn gỗ, thảm...

    // FIX: Đổi từ String sang LocalTime để so sánh giờ
    private LocalTime openTime;  // VD: 05:00
    private LocalTime closeTime; // VD: 22:00

    private boolean isActive; // true = Đang hoạt động

    @JsonIgnore
    @OneToMany(mappedBy = "court")
    private List<Booking> bookings;

    @JsonIgnore
    @OneToMany(mappedBy = "court", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<CourtPriceRule> priceRules;

    @JsonIgnore
    @OneToMany(mappedBy = "court", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<CourtBlock> blocks;
}
